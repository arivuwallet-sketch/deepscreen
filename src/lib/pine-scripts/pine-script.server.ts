// The `.pine` file is bundled as a plain string at build time via Vite's
// `?raw` import — there's no runtime filesystem on the Cloudflare Workers
// target this deploys to, so the content has to be baked into the server
// bundle rather than read from disk on each request.
//
// This file is SERVER ONLY (`.server.ts` suffix), same convention as
// yahoo.server.ts and admin.server.ts elsewhere in this app: TanStack
// Start's build strips `.server.ts` files out of the client bundle
// entirely. That matters a lot more here than usual — this isn't just an
// implementation detail to hide, it's the entire paid product. If this
// import ever moved to a file reachable from client code, the full
// indicator source would ship to every visitor for free.
import source from "./advanced-smc-predictor.pine?raw";

export const PINE_SCRIPT_PRODUCT = "advanced_smc_predictor";
export const PINE_SCRIPT_FILENAME = "Advanced-SMC-Predictor.pine";
export const PINE_SCRIPT_PRICE_INR = 50;

export function getPineScriptSource(): string {
  return source;
}
