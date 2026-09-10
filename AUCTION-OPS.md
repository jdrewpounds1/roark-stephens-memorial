# Roark & Stephens Strong — Silent Auction Operations

## Public bidding flow

1. Participants browse `auction.html` and submit bids through the embedded Jotform **Bid Submission** form.
2. Bidder name, phone number, and email remain private in Jotform.
3. The public website reads only `auction-bids.json`, which contains the current verified high bid, public bid count, and latest verified bid time for each item.
4. `auction.html` checks `auction-bids.json` every 30 seconds, so a verified update appears without requiring visitors to reload the page.

## Posting a verified bid

After confirming a valid Jotform submission, update only the matching item in `auction-bids.json`:

- `highBid`: new verified high bid amount
- `bidCount`: total number of verified valid bids for that item
- `lastBidAt`: ISO timestamp of the verified bid, including Eastern offset
- `updatedAt`: time the public board was last updated

**Never put bidder names, email addresses, or phone numbers in `auction-bids.json`.**

## Item map

- `item-1` — Four Private Assisted Stretch Sessions — opening $70
- `item-2` — Three Private Training Sessions — opening $100
- `item-3` — Color Powder Party — opening $85
- `item-4` — Professional Athlete Photo Shoot — opening $150
- `item-5` — Slate Wrestling Academy one-month membership — opening $55
- `item-6` — The Colosseum one-month membership — opening $55

## Closing

Scheduled close: **Monday, September 14, 2026 at 10:00 AM Eastern**.

At closing, verify the final submission timestamps in Jotform before declaring winners. The highest valid bid received before the deadline wins. Contact winners using the private Jotform submission information.

## Important

The website refreshes the public bid board automatically, but Jotform does not write directly into the public JSON file. A verified bid must be posted to `auction-bids.json` by an organizer or an authorized automation. This separation keeps bidder contact details off the public site.
