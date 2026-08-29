import Link from "next/link";
import { ProductImage } from "./product-image";
import { AddToInquiry } from "@/components/inquiry/add-to-inquiry";
import type { UnitId } from "@/content/schema";

export type CatalogItem = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  categoryName: string;
  families: string[];
  image: string | null;
  units: UnitId[];
  searchIndex: string;
};

export function ProductTile({
  item,
  locale,
  labels,
}: {
  item: CatalogItem;
  locale: string;
  labels: { add: string; added: string; pending: string; details: string };
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[--radius-plate] border border-hairline bg-deck transition-colors duration-300 hover:border-edge">
      <Link
        href={`/${locale}/products/${item.slug}`}
        className="specular block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImage
          src={item.image}
          alt=""
          label={item.name}
          pendingLabel={labels.pending}
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 33vw, 100vw"
          className="aspect-[4/3] w-full"
          imageClassName="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="num text-[10px] text-ink-3">{item.categoryName}</p>
        <h3 className="mt-1.5 font-display text-base font-semibold text-ink">
          <Link
            href={`/${locale}/products/${item.slug}`}
            className="transition-colors duration-200 hover:text-patina"
          >
            {item.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-3">{item.summary}</p>

        <div className="mt-5 flex flex-col gap-2 pt-0">
          <AddToInquiry
            slug={item.slug}
            unit={item.units[0]}
            addLabel={labels.add}
            addedLabel={labels.added}
          />
        </div>
      </div>
    </article>
  );
}
