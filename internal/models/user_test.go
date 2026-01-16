package models

import (
	"testing"
)

func TestNewUser(t *testing.T) {
	user := NewUser("Test User", "test@example.com")

	if user.ID == "" {
		t.Error("expected non-empty ID")
	}
	if user.Name == nil || *user.Name != "Test User" {
		t.Error("expected name to be 'Test User'")
	}
	if user.Email == nil || *user.Email != "test@example.com" {
		t.Error("expected email to be 'test@example.com'")
	}
	if user.CreatedAt == 0 {
		t.Error("expected non-zero CreatedAt")
	}
	if user.UpdatedAt == 0 {
		t.Error("expected non-zero UpdatedAt")
	}
}

func TestUserDisplayName(t *testing.T) {
	tests := []struct {
		name     string
		user     User
		expected string
	}{
		{
			name: "with name",
			user: func() User {
				name := "John Doe"
				email := "john@example.com"
				return User{ID: "123", Name: &name, Email: &email}
			}(),
			expected: "John Doe",
		},
		{
			name: "with empty name, uses email",
			user: func() User {
				name := ""
				email := "john@example.com"
				return User{ID: "123", Name: &name, Email: &email}
			}(),
			expected: "john@example.com",
		},
		{
			name: "with nil name, uses email",
			user: func() User {
				email := "john@example.com"
				return User{ID: "123", Name: nil, Email: &email}
			}(),
			expected: "john@example.com",
		},
		{
			name:     "with nil name and email, uses ID",
			user:     User{ID: "123", Name: nil, Email: nil},
			expected: "123",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.user.DisplayName()
			if result != tt.expected {
				t.Errorf("DisplayName() = %q, want %q", result, tt.expected)
			}
		})
	}
}

func TestUserDisplayEmail(t *testing.T) {
	t.Run("with email", func(t *testing.T) {
		email := "test@example.com"
		user := User{Email: &email}
		if user.DisplayEmail() != "test@example.com" {
			t.Errorf("DisplayEmail() = %q, want %q", user.DisplayEmail(), "test@example.com")
		}
	})

	t.Run("without email", func(t *testing.T) {
		user := User{Email: nil}
		if user.DisplayEmail() != "" {
			t.Errorf("DisplayEmail() = %q, want empty string", user.DisplayEmail())
		}
	})
}
