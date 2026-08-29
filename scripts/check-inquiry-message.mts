// Exercise the message builder with hostile input, the way a real form can be filled.
const { buildInquiryMessage } = await import("../lib/inquiry-message.ts");
const units = { ton:"طن", kg:"كغ", roll:"لفة", meter:"متر طولي", sqmeter:"متر مربع", piece:"قطعة" };

const msg = buildInquiryMessage({
  locale: "ar",
  name: 'خالد <b>"مدير"</b>',
  company: "شركة الفجر & أولاده <script>alert(1)</script>",
  phone: "+963 932 555 933",
  city: "دمشق",
  email: "a@b.co",
  notes: "نحتاج شبك بارتفاع 2م <a href='http://evil'>اضغط</a> & سلك مغلفن",
  lines: [
    { slug: "barbed-wire", quantity: 12, unit: "roll" },
    { slug: "garden-mesh", quantity: 400, unit: "sqmeter" },
    { slug: "not-in-catalogue", quantity: 3, unit: "ton" },
  ],
}, "FT-8K3M2Q", units, new Date("2026-08-22T11:32:00Z"));

console.log(msg);
console.log("\n================ ASSERTIONS ================");
const raw = ["<script>", "<b>\"مدير\"", "<a href='http://evil'"];
for (const r of raw) console.log(`no unescaped ${JSON.stringify(r)}:`, !msg.includes(r) ? "PASS" : "FAIL");
console.log("script tag escaped:", msg.includes("&lt;script&gt;") ? "PASS" : "FAIL");
console.log("ampersand escaped:", msg.includes("&amp;") ? "PASS" : "FAIL");
console.log("catalogue name used, not slug:", msg.includes("أسلاك شائكة") ? "PASS" : "FAIL");
console.log("unknown slug falls back safely:", msg.includes("not-in-catalogue") ? "PASS" : "FAIL");
console.log("units localised (لفة not roll):", msg.includes("لفة") && !msg.includes(" roll") ? "PASS" : "FAIL");
console.log("Damascus time (14:32 = UTC+3):", msg.includes("14:32") ? "PASS" : "FAIL");
// Only our own tags may survive.
const tags = [...msg.matchAll(/<\/?([a-zA-Z]+)/g)].map(m => m[1]);
console.log("tags present:", [...new Set(tags)].join(", "));
