# Fawal Trading

Bilingual product catalogue and quote-request site for فوال التجارية, a steel
wire, mesh and bar manufacturer in Douma, Damascus countryside.

Buyers browse the range, collect what they need into an inquiry list, and submit
it once with their contact details. The request arrives in the owner's Telegram
chat. There are no prices, no checkout and no accounts: quoting happens off-site,
the way it already does.

## Running it

```bash
npm install
cp .env.example .env.local   # then fill in the two Telegram values below
npm run dev
```

Arabic is the default locale and is served right to left at `/ar`. English is at
`/en`. Visiting `/` redirects based on a remembered choice, then the browser's
`Accept-Language`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run test:message` | Checks the Telegram message builder escapes hostile input |
| `npm run manifest` | Regenerates the photography shot list from the catalogue |

## Connecting Telegram

Quote requests are delivered by a bot posting into one chat. There is no webhook,
no database and nothing to host.

1. In Telegram, message **@BotFather** and send `/newbot`. Copy the token it
   gives you.
2. Send any message to your new bot from the account that should receive the
   requests, then run:

   ```bash
   curl "https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates"
   ```

   Read `message.chat.id` out of the response.
3. Put both values in `.env.local`:

   ```
   TELEGRAM_BOT_TOKEN=...
   TELEGRAM_ADMIN_CHAT_ID=...
   ```

Both are server-only. Never prefix them with `NEXT_PUBLIC_`, which would publish
the token to every visitor.

If delivery fails, the buyer is told plainly and shown the company phone number
rather than a false success, and the full request is written to the server log so
it can be recovered by hand.

### What protects the endpoint

- Requests are validated with zod before anything else happens.
- Product names come from our own catalogue, never from the request body, so a
  tampered payload cannot put arbitrary text into the owner's chat.
- Every buyer-supplied value is HTML-escaped before it enters the message.
- A hidden honeypot field and a minimum fill time reject bots, and both answer
  with the same 200 a real submission gets, so a bot cannot find the boundary.
- Five requests per address per ten minutes. The limiter is in memory, which
  suits this traffic; swap it for Upstash Redis in `lib/rate-limit.ts` if that
  changes.

## Adding or changing products

Everything lives in [`content/catalog.ts`](content/catalog.ts), validated at
module load against the schemas in [`content/schema.ts`](content/schema.ts), so a
malformed entry fails the build instead of a page view. Add an entry with both
`ar` and `en` text and it appears in the grid, the filters, the search index, the
sitemap of static paths and the inquiry list.

The exported functions at the bottom of `catalog.ts` are the only thing the
components touch. A CMS can replace the file's internals later without any
component changing.

## Photography

None has been supplied yet. Every image position renders a brushed metal plate
until a file exists, which is a deliberate blank rather than a broken image.

[`public/products/README.md`](public/products/README.md) lists all 23 images with
their file names, aspect ratios and shooting notes. Dropping a correctly named
file into that folder replaces the placeholder with no code change.

## Notes for the owner

Three things in the brochure need confirming, and are marked where they appear:

1. **"More than fifty years" and "founded in 2001"** both appear in the brochure
   (pages 2 and 3). The site states both, crediting the 2001 date to the founding
   under the parent company, محمد إبراهيم فوال التجارية. Confirm the wording.
2. **No specifications were supplied.** The brochure names the product lines but
   gives no gauges, diameters, roll lengths or coating grades. Rather than invent
   plausible numbers, each product page lists the details we need *from* the
   buyer in order to quote. Send real figures and these become a specification
   table instead.
3. **مشاريعنا is empty.** Page 11 of the brochure is a heading with nothing under
   it, so the projects page currently explains that and offers to send examples.
   Send project names and photographs to fill it.

## Design

Dark, locked page-wide. Neutrals are tinted toward galvanized zinc; the single
accent is a low-chroma verdigris taken from the slate-teal in the existing logo
wordmark. Contrast runs high on purpose, because buyers read this on a phone in
daylight: body text is AAA and the muted tier still clears AA.

The material language is four rules applied consistently rather than decoration:
a bevelled top edge on every raised plate, an anisotropic brush grain at one
fixed angle, a specular sweep on hover, and the expanded metal diamond used in
exactly two places. All of it is defined in
[`app/globals.css`](app/globals.css).

The FT monogram in [`components/brand/logo.tsx`](components/brand/logo.tsx) is
traced from the company's existing mark. The original is a raster with a dark
teal serif wordmark on white, which cannot sit on a dark ground; if the source
vector turns up, swapping the paths is a one-file change.
