import Image from "next/image";
import { MeshGround } from "@/components/material/mesh-ground";
import { resolveProductImage } from "@/lib/product-images";
import { Reveal } from "@/components/material/reveal";
import type { Dictionary } from "@/lib/i18n/dictionary";

/** Full bleed, one statement. The only section on the page where type sits over
 *  an image, which is what keeps it distinct from everything above it. */
export function Factory({ t }: { t: Dictionary }) {
  const image = resolveProductImage("factory");

  return (
    <section className="relative isolate overflow-hidden border-b border-hairline">
      <div className="absolute inset-0 -z-10">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="plate h-full w-full">
            <MeshGround scale={86} opacity={0.13} className="text-spec-hi" />
          </div>
        )}
        {/* Scrim. Without it the statement fails contrast once a real photograph
            replaces the plate. */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/85 to-void/55" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-28 lg:px-8 lg:py-40">
        <Reveal className="max-w-[52ch]">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink lg:text-4xl">
            {t.home.factoryTitle}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-2 lg:text-lg">
            {t.home.factoryBody}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
