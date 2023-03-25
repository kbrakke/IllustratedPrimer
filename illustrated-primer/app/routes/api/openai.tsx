import pino from 'pino';
import { useLoaderData } from 'react-router';
import { loader } from '../_index';

const logger = pino();

export function OpenAI() {
    let data = useLoaderData<typeof loader>();
    return (
        <div>
            {data.openAiResponse}
        </div>
    );
}