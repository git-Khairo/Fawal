import type { Dictionary } from "@/lib/i18n/dictionary";

/**
 * One sentence, not a row of metric tiles. The two facts a trade buyer weighs
 * are how long the company has been around and where the plant is, and both fit
 * in a line.
 */
export function TrustLine({ t }: { t: Dictionary }) {
  return (
    <section className="border-b border-hairline bg-deck">
      <p className="mx-auto max-w-[1400px] px-5 py-7 text-center text-sm leading-relaxed text-ink-2 lg:px-8">
        {t.home.trustLine}
      </p>
    </section>
  );
}
