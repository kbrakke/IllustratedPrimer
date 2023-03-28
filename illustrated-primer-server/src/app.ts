import pino from 'pino-http';
import express from 'express';
import bodyParser from 'body-parser';
import { ai } from './routers/ai';
import {authors } from './routers/authors';


const app = express();
const port = 3000;

app.use(pino());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  req.log.info('Received Request');
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use('/ai', ai);
app.use('/authors', authors);