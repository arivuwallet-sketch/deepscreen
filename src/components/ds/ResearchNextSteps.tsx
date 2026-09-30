import { Link } from "@tanstack/react-router";
import { researchLinks } from "@/lib/seo/research";

export function ResearchNextSteps({ path }: { path: string }) {
  const links = researchLinks(path);
  if (!links.length) return null;
  return (
    <nav
      aria-label="Continue your research"
      className="mx-auto max-w-7xl border-t border-border px-4 py-10 sm:px-6 lg:px-8"
    >
      <h2 className="text-lg font-semibold">Continue your research</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary"
          >
            <h3 className="text-sm font-semibold text-primary">{link.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{link.description}</p>
          </Link>
        ))}
      </div>
    </nav>
  );
}
