//go:build ai

package ai_test

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/kbrakke/illustrated-primer/internal/ai"
)

func TestOpenAIClient_RealAPI(t *testing.T) {
	// Skip if AI tests are not enabled
	if os.Getenv("AI_TESTS_ENABLED") != "true" {
		t.Skip("AI tests disabled; set AI_TESTS_ENABLED=true to run")
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		t.Skip("OPENAI_API_KEY not set")
	}

	// Use gpt-5-nano for cost-effective testing
	// Reasoning models need sufficient tokens for both reasoning and output
	client := ai.NewClient(apiKey, ai.WithModel(ai.ModelNano), ai.WithMaxTokens(1024))

	t.Run("GenerateResponse", func(t *testing.T) {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		response, err := client.GenerateResponse(ctx, "Say hello in one word.", nil)
		if err != nil {
			t.Fatalf("GenerateResponse failed: %v", err)
		}

		if response == "" {
			t.Error("expected non-empty response")
		}

		t.Logf("Response: %s", response)
	})

	t.Run("GenerateResponse_WithHistory", func(t *testing.T) {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		history := []string{
			"What is 2+2?",
			"2+2 equals 4.",
		}

		response, err := client.GenerateResponse(ctx, "What did I just ask you?", history)
		if err != nil {
			t.Fatalf("GenerateResponse failed: %v", err)
		}

		if response == "" {
			t.Error("expected non-empty response")
		}

		t.Logf("Response: %s", response)
	})

	t.Run("GenerateResponseStream", func(t *testing.T) {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		ch, err := client.GenerateResponseStream(ctx, "Count from 1 to 3.", nil)
		if err != nil {
			t.Fatalf("GenerateResponseStream failed: %v", err)
		}

		var fullResponse string
		for chunk := range ch {
			fullResponse += chunk
		}

		if fullResponse == "" {
			t.Error("expected non-empty response")
		}

		t.Logf("Streamed response: %s", fullResponse)
	})
}

func TestSystemPrompt(t *testing.T) {
	prompt := ai.SystemPrompt()

	if prompt == "" {
		t.Error("SystemPrompt should not be empty")
	}

	// Check for key phrases
	keywords := []string{"teacher", "story", "children", "education"}
	for _, keyword := range keywords {
		found := false
		for i := 0; i < len(prompt)-len(keyword); i++ {
			if prompt[i:i+len(keyword)] == keyword {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("SystemPrompt should contain %q", keyword)
		}
	}
}
