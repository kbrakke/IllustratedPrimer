import { LoaderArgs, json } from "@remix-run/server-runtime";
import { Outlet, useLoaderData } from "@remix-run/react";
import PageDropdown from '~/components/PageDropdown';
import { Story, Page } from "@prisma/client";

export function ErrorBoundary({ error }) {
  console.error(error);
  return (
    <>
      <div>
        <h1>Under Construction</h1>
      </div>
    </>
  );
}

export default function Story() {
  throw new Error("Under Construction");
  return (
    <>
      <div className="navbar bg-base-100">
        <div className="flex-1 justify-center">
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Outlet />
      </div>
    </>
  )
}