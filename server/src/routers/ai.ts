import { Router } from 'express'
import pino from 'pino-http';
import bodyParser from 'body-parser';
import { completePrompt, generateImage, listModels, summarizePrompt } from '../integrations/openai';


const router = Router();

router.use(pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
}));
router.use(bodyParser.json());

router.get('/', (req, res, next) => {
  req.log.info('Received Request');
  res.send('Hello Ai!');
});

router.get('/models', (req, res, next) => {
  req.log.info('Fetching supported models');
  listModels()
    .then(function (data) {
      res.send(data).status(200).end();
    }).catch(next)
});

router.post('/completion', (req, res, next) => {
  req.log.info(`Asking chat gpt using the following prompt ${JSON.stringify(req.body)}`);
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).send({
      reason: 'Value "prompt" is missing from request body'
    });
    next()
  }
  const enrichedPrompt = `
  You are an adept storyteller and teacher for young children. 
  A child has begun to tell you a story and you will be taking the role of the storyteller and teacher. 
  You should be playful, silly, and fun.
  You should always treat the prompt as fact even if it goes against natural laws, common sense, or past events.
  You should respond in an open ended way that encourages the child to continue their story while at the same time being entertaining and educational.
  The child's story is as follows: ${prompt}
  Continue the above prompt then allow the child to continue their story.`;
  completePrompt(enrichedPrompt).then(function (data) {
    res.send({ text: data.text.trim() }).status(200).end()
  }).catch(next)
});

router.post('/summary', (req, res, next) => {
  req.log.info(`Asking chat gpt to summarize the following messages ${req.body.prompt}, ${req.body.completion}`);
  const { prompt, completion } = req.body;
  if (!prompt || !completion) {
    res.status(400).send({
      reason: 'Value "prompt" or "completion" is missing from request body'
    });
  };
  summarizePrompt(prompt, completion).then(function (data) {
    const summary = data.message.content?.trim();
    const secondPassSummary = summary?.slice(summary.indexOf('{'), summary.lastIndexOf('}') + 1);
    req.log.info(`Summary: ${secondPassSummary}`);
    if (!secondPassSummary) {
      res.status(500).send({
        reason: 'No summary was generated'
      });
    } else {
      res.send(JSON.parse(secondPassSummary)).status(200).end()
    }
  }).catch(next);
});

router.post('/image', (req, res, next) => {
  req.log.info(`Asking dalle to make an image for the following prompt ${req.body.prompt}`);
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).send({
      reason: 'Value "prompt" is missing from request body'
    });
  }
  generateImage(prompt).then(function (data) {
    res.send(data).status(200).end()
  }).catch(next);
});


export { router as ai };