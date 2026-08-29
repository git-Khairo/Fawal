import Link from "next/link";

/** Rendered outside the locale params, so it cannot read the dictionary. Both
 *  languages are shown rather than guessing which one the visitor wanted. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-[1400px] flex-col items-start justify-center gap-5 px-5 lg:px-8">
      <p className="num text-sm text-patina">404</p>
      <h1 className="font-display text-3xl font-semibold text-ink lg:text-4xl">
        الصفحة غير موجودة
        <span className="mt-1.5 block text-ink-2">Page not found</span>
      </h1>
      <div className="mt-2 flex gap-3">
        <Link
          href="/ar"
          className="rounded-[--radius-tile] border border-hairline px-4 py-2.5 text-sm text-ink-2 transition-colors hover:border-edge hover:text-ink"
        >
          الرئيسية
        </Link>
        <Link
          href="/en"
          className="rounded-[--radius-tile] border border-hairline px-4 py-2.5 text-sm text-ink-2 transition-colors hover:border-edge hover:text-ink"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
