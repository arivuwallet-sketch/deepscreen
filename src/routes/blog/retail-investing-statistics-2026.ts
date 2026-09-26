import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/retail-investing-statistics-2026")({
  beforeLoad: () => {
    throw redirect({
      href: "/blog/retail-investing-statistics-2026.html",
      statusCode: 308,
    });
  },
});
