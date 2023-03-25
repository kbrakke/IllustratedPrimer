import { LoaderArgs, json } from "@remix-run/server-runtime";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getStoryWithPages } from "~/models/stories.server";
import PageDropdown from '~/components/PageDropdown';
import { Story, Page } from "@prisma/client";
import invariant from "tiny-invariant";
import pino from "pino";

const logger = pino();

export async function loader({ params }: LoaderArgs) {
  const { storyId } = params;
  try {
    const story = await getStoryWithPages(storyId || '');
    invariant(story, "story not found");
    return json({ story });
  } catch (e) {
    return json({ story: null }, { status: 404 });
  }
}

export function ErrorBoundary(error: any) {
  console.error(error);
  return (
    <>
      <div>
        <h1>Something went wrong</h1>
      </div>
    </>
  );
}

export default function Story() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <div className="navbar bg-base-100">
        <div className="flex-1 justify-center">
          <PageDropdown story={data.story} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Outlet />
      </div>
    </>
  )
}