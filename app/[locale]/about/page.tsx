import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { Reveal } from "@/components/material/reveal";
import { MeshGround } from "@/components/material/mesh-ground";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return { title: t.about.title, description: t.about.lead };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  const principles = [
    { title: t.about.principle1Title, body: t.about.principle1Body },
    { title: t.about.principle2Title, body: t.about.principle2Body },
    { title: t.about.principle3Title, body: t.about.principle3Body },
  ];

  // The four processes, in the order the material actually passes through them.
  const process = [
    t.about.process1,
    t.about.process2,
    t.about.process3,
    t.about.process4,
  ];

  const sectors = [t.about.sector1, t.about.sector2, t.about.sector3];

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-8 lg:py-24">
          <h1 className="max-w-[14ch] font-display text-4xl font-semibold tracking-tight text-ink lg:text-6xl">
            {t.about.title}
          </h1>
          <p className="mt-8 max-w-[40ch] font-display text-xl font-medium leading-snug text-ink lg:text-2xl">
            {t.about.lead}
          </p>
          <p className="mt-6 max-w-[68ch] text-[15px] leading-relaxed text-ink-2">
            {t.about.body}
          </p>
        </div>
      </section>

      {/* The manufacturing network. Asymmetric on purpose: a heading held to one
          side against a single paragraph, which is a different shape from every
          other block on the page. */}
      <section className="relative overflow-hidden border-b border-hairline">
        <MeshGround
          scale={58}
          opacity={0.04}
          className="[mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="relative mx-auto grid max-w-[1400px] gap-8 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-28">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink lg:text-4xl">
              {t.about.networkTitle}
            </h2>
          </Reveal>
          <Reveal step={1}>
            <p className="max-w-[62ch] text-[15px] leading-relaxed text-ink-2 lg:text-lg">
              {t.about.networkBody}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Processes and sectors together: what the material goes through, and who
          it goes to. Two plain lists, no cards. */}
      <section className="border-b border-hairline bg-deck">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-5 py-20 lg:grid-cols-2 lg:gap-24 lg:px-8 lg:py-28">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink lg:text-2xl">
              {t.about.processTitle}
            </h2>
            <ol className="mt-7 border-t border-hairline">
              {process.map((step, i) => (
                <li
                  key={step}
                  className="flex items-baseline gap-5 border-b border-hairline py-4"
                >
                  <span className="num w-6 shrink-0 text-[11px] tabular-nums text-patina">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-lg font-medium text-ink lg:text-xl">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-ink lg:text-2xl">
              {t.about.sectorsTitle}
            </h2>
            <ul className="mt-7 border-t border-hairline">
              {sectors.map((sector) => (
                <li key={sector} className="border-b border-hairline py-4">
                  <span className="font-display text-lg font-medium text-ink lg:text-xl">
                    {sector}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-void">
        <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-8 lg:py-28">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink lg:text-3xl">
            {t.about.principlesTitle}
          </h2>

          {/* A divided list, not three cards. Three short ideas do not need three
              boxes of chrome to be read as three things. */}
          <dl className="mt-10 grid gap-px overflow-hidden border-y border-hairline bg-hairline lg:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal key={p.title} step={i as 0 | 1 | 2} className="bg-void p-7 lg:p-9">
                <dt className="font-display text-lg font-semibold text-ink">{p.title}</dt>
                <dd className="mt-3 max-w-[38ch] text-sm leading-relaxed text-ink-3">{p.body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
