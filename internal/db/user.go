package db

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/kbrakke/illustrated-primer/internal/models"
)

// ErrUserNotFound is returned when a user is not found.
var ErrUserNotFound = errors.New("user not found")

// CreateUser inserts a new user into the database.
func (db *Database) CreateUser(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (id, name, email, email_verified, image, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := db.pool.Exec(ctx, query,
		user.ID,
		user.Name,
		user.Email,
		user.EmailVerified,
		user.Image,
		user.CreatedAt,
		user.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert user: %w", err)
	}
	return nil
}

// GetUserByID retrieves a user by their ID.
func (db *Database) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	query := `
		SELECT id, name, email, email_verified, image, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	var user models.User
	err := db.pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.EmailVerified,
		&user.Image,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("query user by id: %w", err)
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by their email address.
func (db *Database) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `
		SELECT id, name, email, email_verified, image, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	var user models.User
	err := db.pool.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.EmailVerified,
		&user.Image,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("query user by email: %w", err)
	}
	return &user, nil
}

// ListUsers retrieves all users ordered by creation date.
func (db *Database) ListUsers(ctx context.Context) ([]models.User, error) {
	query := `
		SELECT id, name, email, email_verified, image, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
	`
	rows, err := db.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query users: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.EmailVerified,
			&user.Image,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan user: %w", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate users: %w", err)
	}

	return users, nil
}

// UpdateUser updates an existing user.
func (db *Database) UpdateUser(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now().Unix()
	query := `
		UPDATE users
		SET name = $2, email = $3, email_verified = $4, image = $5, updated_at = $6
		WHERE id = $1
	`
	result, err := db.pool.Exec(ctx, query,
		user.ID,
		user.Name,
		user.Email,
		user.EmailVerified,
		user.Image,
		user.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("update user: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrUserNotFound
	}
	return nil
}

// DeleteUser deletes a user by their ID.
func (db *Database) DeleteUser(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	result, err := db.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete user: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrUserNotFound
	}
	return nil
}
