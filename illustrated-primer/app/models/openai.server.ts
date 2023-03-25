import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    organization: process.env.OPENAPI_ORG,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function askOpenAI(prompt: string): Promise<string> {
    const response = await openai.createCompletion({
        model: "text-curie-001",
        prompt: prompt,
        temperature: 0.8,
        max_tokens: 250,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
    });
    return response.data.choices[0].text || "No response from OpenAI";
};