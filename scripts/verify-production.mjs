const BASE = 'https://www.roarkstephensstrong.org';
const pages = [
  '/',
  '/memorial.html',
  '/brock-memorial.html',
  '/laikyn-memorial.html',
  '/events.html',
  '/wrestling-fundraiser.html',
  '/softball-fundraiser.html',
  '/football',
  '/auction.html',
  '/registry.html',
  '/apparel.html',
  '/social-under-construction.html'
];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function get(path) {
  const response = await fetch(new URL(path, BASE), {
    redirect: 'follow',
    headers: { 'user-agent': 'Roark-Stephens-Strong-production-check/2.0' }
  });
  return { response, body: await response.text() };
}

let home;
for (let attempt = 1; attempt <= 30; attempt += 1) {
  home = await get('/');
  if (home.response.ok && home.body.includes('Silent Auction · Monday, September 28')) break;
  if (attempt === 30) throw new Error('Production did not publish the expected commit within five minutes');
  await sleep(10000);
}

const requiredHeaders = {
  'content-security-policy': ["default-src 'self'", 'frame-src https://form.jotform.com', 'https://www.google.com'],
  'referrer-policy': ['strict-origin-when-cross-origin'],
  'x-content-type-options': ['nosniff'],
  'x-frame-options': ['DENY'],
  'permissions-policy': ['camera=()', 'microphone=()', 'geolocation=()']
};
for (const [name, fragments] of Object.entries(requiredHeaders)) {
  const value = home.response.headers.get(name) || '';
  for (const fragment of fragments) check(value.includes(fragment), `Missing ${name} fragment: ${fragment}`);
}

const seenAssets = new Set();
const pageBodies = new Map();
for (const page of pages) {
  const { response, body } = page === '/' ? home : await get(page);
  check(response.ok, `${page} returned ${response.status}`);
  pageBodies.set(page, body);
  check(!body.includes('laikyn-announcement.svg'), `${page} still uses Laikyn's SVG wrapper`);
  check(!body.includes('wrestling-fundraiser-collage.svg'), `${page} still uses the collage SVG wrapper`);
  check(!body.includes('gofund.me/23555469c'), `${page} still contains the broken fundraiser short link`);
  for (const match of body.matchAll(/<(?:img|script)[^>]+src=["']([^"'?#]+)["']/gi)) {
    const source = match[1];
    if (!source.startsWith('http') && !source.startsWith('data:')) {
      seenAssets.add(new URL(source, new URL(page, BASE)).pathname);
    }
  }
  for (const match of body.matchAll(/<link[^>]+href=["']([^"'?#]+)["']/gi)) {
    const source = match[1];
    if (!source.startsWith('http') && !source.startsWith('data:')) {
      seenAssets.add(new URL(source, new URL(page, BASE)).pathname);
    }
  }
}

for (const asset of seenAssets) {
  const response = await fetch(new URL(asset, BASE), { redirect: 'follow' });
  check(response.ok, `Asset ${asset} returned ${response.status}`);
}

check(home.body.includes('auction-paddle.svg'), 'Homepage is missing the auction-paddle fundraiser tile');
check(home.body.includes('fundraiser-hoodie.svg'), 'Homepage is missing the fundraiser hoodie tile');
check(home.body.includes('gofundme-heart.svg'), 'Homepage is missing the GoFundMe heart tile');
check(home.body.includes('Apparel · Monday, September 21'), 'Homepage apparel deadline is missing');
check(home.body.includes('Silent Auction · Monday, September 28'), 'Homepage auction deadline is missing');

const auction = pageBodies.get('/auction.html') || '';
check(auction.includes('Monday, September 28 · 10:00 AM ET'), 'Auction page has the wrong closing date');
check(!auction.includes('Color Powder Party'), 'Removed Color Powder Party is still on the auction page');
const apparel = pageBodies.get('/apparel.html') || '';
check(apparel.includes('Monday, September 21 at 10:00 AM ET'), 'Apparel page has the wrong order deadline');
const football = pageBodies.get('/football') || '';
check(football.includes('Temple Tigers 10U'), 'Football page is missing Temple Tigers 10U');
check(!football.includes('Temple Middle School'), 'Football page still contains the middle-school schedule');

const script = await get('/site.js');
check(script.response.ok, 'site.js did not load');
check(script.body.includes('2026-09-28T10:00:00-04:00'), 'Auction countdown has the wrong deadline');
check(script.body.includes('supporter-logo.fallback'), 'Supporter-logo fallback is missing');

const externalChecks = [
  ['https://form.jotform.com/262488411019053', ['September 21', 'Slate Wrestling Academy', 'Temple High School']],
  ['https://form.jotform.com/262510645525050', ['Optional Photo']],
  ['https://form.jotform.com/262514458627059', ['September 28', 'Professional Athlete Photo Shoot']],
  ['https://www.gofundme.com/f/support-a-family-after-tragic-loss-xjhdg', []],
  ['https://www.gofundme.com/f/help-honor-laikyn-stephens', []]
];
for (const [url, fragments] of externalChecks) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' } });
  check(response.ok, `External destination failed: ${url} (${response.status})`);
  const body = await response.text();
  for (const fragment of fragments) check(body.includes(fragment), `${url} is missing: ${fragment}`);
}

const missing = await get('/this-page-does-not-exist');
check(missing.response.status === 404, `Missing route returned ${missing.response.status}, expected 404`);
check(missing.body.includes('Page not found'), 'Custom 404 page was not served');

console.log(`Verified ${pages.length} pages, ${seenAssets.size} local assets, 3 live forms, 2 fundraisers, deadlines, header assets, security headers, and the custom 404.`);
