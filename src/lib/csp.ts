import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";

export const getCspNonce = createIsomorphicFn()
  .server(() => getGlobalStartContext()?.cspNonce as string | undefined)
  .client(
    () => document.querySelector('meta[property="csp-nonce"]')?.getAttribute("content") ?? undefined,
  );
