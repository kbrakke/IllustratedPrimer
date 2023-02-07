import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { HiMenuAlt2, HiDotsVertical } from 'react-icons/hi'
import { useEffect } from 'react'
import { themeChange } from 'theme-change'
import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, []);
  return (
    <html className="h-full">
      <head>
          <Meta />
          <Links />
      </head>
      <body data-theme="garden" lang="en" className="h-full drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="navbar bg-base-100">
            <div className="flex-none">
              <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
                <HiMenuAlt2 />
              </label>
            </div>
            <div className="flex-1">
              <a className="btn btn-ghost normal-case text-xl">A Young Lady's Illustrated Primer</a>
            </div>
            <div className="flex-none">
              <button className="btn btn-square btn-ghost">
                <HiDotsVertical />
              </button>
            </div>
          </div>
          <div className="flex border-8">
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </div>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 bg-base-100 text-base-content">
            <li><a>Sidebar Item 1</a></li>
            <li><a>Sidebar Item 2</a></li>
          </ul>
        </div>
      </body>
    </html>
  );
}
