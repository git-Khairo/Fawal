/**
 * Escapes the five characters Telegram's HTML parse mode treats as markup.
 *
 * Every value that originates from the buyer passes through this before it goes
 * anywhere near a message body. Without it, a company name containing a tag
 * would break the message, and a crafted one could forge links inside the
 * owner's chat.
 *
 * Pure and dependency free on purpose, so it is testable outside the framework.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
