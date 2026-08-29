import { ButtonLink } from "@/components/material/button";
import { MeshGround } from "@/components/material/mesh-ground";
import { MetalSurface } from "@/components/material/metal-surface";
import { resolveProductImage } from "@/lib/product-images";
import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  const heroImage = resolveProductImage("hero");

  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[7fr_5fr] lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="relative z-10">
          <h1 className="max-w-[26ch] font-display text-[2rem] font-semibold tracking-tight text-ink sm:text-[2.5rem] lg:text-[2.9rem]">
            {t.home.heroTitle}
          </h1>
          <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-ink-2 sm:text-base">
            {t.home.heroBody}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={`/${locale}/products`}>{t.common.browseProducts}</ButtonLink>
            <ButtonLink href={`/${locale}/inquiry`} variant="secondary">
              {t.common.requestQuote}
            </ButtonLink>
          </div>
        </div>

        {/* The image slot. Drop public/products/hero.webp in and the lattice panel
            is replaced by the photograph, with no change here. */}
        <div className="relative aspect-[4/3] w-full lg:aspect-[4/4.4]">
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          ) : (
            /* Until the photography arrives this is not a placeholder so much as
               the product itself: their lattice, on their steel, lit live. */
            <div className="plate h-full w-full overflow-hidden">
              <MetalSurface scale={14} />
            </div>
          )}
        </div>
      </div>

      {/* Mesh ground, first of exactly two uses on the site. */}
      <MeshGround
        scale={58}
        opacity={0.045}
        className="[mask-image:linear-gradient(to_bottom,transparent,black_35%,transparent)]"
      />
    </section>
  );
}
