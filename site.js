(function(){
  const brandText = document.querySelector('.brandtext');
  if(brandText && !document.querySelector('.social-links')){
    const socials = document.createElement('div');
    socials.className = 'social-links';
    socials.setAttribute('aria-label','Social pages');
    socials.innerHTML = '<a href="social-under-construction.html?platform=Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 1.9-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.7.3-1 1-1Z"/></svg>Facebook</a><a href="social-under-construction.html?platform=Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="instagram-dot"/></svg>Instagram</a>';
    const topin = brandText.closest('.topin');
    if(topin) topin.appendChild(socials);
  }
  const closeAt = new Date('2026-09-21T10:00:00-04:00');
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
})();
