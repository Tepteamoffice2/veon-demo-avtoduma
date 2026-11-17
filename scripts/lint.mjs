// Project lint for the demo: rules that matter here and that a generic linter does not know.
// 1) no link to the client's current site; 2) no colour or font-family literal outside tokens.css;
// 3) no empty or "#" hrefs; 4) external links only to the client's real channels.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? walk(p) : /\.(astro|ts|css)$/.test(f.name) && files.push(p); } };
walk(root);
const problems = [];
const allowed = [/^tel:\+380\d{9}$/, /^mailto:info@avtoduma\.com/, /^viber:\/\/chat\?number=380670074535$/, /^https:\/\/t\.me\/avtoduma$/, /^https:\/\/www\.google\.com\/maps/, /^https:\/\/schema\.org$/, /^#[a-z]/, /^\/images\//, /^\.\.\/scripts\//];
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const rel = path.relative(process.cwd(), f);
  src.split("\n").forEach((line, i) => {
    const at = `${rel}:${i + 1}`;
    if (/avtoduma\.ua|svitparts|facebook\.com|instagram\.com|youtube\.com/i.test(line)) problems.push(`${at} link to a forbidden site`);
    if (/href=["'](#?)["']/.test(line)) problems.push(`${at} empty href`);
    for (const m of line.matchAll(/(?:href|src)=["']([^"'{]+)["']/g)) if (!allowed.some((r) => r.test(m[1]))) problems.push(`${at} unexpected address ${m[1]}`);
    for (const m of line.matchAll(/"(https?:\/\/[^"]+|tel:[^"]+|viber:[^"]+|mailto:[^"]+)"/g)) if (!allowed.some((r) => r.test(m[1]))) problems.push(`${at} unexpected address ${m[1]}`);
    if (!rel.endsWith("tokens.css") && !/^\s*(\/\/|\/\*|\*)/.test(line)) {
      if (/(?:^|[\s:(,])#[0-9a-fA-F]{3,8}\b/.test(line) && /(color|background|border|fill|stroke|outline|shadow)/.test(line)) problems.push(`${at} colour literal outside tokens.css`);
      if (/font-family:\s*(?!\s|var\()/.test(line)) problems.push(`${at} font-family literal outside tokens.css`);
    }
  });
}
if (problems.length) { console.error(problems.join("\n")); console.error(`lint: ${problems.length} problem(s)`); process.exit(1); }
console.log(`lint: ${files.length} files OK`);
