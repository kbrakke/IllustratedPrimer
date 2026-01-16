package models

import (
	"time"

	"github.com/google/uuid"
)

// Page represents a single page in a story, containing user prompt and AI completion.
type Page struct {
	ID         string  `json:"id"`
	StoryID    string  `json:"story_id"`
	PageNum    int64   `json:"page_num"`
	Prompt     string  `json:"prompt"`
	Completion string  `json:"completion"`
	Summary    string  `json:"summary"`
	ImagePath  *string `json:"image_path"`
	AudioPath  *string `json:"audio_path"`
	CreatedAt  int64   `json:"created_at"`
	UpdatedAt  int64   `json:"updated_at"`
}

// NewPage creates a new Page with a generated UUID and current timestamps.
func NewPage(storyID string, pageNum int64, prompt, completion string) *Page {
	now := time.Now().Unix()
	return &Page{
		ID:         uuid.New().String(),
		StoryID:    storyID,
		PageNum:    pageNum,
		Prompt:     prompt,
		Completion: completion,
		Summary:    "",
		CreatedAt:  now,
		UpdatedAt:  now,
	}
}

// NewPageWithSummary creates a new Page with a summary included.
func NewPageWithSummary(storyID string, pageNum int64, prompt, completion, summary string) *Page {
	page := NewPage(storyID, pageNum, prompt, completion)
	page.Summary = summary
	return page
}
