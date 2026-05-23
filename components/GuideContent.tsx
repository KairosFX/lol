import type { GuideSection } from "@/lib/types";
import { cn } from "@/lib/utils";

type GuideContentProps = {
  sections: GuideSection[];
};

function isTacticalSection(title: string) {
  return /tips|strategy|teamfighting|power spikes|matchups|combos/i.test(title);
}

export function GuideContent({ sections }: GuideContentProps) {
  return (
    <article className="guide-prose space-y-5">
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="glass-panel rounded-lg p-5 md:p-7"
          aria-labelledby={`${section.id}-title`}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-brightgold to-arcane" />
            <h2 id={`${section.id}-title`} className="text-2xl font-bold text-white">
              {section.title}
            </h2>
          </div>
          <div className="space-y-4">
            {section.blocks.map((block, blockIndex) => {
              if (block.type === "subheading") {
                return (
                  <h3
                    key={`${section.id}-${block.type}-${blockIndex}`}
                    className="pt-2 text-sm font-bold uppercase text-brightgold"
                  >
                    {block.text}
                  </h3>
                );
              }

              if (block.type === "list") {
                return (
                  <ul
                    key={`${section.id}-${block.type}-${blockIndex}`}
                    className={cn(
                      "space-y-2 pl-5",
                      isTacticalSection(section.title) &&
                        "rounded-lg border border-arcane/20 bg-arcane/[0.06] py-4 pr-4",
                    )}
                  >
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              }

              return <p key={`${section.id}-${block.type}-${blockIndex}`}>{block.text}</p>;
            })}
          </div>
        </section>
      ))}
    </article>
  );
}
