import cors from 'cors';
import pino from 'pino-http';
import express from 'express';
import bodyParser from 'body-parser';
import { ai } from './routers/ai';
import {authors } from './routers/authors';
import { config } from './config';


const app = express();
const port = config.port;

app.use(pino());
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  req.log.info('Received Request');
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use('/ai', ai);
app.use('/authors', authors);