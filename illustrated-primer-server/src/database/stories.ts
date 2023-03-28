import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export function getStoriesByAuthorId(authorId: string) {
  return prisma.story.findMany({ where: { authorId } })
}

export function getStoriesByAuthorEmail(authorEmail: string) {
  return prisma.story.findMany({ where: { author: { email: authorEmail } } })
}