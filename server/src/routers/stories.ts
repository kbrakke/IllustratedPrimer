import { Router } from 'express'
import pino from 'pino-http';
import bodyParser from 'body-parser';
import { Story } from '@prisma/client';
import { getStoryById, getStoriesByAuthorId } from '../database/db';


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

router.get('/:id', (req, res, next) => {
  req.log.info('Fetching story');
  getStoryById(req.params.id).then((data: Story | null) => {
    res.send(data).status(200).end();
  }).catch(next)
});

router.post('/', (req, res, next) => {
  req.log.info(`Fetching stories for author ${req.body}`);
  const { authorId } = req.body;
  if (!authorId) {
    res.send('Author id is required').status(400).end();
  }
  getStoriesByAuthorId(authorId).then((data: Story[] | null) => {
    if (!data) {
      res.status(404).end();
    } else {
      res.send(data).status(200).end();
    }
  }).catch(next)
});

export { router as stories }