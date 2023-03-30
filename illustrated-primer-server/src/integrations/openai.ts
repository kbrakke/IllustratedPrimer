import { Configuration, CreateCompletionResponse, ListModelsResponse, OpenAIApi } from "openai";
import { config } from '../config'

export async function listModels(): Promise<ListModelsResponse> {
  const configuration = new Configuration({
    organization: config.openAPIOrg,
    apiKey: config.openAPIKey,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.listModels();
  return response.data;
}

export async function completePrompt(prompt: string): Promise<CreateCompletionResponse> {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 1000,
    temperature: 0,
  });
  return response.data
}

export async function summarizePrompt(prompt: string, completion: string): Promise<CreateCompletionResponse> {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const concat = `Here is a prompt and completion pair that tells a story. 
                  I would like to illustrate this story, and have a nice summary to refer to it. 
                  Please give me the most salient summary for this entire passage.
                  prompt: ${prompt}
                  completion: ${completion}`;
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: concat,
    max_tokens: 333,
    temperature: 0,
  });
  return response.data
}