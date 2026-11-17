// Facts for the homepage — only from veon/client.json (ids in comments). Nothing here may point to the client's current site.

export const NOTE_FUTURE = "Розділ у розробці";

export interface Phone { label: string; href: string; }

// company.contacts.phones (C-005); the first one is the main line
export const phones: Phone[] = [
  { label: "+38 (044) 585-45-35", href: "tel:+380445854535" },
  { label: "+38 (067) 007-45-35", href: "tel:+380670074535" },
  { label: "+38 (095) 007-45-35", href: "tel:+380950074535" },
  { label: "+38 (098) 007-45-35", href: "tel:+380980074535" },
];
export const mainPhoneShort = "044 585-45-35";

// company.contacts.messengers, emails
export const viber = { label: "Viber", number: "+38 (067) 007-45-35", href: "viber://chat?number=380670074535" };
export const telegram = { label: "Telegram", handle: "@avtoduma", href: "https://t.me/avtoduma" };
export const email = "info@avtoduma.com";
export const b2bMailto = `mailto:${email}?subject=${encodeURIComponent("Співпраця: СТО / автомагазин")}`;

// company.contacts.addresses, C-013, C-011
export const address = { street: "Голосіївський пр-т, 130/57", city: "03127, Київ" };
export const schedule = { days: "пн–пт 9:00–19:00", weekend: "сб і нд — вихідні" };
export const routeHref = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent("проспект Голосіївський, 130/57, Київ, 03127");
export const mapsProfile = "https://www.google.com/maps?cid=9203525120458293671"; // C-031, audit/browser-home.json
export const legal = "ТОВ «Отомобіль», ЄДРПОУ 37480089";

export const anchors = [
  { href: "#pidbir", label: "Підбір" },
  { href: "#katalog", label: "Каталог" },
  { href: "#dostavka", label: "Доставка й оплата" },
  { href: "#biznes", label: "Для бізнесу" },
  { href: "#pro-nas", label: "Про нас" },
  { href: "#kontakty", label: "Контакти" },
];

// Catalog rows by the letters of the logo caption (C-036); sections from C-002, C-032, company.products_services
export interface CatalogRow { id: string; letter: string; word: string; items: string[]; }
export const catalog: CatalogRow[] = [
  { id: "katalog-d", letter: "Д", word: "Деталі", items: ["Запчастини для легкових", "Вантажні запчастини", "Автоскло", "Запчастини для човнів"] },
  { id: "katalog-u", letter: "У", word: "Устаткування", items: ["Шини", "Акумулятори", "Оливи та автохімія", "Інструменти й товари для гаража"] },
  { id: "katalog-m", letter: "М", word: "Механізми", items: ["Турбіни", "Муфта Haldex", "Склопідйомники", "Стартери й генератори"] },
  { id: "katalog-a", letter: "А", word: "Аксесуари", items: ["Автоаксесуари", "Автосвітло", "Автоелектроніка", "Автосувеніри"] },
];

// C-009
export const history = [
  { year: "1999", text: "створення компанії" },
  { year: "2001", text: "власний склад" },
  { year: "2006", text: "власний відділ логістики" },
  { year: "2007", text: "сайт transvit.kiev.ua" },
  { year: "2011–2012", text: "новий інтернет-проєкт «Автодума»" },
];

// Future pages of the full site (ux/demo-home.md п. 4) — rendered as FutureLink
export const futurePages = [
  "Каталог", "Підбір за VIN", "Бренди", "Оплата та доставка", "Для СТО та магазинів",
  "Партнерам", "Відгуки", "Вакансії", "Додаток AVTODUMA", "Вхід", "Кошик",
];
