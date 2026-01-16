.PHONY: build run test test-unit test-integration test-ai test-all clean fmt lint

# Build the application
build:
	go build -o bin/primer ./cmd/primer

# Run the application
run:
	go run ./cmd/primer

# Run with seed data
run-seed:
	go run ./cmd/primer --seed

# Run with debug logging
run-debug:
	go run ./cmd/primer --debug

# Run unit tests only (fast, no external dependencies)
test-unit:
	go test ./... -short -v

# Run integration tests (requires Docker for testcontainers)
test-integration:
	go test ./... -tags=integration -v -count=1

# Run AI tests (requires OPENAI_API_KEY, uses gpt-5-nano)
test-ai:
	AI_TESTS_ENABLED=true go test ./... -tags=ai -v -count=1

# Run all tests
test-all:
	AI_TESTS_ENABLED=true go test ./... -tags=integration,ai -v -count=1

# Default test target (unit + integration)
test:
	go test ./... -tags=integration -v -count=1

# Format code
fmt:
	go fmt ./...

# Run linter
lint:
	golangci-lint run

# Clean build artifacts
clean:
	rm -rf bin/
	rm -rf logs/

# Install dependencies
deps:
	go mod download
	go mod tidy

# Generate coverage report
coverage:
	go test ./... -coverprofile=coverage.out
	go tool cover -html=coverage.out -o coverage.html

# Help
help:
	@echo "Available targets:"
	@echo "  build           - Build the application"
	@echo "  run             - Run the application"
	@echo "  run-seed        - Run with seed data"
	@echo "  run-debug       - Run with debug logging"
	@echo "  test-unit       - Run unit tests only"
	@echo "  test-integration- Run integration tests (requires Docker)"
	@echo "  test-ai         - Run AI tests (requires OPENAI_API_KEY)"
	@echo "  test-all        - Run all tests"
	@echo "  test            - Run unit + integration tests"
	@echo "  fmt             - Format code"
	@echo "  lint            - Run linter"
	@echo "  clean           - Clean build artifacts"
	@echo "  deps            - Install/update dependencies"
	@echo "  coverage        - Generate coverage report"
