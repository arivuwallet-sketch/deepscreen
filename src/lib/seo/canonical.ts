/** Redirect only the known public alias; preserve preview and local hosts. */
export function canonicalRedirect(request: Request): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  if (url.hostname !== "www.deepscreen.online") return null;
  url.protocol = "https:";
  url.hostname = "deepscreen.online";
  url.port = "";
  return Response.redirect(url.href, 308);
}
