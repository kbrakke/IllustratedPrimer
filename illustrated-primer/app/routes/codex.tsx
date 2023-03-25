import { getLastS2TQuestion } from '~/models/stt.server';
import { useLoaderData, useActionData, Outlet, Link } from "@remix-run/react";
import { ActionArgs, LoaderArgs, json } from '@remix-run/node';
import pino from 'pino';
import invariant from 'tiny-invariant';
import axios, { AxiosError, AxiosRequestHeaders } from "axios";
import { sttCookie } from './cookies';
import { askOpenAI } from '~/models/openai.server';
import { getStories } from '~/models/stories.server';
import { HiDotsVertical, HiMenuAlt1 } from 'react-icons/hi';

const logger = pino();

export async function loader({ request }: LoaderArgs) {
  const lastSttResult = await getLastS2TQuestion();
  let cookieHeader = request.headers.get("Cookie") || '';

  const speechToken = await sttCookie.parse(cookieHeader);
  logger.info('Fetching token object');
  let sttToken = { authToken: '', error: '', region: '' };

  if (speechToken === null) {
    try {
      const speechKey = process.env.SPEECH_KEY;
      const speechRegion = process.env.SPEECH_REGION;
      invariant(speechKey !== 'paste-your-speech-key-here', 'You forgot to add your speech key to the .env file.');
      invariant(speechKey, 'You forgot to add your speech key to the .env file.');
      invariant(speechRegion !== 'paste-your-speech-region-here', 'You forgot to add your speech region to the .env file.');
      const headers: AxiosRequestHeaders = {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '0',
      };
      const tokenResponse = await axios.post(`https://ipspeechtotext.cognitiveservices.azure.com/sts/v1.0/issuetoken`, null, { headers });
      const token = tokenResponse.data;
      const region = tokenResponse.headers['x-ms-region'];
      cookieHeader = await sttCookie.serialize(`${region}:${token}`);

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
  const stories = await getStories();

  let openAiResponse = `Young Lady's Illustrated Primer: a Propædeutic Enchiridion, 
                        in which is told the tale of Princess Nell and her various
                        friends, kin, associates, etc.`;
  if (!process.env.DEBUG) {
    openAiResponse = await askOpenAI(`You are a an eloquent story teller who specalizes in children's books. 
                                      You are writing a primer for young ladies. What heroic adventure does
                                      little Nell have?`);
  }
  invariant(sttToken, 'No token found');
  invariant(sttToken.authToken, 'No auth found');
  invariant(sttToken.region, 'No region found');
  return json({ lastSttResult, sttToken, openAiResponse, stories }, {
    headers: {
      "Set-Cookie": cookieHeader
    },
  });
}

export default function Codex() {
  const data = useLoaderData<typeof loader>();
  const storyButtons = data.stories.map((story) => {
    return <li key={story.title}><Link className="btn btn-ghost" to={`/codex/${story.id}`}>{story.title}</Link></li>
  });
  return (
    <main data-theme="garden" lang="en" className="w-full h-full drawer">
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="navbar bg-base-100">
            <div className="flex-none">
              <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
                <HiMenuAlt1 />
              </label>
            </div>
            <div className="flex-1 flex-wrap justify-center">
              A Young Lady's Illustrated Primer
            </div>
            <div className="flex-none">
              <button className="btn btn-square btn-ghost">
                <HiDotsVertical />
              </button>
            </div>
          </div>
          <Outlet />
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 bg-base-100 text-base-content">
            {storyButtons}
            <li key='newStory'><Link className="btn btn-ghost" to={'/codex/new'}>New Story</Link></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
