import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient();

// Author Functions
export function getAuthors() {
  return prisma.author.findMany()
}

export function getAuthorByEmail(email: string) {
  return prisma.author.findUnique({ where: { email } })
}

export function getAuthorById(id: string) {
  return prisma.author.findUnique({ where: { id } })
}

// Story Functions
export function getStoriesByAuthorId(authorId: string) {
  return prisma.story.findMany({ where: { authorId } })
}

export function getStoriesByAuthorEmail(authorEmail: string) {
  return prisma.story.findMany({ where: { author: { email: authorEmail } } })
}

export function getStoryById(id: string) {
  return prisma.story.findUnique({ where: { id } })
}

// Page Functions
export function getPagesByStoryId(storyId: string) {
  return prisma.page.findMany({ where: { storyId } })
}

export function getPagesByStoryTitle(storyTitle: string) {
  return prisma.page.findMany({ where: { story: { title: storyTitle } } })
}

export function getPageById(id: string) {
  return prisma.page.findUnique({ where: { id } })
}

export async function createPageForStoryId(storyId: string, page: Prisma.PageCreateInput) {
  await prisma.story.update({
    where: { id: storyId },
    data: {
      pages: {
        create: page
      }
    }
  });
  return prisma.page.findFirst({ where: { storyId }, orderBy: { number: 'desc' } });
}

export async function setAudioForPage(pageId: string, audioFile: string) {
  return prisma.page.update({
    where: { id: pageId },
    data: {
      audioFile
    }
  })
}

export async function getAudioFileForPage(pageId: string) {
  return prisma.page.findUnique({ where: { id: pageId } }).then((page) => {
    return page?.audioFile
  });
}