package db

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/kbrakke/illustrated-primer/internal/models"
)

// ErrPageNotFound is returned when a page is not found.
var ErrPageNotFound = errors.New("page not found")

// CreatePage inserts a new page into the database.
func (db *Database) CreatePage(ctx context.Context, page *models.Page) error {
	query := `
		INSERT INTO pages (id, story_id, page_num, prompt, completion, summary, image_path, audio_path, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := db.pool.Exec(ctx, query,
		page.ID,
		page.StoryID,
		page.PageNum,
		page.Prompt,
		page.Completion,
		page.Summary,
		page.ImagePath,
		page.AudioPath,
		page.CreatedAt,
		page.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert page: %w", err)
	}
	return nil
}

// GetPageByID retrieves a page by its ID.
func (db *Database) GetPageByID(ctx context.Context, id string) (*models.Page, error) {
	query := `
		SELECT id, story_id, page_num, prompt, completion, summary, image_path, audio_path, created_at, updated_at
		FROM pages
		WHERE id = $1
	`
	var page models.Page
	err := db.pool.QueryRow(ctx, query, id).Scan(
		&page.ID,
		&page.StoryID,
		&page.PageNum,
		&page.Prompt,
		&page.Completion,
		&page.Summary,
		&page.ImagePath,
		&page.AudioPath,
		&page.CreatedAt,
		&page.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPageNotFound
		}
		return nil, fmt.Errorf("query page by id: %w", err)
	}
	return &page, nil
}

// GetPageByStoryAndNum retrieves a page by story ID and page number.
func (db *Database) GetPageByStoryAndNum(ctx context.Context, storyID string, pageNum int64) (*models.Page, error) {
	query := `
		SELECT id, story_id, page_num, prompt, completion, summary, image_path, audio_path, created_at, updated_at
		FROM pages
		WHERE story_id = $1 AND page_num = $2
	`
	var page models.Page
	err := db.pool.QueryRow(ctx, query, storyID, pageNum).Scan(
		&page.ID,
		&page.StoryID,
		&page.PageNum,
		&page.Prompt,
		&page.Completion,
		&page.Summary,
		&page.ImagePath,
		&page.AudioPath,
		&page.CreatedAt,
		&page.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPageNotFound
		}
		return nil, fmt.Errorf("query page by story and num: %w", err)
	}
	return &page, nil
}

// ListPagesByStory retrieves all pages for a story ordered by page number.
func (db *Database) ListPagesByStory(ctx context.Context, storyID string) ([]models.Page, error) {
	query := `
		SELECT id, story_id, page_num, prompt, completion, summary, image_path, audio_path, created_at, updated_at
		FROM pages
		WHERE story_id = $1
		ORDER BY page_num ASC
	`
	rows, err := db.pool.Query(ctx, query, storyID)
	if err != nil {
		return nil, fmt.Errorf("query pages: %w", err)
	}
	defer rows.Close()

	var pages []models.Page
	for rows.Next() {
		var page models.Page
		if err := rows.Scan(
			&page.ID,
			&page.StoryID,
			&page.PageNum,
			&page.Prompt,
			&page.Completion,
			&page.Summary,
			&page.ImagePath,
			&page.AudioPath,
			&page.CreatedAt,
			&page.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan page: %w", err)
		}
		pages = append(pages, page)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate pages: %w", err)
	}

	return pages, nil
}

// GetNextPageNum returns the next page number for a story.
func (db *Database) GetNextPageNum(ctx context.Context, storyID string) (int64, error) {
	query := `SELECT COALESCE(MAX(page_num), 0) + 1 FROM pages WHERE story_id = $1`
	var nextNum int64
	err := db.pool.QueryRow(ctx, query, storyID).Scan(&nextNum)
	if err != nil {
		return 0, fmt.Errorf("get next page num: %w", err)
	}
	return nextNum, nil
}

// UpdatePage updates an existing page.
func (db *Database) UpdatePage(ctx context.Context, page *models.Page) error {
	page.UpdatedAt = time.Now().Unix()
	query := `
		UPDATE pages
		SET prompt = $2, completion = $3, summary = $4, image_path = $5, audio_path = $6, updated_at = $7
		WHERE id = $1
	`
	result, err := db.pool.Exec(ctx, query,
		page.ID,
		page.Prompt,
		page.Completion,
		page.Summary,
		page.ImagePath,
		page.AudioPath,
		page.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("update page: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrPageNotFound
	}
	return nil
}

// DeletePage deletes a page by its ID.
func (db *Database) DeletePage(ctx context.Context, id string) error {
	query := `DELETE FROM pages WHERE id = $1`
	result, err := db.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete page: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrPageNotFound
	}
	return nil
}
