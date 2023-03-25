import { getStoryWithPages } from "~/models/stories.server";
import { useLoaderData } from "@remix-run/react";
import { LoaderArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import pino from "pino";
import { CancellationErrorCodePropertyName } from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/Exports";

const logger = pino();

export async function loader({ params }: LoaderArgs) {
    const { storyId, pageId } = params;
    const story = await getStoryWithPages(storyId || '');
    const page = story.pages.find(p => p.id === pageId);
    invariant(page, "page not found");
    return json({ page });
}

export default function Page() {
    const data = useLoaderData<typeof loader>();
    return (
        <>
            <div className="bg-base-300 rounded-box border-8">
                {data.page.prompt}
            </div>
            <img className='object-contain hover:object-cover h-512 w-512' src={data.page.image} />
            <div className="bg-base-300 rounded-box border-8">
                {data.page.completion}
            </div>
        </>
    )
}