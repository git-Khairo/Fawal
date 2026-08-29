import "server-only";

export { escapeHtml } from "./escape-html";

const API_BASE = "https://api.telegram.org";

export type TelegramResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "api-error" | "network" };

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID);
}

export async function sendToAdmin(html: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) return { ok: false, reason: "not-configured" };

  // Two attempts. A single transient network blip should not cost a lead, and
  // more than two would hold the buyer's browser open for too long.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: html,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });

      if (response.ok) return { ok: true };

      // 4xx means the message or the credentials are wrong. Retrying cannot help.
      if (response.status >= 400 && response.status < 500) {
        const body = await response.text().catch(() => "");
        console.error("[telegram] rejected", response.status, body.slice(0, 400));
        return { ok: false, reason: "api-error" };
      }
    } catch (error) {
      if (attempt === 1) {
        console.error("[telegram] network failure", error);
        return { ok: false, reason: "network" };
      }
    }
  }

  return { ok: false, reason: "network" };
}
