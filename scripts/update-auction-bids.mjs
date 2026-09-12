import { readFile, writeFile } from 'node:fs/promises';

const FORM_ID = process.env.JOTFORM_FORM_ID || '262514458627059';
const API_KEY = process.env.JOTFORM_API_KEY;
const FIXTURE = process.env.JOTFORM_SUBMISSIONS_FILE;
const CLOSE_AT = new Date('2026-09-14T10:00:00-04:00');

const items = {
  'Four Private Assisted Stretch Sessions — Goldmine Performance': { id: 'item-1', opening: 70, increment: 15 },
  '3 Private Training Sessions — Goldmine Performance': { id: 'item-2', opening: 100, increment: 20 },
  'Color Powder Party — Cela Photography': { id: 'item-3', opening: 85, increment: 20 },
  'Professional Athlete Photo Shoot — Cela Photography': { id: 'item-4', opening: 150, increment: 25 },
  '1-Month Membership — Slate Wrestling Academy': { id: 'item-5', opening: 55, increment: 15 },
  '1-Month Membership — The Colosseum Training Center (Carrollton)': { id: 'item-6', opening: 55, increment: 15 }
};

function submissionTime(value) {
  if (!value) return null;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const withZone = /(?:Z|[+-]\d\d:\d\d)$/.test(normalized) ? normalized : normalized + '-04:00';
  const date = new Date(withZone);
  return Number.isNaN(date.valueOf()) ? null : date;
}
function money(value) {
  const parsed = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}
async function loadSubmissions() {
  if (FIXTURE) return JSON.parse(await readFile(FIXTURE, 'utf8'));
  if (!API_KEY) throw new Error('JOTFORM_API_KEY is required');
  const url = new URL('https://api.jotform.com/form/' + FORM_ID + '/submissions');
  url.searchParams.set('limit', '1000');
  url.searchParams.set('orderby', 'created_at');
  url.searchParams.set('direction', 'ASC');
  const response = await fetch(url, { headers: { APIKEY: API_KEY } });
  if (!response.ok) throw new Error('Jotform API returned ' + response.status);
  const payload = await response.json();
  if (!Array.isArray(payload.content)) throw new Error('Unexpected Jotform response');
  return payload.content;
}
const board = JSON.parse(await readFile('auction-bids.json', 'utf8'));
const baseline = Object.fromEntries(Object.values(items).map(({ id, opening }) => [id, { highBid: opening, bidCount: 0, lastBidAt: null }]));
if (!FIXTURE && new Date() > CLOSE_AT) {
  console.log('Auction is closed; no Jotform request was made.');
  process.exit(0);
}
const submissions = (await loadSubmissions())
 .filter(submission => submission.status === 'ACTIVE')
 .map(submission => ({ submission, created: submissionTime(submission.created_at) }))
 .filter(({ created }) => created && created <= CLOSE_AT)
 .sort((a,b) => a.created - b.created);
let lastAccepted = null;
for (const { submission, created } of submissions) {
  const rule = items[submission.answers?.['2']?.answer];
  const amount = money(submission.answers?.['6']?.answer);
  if (!rule || amount === null) continue;
  const current = baseline[rule.id];
  const minimum = current.bidCount === 0 ? rule.opening : current.highBid + rule.increment;
  if (amount < minimum) continue;
  current.highBid = amount;
  current.bidCount += 1;
  current.lastBidAt = created.toISOString();
  lastAccepted = created;
}
const next = { updatedAt: lastAccepted ? lastAccepted.toISOString() : board.updatedAt, items: baseline };
await writeFile('auction-bids.json', JSON.stringify(next, null, 2) + '\n');
console.log('Auction board generated with ' + Object.values(baseline).reduce((sum,item)=>sum+item.bidCount,0) + ' valid bids.');
