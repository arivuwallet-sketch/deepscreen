import { createServerFn } from "@tanstack/react-start";
export const getOptionsContext = createServerFn({ method: "GET" })
  .inputValidator((data: { market: string; code: string }) => {
    if (!data || typeof data.market !== "string" || typeof data.code !== "string")
      throw new Error("Invalid underlying");
    return { market: data.market.toUpperCase(), code: data.code.trim().toUpperCase() };
  })
  .handler(async ({ data }) => {
    const { fetchOptionsContext } = await import("./options-context.server");
    return fetchOptionsContext(data.market, data.code);
  });
