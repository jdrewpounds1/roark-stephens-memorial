(function(){
  const closeAt = new Date('2026-09-14T10:00:00-04:00');
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
})();
