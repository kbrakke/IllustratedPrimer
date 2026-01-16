# AI Module

## Purpose
This module handles all AI/LLM interactions for the Illustrated Primer application. It provides a clean interface to OpenAI's GPT-5 Responses API for generating educational story content and managing conversation context. The module uses GPT-5 to create warm, educational narratives tailored for children aged 2-8.

## Architecture
The module is organized around a client pattern with configurable options:
- **Client Layer**: Manages API connections and request/response handling
- **Prompt Layer**: Defines system prompts for educational storytelling
- **Streaming Support**: Includes both blocking and streaming response modes via channels

## Key Features
- Non-blocking and streaming chat completions
- Conversation history management (alternating user/assistant roles)
- Educational storytelling prompt engineering
- Configurable model selection (gpt-5, gpt-5-mini, gpt-5-nano)
- Organization ID support for project-scoped keys

## Files

### prompt.go
Defines the `SystemPrompt()` function that returns the system prompt optimized for educational storytelling with children ages 2-8. The prompt encourages warm, educational narratives that weave learning into stories.

### client.go
Implements the `OpenAIClient` struct that wraps HTTP requests to the OpenAI Responses API:
- `NewClient(apiKey, ...opts)` - Creates a client with optional configuration
- `GenerateResponse(ctx, message, history)` - Blocking request returning full response
- `GenerateResponseStream(ctx, message, history)` - Returns a channel for streaming chunks
- Supports model configuration via `WithModel()`, `WithMaxTokens()`, `WithOrgID()`, `WithLogger()`

### client_test.go
Contains real API tests using gpt-5-nano for cost-effective testing. Tests are gated behind the `ai` build tag and `AI_TESTS_ENABLED=true` environment variable.

## Usage

```go
client := ai.NewClient(apiKey, ai.WithModel(ai.ModelNano))

// Blocking request
response, err := client.GenerateResponse(ctx, "Tell me a story", nil)

// Streaming request
ch, err := client.GenerateResponseStream(ctx, "Tell me a story", history)
for chunk := range ch {
    fmt.Print(chunk)
}
```

## Model Options
- `ai.DefaultModel` ("gpt-5") - Production model
- `ai.ModelMini` ("gpt-5-mini") - Faster, cheaper
- `ai.ModelNano` ("gpt-5-nano") - Testing (very cheap)

## Token Configuration

The GPT-5 family are reasoning models that allocate output tokens to both internal reasoning and the actual response. The `max_output_tokens` parameter limits the total budget for both.

- `ai.DefaultMaxTokens` (4096) - Default token budget, sufficient for reasoning + story generation
- For tests, use at least 1024 tokens to ensure enough budget for both reasoning and output
- If responses are being truncated or empty, increase the token budget

**Important**: With too few tokens (e.g., 50-256), the model may use all tokens for reasoning and return an empty response. The API response will show `"status": "incomplete"` with `"reason": "max_output_tokens"` when this occurs.
