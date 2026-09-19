import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { routeTree } from "./routeTree.gen";

const getCspNonce = createIsomorphicFn()
  .server(() => getGlobalStartContext()?.cspNonce as string | undefined)
  .client(
    () => document.querySelector('meta[property="csp-nonce"]')?.getAttribute("content") ?? undefined,
  );

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ssr: { nonce: getCspNonce() },
  });

  return router;
};
