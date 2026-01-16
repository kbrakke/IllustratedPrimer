package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents an application user with authentication and profile information.
type User struct {
	ID            string  `json:"id"`
	Name          *string `json:"name"`
	Email         *string `json:"email"`
	EmailVerified *int64  `json:"email_verified"`
	Image         *string `json:"image"`
	CreatedAt     int64   `json:"created_at"`
	UpdatedAt     int64   `json:"updated_at"`
}

// NewUser creates a new User with a generated UUID and current timestamps.
func NewUser(name, email string) *User {
	now := time.Now().Unix()
	return &User{
		ID:        uuid.New().String(),
		Name:      &name,
		Email:     &email,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// DisplayName returns a display-friendly name for the user.
// Falls back to email or ID if name is not set.
func (u *User) DisplayName() string {
	if u.Name != nil && *u.Name != "" {
		return *u.Name
	}
	if u.Email != nil && *u.Email != "" {
		return *u.Email
	}
	return u.ID
}

// DisplayEmail returns the email or an empty string if not set.
func (u *User) DisplayEmail() string {
	if u.Email != nil {
		return *u.Email
	}
	return ""
}
