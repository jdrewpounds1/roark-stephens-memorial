(function(){
  const primaryNav = document.querySelector('.top nav');
  if(primaryNav && !primaryNav.querySelector('a[href="football.html"]')){
    const footballLink = document.createElement('a');
    footballLink.href = 'football.html';
    footballLink.textContent = 'Football';
    const eventsLink = primaryNav.querySelector('a[href="events.html"]');
    primaryNav.insertBefore(footballLink, eventsLink || null);
  }
  const brandText = document.querySelector('.brandtext');
  if(brandText && !document.querySelector('.social-links')){
    const socials = document.createElement('div');
    socials.className = 'social-links';
    socials.setAttribute('aria-label','Social pages');
    socials.innerHTML = '<a href="social-under-construction.html?platform=Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 1.9-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.7.3-1 1-1Z"/></svg>Facebook</a><a href="social-under-construction.html?platform=Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="instagram-dot"/></svg>Instagram</a>';
    let brand = brandText.closest('.brand');
    if(brand && brand.tagName === 'A'){
      const wrapper = document.createElement('div');
      wrapper.className = 'brand';
      brand.parentElement.insertBefore(wrapper, brand);
      wrapper.appendChild(brand);
      brand.classList.add('brand-home');
      brand = wrapper;
    }
    const slot = document.createElement('div');
    slot.className = 'brand-social-slot';
    slot.appendChild(socials);
    if(brand) brand.appendChild(slot);
  }
  const closeAt = new Date('2026-09-28T10:00:00-04:00');
  const countdown = document.getElementById('auctionCountdown');
  function tick(){
    if(!countdown) return;
    const diff = closeAt - new Date();
    if(diff <= 0){ countdown.textContent = 'Auction closed'; return; }
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    countdown.textContent = `${d}d ${h}h ${m}m remaining`;
  }
  tick();
  if(countdown) setInterval(tick,60000);

  const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  const when = iso => {
    if(!iso) return 'No bids yet';
    try{return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York'}).format(new Date(iso)) + ' ET';}
    catch(e){return 'Verified bid posted';}
  };

  async function refreshBidBoard(){
    if(!document.querySelector('[data-auction-item]')) return;
    try{
      const r = await fetch('auction-bids.json',{cache:'no-store'});
      if(!r.ok) throw new Error('bid board unavailable');
      const data = await r.json();
      Object.entries(data.items || {}).forEach(([id,item])=>{
        const card = document.querySelector(`[data-auction-item="${id}"]`);
        if(!card) return;
        const bidEl = card.querySelector('[data-current-bid]');
        const metaEl = card.querySelector('[data-bid-meta]');
        const statusEl = card.querySelector('[data-bid-status]');
        const opening = Number(card.dataset.openingBid || 0);
        const count = Number(item.bidCount || 0);
        const current = Number(item.highBid || opening);
        if(bidEl) bidEl.textContent = money(current);
        if(metaEl) metaEl.textContent = count > 0 ? `Latest verified bid: ${when(item.lastBidAt)}` : 'Opening bid — no verified bids yet';
        if(statusEl){
          statusEl.textContent = count > 0 ? `${count} verified bid${count===1?'':'s'}` : 'Open for bidding';
          statusEl.classList.toggle('pending',count===0);
        }
        card.classList.toggle('is-leading',count>0);
      });
      const updated = document.getElementById('bidBoardUpdated');
      if(updated && data.updatedAt) updated.textContent = `Bid board last verified ${when(data.updatedAt)}`;
    }catch(e){
      const updated = document.getElementById('bidBoardUpdated');
      if(updated) updated.textContent = 'Bid board could not refresh. The secure bid form is still available below.';
    }
  }
  refreshBidBoard();
  setInterval(refreshBidBoard,30000);

  const eventLinks = { 'event-complete':'wrestling-fundraiser.html', 'event-upcoming':'softball-fundraiser.html' };
  Object.entries(eventLinks).forEach(([className, href]) => {
    const card = document.querySelector(`.${className}`);
    if(!card) return;
    card.setAttribute('role','link');
    card.setAttribute('tabindex','0');
    card.setAttribute('title','Open fundraiser story');
    card.addEventListener('click', event => {
      if(event.target.closest('a')) return;
      window.location.href = href;
    });
    card.addEventListener('keydown', event => {
      if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); window.location.href = href; }
    });
  });
  const softballCard = document.querySelector('.event-upcoming .event-body');
  if(softballCard && !softballCard.querySelector('.softball-contact')){
    const contact = document.createElement('p');
    contact.className = 'event-note softball-contact';
    contact.textContent = 'To register a team or volunteer, contact Stephanie at 470-279-9974.';
    softballCard.appendChild(contact);
  }

  const ticker = document.querySelector('.supporter-ticker');
  if(ticker){
    const logo = (domain, alt) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const items = `
      <a class="supporter-partner goldmine" href="https://www.goldmineperformance.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Goldmine Performance"><img src="https://images.squarespace-cdn.com/content/68eaa3b9bb6c215f7060a368/451e6348-7e1d-4dff-bb55-c4f1a9c096a9/GMPLogo_2.png?content-type=image%2Fpng&format=300w" alt="Goldmine Performance logo"><span>Goldmine Performance</span></a>
      <a class="supporter-partner" href="https://www.celaphotog.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Cela Photography"><span class="supporter-logo"><img src="${logo('celaphotog.com','Cela Photography')}" alt="Cela Photography logo" data-fallback="CE"><b aria-hidden="true">CE</b></span><span>Cela Photography</span></a>
      <span class="supporter-cluster" aria-label="Labor Day wrestling fundraiser partners"><span class="cluster-label">Wrestling Camp Partners</span>
        <a class="supporter-partner" href="https://www.slatewrestlingacademy.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Slate Wrestling Academy"><span class="supporter-logo"><img src="${logo('slatewrestlingacademy.com','Slate Wrestling Academy')}" alt="Slate Wrestling Academy logo" data-fallback="SW"><b aria-hidden="true">SW</b></span><span>Slate Wrestling Academy</span></a>
        <a class="supporter-partner" href="https://www.thecolosseumtraining.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit The Colosseum Training Center"><span class="supporter-logo"><img src="${logo('thecolosseumtraining.com','The Colosseum Training Center')}" alt="The Colosseum Training Center logo" data-fallback="CT"><b aria-hidden="true">CT</b></span><span>The Colosseum</span></a>
        <a class="supporter-partner" href="https://cms.carrolltoncityschools.net/" target="_blank" rel="noopener noreferrer" aria-label="Visit Carrollton Middle School"><span class="supporter-logo"><img src="${logo('cms.carrolltoncityschools.net','Carrollton Middle School')}" alt="Carrollton Middle School logo" data-fallback="CM"><b aria-hidden="true">CM</b></span><span>Carrollton Middle School</span></a>
      </span>`;
    const track = ticker.querySelector('.supporter-ticker-track');
    if(track) track.innerHTML = `<span class="ticker-set">${items}</span><span class="ticker-set" aria-hidden="true">${items}</span>`;
    ticker.querySelectorAll('.supporter-logo img').forEach(img => {
      const useFallback = () => img.closest('.supporter-logo')?.classList.add('fallback');
      img.addEventListener('error', useFallback, {once:true});
      if(img.complete && !img.naturalWidth) useFallback();
    });
    const label = ticker.querySelector('.supporter-ticker-label');
    if(label) label.innerHTML = '<img src="rs-ribbon-white.png" alt="">Community Supporters';
    if(!document.getElementById('supporterTickerUpgradeStyles')){
      const style = document.createElement('style');
      style.id = 'supporterTickerUpgradeStyles';
      style.textContent = `
        .supporter-ticker{display:flex;align-items:stretch;background:#071a31;color:#fff;border-top:1px solid rgba(239,189,69,.35);border-bottom:1px solid rgba(239,189,69,.35);overflow:hidden;min-height:74px}
        .supporter-ticker-label{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:0 16px;background:linear-gradient(135deg,#efbd45,#dba52b);color:#10213a;font-weight:900;font-size:10px;letter-spacing:.11em;text-transform:uppercase;z-index:2;box-shadow:8px 0 24px rgba(0,0,0,.18)}
        .supporter-ticker-label img{width:30px;height:36px;object-fit:contain}
        .supporter-ticker-window{overflow:hidden;flex:1;display:flex;align-items:center}
        .supporter-ticker-track{display:flex;width:max-content;animation:supportScroll 48s linear infinite;will-change:transform}
        .ticker-set{display:flex;align-items:center;gap:14px;padding:8px 14px}
        .supporter-partner{display:inline-flex;align-items:center;gap:8px;min-height:50px;padding:5px 10px;border-radius:10px;text-decoration:none;color:#fff;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);white-space:nowrap;transition:background .18s ease,border-color .18s ease,transform .18s ease}
        .supporter-partner:hover{background:rgba(239,189,69,.12);border-color:rgba(239,189,69,.55);transform:translateY(-1px)}
        .supporter-partner img{width:40px;height:40px;object-fit:contain;border-radius:50%;background:#fff;padding:2px;flex:0 0 auto}
        .supporter-partner.goldmine img{border-radius:50%;padding:0}
        .supporter-logo{position:relative;display:grid;place-items:center;width:40px;height:40px;flex:0 0 auto;border-radius:50%;background:#fff}
        .supporter-logo img{position:absolute;inset:0}
        .supporter-logo b{display:none;color:#efbd45;font-size:10px;letter-spacing:.05em}
        .supporter-logo.fallback{background:#102c4a;border:1px solid rgba(239,189,69,.72)}
        .supporter-logo.fallback img{display:none}
        .supporter-logo.fallback b{display:block}
        .supporter-partner span{font-size:11px;font-weight:800;letter-spacing:.01em}
        .supporter-cluster{display:inline-flex;align-items:center;gap:7px;padding:5px 8px 5px 10px;border:1px solid rgba(239,189,69,.55);border-radius:12px;background:rgba(239,189,69,.08);position:relative;white-space:nowrap}
        .cluster-label{display:inline-flex;align-items:center;align-self:stretch;padding-right:8px;border-right:1px solid rgba(239,189,69,.32);font-size:8px;line-height:1.15;text-transform:uppercase;letter-spacing:.12em;color:#f5ca62;font-weight:900;max-width:64px;white-space:normal;text-align:center}
        .supporter-cluster .supporter-partner{background:rgba(255,255,255,.03);padding:4px 7px;border-color:transparent}
        @keyframes supportScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .supporter-ticker:hover .supporter-ticker-track,.supporter-ticker:focus-within .supporter-ticker-track{animation-play-state:paused}
        @media (max-width:760px){.supporter-ticker{min-height:66px}.supporter-ticker-label{padding:0 10px;font-size:8px;max-width:98px;line-height:1.15;text-align:center}.supporter-ticker-label img{width:25px;height:30px}.ticker-set{gap:9px;padding:7px 9px}.supporter-partner{min-height:44px;padding:4px 7px}.supporter-partner img,.supporter-logo{width:34px;height:34px}.supporter-partner span{font-size:9px}.cluster-label{font-size:7px;max-width:55px}.supporter-ticker-track{animation-duration:38s}}
        @media (prefers-reduced-motion:reduce){.supporter-ticker-track{animation:none}}
      `;
      document.head.appendChild(style);
    }
  }
})();
