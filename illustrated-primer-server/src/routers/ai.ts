import { Router } from 'express'
import pino from 'pino-http';
import bodyParser from 'body-parser';
import { completePrompt, listModels } from '../integrations/openai';


const router = Router();

router.use(pino());
router.use(bodyParser.json());

router.get('/models', (req, res, next) => {
  req.log.info('Fetching supported models');
  listModels()
  .then(function(data) {
    res.send(data).status(200).end();
  }).catch(next)
});

router.post('/completion', (req, res, next) => {
  req.log.info(`Asking chat gpt using the followig prompt ${req.body.prompt}`);
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).send({
      reason: 'Value "prompt" is missing from request body'
    });
    next()
  }
  completePrompt(prompt).then(function(data) {
    res.send(data.choices[0].text).status(200).end()
  }).catch(next)
});

router.post('/summary', (req, res, next) => {
  req.log.info(`Asking chat gpt to summarize the following messages ${req.body.prompt}`);
  const { prompt } = req.body;

});

router.post('/image', (req, res, next) => {
  req.log.info(`Asking dalle to make an image for the following prompt ${req.body.prompt}`);

});


export { router as ai };