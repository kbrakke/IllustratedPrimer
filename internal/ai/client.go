package ai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
)

const (
	// DefaultModel is the default GPT-5 model for production use.
	DefaultModel = "gpt-5"

	// ModelMini is a smaller, faster model for testing.
	ModelMini = "gpt-5-mini"

	// ModelNano is the smallest model, ideal for cost-effective testing.
	ModelNano = "gpt-5-nano"

	// DefaultMaxTokens is the default max output tokens for responses.
	// Reasoning models (gpt-5 family) use tokens for both reasoning and output,
	// so this needs to be large enough to accommodate both. 4096 provides
	// sufficient budget for reasoning (~1-2k tokens) plus story generation.
	DefaultMaxTokens = 4096

	responsesAPIURL = "https://api.openai.com/v1/responses"
)

// Client is an interface for AI operations.
type Client interface {
	GenerateResponse(ctx context.Context, message string, history []string) (string, error)
	GenerateResponseStream(ctx context.Context, message string, history []string) (<-chan string, error)
}

// OpenAIClient implements the Client interface using OpenAI's GPT-5 Responses API.
type OpenAIClient struct {
	apiKey     string
	orgID      string
	model      string
	maxTokens  int
	httpClient *http.Client
	logger     *slog.Logger
}

// ClientOption is a function that configures an OpenAIClient.
type ClientOption func(*OpenAIClient)

// WithModel sets the model to use.
func WithModel(model string) ClientOption {
	return func(c *OpenAIClient) {
		c.model = model
	}
}

// WithMaxTokens sets the maximum completion tokens.
func WithMaxTokens(tokens int) ClientOption {
	return func(c *OpenAIClient) {
		c.maxTokens = tokens
	}
}

// WithOrgID sets the organization ID for project-scoped keys.
func WithOrgID(orgID string) ClientOption {
	return func(c *OpenAIClient) {
		c.orgID = orgID
	}
}

// WithLogger sets a custom logger.
func WithLogger(logger *slog.Logger) ClientOption {
	return func(c *OpenAIClient) {
		c.logger = logger
	}
}

// WithHTTPClient sets a custom HTTP client.
func WithHTTPClient(client *http.Client) ClientOption {
	return func(c *OpenAIClient) {
		c.httpClient = client
	}
}

// NewClient creates a new OpenAI client with the given API key and options.
func NewClient(apiKey string, opts ...ClientOption) *OpenAIClient {
	c := &OpenAIClient{
		apiKey:     apiKey,
		model:      DefaultModel,
		maxTokens:  DefaultMaxTokens,
		httpClient: http.DefaultClient,
		logger:     slog.Default(),
	}

	for _, opt := range opts {
		opt(c)
	}

	c.logger.Info("OpenAI client initialized",
		"model", c.model,
		"max_tokens", c.maxTokens,
		"has_org_id", c.orgID != "",
	)

	return c
}

// responsesRequest is the request body for the Responses API.
type responsesRequest struct {
	Model    string          `json:"model"`
	Input    json.RawMessage `json:"input"`
	Stream   bool            `json:"stream,omitempty"`
	MaxTokens int            `json:"max_output_tokens,omitempty"`
}

// buildInput creates the input array for the Responses API.
func (c *OpenAIClient) buildInput(message string, history []string) json.RawMessage {
	var messages []map[string]string

	// Add system message
	messages = append(messages, map[string]string{
		"role":    "system",
		"content": SystemPrompt(),
	})

	// Add conversation history (alternating user/assistant)
	for i, msg := range history {
		role := "user"
		if i%2 == 1 {
			role = "assistant"
		}
		messages = append(messages, map[string]string{
			"role":    role,
			"content": msg,
		})
	}

	// Add current user message
	messages = append(messages, map[string]string{
		"role":    "user",
		"content": message,
	})

	data, _ := json.Marshal(messages)
	return data
}

// GenerateResponse sends a message and returns the complete response.
func (c *OpenAIClient) GenerateResponse(ctx context.Context, message string, history []string) (string, error) {
	reqBody := responsesRequest{
		Model:     c.model,
		Input:     c.buildInput(message, history),
		MaxTokens: c.maxTokens,
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", responsesAPIURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	if c.orgID != "" {
		req.Header.Set("OpenAI-Organization", c.orgID)
	}

	c.logger.Debug("sending request to OpenAI",
		"model", c.model,
		"history_length", len(history),
	)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		ID      string `json:"id"`
		Output  []struct {
			Type    string `json:"type"`
			Content []struct {
				Type string `json:"type"`
				Text string `json:"text"`
			} `json:"content"`
		} `json:"output"`
		Usage struct {
			InputTokens  int `json:"input_tokens"`
			OutputTokens int `json:"output_tokens"`
		} `json:"usage"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("decode response: %w", err)
	}

	c.logger.Info("received response from OpenAI",
		"response_id", result.ID,
		"input_tokens", result.Usage.InputTokens,
		"output_tokens", result.Usage.OutputTokens,
	)

	// Extract text from response
	for _, output := range result.Output {
		if output.Type == "message" {
			for _, content := range output.Content {
				// OpenAI Responses API uses "output_text" as the content type
				if content.Type == "output_text" || content.Type == "text" {
					return content.Text, nil
				}
			}
		}
	}

	c.logger.Warn("empty response from OpenAI")
	return "", nil
}

// GenerateResponseStream sends a message and returns a channel for streaming the response.
func (c *OpenAIClient) GenerateResponseStream(ctx context.Context, message string, history []string) (<-chan string, error) {
	reqBody := responsesRequest{
		Model:     c.model,
		Input:     c.buildInput(message, history),
		Stream:    true,
		MaxTokens: c.maxTokens,
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", responsesAPIURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Accept", "text/event-stream")
	if c.orgID != "" {
		req.Header.Set("OpenAI-Organization", c.orgID)
	}

	c.logger.Debug("starting streaming request to OpenAI",
		"model", c.model,
		"history_length", len(history),
	)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("send request: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	ch := make(chan string, 100)

	go func() {
		defer close(ch)
		defer resp.Body.Close()

		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			line := scanner.Text()

			// Skip empty lines and comments
			if line == "" || strings.HasPrefix(line, ":") {
				continue
			}

			// Parse SSE data lines
			if strings.HasPrefix(line, "data: ") {
				data := strings.TrimPrefix(line, "data: ")

				// Check for stream end
				if data == "[DONE]" {
					c.logger.Debug("stream completed")
					return
				}

				// Parse the event
				var event struct {
					Type  string `json:"type"`
					Delta string `json:"delta"`
				}
				if err := json.Unmarshal([]byte(data), &event); err != nil {
					c.logger.Debug("failed to parse event", "data", data)
					continue
				}

				// Send text deltas to the channel
				if event.Type == "response.output_text.delta" && event.Delta != "" {
					select {
					case ch <- event.Delta:
					case <-ctx.Done():
						c.logger.Debug("stream cancelled by context")
						return
					}
				}
			}
		}

		if err := scanner.Err(); err != nil {
			c.logger.Error("stream read error", "error", err)
		}
	}()

	return ch, nil
}
