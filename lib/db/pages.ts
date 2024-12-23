import { PrismaClient, Story, Page } from '@prisma/client';

const prisma = new PrismaClient();
// Page Operations
export async function createPage(
  storyId: string,
  data: {
    prompt: string;
    completion: string;
    summary: string;
    image: string;
    pageNum: number;
    audioFile?: string;
  }
): Promise<Page> {
  return prisma.page.create({
    data: {
      storyId,
      ...data,
    },
  });
}

export async function getPage(id: string): Promise<Page | null> {
  return prisma.page.findUnique({
    where: { id },
  });
}

export async function getStoryPages(storyId: string): Promise<Page[]> {
  return prisma.page.findMany({
    where: { storyId },
    orderBy: {
      pageNum: 'asc',
    },
  });
}

export async function updatePage(
  id: string,
  data: {
    prompt?: string;
    completion?: string;
    summary?: string;
    image?: string;
    pageNum?: number;
    audioFile?: string;
  }
): Promise<Page> {
  return prisma.page.update({
    where: { id },
    data,
  });
}

export async function deletePage(id: string): Promise<Page> {
  return prisma.page.delete({
    where: { id },
  });
}

// Utility Functions
export async function getLatestPagepageNum(storyId: string): Promise<number> {
  const pages = await prisma.page.findMany({
    where: { storyId },
    orderBy: {
      pageNum: 'desc',
    },
    take: 1,
  });

  return pages.length > 0 ? pages[0].pageNum : 0;
}

export async function getStoryWithLatestPage(id: string): Promise<Story | null> {
  return prisma.story.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: {
          pageNum: 'desc',
        },
        take: 1,
      },
    },
  });
}
