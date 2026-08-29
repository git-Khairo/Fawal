/**
 * Regenerates public/products/README.md from the catalogue, so the shot list
 * can never drift from the products that actually exist.
 *   npm run manifest
 */
import { writeFileSync } from "node:fs";
import { families, categories, products } from "../content/catalog";

const rows = [
  { file: "hero", where: "Home hero panel", ratio: "4:5 portrait (desktop), 4:3 (mobile)", note: "The strongest single image on the site. A coil or roll lit from one side, dark ground." },
  { file: "factory", where: "Home, the plant section", ratio: "16:9 landscape, at least 2000px wide", note: "Wide shot of the Douma plant floor. Type is laid over the top, so keep the upper third uncluttered." },
  ...families.map((f) => ({ file: f.image, where: `Home, ${f.name.en} tile`, ratio: "16:9 landscape", note: `Something that reads as ${f.name.en.toLowerCase()} at a glance.` })),
  ...categories.map((c) => ({ file: c.image, where: `Home catalogue index, ${c.name.en}`, ratio: "4:5 portrait", note: `${c.name.en}, shot close.` })),
  ...products.map((p) => ({ file: p.image, where: `Product page and grid, ${p.name.en}`, ratio: "4:3 landscape", note: p.name.ar })),
];

const body = `# Product photography

Drop files in this folder and they replace the placeholder plates automatically.
No code change and no rebuild of any component is needed.

**Naming**: use exactly the file name in the first column plus an extension.
\`webp\` is preferred, then \`avif\`, \`jpg\`, \`jpeg\`, \`png\`. For example
\`${products[0].image}.webp\`.

**Shooting notes**: the site is a dark theme. Photographs sit best on it when the
background is dark and the light comes from one side, the same way every surface
on the site is lit. Avoid white studio backdrops; they punch a bright hole in the
page. Shoot at least 1600px on the long edge.

Anything not supplied keeps showing a brushed metal plate, which is a deliberate
blank rather than a broken image, so the site can ship before the photography is
finished.

| File name | Where it appears | Aspect ratio | Notes |
| --- | --- | --- | --- |
${rows.map((r) => `| \`${r.file}\` | ${r.where} | ${r.ratio} | ${r.note} |`).join("\n")}

Total: ${rows.length} images.
`;

writeFileSync(new URL("../public/products/README.md", import.meta.url), body);
console.log(`Wrote manifest with ${rows.length} entries.`);
