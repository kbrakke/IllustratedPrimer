import axios from "axios";

export async function askAI(prompt) {
    const res = await axios.post('/api/ask-ai', { prompt: prompt });
    return res.data;
}