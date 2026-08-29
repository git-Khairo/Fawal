import { ButtonLink } from "@/components/material/button";
import { MeshGround } from "@/components/material/mesh-ground";
import { Reveal } from "@/components/material/reveal";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function QuoteBand({ locale, t }: { locale: Locale; t: Dictionary }) {
  const steps = [
    { title: t.home.step1Title, body: t.home.step1Body },
    { title: t.home.step2Title, body: t.home.step2Body },
    { title: t.home.step3Title, body: t.home.step3Body },
  ];

  return (
    <section className="relative overflow-hidden bg-deck">
      {/* Mesh ground, second and last use on the site. */}
      <MeshGround
        scale={64}
        opacity={0.055}
        className="text-spec-hi [mask-image:radial-gradient(70%_90%_at_50%_0%,black,transparent)]"
      />

      <div className="relative mx-auto grid max-w-[1400px] gap-14 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8 lg:py-28">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink lg:text-4xl">
            {t.home.ctaTitle}
          </h2>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ink-2">
            {t.home.ctaBody}
          </p>
          <ButtonLink href={`/${locale}/products`} className="mt-8">
            {t.common.browseProducts}
          </ButtonLink>
        </Reveal>

        <Reveal step={1}>
          {/* A divided sequence rather than three equal cards. The verb is the
              label, so no ordinal is needed: reading order already carries it. */}
          <ol className="border-t border-hairline">
            {steps.map((step) => (
              <li
                key={step.title}
                className="grid grid-cols-[7rem_1fr] items-baseline gap-4 border-b border-hairline py-6 sm:grid-cols-[9rem_1fr] sm:gap-8 sm:py-7"
              >
                <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                  {step.title}
                </h3>
                <p className="max-w-[46ch] text-sm leading-relaxed text-ink-3">{step.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
