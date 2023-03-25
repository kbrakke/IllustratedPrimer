import { Page, Story } from "@prisma/client";
import { prisma } from "~/db.server";


export async function getStoryWithPages(id: string): Promise<Story & { pages: Page[] }> {
  return prisma.story.findUniqueOrThrow({ where: { id }, include: { pages: true } });
}

export async function getStory(id: string): Promise<Story> {
  return prisma.story.findUniqueOrThrow({ where: { id } });
}

export async function getPageCountForStory(id: string): Promise<number> {
  return prisma.story.findUnique({ where: { id }, include: { _count: { select: { pages: true } } } }).then((story) => {
    return story?._count?.pages || 0;
  });
}

export async function getStories(): Promise<Story[]> {
  return prisma.story.findMany();
}

export async function getIdByTitle(title: string): Promise<string> {
  return prisma.story.findUnique({ where: { title } }).then((story) => {
    return story?.id || "";
  });
}

export async function createNewPage(storyId: string, prompt: string, completion: string): Promise<Page> {
  const storyWithPages = await getStoryWithPages(storyId);
  const pageCount = storyWithPages.pages.length;
  const story: Story = {
    ...storyWithPages,
  }

  return prisma.page.create({
    data: {
      story,
      pageName: `Test-${Date.now()}`,
      number: pageCount + 1,
      prompt,
      completion,
      storyTitle: story.title
    }
  })
}
