# Next.js Implementation - Prisma Schema Reference

This document preserves the original Prisma schema from the Next.js implementation for historical reference.

## Original Schema

The Next.js version used Prisma ORM with SQLite. The Rust implementation uses the same logical schema but with optimized SQLite types.

### Key Differences in Rust Implementation

1. **Timestamps**: Changed from DateTime to Unix epoch integers (8 bytes vs variable TEXT)
2. **STRICT Mode**: Added SQLite STRICT mode for type safety
3. **Image Storage**: Changed from base64 TEXT to file path references
4. **Indexes**: Added compound indexes for performance

### Prisma Schema (Next.js)

\`\`\`prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(cuid())
  name          String?
  email         String?         @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  stories       Story[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}

model Story {
  id          String   @id @default(cuid())
  userId      String
  title       String
  summary     String
  currentPage Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
  pages       Page[]
}

model Page {
  id         String   @id @default(cuid())
  storyId    String
  pageNum    Int
  prompt     String
  completion String
  summary    String
  image      String
  audioFile  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  story      Story    @relation(fields: [storyId], references: [id])
}
\`\`\`

## Migration Notes

When migrating data from the Next.js SQLite database to the Rust version:

1. Convert DateTime strings to Unix timestamps
2. Extract any base64 images to separate files
3. Validate foreign key relationships
4. Run VACUUM to compact database

## See Also

- [Rust Schema](../../migrations/001_init.sql) - Current implementation
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Database optimization details
