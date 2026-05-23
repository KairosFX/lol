import Link from "next/link";
import { BookOpen, Menu, Swords } from "lucide-react";

type SiteHeaderProps = {
  championCount: number;
};

export function SiteHeader({ championCount }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-abyss/[0.82] backdrop-blur-xl">
      <div className="rift-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-md">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-gold/40 bg-gold/10 text-brightgold shadow-gold">
            <Swords aria-hidden="true" size={20} strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold uppercase text-white">League Guide</span>
            <span className="block text-xs text-slate-400">Codex</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm text-slate-300 md:flex">
          <Link
            href="/"
            className="focus-ring rounded-md px-3 py-2 transition hover:bg-white/[0.07] hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/champions"
            className="focus-ring rounded-md px-3 py-2 transition hover:bg-white/[0.07] hover:text-white"
          >
            Champions
          </Link>
          <span className="ml-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-slate-300">
            {championCount} guides
          </span>
        </nav>

        <Link
          href="/champions"
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-200 transition hover:border-arcane/40 hover:bg-arcane/10 hover:text-white md:hidden"
          aria-label="Open champion index"
        >
          <BookOpen aria-hidden="true" size={17} />
          <Menu aria-hidden="true" size={17} />
        </Link>
      </div>
    </header>
  );
}
