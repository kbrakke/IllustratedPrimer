//go:build integration

package db_test

import (
	"context"
	"testing"

	"github.com/kbrakke/illustrated-primer/internal/db"
	"github.com/kbrakke/illustrated-primer/internal/models"
	"github.com/kbrakke/illustrated-primer/testutil"
)

func TestUserCRUD(t *testing.T) {
	testDB := testutil.NewTestDatabase(t)
	ctx := context.Background()

	t.Run("CreateUser", func(t *testing.T) {
		user := models.NewUser("Test User", "test@example.com")
		err := testDB.Database.CreateUser(ctx, user)
		if err != nil {
			t.Fatalf("CreateUser failed: %v", err)
		}
	})

	t.Run("GetUserByID", func(t *testing.T) {
		// First create a user
		user := models.NewUser("Get Test", "get@example.com")
		if err := testDB.Database.CreateUser(ctx, user); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		// Then retrieve it
		retrieved, err := testDB.Database.GetUserByID(ctx, user.ID)
		if err != nil {
			t.Fatalf("GetUserByID failed: %v", err)
		}

		if retrieved.ID != user.ID {
			t.Errorf("ID = %q, want %q", retrieved.ID, user.ID)
		}
		if *retrieved.Name != *user.Name {
			t.Errorf("Name = %q, want %q", *retrieved.Name, *user.Name)
		}
	})

	t.Run("GetUserByID_NotFound", func(t *testing.T) {
		_, err := testDB.Database.GetUserByID(ctx, "nonexistent-id")
		if err != db.ErrUserNotFound {
			t.Errorf("expected ErrUserNotFound, got %v", err)
		}
	})

	t.Run("GetUserByEmail", func(t *testing.T) {
		user := models.NewUser("Email Test", "email-test@example.com")
		if err := testDB.Database.CreateUser(ctx, user); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		retrieved, err := testDB.Database.GetUserByEmail(ctx, "email-test@example.com")
		if err != nil {
			t.Fatalf("GetUserByEmail failed: %v", err)
		}

		if retrieved.ID != user.ID {
			t.Errorf("ID = %q, want %q", retrieved.ID, user.ID)
		}
	})

	t.Run("ListUsers", func(t *testing.T) {
		testDB.Clean(t)

		// Create multiple users
		for i := 0; i < 3; i++ {
			user := models.NewUser("List User", "list"+string(rune('0'+i))+"@example.com")
			if err := testDB.Database.CreateUser(ctx, user); err != nil {
				t.Fatalf("setup failed: %v", err)
			}
		}

		users, err := testDB.Database.ListUsers(ctx)
		if err != nil {
			t.Fatalf("ListUsers failed: %v", err)
		}

		if len(users) != 3 {
			t.Errorf("got %d users, want 3", len(users))
		}
	})

	t.Run("UpdateUser", func(t *testing.T) {
		user := models.NewUser("Update Test", "update@example.com")
		if err := testDB.Database.CreateUser(ctx, user); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		newName := "Updated Name"
		user.Name = &newName
		if err := testDB.Database.UpdateUser(ctx, user); err != nil {
			t.Fatalf("UpdateUser failed: %v", err)
		}

		retrieved, err := testDB.Database.GetUserByID(ctx, user.ID)
		if err != nil {
			t.Fatalf("GetUserByID failed: %v", err)
		}

		if *retrieved.Name != "Updated Name" {
			t.Errorf("Name = %q, want %q", *retrieved.Name, "Updated Name")
		}
	})

	t.Run("DeleteUser", func(t *testing.T) {
		user := models.NewUser("Delete Test", "delete@example.com")
		if err := testDB.Database.CreateUser(ctx, user); err != nil {
			t.Fatalf("setup failed: %v", err)
		}

		if err := testDB.Database.DeleteUser(ctx, user.ID); err != nil {
			t.Fatalf("DeleteUser failed: %v", err)
		}

		_, err := testDB.Database.GetUserByID(ctx, user.ID)
		if err != db.ErrUserNotFound {
			t.Errorf("expected ErrUserNotFound after delete, got %v", err)
		}
	})
}
