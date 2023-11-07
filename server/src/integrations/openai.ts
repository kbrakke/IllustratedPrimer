import OpenAI from "openai";
import { config } from '../config'

export async function listModels(): Promise<OpenAI.Models.Model[]> {

  const openai = new OpenAI({
    organization: config.openAPIOrg,
    apiKey: config.openAPIKey,
  });
  const response = await openai.models.list();
  return response.data;
}

export async function completePrompt(prompt: string): Promise<OpenAI.Completions.CompletionChoice> {
  const openai = new OpenAI({
    organization: config.openAPIOrg,
    apiKey: config.openAPIKey,
  });
  const response = await openai.completions.create({
    model: "text-davinci-003",
    prompt,
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
    n: 1,
    size: "1024x1024"
  });
  return response.data[0];
}