"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash, CheckCircle, WarningCircle, Phone } from "@phosphor-icons/react/dist/ssr";
import { useInquiry, MAX_QUANTITY } from "@/lib/cart-store";
import { Button, ButtonLink } from "@/components/material/button";
import { MeshGround } from "@/components/material/mesh-ground";
import { MaterialFill } from "@/components/material/material-fill";
import type { UnitId, Locale } from "@/content/schema";
import { cn } from "@/lib/cn";

export type CatalogEntry = {
  name: string;
  categoryName: string;
  image: string | null;
  units: UnitId[];
};

type Labels = {
  inquiry: Record<string, string>;
  units: Record<string, string>;
  common: Record<string, string>;
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; reference: string }
  | { kind: "error"; message: string; showPhone: boolean };

type FieldErrors = Partial<Record<"name" | "phone" | "city" | "email", string>>;

export function InquiryView({
  locale,
  catalog,
  labels,
  phone,
}: {
  locale: Locale;
  catalog: Record<string, CatalogEntry>;
  labels: Labels;
  phone: string;
}) {
  const { inquiry: L, units: U, common: C } = labels;

  const lines = useInquiry((s) => s.lines);
  const hydrated = useInquiry((s) => s.hydrated);
  const setQuantity = useInquiry((s) => s.setQuantity);
  const setUnit = useInquiry((s) => s.setUnit);
  const remove = useInquiry((s) => s.remove);
  const clear = useInquiry((s) => s.clear);

  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const startedAt = useRef<number>(0);
  const successRef = useRef<HTMLDivElement>(null);

  // Drop any line whose product no longer exists in the catalogue, which can
  // happen when a saved list outlives a product being retired.
  const known = useMemo(() => lines.filter((l) => catalog[l.slug]), [lines, catalog]);

  // Stamped on mount rather than during render: Date.now() in a render body is
  // impure and would drift on every re-render.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status.kind === "sent") successRef.current?.focus();
  }, [status.kind]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const nextErrors: FieldErrors = {};
    if (!values.name?.trim() || values.name.trim().length < 2) nextErrors.name = L.errorRequired;
    if (!values.phone?.trim()) nextErrors.phone = L.errorRequired;
    else if (!/^[+\d][\d\s()\-.]{4,29}$/.test(values.phone.trim())) nextErrors.phone = L.errorPhone;
    if (!values.city?.trim() || values.city.trim().length < 2) nextErrors.city = L.errorRequired;
    if (values.email?.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim())) {
      nextErrors.email = L.errorEmail;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }

    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          name: values.name.trim(),
          company: values.company?.trim() ?? "",
          phone: values.phone.trim(),
          city: values.city.trim(),
          email: values.email?.trim() ?? "",
          notes: values.notes?.trim() ?? "",
          website: values.website ?? "",
          startedAt: startedAt.current,
          lines: known.map((l) => ({ slug: l.slug, quantity: l.quantity, unit: l.unit })),
        }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        reference?: string;
        error?: string;
      };

      if (response.status === 429) {
        setStatus({ kind: "error", message: L.errorRateLimited, showPhone: false });
        return;
      }
      if (!response.ok || !body.ok) {
        const delivery = body.error === "delivery";
        setStatus({
          kind: "error",
          message: delivery ? L.errorNetworkBody : L.errorGeneric,
          showPhone: delivery,
        });
        return;
      }

      clear();
      setStatus({ kind: "sent", reference: body.reference ?? "" });
    } catch {
      setStatus({ kind: "error", message: L.errorNetworkBody, showPhone: true });
    }
  }

  /* ---- sent ------------------------------------------------------------ */
  if (status.kind === "sent") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="plate relative overflow-hidden rounded-[--radius-plate] border border-hairline outline-none"
      >
        <MeshGround scale={70} opacity={0.08} className="text-spec-hi" />
        <div className="relative flex flex-col items-start gap-4 px-7 py-16 lg:px-14 lg:py-20">
          <CheckCircle size={34} weight="light" className="text-patina" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-ink">{L.successTitle}</h2>
          <p className="max-w-[48ch] text-[15px] leading-relaxed text-ink-2">
            {L.successBody.split("{id}")[0]}
            <span className="num text-patina">{status.reference}</span>
            {L.successBody.split("{id}")[1]}
          </p>
          <ButtonLink href={`/${locale}/products`} className="mt-3">
            {L.successCta}
          </ButtonLink>
        </div>
      </div>
    );
  }

  /* ---- loading the saved list ------------------------------------------ */
  if (!hydrated) {
    return (
      <div className="grid gap-4" aria-busy="true" aria-label={C.loading}>
        {[0, 1].map((i) => (
          <div key={i} className="plate h-28 rounded-[--radius-plate] border border-hairline" />
        ))}
      </div>
    );
  }

  /* ---- empty ------------------------------------------------------------ */
  if (known.length === 0) {
    return (
      <div className="plate relative overflow-hidden rounded-[--radius-plate] border border-hairline">
        <MeshGround scale={70} opacity={0.08} className="text-spec-hi" />
        <div className="relative flex flex-col items-start gap-4 px-7 py-16 lg:px-14 lg:py-20">
          <h2 className="font-display text-2xl font-semibold text-ink">{L.emptyTitle}</h2>
          <p className="max-w-[48ch] text-[15px] leading-relaxed text-ink-2">{L.emptyBody}</p>
          <ButtonLink href={`/${locale}/products`} className="mt-3">
            {L.emptyCta}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const sending = status.kind === "sending";

  /* ---- list plus form --------------------------------------------------- */
  return (
    <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
      <section aria-labelledby="lines-heading">
        <h2 id="lines-heading" className="font-display text-lg font-semibold text-ink">
          {L.listTitle}
        </h2>

        <ul className="mt-5 grid gap-px overflow-hidden border-y border-hairline bg-hairline">
          {known.map((line) => {
            const entry = catalog[line.slug];
            return (
              <li key={line.slug} className="flex gap-4 bg-void p-4 sm:p-5">
                <Link
                  href={`/${locale}/products/${line.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[--radius-tile] border border-hairline"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {entry.image ? (
                    <Image src={entry.image} alt="" fill sizes="80px" className="object-cover" />
                  ) : (
                    <MaterialFill scale={30} className="absolute inset-0" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="num text-[10px] text-ink-3">{entry.categoryName}</p>
                  <h3 className="mt-1 font-display text-[15px] font-semibold text-ink">
                    <Link
                      href={`/${locale}/products/${line.slug}`}
                      className="transition-colors duration-200 hover:text-patina"
                    >
                      {entry.name}
                    </Link>
                  </h3>

                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <label className="block">
                      <span className="sr-only">{C.quantity}</span>
                      <input
                        type="number"
                        min={1}
                        max={MAX_QUANTITY}
                        value={line.quantity}
                        onChange={(e) => setQuantity(line.slug, Number(e.target.value))}
                        className="num plate-inset w-24 rounded-[--radius-tile] border border-hairline px-3 py-2 text-sm text-ink focus:border-edge"
                      />
                    </label>
                    <label className="block">
                      <span className="sr-only">{C.unit}</span>
                      <select
                        value={line.unit}
                        onChange={(e) => setUnit(line.slug, e.target.value as UnitId)}
                        className="plate-inset rounded-[--radius-tile] border border-hairline px-3 py-2 text-sm text-ink focus:border-edge"
                      >
                        {entry.units.map((u) => (
                          <option key={u} value={u} className="bg-raised text-ink">
                            {U[u]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => remove(line.slug)}
                      className="ms-auto inline-flex items-center gap-1.5 rounded-[--radius-tile] px-2.5 py-2 text-xs text-ink-3 transition-colors duration-200 hover:text-ink"
                    >
                      <Trash size={14} aria-hidden="true" />
                      {C.remove}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="form-heading">
        <h2 id="form-heading" className="font-display text-lg font-semibold text-ink">
          {L.formTitle}
        </h2>

        <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-5">
          {/* Honeypot. Hidden from sight and from assistive technology, but a
              naive bot fills every field it finds. */}
          <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <Field
            name="name"
            label={L.nameLabel}
            placeholder={L.namePlaceholder}
            autoComplete="name"
            required
            error={errors.name}
          />
          <Field
            name="company"
            label={L.companyLabel}
            help={L.companyHelp}
            autoComplete="organization"
          />
          <Field
            name="phone"
            label={L.phoneLabel}
            help={L.phoneHelp}
            type="tel"
            autoComplete="tel"
            dir="ltr"
            required
            error={errors.phone}
          />
          <Field
            name="city"
            label={L.cityLabel}
            autoComplete="address-level2"
            required
            error={errors.city}
          />
          <Field
            name="email"
            label={L.emailLabel}
            help={L.emailHelp}
            type="email"
            autoComplete="email"
            dir="ltr"
            error={errors.email}
          />

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-ink">
              {L.notesLabel}
            </label>
            <p id="notes-help" className="mt-1 text-xs text-ink-3">
              {L.notesHelp}
            </p>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={1200}
              aria-describedby="notes-help"
              placeholder={L.notesPlaceholder}
              className="plate-inset mt-2 w-full resize-y rounded-[--radius-tile] border border-hairline px-3.5 py-3 text-sm leading-relaxed text-ink transition-colors duration-200 focus:border-edge"
            />
          </div>

          {status.kind === "error" ? (
            <div
              role="alert"
              className="rounded-[--radius-tile] border border-hairline bg-inset p-4"
            >
              <p className="flex items-start gap-2.5 text-sm text-ink">
                <WarningCircle size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-patina" />
                <span>
                  <span className="block font-medium">{L.errorNetworkTitle}</span>
                  <span className="mt-1 block text-ink-2">{status.message}</span>
                </span>
              </p>
              {status.showPhone ? (
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  dir="ltr"
                  className="num mt-3 inline-flex items-center gap-2 text-sm text-patina hover:underline"
                >
                  <Phone size={15} weight="bold" aria-hidden="true" />
                  {phone}
                </a>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" disabled={sending} className="mt-1">
            {sending ? L.submitting : L.submit}
          </Button>
        </form>
      </section>
    </div>
  );
}

function Field({
  name,
  label,
  help,
  error,
  required,
  ...rest
}: {
  name: string;
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
} & React.ComponentProps<"input">) {
  const helpId = help ? `${name}-help` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-patina"> *</span> : null}
      </label>
      {help ? (
        <p id={helpId} className="mt-1 text-xs text-ink-3">
          {help}
        </p>
      ) : null}
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={[helpId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "plate-inset mt-2 w-full rounded-[--radius-tile] border px-3.5 py-3 text-sm text-ink",
          "transition-colors duration-200 focus:border-edge",
          error ? "border-patina" : "border-hairline",
        )}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-patina">
          {error}
        </p>
      ) : null}
    </div>
  );
}
