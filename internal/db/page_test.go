//go:build integration

package db_test

import (
	"context"
	"testing"

	"github.com/kbrakke/illustrated-primer/internal/db"
	"github.com/kbrakke/illustrated-primer/internal/models"
	"github.com/kbrakke/illustrated-primer/testutil"
)

func TestPageCRUD(t *testing.T) {
	testDB := testutil.NewTestDatabase(t)
	ctx := context.Background()

	// Create a user and story for the pages
	user := models.NewUser("Page Test User", "page-test@example.com")
	if err := testDB.Database.CreateUser(ctx, user); err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	story := models.NewStory(user.ID, "Page Test Story", "")
	if err := testDB.Database.CreateStory(ctx, story); err != nil {
		t.Fatalf("failed to create story: %v", err)
	}

	t.Run("CreatePage", func(t *testing.T) {
		page := models.NewPage(story.ID, 1, "Test prompt", "Test completion")
		err := testDB.Database.CreatePage(ctx, page)
		if err != nil {
			t.Fatalf("CreatePage failed: %v", err)
		}
	})

	t.Run("GetPageByID", func(t *testing.T) {
		page := models.NewPage(story.ID, 2, "Get page prompt", "Get page completion")
		if err := testDB.Database.CreatePage(ctx, page); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		retrieved, err := testDB.Database.GetPageByID(ctx, page.ID)
		if err != nil {
			t.Fatalf("GetPageByID failed: %v", err)
		}

		if retrieved.ID != page.ID {
			t.Errorf("ID = %q, want %q", retrieved.ID, page.ID)
		}
		if retrieved.Prompt != page.Prompt {
			t.Errorf("Prompt = %q, want %q", retrieved.Prompt, page.Prompt)
		}
	})

	t.Run("GetPageByID_NotFound", func(t *testing.T) {
		_, err := testDB.Database.GetPageByID(ctx, "nonexistent-id")
		if err != db.ErrPageNotFound {
			t.Errorf("expected ErrPageNotFound, got %v", err)
		}
	})

	t.Run("GetPageByStoryAndNum", func(t *testing.T) {
		// Create a new story to avoid conflicts
		newStory := models.NewStory(user.ID, "Story Num Test", "")
		if err := testDB.Database.CreateStory(ctx, newStory); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		page := models.NewPage(newStory.ID, 1, "Story num prompt", "Story num completion")
		if err := testDB.Database.CreatePage(ctx, page); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		retrieved, err := testDB.Database.GetPageByStoryAndNum(ctx, newStory.ID, 1)
		if err != nil {
			t.Fatalf("GetPageByStoryAndNum failed: %v", err)
		}

		if retrieved.ID != page.ID {
			t.Errorf("ID = %q, want %q", retrieved.ID, page.ID)
		}
	})

	t.Run("ListPagesByStory", func(t *testing.T) {
		// Create a new story with multiple pages
		newStory := models.NewStory(user.ID, "List Pages Story", "")
		if err := testDB.Database.CreateStory(ctx, newStory); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		for i := int64(1); i <= 3; i++ {
			page := models.NewPage(newStory.ID, i, "Prompt "+string(rune('0'+i)), "Completion")
			if err := testDB.Database.CreatePage(ctx, page); err != nil {
				t.Fatalf("setup failed: %v", err)
			}
		}

		pages, err := testDB.Database.ListPagesByStory(ctx, newStory.ID)
		if err != nil {
			t.Fatalf("ListPagesByStory failed: %v", err)
		}

		if len(pages) != 3 {
			t.Errorf("got %d pages, want 3", len(pages))
		}

		// Check ordering
		for i, page := range pages {
			expectedNum := int64(i + 1)
			if page.PageNum != expectedNum {
				t.Errorf("page %d PageNum = %d, want %d", i, page.PageNum, expectedNum)
			}
		}
	})

	t.Run("GetNextPageNum", func(t *testing.T) {
		// Create a new story
		newStory := models.NewStory(user.ID, "Next Page Num Story", "")
		if err := testDB.Database.CreateStory(ctx, newStory); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		// Should be 1 for empty story
		nextNum, err := testDB.Database.GetNextPageNum(ctx, newStory.ID)
		if err != nil {
			t.Fatalf("GetNextPageNum failed: %v", err)
		}
		if nextNum != 1 {
			t.Errorf("nextNum = %d, want 1", nextNum)
		}

		// Add a page
		page := models.NewPage(newStory.ID, 1, "First", "First")
		if err := testDB.Database.CreatePage(ctx, page); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		// Should be 2 now
		nextNum, err = testDB.Database.GetNextPageNum(ctx, newStory.ID)
		if err != nil {
			t.Fatalf("GetNextPageNum failed: %v", err)
		}
		if nextNum != 2 {
			t.Errorf("nextNum = %d, want 2", nextNum)
		}
	})

	t.Run("UpdatePage", func(t *testing.T) {
		newStory := models.NewStory(user.ID, "Update Page Story", "")
		if err := testDB.Database.CreateStory(ctx, newStory); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		page := models.NewPage(newStory.ID, 1, "Old prompt", "Old completion")
		if err := testDB.Database.CreatePage(ctx, page); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		page.Prompt = "New prompt"
		page.Completion = "New completion"
		if err := testDB.Database.UpdatePage(ctx, page); err != nil {
			t.Fatalf("UpdatePage failed: %v", err)
		}

		retrieved, err := testDB.Database.GetPageByID(ctx, page.ID)
		if err != nil {
			t.Fatalf("GetPageByID failed: %v", err)
		}

		if retrieved.Prompt != "New prompt" {
			t.Errorf("Prompt = %q, want %q", retrieved.Prompt, "New prompt")
		}
	})

	t.Run("DeletePage", func(t *testing.T) {
		newStory := models.NewStory(user.ID, "Delete Page Story", "")
		if err := testDB.Database.CreateStory(ctx, newStory); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		page := models.NewPage(newStory.ID, 1, "Delete prompt", "Delete completion")
		if err := testDB.Database.CreatePage(ctx, page); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		if err := testDB.Database.DeletePage(ctx, page.ID); err != nil {
			t.Fatalf("DeletePage failed: %v", err)
		}

		_, err := testDB.Database.GetPageByID(ctx, page.ID)
		if err != db.ErrPageNotFound {
			t.Errorf("expected ErrPageNotFound after delete, got %v", err)
		}
	})
}
