package db

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/kbrakke/illustrated-primer/internal/models"
)

// ErrStoryNotFound is returned when a story is not found.
var ErrStoryNotFound = errors.New("story not found")

// CreateStory inserts a new story into the database.
func (db *Database) CreateStory(ctx context.Context, story *models.Story) error {
	query := `
		INSERT INTO stories (id, user_id, title, summary, current_page, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := db.pool.Exec(ctx, query,
		story.ID,
		story.UserID,
		story.Title,
		story.Summary,
		story.CurrentPage,
		story.CreatedAt,
		story.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert story: %w", err)
	}
	return nil
}

// GetStoryByID retrieves a story by its ID.
func (db *Database) GetStoryByID(ctx context.Context, id string) (*models.Story, error) {
	query := `
		SELECT id, user_id, title, summary, current_page, created_at, updated_at
		FROM stories
		WHERE id = $1
	`
	var story models.Story
	err := db.pool.QueryRow(ctx, query, id).Scan(
		&story.ID,
		&story.UserID,
		&story.Title,
		&story.Summary,
		&story.CurrentPage,
		&story.CreatedAt,
		&story.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrStoryNotFound
		}
		return nil, fmt.Errorf("query story by id: %w", err)
	}
	return &story, nil
}

// ListStoriesByUser retrieves all stories for a user ordered by creation date.
func (db *Database) ListStoriesByUser(ctx context.Context, userID string) ([]models.Story, error) {
	query := `
		SELECT id, user_id, title, summary, current_page, created_at, updated_at
		FROM stories
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	rows, err := db.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("query stories: %w", err)
	}
	defer rows.Close()

	var stories []models.Story
	for rows.Next() {
		var story models.Story
		if err := rows.Scan(
			&story.ID,
			&story.UserID,
			&story.Title,
			&story.Summary,
			&story.CurrentPage,
			&story.CreatedAt,
			&story.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan story: %w", err)
		}
		stories = append(stories, story)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate stories: %w", err)
	}

	return stories, nil
}

// UpdateStory updates an existing story.
func (db *Database) UpdateStory(ctx context.Context, story *models.Story) error {
	story.UpdatedAt = time.Now().Unix()
	query := `
		UPDATE stories
		SET title = $2, summary = $3, current_page = $4, updated_at = $5
		WHERE id = $1
	`
	result, err := db.pool.Exec(ctx, query,
		story.ID,
		story.Title,
		story.Summary,
		story.CurrentPage,
		story.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("update story: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrStoryNotFound
	}
	return nil
}

// IncrementCurrentPage increments the current page of a story.
func (db *Database) IncrementCurrentPage(ctx context.Context, storyID string) error {
	query := `
		UPDATE stories
		SET current_page = current_page + 1, updated_at = $2
		WHERE id = $1
	`
	result, err := db.pool.Exec(ctx, query, storyID, time.Now().Unix())
	if err != nil {
		return fmt.Errorf("increment current page: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrStoryNotFound
	}
	return nil
}

// DeleteStory deletes a story by its ID.
func (db *Database) DeleteStory(ctx context.Context, id string) error {
	query := `DELETE FROM stories WHERE id = $1`
	result, err := db.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete story: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrStoryNotFound
	}
	return nil
}

// GetStoryPageCount returns the number of pages in a story.
func (db *Database) GetStoryPageCount(ctx context.Context, storyID string) (int64, error) {
	query := `SELECT COUNT(*) FROM pages WHERE story_id = $1`
	var count int64
	err := db.pool.QueryRow(ctx, query, storyID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("count pages: %w", err)
	}
	return count, nil
}
