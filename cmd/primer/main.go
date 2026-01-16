package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strconv"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/joho/godotenv"
	"github.com/kbrakke/illustrated-primer/internal/ai"
	"github.com/kbrakke/illustrated-primer/internal/db"
	"github.com/kbrakke/illustrated-primer/internal/seed"
	"github.com/kbrakke/illustrated-primer/internal/tui"
)

func main() {
	// Parse command line flags
	seedFlag := flag.Bool("seed", false, "Load seed data from the seed/ directory")
	debugFlag := flag.Bool("debug", false, "Enable debug logging")
	flag.Parse()

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		// .env file is optional
		_ = err
	}

	// Set up logging
	logLevel := slog.LevelInfo
	if *debugFlag {
		logLevel = slog.LevelDebug
	}

	// Create log directory
	logDir := "logs"
	if err := os.MkdirAll(logDir, 0755); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to create log directory: %v\n", err)
		os.Exit(1)
	}

	// Create timestamped log file
	timestamp := time.Now().Format("20060102_150405")
	logFilePath := filepath.Join(logDir, fmt.Sprintf("tui_%s.log", timestamp))
	logFile, err := os.Create(logFilePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to create log file: %v\n", err)
		os.Exit(1)
	}
	defer logFile.Close()

	logger := slog.New(slog.NewTextHandler(logFile, &slog.HandlerOptions{
		Level: logLevel,
	}))

	logger.Info("=== Illustrated Primer TUI Starting ===")
	logger.Info("log file created", "path", logFilePath)

	// Get configuration from environment
	openaiAPIKey := os.Getenv("OPENAI_API_KEY")
	if openaiAPIKey == "" {
		fmt.Fprintln(os.Stderr, "OPENAI_API_KEY must be set in environment")
		os.Exit(1)
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://localhost:5432/primer?sslmode=disable"
	}

	// Initialize database
	logger.Info("initializing database connection", "url", maskDatabaseURL(databaseURL))
	ctx := context.Background()

	database, err := db.NewWithURL(ctx, databaseURL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to connect to database: %v\n", err)
		logger.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer database.Close()

	// Run migrations
	logger.Info("running database migrations")
	if err := database.Migrate(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to run migrations: %v\n", err)
		logger.Error("failed to run migrations", "error", err)
		os.Exit(1)
	}

	// Load seed data if requested
	if *seedFlag {
		seedDir := "seed"
		if _, err := os.Stat(seedDir); err == nil {
			logger.Info("loading seed data", "dir", seedDir)
			seedLoader := seed.NewLoader(database, logger)
			if err := seedLoader.LoadFromDirectory(seedDir); err != nil {
				logger.Error("failed to load seed data", "error", err)
				// Continue anyway - seed data is optional
			}
		} else {
			logger.Warn("seed directory not found", "dir", seedDir)
		}
	}

	// Initialize AI client
	logger.Info("initializing OpenAI client")
	aiModel := os.Getenv("OPENAI_MODEL")
	if aiModel == "" {
		aiModel = ai.DefaultModel
	}

	// Build client options
	clientOpts := []ai.ClientOption{
		ai.WithModel(aiModel),
		ai.WithLogger(logger),
	}

	// Check for max tokens override
	if maxTokensStr := os.Getenv("OPENAI_MAX_TOKENS"); maxTokensStr != "" {
		if maxTokens, err := strconv.Atoi(maxTokensStr); err == nil && maxTokens > 0 {
			clientOpts = append(clientOpts, ai.WithMaxTokens(maxTokens))
			logger.Info("using custom max tokens", "max_tokens", maxTokens)
		} else {
			logger.Warn("invalid OPENAI_MAX_TOKENS value, using default", "value", maxTokensStr)
		}
	}

	// Check for organization ID
	if orgID := os.Getenv("OPENAI_ORG_ID"); orgID != "" {
		clientOpts = append(clientOpts, ai.WithOrgID(orgID))
	}

	aiClient := ai.NewClient(openaiAPIKey, clientOpts...)

	// Create and run the TUI
	logger.Info("starting TUI")
	model := tui.New(database, aiClient, logger)

	program := tea.NewProgram(model, tea.WithAltScreen())
	if _, err := program.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error running program: %v\n", err)
		logger.Error("program error", "error", err)
		os.Exit(1)
	}

	logger.Info("application exited successfully")
}

// maskDatabaseURL masks sensitive parts of a database URL for logging.
func maskDatabaseURL(url string) string {
	// Simple masking - in production you'd want to parse the URL properly
	if len(url) > 20 {
		return url[:20] + "..."
	}
	return url
}
