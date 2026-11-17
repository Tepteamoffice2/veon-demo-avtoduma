// E2E for the demo homepage. Playwright comes from the studio tools folder (~/.veon/tools), nothing is installed here.
// Usage: BASE_URL=http://localhost:4322/ node tests/e2e.mjs   (dev server or `npm run preview`)
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

const env = (() => { try { return JSON.parse(fs.readFileSync(path.join(os.homedir(), ".veon", "env.json"), "utf8")); } catch { return {}; } })();
const toolsDir = env.playwright_dir || path.join(os.homedir(), ".veon", "tools");
const require = createRequire(path.join(toolsDir, "noop.js"));
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:4322/";
const H1 = "Автозапчастини в Києві з 1999 року — над деталлю думаємо ми";
const SECTIONS = ["pidbir", "yak-znaity", "katalog", "dostavka", "biznes", "pro-nas", "kontakty"];
const results = [];
const test = async (name, fn) => {
  try { await fn(); results.push(["PASS", name]); }
  catch (e) { results.push(["FAIL", `${name}: ${e.message.split("\n")[0]}`]); }
};
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

const browser = await chromium.launch(env.chrome_path && fs.existsSync(env.chrome_path) ? { executablePath: env.chrome_path } : {});
const page = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(BASE, { waitUntil: "networkidle" });
  return { p, ctx, errors };
};

await test("H1, lang, noindex, sections in concept order, no script errors", async () => {
  const { p, ctx, errors } = await page();
  ok((await p.locator("h1").count()) === 1, "one h1");
  ok((await p.locator("h1").innerText()).replace(/\s+/g, " ").trim() === H1, "h1 text");
  ok((await p.getAttribute("html", "lang")) === "uk", "lang uk");
  ok((await p.getAttribute('meta[name="robots"]', "content")) === "noindex", "noindex");
  const ids = await p.$$eval("main > section", (s) => s.map((x) => x.id));
  ok(JSON.stringify(ids) === JSON.stringify(SECTIONS), `sections ${ids}`);
  ok(errors.length === 0, `script errors: ${errors.join("; ")}`);
  await ctx.close();
});

for (const width of [320, 375, 390, 768, 1024, 1440]) {
  await test(`no horizontal scroll and controls inside the screen at ${width}px`, async () => {
    const { p, ctx } = await page({ viewport: { width, height: 800 } });
    const r = await p.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("a, button, input, summary, [role=link]")) {
        const b = el.getBoundingClientRect();
        if (!b.width || getComputedStyle(el).visibility === "hidden") continue;
        if (el.closest(".menu__panel, .future-link__note, .header__compact")) continue;
        if (b.left < -1 || b.right > innerWidth + 1) out.push(`${el.textContent.trim().slice(0, 30)} ${Math.round(b.left)}..${Math.round(b.right)}`);
      }
      return { sw: document.documentElement.scrollWidth, w: innerWidth, out };
    });
    ok(r.sw <= r.w, `scrollWidth ${r.sw} > ${r.w}`);
    ok(r.out.length === 0, `outside: ${r.out.slice(0, 3).join(", ")}`);
    await ctx.close();
  });
}

await test("390: H1, VIN field and Viber button above 700 px", async () => {
  const { p, ctx } = await page({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true });
  for (const sel of ["h1", "#vin", ".vin__viber"]) {
    const b = await p.locator(sel).boundingBox();
    ok(b && b.y + b.height <= 700, `${sel} bottom ${b && Math.round(b.y + b.height)}`);
  }
  ok(await p.locator(".bar").evaluate((el) => getComputedStyle(el).transform !== "none"), "bar hidden on first screen");
  await p.evaluate(() => window.scrollTo({ top: 1600, behavior: "instant" }));
  await p.waitForTimeout(600);
  ok(await p.locator(".bar").evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight + 1), "bar shown after first screen");
  await ctx.close();
});

await test("VIN card: counter, preview, error, real Viber/Telegram/tel targets", async () => {
  const { p, ctx } = await page({ permissions: ["clipboard-read", "clipboard-write"] });
  await p.fill("#vin", "WVWZZZ1KZAW123456");
  ok((await p.locator(".vin--hero [data-vin-count]").innerText()) === "VIN", "counter shows VIN");
  ok((await p.locator("[data-vin-note]").innerText()).includes("VIN: WVWZZZ1KZAW123456"), "preview");
  await p.fill("#vin", "WVWZZZ1KZAW12345");
  await p.locator("#vin").blur();
  ok((await p.locator("[data-vin-error]").innerText()).includes("17 символів"), "16 chars error");
  ok((await p.getAttribute("#vin", "aria-invalid")) === "true", "aria-invalid");
  ok((await p.getAttribute(".vin__viber", "href")) === "viber://chat?number=380670074535", "viber href");
  ok((await p.getAttribute(".vin__tg", "href")) === "https://t.me/avtoduma", "telegram href");
  ok((await p.getAttribute(".vin__call", "href")) === "tel:+380445854535", "tel href");
  ok(!(await p.locator("form").count()), "no form element pretending to send");
  await ctx.close();
});

await test("Switcher in #yak-znaity changes the answer; keyboard arrows work", async () => {
  const { p, ctx } = await page();
  ok(await p.locator("#panel-vin").isVisible(), "vin panel visible");
  await p.click("#tab-nomer");
  ok(await p.locator("#panel-nomer").isVisible(), "nomer panel visible");
  ok(!(await p.locator("#panel-vin").isVisible()), "vin panel hidden");
  await p.keyboard.press("ArrowRight");
  ok((await p.getAttribute("#tab-marka", "aria-selected")) === "true", "arrow selects next");
  await ctx.close();
});

await test("FutureLink: no href, aria-disabled, note on click", async () => {
  const { p, ctx } = await page();
  const fl = p.locator("#katalog [data-future]").first();
  ok((await fl.getAttribute("aria-disabled")) === "true", "aria-disabled");
  ok((await fl.getAttribute("href")) === null, "no href");
  await fl.click({ force: true }); // Playwright treats aria-disabled as not clickable
  await p.waitForTimeout(800);
  const op = await fl.locator(".future-link__note").evaluate((el) => getComputedStyle(el).opacity);
  ok(Number(op) > 0.9, `note opacity ${op}`);
  ok((await fl.locator(".future-link__note").innerText()) === "Розділ у розробці", "note text");
  await ctx.close();
});

await test("Links: anchors resolve, external only to real channels, nothing to the old site", async () => {
  const { p, ctx } = await page();
  const hrefs = await p.$$eval("a[href]", (a) => a.map((x) => x.getAttribute("href")));
  const bad = [];
  for (const h of hrefs) {
    if (h.startsWith("#")) { if (h !== "#top" && h !== "#main" && !(await p.locator(h).count())) bad.push(h); continue; }
    if (/avtoduma\.ua|facebook|instagram|youtube/i.test(h)) bad.push(h);
    else if (!/^(tel:\+380|mailto:info@avtoduma\.com|viber:\/\/chat\?number=380670074535$|https:\/\/t\.me\/avtoduma$|https:\/\/www\.google\.com\/maps)/.test(h)) bad.push(h);
  }
  ok(bad.length === 0, `bad: ${bad.join(", ")}`);
  await ctx.close();
});

await test("Phone menu: opens, anchor jumps and closes", async () => {
  const { p, ctx } = await page({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  await p.click(".menu__toggle");
  ok(await p.locator(".menu__panel").isVisible(), "menu open");
  await p.click('.menu__anchors a[href="#dostavka"]');
  await p.waitForTimeout(900);
  ok(!(await p.locator(".menu__panel").isVisible()), "menu closed");
  const top = await p.locator("#dostavka").evaluate((el) => el.getBoundingClientRect().top);
  ok(Math.abs(top - 64) < 40, `dostavka at ${Math.round(top)}`);
  await ctx.close();
});

await test("Desktop: header turns compact after the first screen", async () => {
  const { p, ctx } = await page();
  ok(!(await p.locator(".header.is-compact").count()), "full at top");
  await p.evaluate(() => window.scrollTo({ top: 1500, behavior: "instant" }));
  await p.waitForTimeout(500);
  ok(await p.locator(".header.is-compact").count(), "compact after scroll");
  ok(await p.locator("#vin-mini").isVisible(), "mini field visible");
  await ctx.close();
});

await test("prefers-reduced-motion: letters and timeline are in place", async () => {
  const { p, ctx } = await page({ reducedMotion: "reduce" });
  const op = await p.locator(".hero__letter").first().evaluate((el) => getComputedStyle(el).opacity);
  ok(Number(op) === 1, `letter opacity ${op}`);
  const tr = await p.locator(".about__line").evaluate((el) => getComputedStyle(el).transform);
  ok(tr === "none" || tr === "matrix(1, 0, 0, 1, 0, 0)", `line transform ${tr}`);
  await ctx.close();
});

await test("Scripts off: content visible, all three answers shown", async () => {
  const { p, ctx } = await page({ javaScriptEnabled: false });
  for (const sel of ["#panel-vin", "#panel-nomer", "#panel-marka", "#katalog-a", "#kontakty h2"]) ok(await p.locator(sel).isVisible(), `${sel} visible`);
  ok(!(await p.locator(".header__compact").isVisible()), "compact header not shown");
  await ctx.close();
});

await browser.close();
for (const [s, n] of results) console.log(`${s} ${n}`);
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`e2e: ${results.length - failed} passed, ${failed} failed (${BASE})`);
process.exit(failed ? 1 : 0);
