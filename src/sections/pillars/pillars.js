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

  // ---------- deck: all cards live in the pinned scene; the panels are only scroll spacers (and deep-link targets) ----------
  // Scroll position p runs 0..4. Each card rests for half its step, then the front card slides up and tilts back
  // (top tips away) while the next card steps forward from the deck, where the upcoming cards show only their bottom edges.
  var layers=[].slice.call(sec.querySelectorAll('.pl-layer'));
  var deck=document.createElement('div'); deck.className='pl-deck'; sec.querySelector('.pl-scene').appendChild(deck);
  var P=panels.map(function(p){ var c=p.querySelector('.pl-card'); deck.appendChild(c); return {el:p, card:c}; });
  var step=1, top0=0, stickTop=60, mob=false, active=-1, sceneH=600;
  var bar=sec.querySelector('.pl-bar'), dockNav=sec.querySelector('.pl-dock .pl-idx'), tabs=[].slice.call(sec.querySelectorAll('.pl-idx a')), dockOn=false;
  function measure(){
    // panels stick just under the pinned headline: its height drives --pl-top
    if(innerWidth>760) sec.style.setProperty('--pl-bar',bar.offsetHeight+'px'); else sec.style.removeProperty('--pl-bar');
    var cs=getComputedStyle(panels[0]);
    stickTop=parseFloat(getComputedStyle(sec.querySelector('.pl-scene')).top)||0;
    step=panels[0].offsetHeight+(parseFloat(cs.marginBottom)||0);
    top0=stack.getBoundingClientRect().top+scrollY;
    mob=innerWidth<=1180; sceneH=deck.offsetHeight||600;
  }
  function ease(t){ return t*t*(3-2*t); }
  var cur=-1, tLast=0;
  function frame(now){
    raf=0; now=now||performance.now();
    var raw=Math.max(0,Math.min(P.length-1,(scrollY+stickTop-top0)/step)), f=Math.floor(raw), fr=raw-f;
    // a brief rest at the start of each step, then the move; the deck then follows that target with a soft lag
    var tp=Math.min(P.length-1,f+ease(Math.max(0,Math.min(1,(fr-.12)/.88))));
    var dt=tLast?Math.min(64,now-tLast):16.7; tLast=now;
    if(cur<0||rm.matches||Math.abs(tp-cur)>2.5) cur=tp; else cur+=(tp-cur)*(1-Math.pow(.84,dt/16.7));
    if(Math.abs(tp-cur)<.0005) cur=tp;
    var p=cur, n=Math.round(p);
    P.forEach(function(o,i){
      var d=i-p, s=o.card.style, front=Math.abs(d)<.5;
      o.card.classList.toggle('is-front',rm.matches?i===n:front); o.card.inert=rm.matches?i!==n:!front;
      if(rm.matches){ s.opacity=i===n?1:0; s.visibility=i===n?'visible':'hidden'; s.transform=''; s.zIndex=i===n?2:1; return; }
      if(d>=0){ // in the deck: smaller, lower, only the bottom edge shows; content fades
        var k=Math.min(d,3);
        s.transform='translate3d(-50%,calc(-50% + '+(k*(mob?10:14)).toFixed(1)+'px),0) scale('+(1-k*.05).toFixed(4)+')';
        s.opacity=Math.max(0,Math.min(1,3-d)).toFixed(3); s.setProperty('--cov',Math.max(0,Math.min(1,(d-.55)/.45)).toFixed(3));
      } else { // leaving: slides up and tilts back, fading as it goes
        var e=Math.min(1,-d);
        s.transform='translate3d(-50%,calc(-50% - '+(e*sceneH*1.05).toFixed(1)+'px),0) rotateX('+(e*38).toFixed(2)+'deg)';
        s.opacity=Math.max(0,1-Math.max(0,e-.82)/.18).toFixed(3); s.setProperty('--cov','0');
      }
      s.visibility=(d>3||d<=-1)?'hidden':'visible';
      s.zIndex=String(100-i);
    });
    if(cur!==tp) raf=requestAnimationFrame(frame); else tLast=0;
    n=Math.max(0,n);
    // the index docks at the bottom while the panels fill the screen
    var sr=stack.getBoundingClientRect(), on=sr.top<innerHeight*0.55&&sr.bottom>innerHeight*0.6;
    if(on!==dockOn){ dockOn=on; sec.classList.toggle('dock-on',on); }
    if(n!==active){ active=n; layers.forEach(function(l,k){ l.classList.toggle('on',k===n); }); obKick(); sec.dataset.sub=panels[n].dataset.sub; sec.dataset.subI=n; dispatchEvent(new CustomEvent('ssb:sub'));
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

  // ---------- orbit (desktop): logos evenly spaced on one ring, travelling slowly; only the panels on screen move ----------
  // the scene's layers follow the active card; only the active layer's logos move (the outgoing one keeps its place while it fades)
  var scene=sec.querySelector('.pl-scene');
  var OB=layers.map(function(l,k){ return {st:scene, card:P[k].card, it:[].slice.call(l.querySelectorAll('.pl-ob')), a0:-Math.PI/2+k*.7, k:k, w:0, h:0, half:0}; });
  var obPhase=0, obLast=0, obRaf=0, REV=150000;
  function obMeasure(){ OB.forEach(function(o){ o.w=o.st.clientWidth; o.h=o.st.clientHeight; o.half=o.card.offsetWidth/2; }); }
  function obPlace(o){ var n=o.it.length; if(!n) return; var rx=o.w*.45, ry=o.h*.40;
    o.it.forEach(function(el,i){ var t=o.a0+obPhase+i*2*Math.PI/n, s=Math.sin(t), d=(s+1)/2;
      el.style.setProperty('--ox',(o.w/2+rx*Math.cos(t)).toFixed(1)+'px'); el.style.setProperty('--oy',(o.h/2+ry*s).toFixed(1)+'px');
      // fade out while passing behind the card column (never half-covered by the card or the index), slightly smaller at the back
      var dx=Math.abs(rx*Math.cos(t)), vis=Math.max(0,Math.min(1,(dx-o.half-24)/70));
      el.style.setProperty('--os',(.84+.16*d).toFixed(3)); el.style.setProperty('--oo',vis.toFixed(3)); }); }
  function obTick(now){ obRaf=0; if(innerWidth<1181) return;
    if(obLast&&!rm.matches) obPhase+=(now-obLast)/REV*2*Math.PI; obLast=now;
    var o=OB[Math.max(0,active)], vis=scene.getBoundingClientRect(); if(o) obPlace(o);
    if(vis.bottom>0&&vis.top<innerHeight&&!rm.matches) obRaf=requestAnimationFrame(obTick); else obLast=0; }
  function obKick(){ if(!obRaf) obRaf=requestAnimationFrame(obTick); }
  if('IntersectionObserver' in window) new IntersectionObserver(function(){ obKick(); }).observe(scene);
  addEventListener('scroll',obKick,{passive:true});
  obMeasure(); OB.forEach(obPlace);
  addEventListener('resize',function(){ obMeasure(); OB.forEach(obPlace); obKick(); });

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
