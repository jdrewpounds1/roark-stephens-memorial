const BASE = "https://www.roarkstephensstrong.org";
const pages = ["/", "/events.html", "/auction.html", "/registry.html", "/apparel.html"];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, message) => { if (!condition) throw new Error(message); };
async function get(path) {
  const response = await fetch(new URL(path, BASE), { redirect: "follow", headers: { "user-agent": "Roark-Stephens-Strong-production-check/1.0" } });
  return { response, body: await response.text() };
}
let home;
for (let attempt = 1; attempt <= 30; attempt += 1) {
  home = await get("/");
  if (home.response.ok && home.body.includes("brock-announcement.webp")) break;
  if (attempt === 30) throw new Error("Production did not publish the expected commit within five minutes");
  await sleep(10000);
}
const requiredHeaders = {
  "content-security-policy": ["default-src 'self'", "frame-src https://form.jotform.com"],
  "referrer-policy": ["strict-origin-when-cross-origin"],
  "x-content-type-options": ["nosniff"],
  "x-frame-options": ["DENY"],
  "permissions-policy": ["camera=()", "microphone=()", "geolocation=()"],
};
for (const [name, fragments] of Object.entries(requiredHeaders)) {
  const value = home.response.headers.get(name) || "";
  for (const fragment of fragments) check(value.includes(fragment), `Missing ${name} fragment: ${fragment}`);
}
const seenAssets = new Set();
for (const page of pages) {
  const { response, body } = page === "/" ? home : await get(page);
  check(response.ok, `${page} returned ${response.status}`);
  check(!body.includes("laikyn-announcement.svg"), `${page} still uses Laikyn's SVG wrapper`);
  check(!body.includes("wrestling-fundraiser-collage.svg"), `${page} still uses the collage SVG wrapper`);
  check(!body.includes("gofund.me/23555469c"), `${page} still contains the broken fundraiser short link`);
  for (const match of body.matchAll(/<(?:img|script)[^>]+src=["']([^"'?#]+)["']/gi)) {
    const source = match[1];
    if (!source.startsWith("http") && !source.startsWith("data:")) seenAssets.add(new URL(source, new URL(page, BASE)).pathname);
  }
  for (const match of body.matchAll(/<link[^>]+href=["']([^"'?#]+)["']/gi)) {
    const source = match[1];
    if (!source.startsWith("http") && !source.startsWith("data:")) seenAssets.add(new URL(source, new URL(page, BASE)).pathname);
  }
}
for (const asset of seenAssets) {
  const response = await fetch(new URL(asset, BASE), { redirect: "follow" });
  check(response.ok, `Asset ${asset} returned ${response.status}`);
}
for (const url of [
  "https://form.jotform.com/262488411019053",
  "https://form.jotform.com/262510645525050",
  "https://form.jotform.com/262514458627059",
  "https://www.gofundme.com/f/support-a-family-after-tragic-loss-xjhdg",
  "https://www.gofundme.com/f/stand-with-kayla-and-brock-stephens-family",
]) {
  const response = await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0" } });
  check(response.ok, `External destination failed: ${url} (${response.status})`);
}
const missing = await get("/this-page-does-not-exist");
check(missing.response.status === 404, `Missing route returned ${missing.response.status}, expected 404`);
check(missing.body.includes("Page not found"), "Custom 404 page was not served");
console.log(`Verified ${pages.length} pages, ${seenAssets.size} local assets, 3 forms, 2 fundraisers, security headers, and custom 404.`);
