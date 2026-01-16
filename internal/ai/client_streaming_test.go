//go:build ai

package ai_test

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/kbrakke/illustrated-primer/internal/ai"
)

// TestStreamingResponseRaw tests the raw SSE stream to see what OpenAI actually returns.
// This is a diagnostic test to verify the streaming format.
func TestStreamingResponseRaw(t *testing.T) {
	if os.Getenv("AI_TESTS_ENABLED") != "true" {
		t.Skip("AI tests disabled; set AI_TESTS_ENABLED=true to run")
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		t.Skip("OPENAI_API_KEY not set")
	}

	// Build request manually to see raw response
	messages := []map[string]string{
		{"role": "user", "content": "Say 'hello' and nothing else."},
	}
	inputJSON, _ := json.Marshal(messages)

	reqBody := map[string]interface{}{
		"model":             ai.ModelNano,
		"input":             json.RawMessage(inputJSON),
		"stream":            true,
		"max_output_tokens": 1024,
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		t.Fatalf("marshal request: %v", err)
	}

	t.Logf("Request body: %s", string(bodyBytes))

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/responses", bytes.NewReader(bodyBytes))
	if err != nil {
		t.Fatalf("create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Accept", "text/event-stream")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("send request: %v", err)
	}
	defer resp.Body.Close()

	t.Logf("Response status: %d", resp.StatusCode)
	t.Logf("Response headers: %v", resp.Header)

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	// Read and log all SSE events
	scanner := bufio.NewScanner(resp.Body)
	var allText strings.Builder
	eventCount := 0

	for scanner.Scan() {
		line := scanner.Text()
		t.Logf("RAW LINE: %q", line)

		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			eventCount++

			if data == "[DONE]" {
				t.Logf("EVENT %d: [DONE]", eventCount)
				continue
			}

			// Try to parse and log the structure
			var rawEvent map[string]interface{}
			if err := json.Unmarshal([]byte(data), &rawEvent); err != nil {
				t.Logf("EVENT %d: Failed to parse: %v", eventCount, err)
				t.Logf("EVENT %d: Raw data: %s", eventCount, data)
			} else {
				prettyJSON, _ := json.MarshalIndent(rawEvent, "", "  ")
				t.Logf("EVENT %d: %s", eventCount, string(prettyJSON))

				// Try to extract text based on what we find
				if eventType, ok := rawEvent["type"].(string); ok {
					t.Logf("EVENT %d: type=%s", eventCount, eventType)

					// Check for delta field
					if delta, ok := rawEvent["delta"].(string); ok && delta != "" {
						allText.WriteString(delta)
						t.Logf("EVENT %d: delta=%q", eventCount, delta)
					}

					// Check for nested content
					if eventType == "response.output_item.done" {
						if item, ok := rawEvent["item"].(map[string]interface{}); ok {
							if content, ok := item["content"].([]interface{}); ok {
								for _, c := range content {
									if contentItem, ok := c.(map[string]interface{}); ok {
										if text, ok := contentItem["text"].(string); ok {
											t.Logf("EVENT %d: Found text in item.content: %q", eventCount, text)
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	if err := scanner.Err(); err != nil {
		t.Fatalf("scanner error: %v", err)
	}

	t.Logf("Total events: %d", eventCount)
	t.Logf("Accumulated text from deltas: %q", allText.String())
}

// TestStreamingClient tests the actual client streaming implementation.
func TestStreamingClient(t *testing.T) {
	if os.Getenv("AI_TESTS_ENABLED") != "true" {
		t.Skip("AI tests disabled; set AI_TESTS_ENABLED=true to run")
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		t.Skip("OPENAI_API_KEY not set")
	}

	client := ai.NewClient(apiKey, ai.WithModel(ai.ModelNano), ai.WithMaxTokens(1024))

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	ch, err := client.GenerateResponseStream(ctx, "Say 'hello' and nothing else.", nil)
	if err != nil {
		t.Fatalf("GenerateResponseStream failed: %v", err)
	}

	var fullResponse strings.Builder
	chunkCount := 0
	for chunk := range ch {
		chunkCount++
		fullResponse.WriteString(chunk)
		t.Logf("CHUNK %d: %q", chunkCount, chunk)
	}

	t.Logf("Total chunks: %d", chunkCount)
	t.Logf("Full response: %q", fullResponse.String())

	if fullResponse.String() == "" {
		t.Error("Expected non-empty response, got empty string")
	}
}

// TestNonStreamingClient tests the non-streaming implementation for comparison.
func TestNonStreamingClient(t *testing.T) {
	if os.Getenv("AI_TESTS_ENABLED") != "true" {
		t.Skip("AI tests disabled; set AI_TESTS_ENABLED=true to run")
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		t.Skip("OPENAI_API_KEY not set")
	}

	client := ai.NewClient(apiKey, ai.WithModel(ai.ModelNano), ai.WithMaxTokens(1024))

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	response, err := client.GenerateResponse(ctx, "Say 'hello' and nothing else.", nil)
	if err != nil {
		t.Fatalf("GenerateResponse failed: %v", err)
	}

	t.Logf("Non-streaming response: %q", response)

	if response == "" {
		t.Error("Expected non-empty response, got empty string")
	}
}

// TestCompareStreamingAndNonStreaming compares both methods.
func TestCompareStreamingAndNonStreaming(t *testing.T) {
	if os.Getenv("AI_TESTS_ENABLED") != "true" {
		t.Skip("AI tests disabled; set AI_TESTS_ENABLED=true to run")
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		t.Skip("OPENAI_API_KEY not set")
	}

	client := ai.NewClient(apiKey, ai.WithModel(ai.ModelNano), ai.WithMaxTokens(1024))
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Test non-streaming first
	t.Log("Testing non-streaming...")
	nonStreamResp, err := client.GenerateResponse(ctx, "What is 2+2? Answer with just the number.", nil)
	if err != nil {
		t.Fatalf("Non-streaming failed: %v", err)
	}
	t.Logf("Non-streaming response: %q", nonStreamResp)

	// Test streaming
	t.Log("Testing streaming...")
	ch, err := client.GenerateResponseStream(ctx, "What is 2+2? Answer with just the number.", nil)
	if err != nil {
		t.Fatalf("Streaming failed: %v", err)
	}

	var streamResp strings.Builder
	for chunk := range ch {
		streamResp.WriteString(chunk)
	}
	t.Logf("Streaming response: %q", streamResp.String())

	// Both should have content
	if nonStreamResp == "" {
		t.Error("Non-streaming response is empty")
	}
	if streamResp.String() == "" {
		t.Error("Streaming response is empty")
	}

	fmt.Printf("\nNon-streaming: %q\nStreaming: %q\n", nonStreamResp, streamResp.String())
}
