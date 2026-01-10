# Models Module

## Purpose
This module defines the core domain models (data structures) for the Illustrated Primer application. These models represent the business entities and are shared across the database, API, and UI layers. All models implement serialization/deserialization for JSON and database row mapping for SQLx.

## Architecture
The module uses a clean domain model pattern:
- **Serializable**: All models derive Serialize/Deserialize for JSON API compatibility
- **Database Mapped**: FromRow trait for SQLx query results
- **Self-Contained**: Each model includes factory methods and timestamp utilities
- **UUID-based IDs**: All entities use UUID strings for unique identification

## Key Features
- Automatic UUID generation
- Unix timestamp tracking (created_at, updated_at)
- Optional DateTime conversion utilities
- Clone and Debug implementations
- Snake_case to camelCase field mapping

## Files

### mod.rs
Exports the three core domain models (User, Story, Page) and provides a central import point for all model types.

### user.rs
Defines the User model representing application users with fields for authentication (email, email_verified), profile data (name, image), and timestamps with a factory constructor.

### story.rs
Defines the Story model representing interactive educational stories with fields for ownership (user_id), content (title, summary), progress tracking (current_page), and timestamps.

### page.rs
Defines the Page model representing individual story pages with fields for content (prompt, completion, summary), optional media (image_path, audio_path), sequencing (page_num), and story association.
