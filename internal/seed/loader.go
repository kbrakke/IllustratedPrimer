package seed

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	"github.com/kbrakke/illustrated-primer/internal/db"
	"github.com/kbrakke/illustrated-primer/internal/models"
)

// Loader handles loading seed data from JSON files.
type Loader struct {
	db     *db.Database
	logger *slog.Logger
}

// NewLoader creates a new seed data loader.
func NewLoader(database *db.Database, logger *slog.Logger) *Loader {
	return &Loader{
		db:     database,
		logger: logger,
	}
}

// LoadFromDirectory loads all seed data from the specified directory.
// It expects users.json, stories.json, and pages.json files.
func (l *Loader) LoadFromDirectory(dir string) error {
	ctx := context.Background()

	// Load users
	usersFile := filepath.Join(dir, "users.json")
	if err := l.loadUsers(ctx, usersFile); err != nil {
		return fmt.Errorf("load users: %w", err)
	}

	// Load stories
	storiesFile := filepath.Join(dir, "stories.json")
	if err := l.loadStories(ctx, storiesFile); err != nil {
		return fmt.Errorf("load stories: %w", err)
	}

	// Load pages
	pagesFile := filepath.Join(dir, "pages.json")
	if err := l.loadPages(ctx, pagesFile); err != nil {
		return fmt.Errorf("load pages: %w", err)
	}

	l.logger.Info("seed data loaded successfully")
	return nil
}

func (l *Loader) loadUsers(ctx context.Context, path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			l.logger.Warn("users seed file not found", "path", path)
			return nil
		}
		return fmt.Errorf("read file: %w", err)
	}

	var users []models.User
	if err := json.Unmarshal(data, &users); err != nil {
		return fmt.Errorf("parse JSON: %w", err)
	}

	for _, user := range users {
		// Check if user already exists
		existing, err := l.db.GetUserByID(ctx, user.ID)
		if err == nil && existing != nil {
			l.logger.Debug("user already exists, skipping", "id", user.ID)
			continue
		}

		if err := l.db.CreateUser(ctx, &user); err != nil {
			l.logger.Error("failed to create user", "id", user.ID, "error", err)
			continue
		}
		l.logger.Info("created user", "id", user.ID, "name", user.DisplayName())
	}

	return nil
}

func (l *Loader) loadStories(ctx context.Context, path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			l.logger.Warn("stories seed file not found", "path", path)
			return nil
		}
		return fmt.Errorf("read file: %w", err)
	}

	var stories []models.Story
	if err := json.Unmarshal(data, &stories); err != nil {
		return fmt.Errorf("parse JSON: %w", err)
	}

	for _, story := range stories {
		// Check if story already exists
		existing, err := l.db.GetStoryByID(ctx, story.ID)
		if err == nil && existing != nil {
			l.logger.Debug("story already exists, skipping", "id", story.ID)
			continue
		}

		if err := l.db.CreateStory(ctx, &story); err != nil {
			l.logger.Error("failed to create story", "id", story.ID, "error", err)
			continue
		}
		l.logger.Info("created story", "id", story.ID, "title", story.Title)
	}

	return nil
}

func (l *Loader) loadPages(ctx context.Context, path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			l.logger.Warn("pages seed file not found", "path", path)
			return nil
		}
		return fmt.Errorf("read file: %w", err)
	}

	var pages []models.Page
	if err := json.Unmarshal(data, &pages); err != nil {
		return fmt.Errorf("parse JSON: %w", err)
	}

	for _, page := range pages {
		// Check if page already exists
		existing, err := l.db.GetPageByID(ctx, page.ID)
		if err == nil && existing != nil {
			l.logger.Debug("page already exists, skipping", "id", page.ID)
			continue
		}

		if err := l.db.CreatePage(ctx, &page); err != nil {
			l.logger.Error("failed to create page", "id", page.ID, "error", err)
			continue
		}
		l.logger.Info("created page", "id", page.ID, "story_id", page.StoryID, "page_num", page.PageNum)
	}

	return nil
}
