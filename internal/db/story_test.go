//go:build integration

package db_test

import (
	"context"
	"testing"

	"github.com/kbrakke/illustrated-primer/internal/db"
	"github.com/kbrakke/illustrated-primer/internal/models"
	"github.com/kbrakke/illustrated-primer/testutil"
)

func TestStoryCRUD(t *testing.T) {
	testDB := testutil.NewTestDatabase(t)
	ctx := context.Background()

	// Create a user for the stories
	user := models.NewUser("Story Test User", "story-test@example.com")
	if err := testDB.Database.CreateUser(ctx, user); err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	t.Run("CreateStory", func(t *testing.T) {
		story := models.NewStory(user.ID, "Test Story", "A test summary")
		err := testDB.Database.CreateStory(ctx, story)
		if err != nil {
			t.Fatalf("CreateStory failed: %v", err)
		}
	})

	t.Run("GetStoryByID", func(t *testing.T) {
		story := models.NewStory(user.ID, "Get Story Test", "Summary")
		if err := testDB.Database.CreateStory(ctx, story); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		retrieved, err := testDB.Database.GetStoryByID(ctx, story.ID)
		if err != nil {
			t.Fatalf("GetStoryByID failed: %v", err)
		}

		if retrieved.ID != story.ID {
			t.Errorf("ID = %q, want %q", retrieved.ID, story.ID)
		}
		if retrieved.Title != story.Title {
			t.Errorf("Title = %q, want %q", retrieved.Title, story.Title)
		}
	})

	t.Run("GetStoryByID_NotFound", func(t *testing.T) {
		_, err := testDB.Database.GetStoryByID(ctx, "nonexistent-id")
		if err != db.ErrStoryNotFound {
			t.Errorf("expected ErrStoryNotFound, got %v", err)
		}
	})

	t.Run("ListStoriesByUser", func(t *testing.T) {
		// Create a new user to avoid conflicts
		newUser := models.NewUser("List Story User", "list-story@example.com")
		if err := testDB.Database.CreateUser(ctx, newUser); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		// Create multiple stories
		for i := 0; i < 3; i++ {
			story := models.NewStory(newUser.ID, "Story "+string(rune('A'+i)), "")
			if err := testDB.Database.CreateStory(ctx, story); err != nil {
				t.Fatalf("setup failed: %v", err)
			}
		}

		stories, err := testDB.Database.ListStoriesByUser(ctx, newUser.ID)
		if err != nil {
			t.Fatalf("ListStoriesByUser failed: %v", err)
		}

		if len(stories) != 3 {
			t.Errorf("got %d stories, want 3", len(stories))
		}
	})

	t.Run("IncrementCurrentPage", func(t *testing.T) {
		story := models.NewStory(user.ID, "Increment Test", "")
		if err := testDB.Database.CreateStory(ctx, story); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		if story.CurrentPage != 1 {
			t.Fatalf("initial CurrentPage = %d, want 1", story.CurrentPage)
		}

		if err := testDB.Database.IncrementCurrentPage(ctx, story.ID); err != nil {
			t.Fatalf("IncrementCurrentPage failed: %v", err)
		}

		retrieved, err := testDB.Database.GetStoryByID(ctx, story.ID)
		if err != nil {
			t.Fatalf("GetStoryByID failed: %v", err)
		}

		if retrieved.CurrentPage != 2 {
			t.Errorf("CurrentPage = %d, want 2", retrieved.CurrentPage)
		}
	})

	t.Run("UpdateStory", func(t *testing.T) {
		story := models.NewStory(user.ID, "Update Test", "Old summary")
		if err := testDB.Database.CreateStory(ctx, story); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		story.Title = "Updated Title"
		story.Summary = "New summary"
		if err := testDB.Database.UpdateStory(ctx, story); err != nil {
			t.Fatalf("UpdateStory failed: %v", err)
		}

		retrieved, err := testDB.Database.GetStoryByID(ctx, story.ID)
		if err != nil {
			t.Fatalf("GetStoryByID failed: %v", err)
		}

		if retrieved.Title != "Updated Title" {
			t.Errorf("Title = %q, want %q", retrieved.Title, "Updated Title")
		}
		if retrieved.Summary != "New summary" {
			t.Errorf("Summary = %q, want %q", retrieved.Summary, "New summary")
		}
	})

	t.Run("DeleteStory", func(t *testing.T) {
		story := models.NewStory(user.ID, "Delete Test", "")
		if err := testDB.Database.CreateStory(ctx, story); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		if err := testDB.Database.DeleteStory(ctx, story.ID); err != nil {
			t.Fatalf("DeleteStory failed: %v", err)
		}

		_, err := testDB.Database.GetStoryByID(ctx, story.ID)
		if err != db.ErrStoryNotFound {
			t.Errorf("expected ErrStoryNotFound after delete, got %v", err)
		}
	})
}
