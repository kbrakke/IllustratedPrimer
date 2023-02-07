import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const sttCookie = createCookie("speech-token", {
  maxAge: 540, // 9 minutes
});