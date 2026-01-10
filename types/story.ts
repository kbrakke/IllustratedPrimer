import { Story, Page } from '@prisma/client'

export type StoryWithPages = Story & {
  pages: Page[]
} 