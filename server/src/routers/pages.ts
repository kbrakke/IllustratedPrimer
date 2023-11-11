import { Router } from 'express'
import pino from 'pino-http';
import bodyParser from 'body-parser';
import { Page, Prisma } from '@prisma/client';
import { getPagesByStoryId, getPageById, getPagesByStoryTitle, createPageForStoryId } from '../database/db';
import { isEmpty } from 'lodash';

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
  req.log.info('Fetching pages');
  getPageById(req.params.id).then((data: Page | null) => {
    res.send(data).status(200).end();
  }).catch(next)
});

router.post('/', (req, res, next) => {
  req.log.info(`Fetching author with body ${req.body}`);
  const { storyTitle, storyId, pageId } = req.body;
  if (pageId) {
    getPageById(pageId).then((data: Page | null) => {
      res.send(data).status(200).end();
    }).catch(next)
  } else if (storyId) {
    getPagesByStoryId(storyId).then((data: Page[]) => {
      res.send(data).status(200).end();
    }).catch(next)
  } else if (storyTitle) {
    getPagesByStoryTitle(storyTitle).then((data: Page[]) => {
      res.send(data).status(200).end();
    }).catch(next)
  } else {
    res.status(404).end();
  }
});

router.post('/create', (req, res, next) => {
  req.log.info('Creating a page');
  const { storyId, ...input }: Prisma.PageCreateInput & { storyId: string } = req.body
  if (isEmpty(storyId)) {
    res.send('Story id (storyId) is required').status(400).end();
  }
  createPageForStoryId(storyId, input).then((data) => {
    res.send(data).status(200).end();
  }).catch(next);
});

export { router as pages }