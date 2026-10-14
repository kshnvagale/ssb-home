/* Programme: five-term carousel (Lovable style) + term detail sheet */
(function(){
  var PLAY='<svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z" fill="currentColor"/></svg>';
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function pl(n,w){ return n===1?w:(w==='masterclass'?'masterclasses':w+'s'); }
  // ---------- generic sheet (modal on desktop, bottom sheet on mobile) ----------
  function Sheet(el,data,render,hashKey){
    var panel=el.querySelector('.pg-panel'), content=el.querySelector('.pg-content'), cur=-1, opener=null, self={};
    function fill(i){ cur=i; render(i,el,content); content.scrollTop=0; panel.scrollTop=0; history.replaceState(null,'','#'+hashKey(i)); }
    function open(i,from){ opener=from||null; fill(i); el.hidden=false; document.documentElement.classList.add('pg-lock');
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('open'); panel.focus({preventScroll:true}); }); }); }
    function close(){ if(el.hidden) return; el.classList.remove('open'); history.replaceState(null,'',location.pathname+location.search);
      setTimeout(function(){ el.hidden=true; document.documentElement.classList.remove('pg-lock'); if(opener) opener.focus({preventScroll:true}); },480); }
    el.addEventListener('click',function(e){ if(e.target.closest('[data-close]')) close(); var b=e.target.closest('[data-to]'); if(b) fill(+b.dataset.to); });
    addEventListener('keydown',function(e){ if(el.hidden) return; if(e.key==='Escape') close();
      if(e.key==='ArrowRight'&&data[cur+1]) fill(cur+1); if(e.key==='ArrowLeft'&&data[cur-1]) fill(cur-1); });
    var ty=0, drag=false;
    panel.addEventListener('touchstart',function(e){ if(panel.scrollTop<=0){ ty=e.touches[0].clientY; drag=true; } },{passive:true});
    panel.addEventListener('touchmove',function(e){ if(!drag) return; var d=e.touches[0].clientY-ty; if(d>0&&panel.scrollTop<=0){ el.classList.add('dragging'); el.style.setProperty('--drag',d+'px'); } },{passive:true});
    panel.addEventListener('touchend',function(){ if(!drag) return; drag=false; el.classList.remove('dragging'); var d=parseFloat(el.style.getPropertyValue('--drag'))||0; el.style.removeProperty('--drag'); if(d>110) close(); });
    self.open=open; self.panel=panel; self.content=content; return self;
  }
  function pager(data,i,label){ var p=data[i-1], n=data[i+1];
    return '<div class="pg-pager">'+(p?'<button type="button" data-to="'+(i-1)+'"><small>← '+label(p)+'</small>'+esc(p.title||p.name)+'</button>':'')+(n?'<button type="button" class="nx" data-to="'+(i+1)+'"><small>'+label(n)+' →</small>'+esc(n.title||n.name)+'</button>':'')+'</div>'; }
  function testScroll(sh){ var ps=(location.search.match(/[?&]ps=(\d+)/)||[])[1]; if(ps) setTimeout(function(){ sh.panel.scrollTop=+ps; sh.content.scrollTop=+ps; },700); }

  // ---------- term sheet ----------
  var T=JSON.parse(document.getElementById('pg-data').textContent);
  var pgEl=document.getElementById('pg-sheet'), aimg=pgEl.querySelector('.pg-aside img'), adate=pgEl.querySelector('.pg-aside .pg-date'), acounts=pgEl.querySelector('.pg-acounts');
  function list(t,a){ return '<div class="pg-col"><p>'+t+'</p><ul>'+a.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div>'; }
  var pgSheet=Sheet(pgEl,T,function(i,el,content){ var t=T[i]; el.style.setProperty('--acc',t.acc);
    aimg.src=t.img; aimg.style.objectPosition=t.pos; adate.textContent=t.date;
    acounts.innerHTML='<span><b>'+t.c[0]+'</b>'+pl(t.c[0],'course')+'</span><span><b>'+t.c[1]+'</b>live '+pl(t.c[1],'project')+'</span><span><b>'+t.c[2]+'</b>'+pl(t.c[2],'masterclass')+'</span>';
    content.innerHTML='<p class="k">Term '+t.n+' · '+t.date+'</p><h3 id="pgs-title">'+esc(t.title)+'</h3><p class="lede">'+esc(t.sum)+'</p>'+
      '<h4>In class</h4><div class="pg-cols">'+list('Data, tech &amp; AI',t.tech)+list('Business',t.biz)+list('Masterclasses &amp; workshops',t.mc)+'</div>'+
      '<h4>Out of class</h4><div class="pg-outs">'+t.out.map(function(o){ return '<div class="pg-out"><span class="pg-thumb"><img src="'+o.img+'" alt="" loading="lazy">'+(o.watch?'<span class="play">'+PLAY+'</span>':'')+'</span><div>'+(o.flag?'<span class="pg-flag">Flagship</span>':'')+'<h5>'+esc(o.t)+'</h5><p>'+esc(o.d)+'</p></div></div>'; }).join('')+'</div>'+
      pager(T,i,function(x){return 'Term '+x.n;});
  },function(i){return 'term-'+(i+1);});


  // ---------- term carousel (Lovable-style: one large active card, neighbours as photo tiles) ----------
  var stage=document.querySelector('.tm-stage'); if(!stage) return;
  var cards=[].slice.call(stage.querySelectorAll('.tm-card')), count=document.querySelector('.tm-count b'), act=0;
  // image-led side cards: each face shows its term photo, the term name and title
  cards.forEach(function(c,i){ var f=c.querySelector('.tm-face'), im=c.querySelector('.tm-photo img'), t=c.querySelector('.tm-title');
    if(im){ f.style.backgroundImage='url("'+im.getAttribute('src')+'")'; f.style.setProperty('--fpos',im.style.objectPosition||'50% 50%'); }
    var fn=f.querySelector('.tm-fn'), k=document.createElement('span'); k.className='tm-fk'; k.textContent='Term 0'+(i+1); f.insertBefore(k,fn);
    if(t){ var ft=document.createElement('span'); ft.className='tm-ft'; ft.textContent=t.textContent; f.appendChild(ft); }
    fn.textContent=fn.textContent; });
  // five-step rail in place of the 01 / 05 counter
  var rail=document.createElement('div'); rail.className='tm-rail'; rail.setAttribute('role','group'); rail.setAttribute('aria-label','Terms');
  cards.forEach(function(c,i){ var b=document.createElement('button'); b.type='button'; b.className='tm-seg'; b.dataset.seg=i; b.setAttribute('aria-label','Term '+(i+1)); rail.appendChild(b); });
  var cnt=document.querySelector('.tm-count'); if(cnt) cnt.parentNode.insertBefore(rail,cnt);
  rail.addEventListener('click',function(e){ var b=e.target.closest('[data-seg]'); if(b) go(+b.dataset.seg); });
  function dims(){ var W=stage.clientWidth, mob=W<700;
    var A=mob?Math.min(W-40,520):Math.min(940,Math.round(W*0.64)), H=mob?Math.min(600,Math.max(520,Math.round(innerHeight*0.72))):Math.min(520,Math.max(420,innerHeight-430));
    var w=mob?Math.round(A*0.78):Math.round(Math.min(300,A*0.33)), h=mob?Math.round(H*0.8):Math.round(H*0.76), g=mob?12:16;
    stage.style.height=H+'px'; return {A:A,H:H,w:w,h:h,g:g,mob:mob}; }
  function layout(){ var d=dims();
    cards.forEach(function(c,i){ var k=i-act, on=k===0, x=0;
      if(k>0) x=d.A/2+d.g+d.w/2+(k-1)*(d.w+d.g); if(k<0) x=-(d.A/2+d.g+d.w/2+(-k-1)*(d.w+d.g));
      c.style.width=(on?d.A:d.w)+'px'; c.style.height=(on?d.H:d.h)+'px';
      c.style.transform='translate(-50%,-50%) translateX('+x+'px)';
      c.style.zIndex=10-Math.abs(k); c.classList.toggle('on',on);
      c.querySelector('.tm-full').setAttribute('aria-hidden',on?'false':'true');
      c.querySelector('.tm-more').tabIndex=on?0:-1; c.querySelector('.tm-face').tabIndex=on?-1:0; });
    count.textContent=('0'+(act+1)); [].forEach.call(document.querySelectorAll('.tm-seg'),function(b,i){ b.classList.toggle('on',i===act); b.setAttribute('aria-current',i===act?'true':'false'); });
    document.querySelectorAll('.tm-btn').forEach(function(b){ var n=act+ +b.dataset.step; b.disabled=n<0||n>=cards.length; }); }
  function go(i){ act=Math.max(0,Math.min(cards.length-1,i)); layout(); }
  document.querySelectorAll('.tm-btn').forEach(function(b){ b.addEventListener('click',function(){ go(act+ +b.dataset.step); }); });
  stage.addEventListener('click',function(e){ var f=e.target.closest('[data-go]'); if(f) go(+f.dataset.go); var o=e.target.closest('[data-open]'); if(o) pgSheet.open(+o.dataset.open,o); });
  stage.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){ go(act+1); e.preventDefault(); } if(e.key==='ArrowLeft'){ go(act-1); e.preventDefault(); } });
  var sx=0, sy=0; stage.addEventListener('touchstart',function(e){ sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
  stage.addEventListener('touchend',function(e){ var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy; if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)) go(act+(dx<0?1:-1)); },{passive:true});
  addEventListener('resize',layout); stage.classList.add('no-anim'); layout(); requestAnimationFrame(function(){ requestAnimationFrame(function(){ stage.classList.remove('no-anim'); }); });
  var ta=(location.search.match(/[?&]term=(\d)/)||[])[1]; if(ta) go(ta-1);

  // ---------- deep links ----------
  var m=location.hash.match(/^#term-(\d)$/); if(m&&T[m[1]-1]) setTimeout(function(){ document.getElementById('programme').scrollIntoView(); go(m[1]-1); pgSheet.open(m[1]-1); testScroll(pgSheet); },300);
})();
