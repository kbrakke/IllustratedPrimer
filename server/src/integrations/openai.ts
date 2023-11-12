import OpenAI from "openai";
import { config } from '../config'
import path, { resolve } from "path";
import { writeFile } from "fs/promises";
import { Page } from "@prisma/client";
import { Chat, ChatCompletionMessageParam } from "openai/resources";

export async function listModels(): Promise<OpenAI.Models.Model[]> {

  const openai = new OpenAI({
    organization: config.openAPIOrg,
    apiKey: config.openAPIKey,
  });
  const response = await openai.models.list();
  return response.data;
}

function pageToMessage(page: Page): ChatCompletionMessageParam[] {
  return [{
    role: "user",
    content: page.prompt
  }, {
    role: "assistant",
    content: page.completion
  }] as ChatCompletionMessageParam[];
}

export async function completePrompt(prompt: string, pages: Page[]): Promise<OpenAI.Chat.Completions.ChatCompletion.Choice> {
  const openai = new OpenAI({
    organization: config.openAPIOrg,
    apiKey: config.openAPIKey,
  });
  const initialMessage = {
    "role": "system",
    "content": `You are an adept storyteller and teacher for young children. 
    A child has begun to tell you a story and you will be taking the role of the storyteller and teacher. 
    You should be playful, silly, and fun.
    You should always treat the prompt as fact even if it goes against natural laws, common sense, or past events.
    You should respond in an open ended way that encourages the child to continue their story while at the same time being entertaining and educational.`
  } as ChatCompletionMessageParam;
  const storyHistory = pages.map((page) => { return pageToMessage(page) }).flat();
  const fullMessage = [initialMessage, ...storyHistory, {
    role: "user",
    content: prompt
  } as ChatCompletionMessageParam];
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: fullMessage,
    max_tokens: 1000,
    temperature: 0,
  });
  return response.choices[0];
}

export async function summarizePrompt(prompt: string, completion: string): Promise<OpenAI.Chat.Completions.ChatCompletion.Choice> {
  const concat = `At the end of this message I will give you a paragraph of text to summarize as if it were a scene in an educational children's book.
  Additionally give a new prompt that can be used for image generation for the summary.
   The generated prompt shoud be evocative, colorful, and suitable for a child. 
  The output should be json in the form of: {
     "summary": <Summary of the prompt and completion>,
     "imagePrompt": <Prompt for image generation>
   }
   do not include the <> characters, nor add any additional text other than the json.
  ${prompt} ${completion}`;
  const openai = new OpenAI({
    organization: config.openAPIOrg,
    apiKey: config.openAPIKey,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [{
      role: "user",
      content: concat
    }],
    max_tokens: 333,
    temperature: 0,
  });
  return response.choices[0];
}

export async function generateImage(prompt: string): Promise<OpenAI.Images.Image> {
  const enrichedPrompt = `${prompt} in the style of a children's book illustration.`
  const openai = new OpenAI({
    organization: config.openAPIOrg,
    apiKey: config.openAPIKey,
  });
  const response = await openai.images.generate({
    model: "dall-e-3",
    style: "vivid",
    prompt: enrichedPrompt,
    response_format: "b64_json",
    n: 1,
    size: "1024x1024"
  });
  return response.data[0];
}

export async function generateAudio(pageId: string, prompt: string) {
  const speechFile = path.resolve(`./speech-${pageId}.mp3`);
  const openai = new OpenAI({
    organization: config.openAPIOrg,
    apiKey: config.openAPIKey,
  });
  const mp3: any = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: prompt,
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await writeFile(speechFile, buffer);
}