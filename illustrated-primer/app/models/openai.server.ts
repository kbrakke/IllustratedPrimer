/* import { OpenAI } from 'openai-api';

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
*/