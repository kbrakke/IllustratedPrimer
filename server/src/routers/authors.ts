import { Router } from 'express'
import pino from 'pino-http';
import bodyParser from 'body-parser';
import { Author } from '@prisma/client';
import { getAuthorById, getAuthors } from '../database/db';


const router = Router();

router.use(pino());
router.use(bodyParser.json());

router.get('/', (req, res, next) => {
  req.log.info('Fetching authors');
  getAuthors().then(function(data: Author[]) {
    res.send(data).status(200).end();
  }).catch(next)
});

router.get('/:id', (req, res, next) => {
  req.log.info(`Fetching author with id ${req.params.id}`);
  getAuthorById(req.params.id).then( function(data: Author | null) {
    if(!data) {
      res.status(404).end();
    } else {
      res.send(data).status(200).end();
    }
  }).catch(next)
});

export { router as authors }