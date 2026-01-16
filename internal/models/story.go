package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Story represents an interactive educational story belonging to a user.
type Story struct {
	ID          string `json:"id"`
	UserID      string `json:"user_id"`
	Title       string `json:"title"`
	Summary     string `json:"summary"`
	CurrentPage int64  `json:"current_page"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
}

// NewStory creates a new Story with a generated UUID and current timestamps.
func NewStory(userID, title, summary string) *Story {
	now := time.Now().Unix()
	return &Story{
		ID:          uuid.New().String(),
		UserID:      userID,
		Title:       title,
		Summary:     summary,
		CurrentPage: 1,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// PageCountDisplay returns a display string showing the current page.
// This is used in the story list view.
func (s *Story) PageCountDisplay() string {
	if s.CurrentPage == 1 {
		return "1 page"
	}
	return fmt.Sprintf("%d pages", s.CurrentPage)
}
