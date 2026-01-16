package db

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// MigrationSQL contains the initial schema migration.
// This is loaded at runtime rather than embedded since the migrations
// directory is at the project root.
const MigrationSQL = `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT,
    email TEXT UNIQUE,
    email_verified BIGINT,
    image TEXT,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT),
    updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT)
);

CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    current_page BIGINT NOT NULL DEFAULT 1,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT),
    updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY NOT NULL,
    story_id TEXT NOT NULL,
    page_num BIGINT NOT NULL,
    prompt TEXT NOT NULL,
    completion TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    image_path TEXT,
    audio_path TEXT,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT),
    updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT),
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    UNIQUE(story_id, page_num)
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_created ON stories(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pages_story_id ON pages(story_id);
CREATE INDEX IF NOT EXISTS idx_pages_story_page ON pages(story_id, page_num);
`

// Database wraps a PostgreSQL connection pool and provides database operations.
type Database struct {
	pool   *pgxpool.Pool
	logger *slog.Logger
}

// Config holds database configuration options.
type Config struct {
	URL             string
	MaxConnections  int32
	MinConnections  int32
	ConnMaxLifetime time.Duration
	Logger          *slog.Logger
}

// DefaultConfig returns a Config with sensible defaults.
func DefaultConfig(url string) *Config {
	return &Config{
		URL:             url,
		MaxConnections:  5,
		MinConnections:  1,
		ConnMaxLifetime: time.Hour,
		Logger:          slog.Default(),
	}
}

// New creates a new Database connection with the given configuration.
func New(ctx context.Context, cfg *Config) (*Database, error) {
	poolConfig, err := pgxpool.ParseConfig(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("parse database URL: %w", err)
	}

	poolConfig.MaxConns = cfg.MaxConnections
	poolConfig.MinConns = cfg.MinConnections
	poolConfig.MaxConnLifetime = cfg.ConnMaxLifetime

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("create connection pool: %w", err)
	}

	// Test the connection
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	cfg.Logger.Info("database connection established",
		"max_connections", cfg.MaxConnections,
		"min_connections", cfg.MinConnections,
	)

	return &Database{
		pool:   pool,
		logger: cfg.Logger,
	}, nil
}

// NewWithURL creates a new Database connection with default configuration.
func NewWithURL(ctx context.Context, url string) (*Database, error) {
	return New(ctx, DefaultConfig(url))
}

// Pool returns the underlying connection pool.
func (db *Database) Pool() *pgxpool.Pool {
	return db.pool
}

// Close closes the database connection pool.
func (db *Database) Close() {
	db.pool.Close()
	db.logger.Info("database connection closed")
}

// Migrate runs all pending database migrations.
func (db *Database) Migrate(ctx context.Context) error {
	_, err := db.pool.Exec(ctx, MigrationSQL)
	if err != nil {
		return fmt.Errorf("execute migration: %w", err)
	}

	db.logger.Info("database migrations completed")
	return nil
}

// MigrateFromString runs migrations from a SQL string.
// This is useful for testing where the embedded FS may not work.
func (db *Database) MigrateFromString(ctx context.Context, sql string) error {
	_, err := db.pool.Exec(ctx, sql)
	if err != nil {
		return fmt.Errorf("execute migration: %w", err)
	}

	db.logger.Info("database migrations completed")
	return nil
}

// Ping checks if the database connection is alive.
func (db *Database) Ping(ctx context.Context) error {
	return db.pool.Ping(ctx)
}
