import type { GuideSection } from "@/lib/types";

type TableOfContentsProps = {
  sections: GuideSection[];
};

export function TableOfContents({ sections }: TableOfContentsProps) {
  return (
    <nav
      aria-label="Guide sections"
      className="glass-panel sticky top-24 hidden rounded-lg p-4 lg:block"
    >
      <p className="text-xs font-semibold uppercase text-slate-500">Sections</p>
      <ol className="mt-3 space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="focus-ring block rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
