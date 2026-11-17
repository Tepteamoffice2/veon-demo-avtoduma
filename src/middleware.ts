// Optical kerning for the display face. Pliant has no kerning for к/ж/х before «у» in Cyrillic,
// so «року», «платежу», «устаткування» read as two parts at display sizes. The fix wraps the first
// letter of such a pair in <span class="kern"> inside h1–h3 (text only, never attributes); the span
// pulls the next letter closer (tokens.css --kern-pair). Runs in dev and in the static build.
import { defineMiddleware } from "astro:middleware";

const PAIR = /([кжхКЖХ])(?=[уУ])/g;
const HEADING = /<(h[1-3])\b[^>]*>[\s\S]*?<\/\1>/g;

export const kern = (html: string): string =>
  html.replace(HEADING, (block) =>
    block.replace(/>([^<]+)</g, (_m, text: string) => `>${text.replace(PAIR, '<span class="kern">$1</span>')}<`),
  );

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return response;
  const html = await response.text();
  return new Response(kern(html), { status: response.status, statusText: response.statusText, headers: response.headers });
});
