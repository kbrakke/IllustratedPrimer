import { Configuration, CreateCompletionResponse, ImagesResponse, ListModelsResponse, OpenAIApi } from "openai";
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
    apiKey: config.openAPIKey,
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
  const concat = `Given a prompt and completion pair in json, give a summary of the entire story. Additionally give a new prompt 
                  that can be used for image generation for the summary. The output should be json in the form of {
                    summary: <Summary of the prompt and completion>,
                    igPrompt: <Prompt for image generation>
                  }
                  do not include the <> characters, nor add any additional text other than the json output.
                  {
                    prompt: ${prompt}
                    completion: ${completion}
                  }`;
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: concat,
    max_tokens: 333,
    temperature: 0,
  });
  return response.data
}

export async function generateImage(prompt: string): Promise<ImagesResponse> {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: "1024x1024"
  });
  return response.data;
}