package testutil

import (
	"context"
)

// MockCall records a call to the mock AI client.
type MockCall struct {
	Message string
	History []string
}

// MockAIClient is a mock implementation of the AI client for testing.
type MockAIClient struct {
	Response string
	Err      error
	Calls    []MockCall
}

// NewMockAIClient creates a new mock AI client with the specified response.
func NewMockAIClient(response string) *MockAIClient {
	return &MockAIClient{
		Response: response,
		Calls:    make([]MockCall, 0),
	}
}

// GenerateResponse returns the configured mock response.
func (m *MockAIClient) GenerateResponse(ctx context.Context, message string, history []string) (string, error) {
	m.Calls = append(m.Calls, MockCall{
		Message: message,
		History: history,
	})
	return m.Response, m.Err
}

// GenerateResponseStream returns the configured mock response via a channel.
func (m *MockAIClient) GenerateResponseStream(ctx context.Context, message string, history []string) (<-chan string, error) {
	m.Calls = append(m.Calls, MockCall{
		Message: message,
		History: history,
	})

	if m.Err != nil {
		return nil, m.Err
	}

	ch := make(chan string, 1)
	go func() {
		defer close(ch)
		ch <- m.Response
	}()

	return ch, nil
}

// CallCount returns the number of times the client was called.
func (m *MockAIClient) CallCount() int {
	return len(m.Calls)
}

// LastCall returns the last call made to the client, or nil if no calls.
func (m *MockAIClient) LastCall() *MockCall {
	if len(m.Calls) == 0 {
		return nil
	}
	return &m.Calls[len(m.Calls)-1]
}

// Reset clears all recorded calls.
func (m *MockAIClient) Reset() {
	m.Calls = make([]MockCall, 0)
}
