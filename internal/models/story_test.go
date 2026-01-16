package models

import (
	"testing"
)

func TestNewStory(t *testing.T) {
	story := NewStory("user-123", "Test Story", "A test summary")

	if story.ID == "" {
		t.Error("expected non-empty ID")
	}
	if story.UserID != "user-123" {
		t.Errorf("UserID = %q, want %q", story.UserID, "user-123")
	}
	if story.Title != "Test Story" {
		t.Errorf("Title = %q, want %q", story.Title, "Test Story")
	}
	if story.Summary != "A test summary" {
		t.Errorf("Summary = %q, want %q", story.Summary, "A test summary")
	}
	if story.CurrentPage != 1 {
		t.Errorf("CurrentPage = %d, want %d", story.CurrentPage, 1)
	}
	if story.CreatedAt == 0 {
		t.Error("expected non-zero CreatedAt")
	}
	if story.UpdatedAt == 0 {
		t.Error("expected non-zero UpdatedAt")
	}
}

func TestStoryPageCountDisplay(t *testing.T) {
	tests := []struct {
		name        string
		currentPage int64
		expected    string
	}{
		{
			name:        "single page",
			currentPage: 1,
			expected:    "1 page",
		},
		{
			name:        "multiple pages",
			currentPage: 5,
			expected:    "5 pages",
		},
		{
			name:        "two pages",
			currentPage: 2,
			expected:    "2 pages",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			story := Story{CurrentPage: tt.currentPage}
			result := story.PageCountDisplay()
			if result != tt.expected {
				t.Errorf("PageCountDisplay() = %q, want %q", result, tt.expected)
			}
		})
	}
}
