import { buildGraph, buildOrganizationSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=optional";

// This small layout-only stylesheet is deliberately rendered directly in the
// document head. It makes the very first paint use the real device width even
// when the main CSS/font assets are still cold. The full design system replaces
// these declarations as soon as styles.css is available.
const CRITICAL_RESPONSIVE_CSS = `
html,body{width:100%;min-width:0;max-width:100%;margin:0;overflow-x:hidden;-webkit-text-size-adjust:100%;text-size-adjust:100%}
@supports (overflow:clip){html,body{overflow-x:clip}}
*,*::before,*::after{box-sizing:border-box}
img,svg,video,canvas{max-width:100%}
.ds-workspace,.ds-workspace-header,.ds-workspace-content{width:100%;min-width:0;max-width:100%}
.ds-workspace{overflow-x:hidden}
@supports (overflow:clip){.ds-workspace{overflow-x:clip}}
.ds-workspace-topbar,.ds-workspace-navrow{width:100%;min-width:0;max-width:1440px;margin-inline:auto}
.ds-workspace-topbar>*{min-width:0}
.ds-workspace-search{min-width:0;max-width:100%}
@media(max-width:959px){.ds-workspace-navrow{display:none}.ds-workspace-search{flex:1;width:auto}}
@media(max-width:639px){.ds-workspace-topbar{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto auto}.ds-workspace-search{grid-column:1/-1;width:100%;margin:0}}
`;

function NotFoundComponent() {
  return (
    <div className="ds-system-page">
      <div className="ds-system-card">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const reportedError = error instanceof Error ? error : new Error(String(error));
  console.error(reportedError);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(reportedError, { boundary: "tanstack_root_error_component" });
  }, [reportedError]);

  return (
    <div className="ds-system-page">
      <div className="ds-system-card">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "DeepScreen — Beginner Stock Research & Financial Analysis" },
      { name: "description", content: "DeepScreen is a beginner-first stock research platform that explains financial ratios, highlights potential traps and guides you through fundamental analysis across India, the US and the UK." },
      { name: "author", content: "DeepScreen" },
      { property: "og:title", content: "DeepScreen — Beginner Stock Research & Financial Analysis" },
      { property: "og:description", content: "Understand stocks before you trust the numbers. DeepScreen explains ratios, potential traps, company fundamentals and research questions across NSE, BSE, NYSE, Nasdaq and LSE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "DeepScreen" },
      { property: "og:locale", content: "en_IN" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd(
          buildGraph(
            buildOrganizationSchema(),
            buildWebSiteSchema(),
          ),
        ),
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: FONT_CSS,
      },
      { rel: "icon", href: "/favicon.svg?v=20260930", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico?v=20260930", type: "image/x-icon" },
      { rel: "shortcut icon", href: "/favicon.ico?v=20260930", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/favicon.ico?v=20260930" },
      { rel: "describedby", href: "https://deepscreen.online/llms.txt" },
      { rel: "help", href: "https://deepscreen.online/answers" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_RESPONSIVE_CSS }} />
        <HeadContent />
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18457575020" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-18457575020');
`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
