package models

import (
	"testing"
)

func TestNewPage(t *testing.T) {
	page := NewPage("story-123", 5, "User prompt", "AI completion")

	if page.ID == "" {
		t.Error("expected non-empty ID")
	}
	if page.StoryID != "story-123" {
		t.Errorf("StoryID = %q, want %q", page.StoryID, "story-123")
	}
	if page.PageNum != 5 {
		t.Errorf("PageNum = %d, want %d", page.PageNum, 5)
	}
	if page.Prompt != "User prompt" {
		t.Errorf("Prompt = %q, want %q", page.Prompt, "User prompt")
	}
	if page.Completion != "AI completion" {
		t.Errorf("Completion = %q, want %q", page.Completion, "AI completion")
	}
	if page.Summary != "" {
		t.Errorf("Summary = %q, want empty string", page.Summary)
	}
	if page.CreatedAt == 0 {
		t.Error("expected non-zero CreatedAt")
	}
	if page.UpdatedAt == 0 {
		t.Error("expected non-zero UpdatedAt")
	}
}

func TestNewPageWithSummary(t *testing.T) {
	page := NewPageWithSummary("story-123", 1, "Prompt", "Completion", "Summary text")

	if page.Summary != "Summary text" {
		t.Errorf("Summary = %q, want %q", page.Summary, "Summary text")
	}
	if page.Prompt != "Prompt" {
		t.Errorf("Prompt = %q, want %q", page.Prompt, "Prompt")
	}
}
