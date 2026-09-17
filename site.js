(function(){
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
    const items = `
      <a class="supporter-partner goldmine" href="https://www.goldmineperformance.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Goldmine Performance"><img src="sponsor-goldmine.webp" alt="Goldmine Performance logo" width="40" height="40"><span>Goldmine Performance</span></a>
      <a class="supporter-partner" href="https://www.celaphotog.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Cela Photography"><img src="sponsor-cela.svg" alt="Cela Photography logo" width="40" height="40"><span>Cela Photography</span></a>
      <a class="supporter-partner acra" href="https://www.acraprintingandsignsvillarica.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit ACRA Printing and Signs"><img src="sponsor-acra.webp" alt="ACRA Printing and Signs logo" width="120" height="40"><span>ACRA Printing &amp; Signs</span></a>
      <a class="supporter-partner" href="https://teamgeorgiawrestling.sportngin.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Team Georgia Wrestling"><img src="sponsor-team-georgia.png" alt="Team Georgia Wrestling logo" width="40" height="40"><span>Team Georgia Wrestling</span></a>
      <span class="supporter-cluster" aria-label="Labor Day wrestling fundraiser partners"><span class="cluster-label">Wrestling Camp Partners</span>
        <a class="supporter-partner" href="https://www.slatewrestlingacademy.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Slate Wrestling Academy"><img src="sponsor-slate.webp" alt="Slate Wrestling Academy logo" width="40" height="40"><span>Slate Wrestling Academy</span></a>
        <a class="supporter-partner" href="https://www.thecolosseumtraining.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit The Colosseum Training Center"><img src="sponsor-colosseum.webp" alt="The Colosseum Training Center logo" width="40" height="40"><span>The Colosseum</span></a>
        <a class="supporter-partner" href="https://cms.carrolltoncityschools.net/" target="_blank" rel="noopener noreferrer" aria-label="Visit Carrollton Middle School"><img src="sponsor-carrollton.png" alt="Carrollton Middle School logo" width="40" height="40"><span>Carrollton Middle School</span></a>
      </span>`;
    const track = ticker.querySelector('.supporter-ticker-track');
    if(track) track.innerHTML = `<span class="ticker-set">${items}</span><span class="ticker-set" aria-hidden="true">${items}</span>`;
    const label = ticker.querySelector('.supporter-ticker-label');
    if(label) label.innerHTML = '<img src="rs-ribbon-master.webp?v=20260917d" alt="">Community Supporters';
    if(!document.getElementById('supporterTickerUpgradeStyles')){
      const style = document.createElement('style');
      style.id = 'supporterTickerUpgradeStyles';
      style.textContent = `
        .supporter-ticker{display:flex;align-items:stretch;background:#061c16;color:#fff;border-top:1px solid rgba(120,185,216,.4);border-bottom:1px solid rgba(120,185,216,.55);overflow:hidden;min-height:74px}
        .supporter-ticker-label{flex:0 0 220px;width:220px;display:flex;align-items:center;justify-content:center;gap:9px;padding:0 16px;background:#0d3528;color:#f0c65e;font-family:'Allura',cursive;font-weight:400;font-size:20px;line-height:1;white-space:nowrap;text-align:center;z-index:2;box-shadow:8px 0 24px rgba(0,0,0,.18)}
        .supporter-ticker-label img{width:31px;height:37px;object-fit:contain}
        .supporter-ticker-window{position:relative;isolation:isolate;overflow:hidden;flex:1;display:flex;align-items:center;border-left:3px solid #78b9d8}
        .supporter-ticker-window:before{content:'';position:absolute;z-index:2;inset:0 auto 0 0;width:34px;background:linear-gradient(90deg,#061c16 18%,rgba(6,28,22,0));pointer-events:none}
        .supporter-ticker-track{display:flex;width:max-content;animation:supportScroll 48s linear infinite;will-change:transform}
        .ticker-set{display:flex;align-items:center;gap:22px;padding:8px 24px}
        .supporter-partner{display:inline-flex;flex:0 0 auto;align-items:center;gap:10px;min-height:50px;padding:5px 14px;border-radius:10px;text-decoration:none;color:#fff;background:rgba(255,255,255,.045);border:1px solid rgba(120,185,216,.18);white-space:nowrap;transition:background .18s ease,border-color .18s ease,transform .18s ease}
        .supporter-partner:hover{background:rgba(120,185,216,.12);border-color:rgba(120,185,216,.62);transform:translateY(-1px)}
        .supporter-partner img{width:40px;height:40px;object-fit:contain;border-radius:50%;background:#fff;padding:2px;flex:0 0 auto}
        .supporter-partner.goldmine img{border-radius:50%;padding:0}
        .supporter-partner.acra img{width:112px;height:40px;border-radius:6px;padding:4px 7px}
        .supporter-partner span{font-size:11px;font-weight:800;letter-spacing:.01em}
        .supporter-cluster{display:inline-flex;flex:0 0 auto;align-items:center;gap:14px;padding:5px 12px;border:1px solid rgba(239,189,69,.55);border-radius:12px;background:rgba(239,189,69,.08);position:relative;white-space:nowrap}
        .cluster-label{display:inline-flex;align-items:center;align-self:stretch;padding-right:8px;border-right:1px solid rgba(239,189,69,.32);font-size:8px;line-height:1.15;text-transform:uppercase;letter-spacing:.12em;color:#f5ca62;font-weight:900;max-width:64px;white-space:normal;text-align:center}
        .supporter-cluster .supporter-partner{background:rgba(255,255,255,.03);padding:4px 10px;border-color:transparent}
        @keyframes supportScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .supporter-ticker:hover .supporter-ticker-track,.supporter-ticker:focus-within .supporter-ticker-track{animation-play-state:paused}
        @media (max-width:760px){.supporter-ticker{min-height:66px}.supporter-ticker-label{flex-basis:145px;width:145px;max-width:none;justify-content:center;padding:0 9px;font-size:17px;line-height:1;text-align:center;box-shadow:none}.supporter-ticker-label img{display:none}.supporter-ticker-window{border-left:4px solid #78b9d8}.supporter-ticker-window:before{width:30px}.ticker-set{gap:14px;padding:7px 18px}.supporter-partner{gap:9px;min-height:44px;padding:4px 10px}.supporter-partner img{width:34px;height:34px}.supporter-partner.acra img{width:94px;height:34px;border-radius:5px}.supporter-partner span{font-size:9px}.supporter-cluster{gap:10px;padding:5px 10px}.supporter-cluster .supporter-partner{padding:4px 9px}.cluster-label{font-size:7px;max-width:55px}.supporter-ticker-track{animation-duration:42s}}
        @media (prefers-reduced-motion:reduce){.supporter-ticker-track{animation:none}}
      `;
      document.head.appendChild(style);
    }
  }
})();
