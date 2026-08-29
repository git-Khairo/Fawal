import {
  categorySchema,
  familySchema,
  productSchema,
  type Category,
  type Family,
  type Product,
} from "./schema";

/**
 * Source of truth for the catalog.
 *
 * Everything here is taken from the company brochure (FawalTrading.pdf). No product
 * name, category or claim is invented. When a CMS replaces this file, keep the
 * exported function signatures at the bottom and nothing else has to change.
 */

const familyData: Family[] = [
  {
    id: "stationery",
    name: { ar: "حلول المكتبات", en: "Stationery binding" },
    blurb: {
      ar: "أسلاك التجليد بأشكالها للمطابع ومصانع الدفاتر والقرطاسية.",
      en: "Binding wire in every profile, for printers and notebook manufacturers.",
    },
    image: "cat-binding-wire",
  },
  {
    id: "fencing",
    name: { ar: "حلول التسييج", en: "Fencing and protection" },
    blurb: {
      ar: "شبك وأسلاك لتسييج الحدائق والملاعب والمنشآت وحماية المحيط.",
      en: "Mesh and wire for gardens, sports grounds, facilities and perimeter protection.",
    },
    image: "cat-fencing-mesh",
  },
  {
    id: "construction",
    name: { ar: "حلول الإنشاءات والبناء", en: "Construction and building" },
    blurb: {
      ar: "أسلاك التربيط واللحام والأنابيب والشبك الممدد لمواقع البناء.",
      en: "Tying and welding wire, pipe and expanded metal for building sites.",
    },
    image: "cat-steel-bar",
  },
];

const categoryData: Category[] = [
  {
    slug: "metal-wire",
    name: { ar: "أسلاك معدنية", en: "Metal wire" },
    blurb: {
      ar: "أسلاك مسحوبة للتربيط واللحام والتغليف، بأقطار مختلفة.",
      en: "Drawn wire for tying, welding and coating, in a range of diameters.",
    },
    image: "cat-metal-wire",
  },
  {
    slug: "barbed-wire",
    name: { ar: "أسلاك شائكة", en: "Barbed wire" },
    blurb: {
      ar: "أسلاك شائكة لحماية المحيط وتحديد الملكيات والمنشآت.",
      en: "Barbed wire for perimeter security, boundaries and facilities.",
    },
    image: "cat-barbed-wire",
  },
  {
    slug: "binding-wire",
    name: { ar: "أسلاك دفاتر", en: "Bookbinding wire" },
    blurb: {
      ar: "أسلاك تجليد حلزونية وحلقية ومزدوجة لصناعة الدفاتر.",
      en: "Spiral, single loop and double loop binding wire for notebook production.",
    },
    image: "cat-binding-wire",
  },
  {
    slug: "fencing-mesh",
    name: { ar: "شبك التسييج", en: "Fencing mesh" },
    blurb: {
      ar: "شبك حدائق وملاعب وشبك مربع للحماية بارتفاعات مختلفة.",
      en: "Garden, sports ground and square protective mesh in a range of heights.",
    },
    image: "cat-fencing-mesh",
  },
  {
    slug: "steel-bar",
    name: { ar: "قضبان حديدية", en: "Steel bar and pipe" },
    blurb: {
      ar: "قضبان معدنية وأنابيب للهياكل والقوائم وأعمال التسييج.",
      en: "Metal bar and pipe for frames, posts and fencing work.",
    },
    image: "cat-steel-bar",
  },
  {
    slug: "expanded-metal",
    name: { ar: "شبك ممدد", en: "Expanded metal" },
    blurb: {
      ar: "شبك ممدد بفتحات معينية، يُعرف محلياً بالبقلاوة.",
      en: "Expanded metal with diamond apertures, known locally as baklava mesh.",
    },
    image: "cat-expanded-metal",
  },
];

const productData: Product[] = [
  // --- أسلاك معدنية / Metal wire -------------------------------------------
  {
    slug: "tying-wire",
    name: { ar: "أسلاك تربيط", en: "Tying wire" },
    summary: {
      ar: "سلك ليّن لربط حديد التسليح وأعمال الشد في مواقع البناء.",
      en: "Soft annealed wire for tying rebar and general fixing on site.",
    },
    category: "metal-wire",
    families: ["construction"],
    specFields: ["wireDiameter", "coating", "spoolCount"],
    variants: [
      { ar: "مغلفن", en: "Galvanized" },
      { ar: "أسود", en: "Black" },
      { ar: "ملدّن", en: "Annealed" },
    ],
    applications: [
      { ar: "ربط حديد التسليح", en: "Tying rebar" },
      { ar: "تثبيت القوالب", en: "Securing formwork" },
      { ar: "أعمال البناء العامة", en: "General site fixing" },
      { ar: "التغليف والتحزيم", en: "Bundling and packing" },
    ],
    units: ["ton", "kg", "roll"],
    image: "tying-wire",
  },
  {
    slug: "welding-wire",
    name: { ar: "أسلاك لحام", en: "Welding wire" },
    summary: {
      ar: "سلك لحام للاستخدامات الإنشائية وأعمال التصنيع المعدني.",
      en: "Welding wire for structural work and metal fabrication.",
    },
    category: "metal-wire",
    families: ["construction"],
    specFields: ["wireDiameter", "tensileGrade", "spoolCount"],
    variants: [
      { ar: "مصمت", en: "Solid" },
      { ar: "محشو", en: "Flux cored" },
    ],
    applications: [
      { ar: "اللحام الإنشائي", en: "Structural welding" },
      { ar: "تصنيع الهياكل المعدنية", en: "Metal fabrication" },
      { ar: "صيانة المعدات وإصلاحها", en: "Equipment repair" },
    ],
    units: ["kg", "roll", "piece"],
    image: "welding-wire",
  },
  {
    slug: "coated-wire",
    name: { ar: "سلك ملبس", en: "Coated wire" },
    summary: {
      ar: "سلك مغلف بطبقة عازلة، يُستخدم في التجليد والتغليف والتشكيل.",
      en: "Wire with a protective outer coat, used in binding, packaging and forming.",
    },
    category: "metal-wire",
    families: ["stationery"],
    specFields: ["wireDiameter", "coating", "spoolCount"],
    variants: [
      { ar: "مغلف بالـ PVC", en: "PVC coated" },
      { ar: "مغلف بالنايلون", en: "Nylon coated" },
    ],
    applications: [
      { ar: "التجليد والتغليف", en: "Binding and packaging" },
      { ar: "التشكيل اليدوي", en: "Hand forming" },
      { ar: "الأعمال المكتبية", en: "Stationery use" },
    ],
    units: ["kg", "roll"],
    image: "coated-wire",
  },

  // --- أسلاك شائكة / Barbed wire --------------------------------------------
  {
    slug: "barbed-wire",
    name: { ar: "أسلاك شائكة", en: "Barbed wire" },
    summary: {
      ar: "سلك شائك مجدول بأشواك منتظمة لحماية المحيط وتحديد الحدود.",
      en: "Twisted barbed wire with regular barbs, for perimeter security and boundaries.",
    },
    category: "barbed-wire",
    families: ["fencing"],
    specFields: ["wireDiameter", "rollLength", "coating"],
    variants: [
      { ar: "مجدول مزدوج", en: "Double strand twisted" },
      { ar: "حلزوني (كونسرتينا)", en: "Concertina coil" },
    ],
    applications: [
      { ar: "تسييج المحيط", en: "Perimeter fencing" },
      { ar: "تحديد الملكيات الزراعية", en: "Agricultural boundaries" },
      { ar: "حماية المنشآت", en: "Facility protection" },
    ],
    units: ["roll", "kg", "ton"],
    image: "barbed-wire",
  },

  // --- أسلاك دفاتر / Bookbinding wire ---------------------------------------
  {
    slug: "spiral-wire",
    name: { ar: "سلك حلزوني", en: "Spiral binding wire" },
    summary: {
      ar: "سلك تجليد حلزوني متصل للدفاتر والتقاويم والكتالوجات.",
      en: "Continuous spiral binding wire for notebooks, calendars and catalogues.",
    },
    category: "binding-wire",
    families: ["stationery"],
    specFields: ["wireDiameter", "coating", "spoolCount"],
    variants: [
      { ar: "خطوة 3:1", en: "3:1 pitch" },
      { ar: "خطوة 2:1", en: "2:1 pitch" },
    ],
    applications: [
      { ar: "تجليد الدفاتر", en: "Notebook binding" },
      { ar: "التقاويم والكتالوجات", en: "Calendars and catalogues" },
    ],
    units: ["kg", "roll", "piece"],
    image: "spiral-wire",
  },
  {
    slug: "loop-wire",
    name: { ar: "سلك حلقات", en: "Single loop wire" },
    summary: {
      ar: "سلك حلقات مفردة لتجليد الدفاتر والملفات.",
      en: "Single loop wire for binding notebooks and files.",
    },
    category: "binding-wire",
    families: ["stationery"],
    specFields: ["wireDiameter", "coating", "spoolCount"],
    variants: [
      { ar: "حلقة مفردة", en: "Single loop" },
    ],
    applications: [
      { ar: "تجليد الملفات", en: "File binding" },
      { ar: "الدفاتر المدرسية", en: "School notebooks" },
    ],
    units: ["kg", "roll", "piece"],
    image: "loop-wire",
  },
  {
    slug: "double-loop-wire",
    name: { ar: "سلك مزدوج", en: "Double loop wire" },
    summary: {
      ar: "سلك تجليد مزدوج الحلقة يفتح الدفتر بشكل مستوٍ تماماً.",
      en: "Double loop binding wire that lets a notebook open completely flat.",
    },
    category: "binding-wire",
    families: ["stationery"],
    specFields: ["wireDiameter", "coating", "spoolCount"],
    variants: [
      { ar: "خطوة 3:1", en: "3:1 pitch" },
      { ar: "خطوة 2:1", en: "2:1 pitch" },
    ],
    applications: [
      { ar: "تجليد يفتح مستوياً تماماً", en: "Lay-flat binding" },
      { ar: "الأجندات والدفاتر", en: "Diaries and notebooks" },
    ],
    units: ["kg", "roll", "piece"],
    image: "double-loop-wire",
  },

  // --- شبك التسييج / Fencing mesh -------------------------------------------
  {
    slug: "garden-mesh",
    name: { ar: "شبك حدائق وملاعب", en: "Garden and sports mesh" },
    summary: {
      ar: "شبك تسييج للحدائق العامة والملاعب والمساحات المفتوحة.",
      en: "Chain link fencing for parks, sports grounds and open spaces.",
    },
    category: "fencing-mesh",
    families: ["fencing"],
    specFields: ["wireDiameter", "meshAperture", "rollHeight", "rollLength", "coating"],
    variants: [
      { ar: "مغلفن", en: "Galvanized" },
      { ar: "مغلف بالـ PVC", en: "PVC coated" },
    ],
    applications: [
      { ar: "تسييج الحدائق العامة", en: "Public gardens" },
      { ar: "الملاعب الرياضية", en: "Sports grounds" },
      { ar: "المساحات المفتوحة", en: "Open ground" },
    ],
    units: ["sqmeter", "roll", "meter"],
    image: "garden-mesh",
  },
  {
    slug: "square-mesh",
    name: { ar: "شبك مربع للحماية", en: "Square protective mesh" },
    summary: {
      ar: "شبك بفتحات مربعة لحماية النوافذ والمنشآت والأسوار.",
      en: "Square aperture mesh for protecting windows, facilities and walls.",
    },
    category: "fencing-mesh",
    families: ["fencing"],
    specFields: ["wireDiameter", "meshAperture", "rollHeight", "rollLength", "coating"],
    variants: [
      { ar: "ملحوم", en: "Welded" },
      { ar: "مجدول", en: "Woven" },
    ],
    applications: [
      { ar: "حماية النوافذ", en: "Window guards" },
      { ar: "الأسوار والحواجز", en: "Walls and barriers" },
      { ar: "الأقفاص والحظائر", en: "Cages and enclosures" },
    ],
    units: ["sqmeter", "roll", "meter"],
    image: "square-mesh",
  },

  // --- قضبان حديدية / Steel bar and pipe -------------------------------------
  {
    slug: "metal-bar",
    name: { ar: "قضبان معدنية", en: "Metal bar" },
    summary: {
      ar: "قضبان معدنية للقوائم والهياكل وإطارات التسييج.",
      en: "Metal bar for posts, frames and fencing structures.",
    },
    category: "steel-bar",
    families: ["fencing", "construction"],
    specFields: ["barDiameter", "rollLength", "tensileGrade", "coating"],
    variants: [
      { ar: "دائري مصمت", en: "Round solid" },
      { ar: "مربع", en: "Square" },
    ],
    applications: [
      { ar: "قوائم التسييج", en: "Fence posts" },
      { ar: "الهياكل والإطارات", en: "Frames and structures" },
    ],
    units: ["ton", "piece", "meter"],
    image: "metal-bar",
  },
  {
    slug: "metal-pipe",
    name: { ar: "أنابيب معدنية", en: "Metal pipe" },
    summary: {
      ar: "أنابيب معدنية للقوائم والدعائم وأعمال الإنشاءات.",
      en: "Metal pipe for posts, supports and construction work.",
    },
    category: "steel-bar",
    families: ["construction"],
    specFields: ["barDiameter", "sheetThickness", "rollLength", "coating"],
    variants: [
      { ar: "دائري", en: "Round" },
      { ar: "مربع", en: "Square" },
      { ar: "مستطيل", en: "Rectangular" },
    ],
    applications: [
      { ar: "القوائم والدعائم", en: "Posts and supports" },
      { ar: "الهياكل الإنشائية", en: "Structural frames" },
      { ar: "أعمال التسييج", en: "Fencing work" },
    ],
    units: ["ton", "piece", "meter"],
    image: "metal-pipe",
  },

  // --- شبك ممدد / Expanded metal ---------------------------------------------
  {
    slug: "expanded-metal",
    name: { ar: "شبك ممدد (بقلاوة)", en: "Expanded metal (baklava)" },
    summary: {
      ar: "ألواح معدنية مشقوقة وممددة بفتحات معينية، للتسييج والتغطية والديكور.",
      en: "Slit and stretched metal sheet with diamond apertures, for fencing, covers and cladding.",
    },
    category: "expanded-metal",
    families: ["construction", "fencing"],
    specFields: ["sheetThickness", "meshAperture", "rollLength", "rollHeight", "coating"],
    variants: [
      { ar: "عادي", en: "Standard" },
      { ar: "مسطّح (مدرفل)", en: "Flattened" },
    ],
    applications: [
      { ar: "التسييج والتغطية", en: "Fencing and covers" },
      { ar: "الواجهات والديكور", en: "Facades and cladding" },
      { ar: "الأدراج والممرات", en: "Stair treads and walkways" },
    ],
    units: ["sqmeter", "piece", "ton"],
    image: "expanded-metal",
  },
];

// Validate once at module load. A malformed entry fails the build, not a page view.
export const families: Family[] = familyData.map((f) => familySchema.parse(f));
export const categories: Category[] = categoryData.map((c) => categorySchema.parse(c));
export const products: Product[] = productData.map((p) => productSchema.parse(p));

const categorySlugs = new Set(categories.map((c) => c.slug));
for (const product of products) {
  if (!categorySlugs.has(product.category)) {
    throw new Error(`Product "${product.slug}" references unknown category "${product.category}"`);
  }
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function productsInCategory(slug: string): Product[] {
  return products.filter((p) => p.category === slug);
}

export function productsInFamily(id: Family["id"]): Product[] {
  return products.filter((p) => p.families.includes(id));
}
