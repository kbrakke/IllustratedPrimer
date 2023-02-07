import { getLastS2TQuestion, upsertS2TQuestion } from '~/models/stt.server';
import { useLoaderData, useActionData } from "@remix-run/react";
import { ActionArgs, LoaderArgs, createCookie, json } from '@remix-run/node';
import pino from 'pino';
import { Stt } from '~/routes/api/stt';
import invariant from 'tiny-invariant';
import axios, { AxiosError, AxiosRequestHeaders } from "axios";
import { sttCookie } from './cookies';

const logger = pino();

export async function loader({ request }: LoaderArgs) {
  const lastSttResult = await getLastS2TQuestion();
  let cookieHeader = request.headers.get("Cookie") || '';
  logger.info(cookieHeader);
  const speechToken = await sttCookie.parse(cookieHeader);
  logger.info('Fetching token object');
  logger.info(`speechToken: ${speechToken}`);
  let sttToken = { authToken: '', error: '', region: '' };
  let sttCookieHeader = '';

  if (speechToken === null) {
    try {
      const speechKey = process.env.SPEECH_KEY;
      const speechRegion = process.env.SPEECH_REGION;
      logger.info('Speech key: ' + speechKey);
      logger.info('Speech region: ' + speechRegion);
      invariant(speechKey !== 'paste-your-speech-key-here', 'You forgot to add your speech key to the .env file.');
      invariant(speechKey, 'You forgot to add your speech key to the .env file.');
      invariant(speechRegion !== 'paste-your-speech-region-here', 'You forgot to add your speech region to the .env file.');
      const headers: AxiosRequestHeaders = {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '0',
      };
      const tokenResponse = await axios.post(`https://ipspeechtotext.cognitiveservices.azure.com/sts/v1.0/issuetoken`, null, { headers });
      //logger.info(tokenResponse);
      const token = tokenResponse.data;
      const region = tokenResponse.headers['x-ms-region'];
      cookieHeader = await sttCookie.serialize(`${region}:${token}`);

      logger.info('Token fetched from back-end: ' + token);
      sttToken.authToken = token
      sttToken.region = region;
    } catch (err: Error | AxiosError | any) {
      if (axios.isAxiosError(err)) {
        logger.error(err);
        sttToken.error = err.response?.data;
      } else {
        logger.error(err);
        sttToken.error = err.message
      };
    }
  } else {
    const idx = speechToken.indexOf(':');
    sttToken.authToken = speechToken.slice(idx + 1)
    sttToken.region = speechToken.slice(0, idx);
  }
  invariant(sttToken, 'No token found');
  invariant(sttToken.authToken, 'No auth found');
  invariant(sttToken.region, 'No region found');
  return json({ lastSttResult, sttToken }, {
    headers: {
      "Set-Cookie": cookieHeader
    },
  });
}

export async function action(request: ActionArgs) {
  logger.info('In Routes Index Action');
  return {};
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const success = useActionData<typeof loader>();
  return (
    <main className='h-full grid grid-cols-2 gap-4 items-stretch'>
      <div className="min-h-fit bg-base-300 rounded-box border-8">
        <div className="min-h-fit rounded-box">
          <Stt />
        </div>
        <div>
          {data.lastSttResult.question}
        </div>
      </div>
      <div className="min-h-fit bg-base-300 rounded-box border-8">
        {data.lastSttResult.answer}
      </div>
    </main >
  );
}
