import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.sttQuestion.create({
    data: {
      question: "What is the capital of France?",
      answer: "Paris",
    }
  });

  await prisma.story.create({
    data: {
      title: "Debug, The First",
      author: "Me",
      description: "This is a story that I am writing to test the layout of the pages",
      image: "https://openai-labs-public-images-prod.azureedge.net/user-ygBEkkqVDdSm1sonNjtobMiH/generations/generation-B71yzNHIy2df6QxI9FRKEg9G/image.webp",
      pages: {
        create: [
          {
            number: 1,
            prompt: "I am writing a simple story to test this layout changing",
            completion: "I can't really figure this out, so here is some old DallE image",
            image: "https://openai-labs-public-images-prod.azureedge.net/user-ygBEkkqVDdSm1sonNjtobMiH/generations/generation-B71yzNHIy2df6QxI9FRKEg9G/image.webp",
            pageName: "Init"
          },
          {
            number: 2,
            prompt: "Here is a second page, it should pretty nicely have faded from the first",
            completion: "Yea, this really makes no sense, have another generated image",
            image: "https://openai-labs-public-images-prod.azureedge.net/user-ygBEkkqVDdSm1sonNjtobMiH/generations/generation-14Z7qR4Q4yEMFNBEhZ0qpjiW/image.webp",
            pageName: "Continue?"
          },
          {
            number: 3,
            prompt: "Here is the final page, this should be a nice completion",
            completion: "This is our last generated image. I hope you enjoyed this story.",
            image: "https://openai-labs-public-images-prod.azureedge.net/user-ygBEkkqVDdSm1sonNjtobMiH/generations/generation-0vNgD5lD5gMGrGvbtPqzSgg0/image.webp",
            pageName: "End"
          }
        ]
      },
    }
  });

  await prisma.story.create({
    data: {
      title: "Debug, The Second",
      author: "Me",
      description: "This is another story I am using to test things out",
      image: "https://openai-labs-public-images-prod.azureedge.net/user-ygBEkkqVDdSm1sonNjtobMiH/generations/generation-B71yzNHIy2df6QxI9FRKEg9G/image.webp",
      pages: {
        create: [
          {
            number: 1,
            prompt: "Here is the only page of an entirely new story",
            completion: "Well this is a bit of a letdown",
            image: "https://openai-labs-public-images-prod.azureedge.net/user-ygBEkkqVDdSm1sonNjtobMiH/generations/generation-Lm8S3WMAPz7GQOwSMdrXD0Dr/image.webp",
            pageName: "The End?"
          }
        ]
      }
    }
  });
  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
