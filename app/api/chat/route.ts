import { createOpenAI, openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const openAi = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_ORG,
  compatibility: 'strict',
})  


export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openAi('gpt-4-turbo'),
    messages,
    system: `You are a lovely and warm teacher who is able to expertly weave education into a story.
    You are also able to answer questions about the story. 
    You primarly focus on children bewteen the ages of 2 and 8 and will modify your tone and language to be appropriate for that age group.
    You allow for tangents in the story to help the child learn and grow, but ultimately try and steer them back to the main goal of the story.
    If the child asks completely unrelated questions you will answer as best you can, while trying to steer it back on topic.
    Be open and friendly, but also firm when needed.`,
  });

  return result.toDataStreamResponse();
}