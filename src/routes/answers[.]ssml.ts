import { createFileRoute } from "@tanstack/react-router";
import { ANSWERS } from "@/lib/discovery/answers";
const escapeXml = (text: string) =>
  text.replace(
    /[<>&"']/g,
    (character) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character]!,
  );
export const Route = createFileRoute("/answers.ssml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      ANY: () =>
        new Response(null, { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } }),
      GET: () =>
        new Response(
          `<?xml version="1.0" encoding="UTF-8"?><speak xmlns="http://www.w3.org/2001/10/synthesis" version="1.1" xml:lang="en-US">${ANSWERS.map((a) => `<p><s>${escapeXml(a.question)}</s><break time="400ms"/><s>${escapeXml(a.answer)}</s></p>`).join("")}</speak>`,
          {
            headers: {
              "Content-Type": "application/ssml+xml; charset=utf-8",
              "Content-Disposition": 'attachment; filename="deepscreen-answers.ssml"',
              "Cache-Control": "public, max-age=3600",
              "X-Robots-Tag": "noindex",
            },
          },
        ),
    },
  },
});
