/* How you learn: stacked panels with parallax floaters, rails, 85% detail sheet with deep links, reel viewer */
(function(){
  var sec=document.querySelector('.pl-sec'); if(!sec) return;
  var root=document.documentElement;
  var rm=matchMedia('(prefers-reduced-motion: reduce)');
  var stack=sec.querySelector('.pl-stack');
  var panels=[].slice.call(sec.querySelectorAll('.pl-panel'));
  var dlg=document.getElementById('pl-dlg'), rv=document.getElementById('pl-rv');
  // overlays sit above every section and the nav
  document.body.appendChild(dlg); document.body.appendChild(rv);

  // ---------- stacked panels: parallax, cover, active pillar ----------
  var P=panels.map(function(p){
    return {el:p, stage:p.querySelector('.pl-stage'), bg:p.querySelector('.pl-bg'), card:p.querySelector('.pl-card'),
      fl:[].slice.call(p.querySelectorAll('.pl-f')).map(function(f){ return {el:f, d:parseFloat(f.dataset.d)||.5}; })};
  });
  var step=1, top0=0, stickTop=60, mob=false, active=-1;
  var bar=sec.querySelector('.pl-bar'), dockNav=sec.querySelector('.pl-dock .pl-idx'), tabs=[].slice.call(sec.querySelectorAll('.pl-idx a')), dockOn=false;
  function measure(){
    // panels stick just under the pinned headline: its height drives --pl-top
    if(innerWidth>760) sec.style.setProperty('--pl-bar',bar.offsetHeight+'px'); else sec.style.removeProperty('--pl-bar');
    var cs=getComputedStyle(panels[0]);
    stickTop=parseFloat(cs.top)||0;
    step=panels[0].offsetHeight+(parseFloat(cs.marginBottom)||0);
    top0=stack.getBoundingClientRect().top+scrollY;
    mob=innerWidth<=1180;
  }
  function frame(){
    raf=0;
    var y=scrollY, range=mob?70:150, n=-1;
    P.forEach(function(p,i){
      // t: -1 entering from below, 0 just stuck, 1 fully covered by the next panel
      var t=(y+stickTop-(top0+i*step))/step;
      if(t>-0.5) n=i;
      if(rm.matches) return;
      if(t<-1.2||t>1.2) return;
      var tc=Math.max(-1,Math.min(1,t));
      p.fl.forEach(function(f){ f.el.style.setProperty('--fy',(-tc*f.d*range).toFixed(1)+'px'); });
      p.card.style.setProperty('--cy',(-tc*(mob?10:22)).toFixed(1)+'px');
      p.bg.style.setProperty('--bgy',(tc*(mob?24:48)).toFixed(1)+'px');
      p.stage.style.setProperty('--cov',i<P.length-1?Math.max(0,Math.min(1,t)).toFixed(3):0);
    });
    n=Math.max(0,n);
    // the index docks at the bottom while the panels fill the screen
    var sr=stack.getBoundingClientRect(), on=sr.top<innerHeight*0.55&&sr.bottom>innerHeight*0.6;
    if(on!==dockOn){ dockOn=on; sec.classList.toggle('dock-on',on); }
    if(n!==active){ active=n; sec.dataset.sub=panels[n].dataset.sub; sec.dataset.subI=n; dispatchEvent(new CustomEvent('ssb:sub'));
      tabs.forEach(function(a){ var on=+a.dataset.i===n; a.classList.toggle('on',on); if(on) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); });
      // phones: keep the active pillar in view in the pinned strip
      var am=dockNav.querySelector('a.on'); if(am&&dockNav.scrollWidth>dockNav.clientWidth) dockNav.scrollTo({left:Math.max(0,am.offsetLeft-4),behavior:rm.matches?'auto':'smooth'}); }
  }
  var raf=0;
  function kick(){ if(!raf) raf=requestAnimationFrame(frame); }
  addEventListener('scroll',kick,{passive:true});
  addEventListener('resize',function(){ measure(); kick(); });
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ measure(); kick(); });
  setTimeout(function(){ measure(); kick(); },500);
  measure(); frame();

  // pillar index: jump to the point where that panel has just stuck
  tabs.forEach(function(a){ var i=+a.dataset.i; a.addEventListener('click',function(e){ e.preventDefault(); measure();
    scrollTo({top:top0+i*step-stickTop+2,behavior:rm.matches?'auto':'smooth'}); }); });
  if(window.ResizeObserver) new ResizeObserver(function(){ measure(); kick(); }).observe(bar);

  // ---------- rails: arrows (desktop), mouse drag, arrow state ----------
  [].slice.call(sec.querySelectorAll('.pl-card')).forEach(function(card){
    var rail=card.querySelector('.pl-rail'), pv=card.querySelector('.pl-pv'), nx=card.querySelector('.pl-nx');
    function stepW(){ var it=rail.querySelector('.pl-it'); return it?(it.offsetWidth+8)*2:200; }
    function state(){ pv.disabled=rail.scrollLeft<4; nx.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4; }
    pv.addEventListener('click',function(){ rail.scrollBy({left:-stepW(),behavior:rm.matches?'auto':'smooth'}); });
    nx.addEventListener('click',function(){ rail.scrollBy({left:stepW(),behavior:rm.matches?'auto':'smooth'}); });
    rail.addEventListener('scroll',function(){ requestAnimationFrame(state); },{passive:true});
    state(); setTimeout(state,600);
    var down=false, sx=0, sl=0, moved=false;
    rail.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse') return; down=true; moved=false; sx=e.clientX; sl=rail.scrollLeft; });
    addEventListener('pointermove',function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>5){ moved=true; rail.classList.add('is-drag'); } if(moved) rail.scrollLeft=sl-dx; });
    addEventListener('pointerup',function(){ if(!down) return; down=false; setTimeout(function(){ rail.classList.remove('is-drag'); },0); });
    rail.addEventListener('click',function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); moved=false; } },true);
  });

  // ---------- shared overlay helpers ----------
  function lock(on){ root.classList.toggle('pl-lock',on); }
  function trap(box,e){
    var f=[].slice.call(box.querySelectorAll('a[href],button:not([disabled]),video')).filter(function(x){ return x.offsetParent!==null; });
    if(!f.length) return; var a=f[0], z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); }
    else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); }
  }

  // ---------- detail sheet / modal ----------
  var box=dlg.querySelector('.pl-dlg-box'), media=dlg.querySelector('.pl-dlg-media img'), dn=dlg.querySelector('.pl-dlg-n'), dt=dlg.querySelector('.pl-dlg-t'),
      dc=dlg.querySelector('.pl-dlg-c'), dnext=dlg.querySelector('.pl-dlg-next'), head=dlg.querySelector('.pl-dlg-head');
  var openKey=null, opener=null, pushed=false;
  function render(key,at){
    var tpl=document.getElementById('pl-tpl-'+key); if(!tpl) return false;
    dn.innerHTML='<b>'+tpl.dataset.n.split(' / ')[0]+'</b> / '+tpl.dataset.n.split(' / ')[1];
    dt.textContent=tpl.dataset.name;
    media.src=tpl.dataset.bg; media.style.objectPosition=tpl.dataset.fx||'50% 50%';
    dc.innerHTML=''; dc.appendChild(tpl.content.cloneNode(true)); dc.scrollTop=0;
    dnext.textContent='Next: '+tpl.dataset.nextName; dnext.dataset.next=tpl.dataset.next;
    openKey=key;
    if(at!=null){ var rows=dc.querySelectorAll('.pd-row'), r=rows[+at];
      if(r) setTimeout(function(){ dc.scrollTo({top:r.offsetTop-dc.offsetTop-12,behavior:rm.matches?'auto':'smooth'}); r.classList.add('is-hit'); },380); }
    return true;
  }
  function openDlg(key,at,btn){
    if(!render(key,at)) return;
    if(!dlg.classList.contains('is-open')){
      opener=btn||document.activeElement; dlg.classList.add('is-open'); dlg.setAttribute('aria-hidden','false'); lock(true);
      try{ history.pushState({pl:key},'',location.pathname+location.search+'#pillar-'+key); pushed=true; }catch(_){ pushed=false; }
      setTimeout(function(){ dlg.querySelector('.pl-dlg-x').focus({preventScroll:true}); },60);
    } else {
      try{ history.replaceState({pl:key},'',location.pathname+location.search+'#pillar-'+key); }catch(_){}
    }
  }
  function closeDlg(fromPop){
    if(!dlg.classList.contains('is-open')) return;
    dlg.classList.remove('is-open'); dlg.setAttribute('aria-hidden','true'); box.style.removeProperty('--drag'); openKey=null;
    if(!rv.classList.contains('is-open')) lock(false);
    if(pushed&&!fromPop){ pushed=false; history.back(); } else pushed=false;
    if(opener&&opener.focus) opener.focus({preventScroll:true});
  }
  sec.addEventListener('click',function(e){
    var b=e.target.closest('[data-pl-open]'); if(!b) return;
    e.preventDefault(); openDlg(b.dataset.plOpen,b.dataset.at,b);
  });
  dlg.addEventListener('click',function(e){
    if(e.target.closest('[data-pl-close]')){ closeDlg(); return; }
    var j=e.target.closest('[data-pd-jump]');
    if(j){ e.preventDefault(); var h=j.getAttribute('href'); closeDlg();
      setTimeout(function(){ var t=document.querySelector(h); if(t) scrollTo({top:t.getBoundingClientRect().top+scrollY,behavior:rm.matches?'auto':'smooth'}); },pushed?80:40); }
  });
  dnext.addEventListener('click',function(){ openDlg(dnext.dataset.next); });
  addEventListener('popstate',function(){ if(dlg.classList.contains('is-open')) closeDlg(true); });
  // deep link: #pillar-ai opens that pillar
  var m=/^#pillar-([a-z]+)$/.exec(location.hash);
  if(m&&document.getElementById('pl-tpl-'+m[1])){
    setTimeout(function(){ var p=document.getElementById('learn-'+m[1]); if(p) scrollTo({top:p.getBoundingClientRect().top+scrollY-60}); openDlg(m[1]); try{ history.replaceState(null,'',location.pathname+location.search+'#pillar-'+m[1]); pushed=false; }catch(_){} },300);
  }
  // swipe down on the sheet head to close (phone)
  var sy=0, dy=0, dragging=false;
  head.addEventListener('touchstart',function(e){ if(innerWidth>760) return; dragging=true; sy=e.touches[0].clientY; dy=0; box.classList.add('is-drag'); },{passive:true});
  head.addEventListener('touchmove',function(e){ if(!dragging) return; dy=Math.max(0,e.touches[0].clientY-sy); box.style.setProperty('--drag',dy+'px'); },{passive:true});
  head.addEventListener('touchend',function(){ if(!dragging) return; dragging=false; box.classList.remove('is-drag');
    if(dy>110) closeDlg(); else box.style.removeProperty('--drag'); });

  // ---------- reel viewer ----------
  var vid=rv.querySelector('video'), bars=rv.querySelector('.pl-rv-bars'), cap=rv.querySelector('.pl-rv-cap'), snd=rv.querySelector('.pl-rv-snd');
  var set=[], idx=0, rvOpener=null, muted=false, prog=0;
  function show(i){
    idx=(i+set.length)%set.length; var r=set[idx];
    [].slice.call(bars.children).forEach(function(b,k){ b.classList.toggle('done',k<idx); b.firstChild.style.width=k<idx?'100%':'0'; });
    cap.querySelector('small').textContent=r.dataset.s; cap.querySelector('b').textContent=r.dataset.t;
    var img=r.querySelector('img'); vid.poster=img?img.currentSrc||img.src:'';
    if(vid.getAttribute('src')!==r.dataset.src) vid.src=r.dataset.src;
    try{ vid.currentTime=0; }catch(_){}
    vid.muted=muted; var pr=vid.play(); if(pr&&pr.catch) pr.catch(function(){ vid.muted=true; muted=true; snd.textContent='Sound off'; snd.setAttribute('aria-pressed','false'); vid.play().catch(function(){}); });
  }
  function openRv(btn){
    var rail=btn.closest('.pl-rail'); set=[].slice.call(rail.querySelectorAll('.pl-reel'));
    bars.innerHTML=set.map(function(){ return '<i><b></b></i>'; }).join('');
    rvOpener=btn; rv.classList.add('is-open'); rv.setAttribute('aria-hidden','false'); lock(true);
    show(set.indexOf(btn)); tickBar();
    setTimeout(function(){ rv.querySelector('.pl-rv-x').focus({preventScroll:true}); },60);
  }
  function closeRv(){
    if(!rv.classList.contains('is-open')) return;
    rv.classList.remove('is-open'); rv.setAttribute('aria-hidden','true'); vid.pause(); cancelAnimationFrame(prog);
    if(!dlg.classList.contains('is-open')) lock(false);
    if(rvOpener&&rvOpener.focus) rvOpener.focus({preventScroll:true});
  }
  function tickBar(){
    cancelAnimationFrame(prog);
    (function loop(){ var b=bars.children[idx]; if(b&&vid.duration) b.firstChild.style.width=(vid.currentTime/vid.duration*100)+'%';
      if(rv.classList.contains('is-open')) prog=requestAnimationFrame(loop); })();
  }
  vid.addEventListener('ended',function(){ show(idx+1); });
  sec.addEventListener('click',function(e){ var b=e.target.closest('.pl-reel'); if(!b) return; e.preventDefault(); openRv(b); });
  rv.querySelector('.pl-rv-prev').addEventListener('click',function(){ show(idx-1); });
  rv.querySelector('.pl-rv-next').addEventListener('click',function(){ show(idx+1); });
  rv.querySelectorAll('[data-rv-close]').forEach(function(b){ b.addEventListener('click',closeRv); });
  snd.addEventListener('click',function(){ muted=!muted; vid.muted=muted; snd.textContent=muted?'Sound off':'Sound on'; snd.setAttribute('aria-pressed',String(!muted)); });
  var tx=0, ty=0;
  rv.addEventListener('touchstart',function(e){ tx=e.touches[0].clientX; ty=e.touches[0].clientY; },{passive:true});
  rv.addEventListener('touchend',function(e){ var dx=e.changedTouches[0].clientX-tx, dyy=e.changedTouches[0].clientY-ty;
    if(dyy>90&&Math.abs(dyy)>Math.abs(dx)) closeRv(); else if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dyy)) show(idx+(dx<0?1:-1)); },{passive:true});

  addEventListener('keydown',function(e){
    if(rv.classList.contains('is-open')){
      if(e.key==='Escape'){ closeRv(); return; }
      if(e.key==='ArrowRight'){ show(idx+1); return; }
      if(e.key==='ArrowLeft'){ show(idx-1); return; }
      if(e.key==='Tab') trap(rv,e); return;
    }
    if(dlg.classList.contains('is-open')){
      if(e.key==='Escape'){ closeDlg(); return; }
      if(e.key==='Tab') trap(box,e);
    }
  });
  window.__pillars={open:openDlg,close:closeDlg,reel:function(k,i){ var r=sec.querySelectorAll('.pl-reel[data-reel="'+k+'"]')[i||0]; if(r) openRv(r); },closeReel:closeRv};
})();
