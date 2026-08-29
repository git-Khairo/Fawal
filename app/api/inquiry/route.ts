import { NextResponse } from "next/server";
import { inquiryRequestSchema, MIN_FILL_MS } from "@/lib/inquiry-schema";
import { getProduct } from "@/content/catalog";
import { sendToAdmin, isTelegramConfigured } from "@/lib/telegram";
import { buildInquiryMessage } from "@/lib/inquiry-message";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { getDictionary } from "@/lib/i18n/dictionary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Short, sayable over the phone, and unambiguous: no O/0 or I/1 confusion. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function reference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `FT-${out}`;
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request.headers));
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate-limited" },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const parsed = inquiryRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const data = parsed.data;

  // Anti-spam. Both checks answer 200 with a reference so a bot cannot tell a
  // rejection from a success and start probing for the boundary.
  const looksAutomated =
    Boolean(data.website) || Date.now() - data.startedAt < MIN_FILL_MS;
  if (looksAutomated) {
    return NextResponse.json({ ok: true, reference: reference() });
  }

  // Drop any slug that is not in our own catalogue before doing anything else.
  const lines = data.lines.filter((line) => getProduct(line.slug));
  if (lines.length === 0) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const ref = reference();

  if (!isTelegramConfigured()) {
    // Loud in the server log, honest to the caller. Silently accepting here
    // would lose the lead with no trace anywhere.
    console.error("[inquiry] TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID is not set", {
      reference: ref,
    });
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 503 });
  }

  // Units are localised so the owner reads "طن", not "ton".
  const t = await getDictionary(data.locale);
  const result = await sendToAdmin(buildInquiryMessage({ ...data, lines }, ref, t.units));

  if (!result.ok) {
    // The full request goes to the server log so it can be recovered by hand.
    console.error("[inquiry] delivery failed", {
      reference: ref,
      reason: result.reason,
      phone: data.phone,
      name: data.name,
      lines: lines.map((l) => `${l.slug} ${l.quantity} ${l.unit}`),
    });
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, reference: ref });
}
