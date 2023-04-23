import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const email = 'princessnell@newatlantis.com';

  await prisma.author.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Nellodee',
      email,
      stories: {
        create: {
            title: 'The Tales of Princess Nellodee and her associates.',
            pages: {
              create:{
                  prompt: 'Once upon a time, there was a princess named Nellodee.',
                  completion: 'She was a very beautiful princess, and she lived in a castle with her father, the king.',
                  summary: 'There was a princess named Nellodee and she has a father',
                  image: 'https://openai-labs-public-images-prod.azureedge.net/user-ygBEkkqVDdSm1sonNjtobMiH/generations/generation-B71yzNHIy2df6QxI9FRKEg9G/image.webp',
                  number: 1
                }
            }
          }
      }
    }
  })
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });