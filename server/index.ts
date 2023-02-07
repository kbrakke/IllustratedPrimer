import { config } from 'dotenv';
import express from 'express';
import axios from 'axios';
import { OpenAIApi, Configuration } from 'openai';
import bodyParser from 'body-parser';
import { pinoHttp } from 'pino-http';

const pino = pinoHttp();
config();
const app = express();
const openai = new OpenAIApi(new Configuration({
    organization: "org-RnvscqnaZBNtvzYDOywsyfjf",
    apiKey: process.env.OPENAI_API_KEY,
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/api/get-speech-token', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION;
    if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
        res.status(400).send('You forgot to add your speech key or region to the .env file.');
    } else {
        const headers = {
            headers: {
                'Ocp-Apim-Subscription-Key': speechKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const tokenResponse = await axios.post(`https://ipspeechtotext.cognitiveservices.azure.com/sts/v1.0/issuetoken`, null, headers);
            res.send({ token: tokenResponse.data, region: speechRegion });
        } catch (err) {
            res.log.error(err);
            res.status(401).send('There was an error authorizing your speech key.');
        }
    }
});

app.post('/api/ask-ai', async (req, res, next) => {
    req.log.info(req);
    const response = await openai.createCompletion({
        model: "text-curie-001",
        prompt: `${req.body.prompt}`,
        temperature: 0.8,
        max_tokens: 60,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
    });
    if (response.status !== 200) {
        res.log.error(response);
        res.status(500).send('There was an error completing your text.');
        return;
    }
    res.status(200).json(response.data);
});

app.listen(3001, () =>
    pino.info('Express server is running on localhost:3001')
);