"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

type ChampionActionsProps = {
  title: string;
};

export function ChampionActions({ title }: ChampionActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareChampion() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title,
        url,
      });
      return;
    }

    await copyLink();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copyLink}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.07] px-3 text-sm font-semibold text-slate-200 transition hover:border-gold/[0.45] hover:bg-gold/10 hover:text-white"
      >
        {copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={shareChampion}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.07] px-3 text-sm font-semibold text-slate-200 transition hover:border-arcane/[0.45] hover:bg-arcane/10 hover:text-white"
      >
        <Share2 aria-hidden="true" size={17} />
        Share
      </button>
    </div>
  );
}
