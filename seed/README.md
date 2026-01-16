# Seed Data

This directory contains example data for the Illustrated Primer application. Use the `--seed` flag to load this data into the database.

## Usage

```bash
# Run with seed data
./bin/primer --seed

# Or during development
go run ./cmd/primer --seed
```

## Data Files

### users.json
Contains example users. Currently includes:
- **Princess Nellodee**: A young learner exploring magical adventures

### stories.json
Contains example stories. Currently includes:
- **The Magic Garden Adventure**: A 3-page story about Princess Nellodee discovering a hidden magical garden and learning about colors, shapes, and friendship

### pages.json
Contains the individual pages for each story. Each page includes:
- Prompts: What the user asked or wanted to explore
- Completions: The story text generated for that page
- Summaries: Brief descriptions of what happens on each page
- Optional image and audio paths (for future multimedia features)

## Data Structure

All JSON files follow the structure of their respective models:

- **User**: id, name, email, email_verified, image, created_at, updated_at
- **Story**: id, user_id, title, summary, current_page, created_at, updated_at
- **Page**: id, story_id, page_num, prompt, completion, summary, image_path, audio_path, created_at, updated_at

## Adding New Seed Data

To add new seed data:

1. Create or edit the JSON files in this directory
2. Ensure all IDs are unique and consistent across files (e.g., story user_id must match a user id)
3. Run the application with `--seed` flag

The seed loader will skip any data that already exists in the database (based on ID), so it's safe to run multiple times.
