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
    max_tokens: 250,
    temperature: 0,
  });
  return response.data
}