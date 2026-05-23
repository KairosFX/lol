import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="rift-shell grid min-h-screen place-items-center py-16">
      <div className="glass-panel max-w-xl rounded-lg p-8 text-center">
        <h1 className="text-3xl font-black text-white">Guide not found</h1>
        <p className="mt-3 text-slate-400">
          The requested champion guide is missing or the source text file could not be read.
        </p>
        <Link
          href="/champions"
          className="focus-ring mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-brightgold px-4 text-sm font-bold text-abyss transition hover:bg-white"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Back to champions
        </Link>
      </div>
    </main>
  );
}
