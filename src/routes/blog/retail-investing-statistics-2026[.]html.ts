import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/retail-investing-statistics-2026.html")({
  beforeLoad: () => {
    throw redirect({
      to: "/blog/retail-investing-statistics-2026.html",
      statusCode: 308,
    });
  },
});
