//go:build integration

package testutil

import (
	"context"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kbrakke/illustrated-primer/internal/db"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

// TestDatabase wraps a test database container.
type TestDatabase struct {
	Container testcontainers.Container
	Database  *db.Database
	Pool      *pgxpool.Pool
	ConnStr   string
}

// NewTestDatabase creates a new PostgreSQL test container and returns a connected database.
func NewTestDatabase(t *testing.T) *TestDatabase {
	t.Helper()
	ctx := context.Background()

	// Start PostgreSQL container
	container, err := postgres.Run(ctx,
		"postgres:16-alpine",
		postgres.WithDatabase("test_primer"),
		postgres.WithUsername("test"),
		postgres.WithPassword("test"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(60*time.Second),
		),
	)
	if err != nil {
		t.Fatalf("failed to start postgres container: %v", err)
	}

	// Get connection string
	connStr, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		container.Terminate(ctx)
		t.Fatalf("failed to get connection string: %v", err)
	}

	// Create database connection
	database, err := db.NewWithURL(ctx, connStr)
	if err != nil {
		container.Terminate(ctx)
		t.Fatalf("failed to connect to database: %v", err)
	}

	// Run migrations
	if err := database.Migrate(ctx); err != nil {
		database.Close()
		container.Terminate(ctx)
		t.Fatalf("failed to run migrations: %v", err)
	}

	testDB := &TestDatabase{
		Container: container,
		Database:  database,
		Pool:      database.Pool(),
		ConnStr:   connStr,
	}

	// Register cleanup
	t.Cleanup(func() {
		database.Close()
		container.Terminate(ctx)
	})

	return testDB
}

// Clean removes all data from the database tables.
func (td *TestDatabase) Clean(t *testing.T) {
	t.Helper()
	ctx := context.Background()

	// Delete in reverse order of foreign key dependencies
	tables := []string{"pages", "stories", "users"}
	for _, table := range tables {
		_, err := td.Pool.Exec(ctx, "DELETE FROM "+table)
		if err != nil {
			t.Fatalf("failed to clean table %s: %v", table, err)
		}
	}
}
