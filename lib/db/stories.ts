import { PrismaClient, Story, Page } from '@prisma/client';

const prisma = new PrismaClient();

type StoryWithPages = Story & { pages: Page[] };
// Story Operations
export async function createStory(userId: string, title: string): Promise<Story> {
  return prisma.story.create({
    data: {
      userId,
      title,
      summary: '',
    },
    include: {
      pages: true,
    },
  });
}

export async function getStory(id: string): Promise<StoryWithPages | null> {
  return prisma.story.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: {
          pageNum: 'asc',
        },
      },
    },
  });
}

export async function getUserStories(userId: string): Promise<StoryWithPages[]> {
  const stories = await prisma.story.findMany({
    where: { userId },
    include: {
      pages: {
        orderBy: {
          pageNum: 'asc',
        },
      },
    },
  });
  return stories;
}

export async function updateStory(id: string, title: string): Promise<Story> {
  return prisma.story.update({
    where: { id },
    data: { title },
    include: {
      pages: true,
    },
  });
}

export async function deleteStory(id: string): Promise<Story> {
  return prisma.story.delete({
    where: { id },
    include: {
      pages: true,
    },
  });
}

// Batch Operations
export async function createStoryWithFirstPage(
  userId: string,
  title: string,
  pageData: {
    prompt: string;
    completion: string;
    summary: string;
    image: string;
    audioFile?: string;
  }
): Promise<Story> {
  return prisma.story.create({
    data: {
      userId,
      title,
      summary: '',
      pages: {
        create: {
          ...pageData,
          pageNum: 1,
        },
      },
    },
    include: {
      pages: true,
    },
  });
}

export async function deleteStoryWithPages(storyId: string): Promise<Story> {
  return prisma.story.delete({
    where: { id: storyId },
    include: {
      pages: true,
    },
  });
}

// Search and Filter Operations
export async function searchStories(
  userId: string,
  searchTerm: string
): Promise<Story[]> {
  return prisma.story.findMany({
    where: {
      userId,
      title: {
        contains: searchTerm,
      },
    },
    include: {
      pages: {
        orderBy: {
          pageNum: 'asc',
        },
      },
    },
  });
}

export async function getStoriesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Story[]> {
  return prisma.story.findMany({
    where: {
      userId,
      pages: {
        some: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
    include: {
      pages: {
        orderBy: {
          pageNum: 'asc',
        },
      },
    },
  });
} 