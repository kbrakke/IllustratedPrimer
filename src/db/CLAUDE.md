# Database Module

## Purpose
This module provides the data persistence layer for the Illustrated Primer application using SQLite. It manages database connections, migrations, and CRUD operations for all domain entities (users, stories, and pages). The module uses SQLx for type-safe, async database operations with connection pooling.

## Architecture
The module follows a repository pattern with separation of concerns:
- **Connection Layer**: Database pool management and configuration
- **Repository Layer**: Entity-specific CRUD operations
- **Migration Layer**: Schema versioning and updates

The SQLite database is configured with WAL mode for better concurrency and foreign keys enabled for referential integrity.

## Key Features
- Connection pooling (max 5 connections)
- Automatic database creation
- Type-safe queries with SQLx
- Foreign key constraints
- Timestamp tracking (created_at, updated_at)

## Files

### mod.rs
Exports public database API including the Database struct and entity-specific modules (user, story, page).

### connection.rs
Implements the Database struct managing SQLite connection pools with WAL journaling, foreign keys enabled, and migration support for schema evolution.

### user.rs
Provides CRUD operations for User entities including create, read by id/email, list all, update, and delete with automatic timestamp management.

### story.rs
Provides CRUD operations for Story entities including create, read, list by user, update, delete, and a specialized increment_current_page method for story progression.

### page.rs
Provides CRUD operations for Page entities including create, read by id or story+page_num, list by story, update, delete, and get_next_page_num for sequential page creation.
