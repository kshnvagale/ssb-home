/* Navigation: global nav (layer 1), flying logo, section bar (layer 2), mobile section header with section list, menu sheet */
(function(){
  // ---- nav theme follows the section under it ----
  var root=document.documentElement, film=document.querySelector('.film-scroll');
  function navTheme(){
    var dark=false;
    if(film){ var b=parseFloat(film.style.getPropertyValue('--bgp')||0); var fr=film.getBoundingClientRect(); if(fr.top<60&&fr.bottom>60&&b>0.5) dark=true; }
    document.querySelectorAll('[data-nav]').forEach(function(sec){ var r=sec.getBoundingClientRect(); if(r.top<=40&&r.bottom>40) dark=sec.dataset.nav==='dark'; });
    root.classList.toggle('nav-dark',dark);
  }
  addEventListener('scroll',function(){ requestAnimationFrame(navTheme); },{passive:true}); setTimeout(navTheme,200);
})();
(function(){
  // ===== NAV v4: layer switch, flying logo, scrollspy, mobile section header, section list, menu sheet =====
  var root=document.documentElement, gn=document.querySelector('.gn'), fly=document.querySelector('.brand-fly');
  if(!gn||!fly) return;
  var slot=gn.querySelector('.gn-slot'), ln=document.querySelector('.ln'), bar=ln.querySelector('.ln-bar'), lslot=bar.querySelector('.ln-slot');
  var hooks=[].slice.call(ln.querySelectorAll('.ln-hooks a')), lind=ln.querySelector('.ln-ind');
  var mh=document.querySelector('.mh'), mhName=mh.querySelector('.mh-name'), mhK=mh.querySelector('.mh-k'), mhS=mh.querySelector('.mh-s'), mhPg=mh.querySelector('.mh-pg b');
  var mx=document.getElementById('mx-list'), mxPanel=mx.querySelector('.mx-panel'), mxRows=[].slice.call(mx.querySelectorAll('.mx-row'));
  var mq=matchMedia('(max-width:760px)'), rm=matchMedia('(prefers-reduced-motion: reduce)');
  var ids=['#film','#outcomes','#programme','#learn','#built','#faculty','#campus','#team','#press','#admissions','#faq'], secs=ids.map(function(s){ return document.querySelector(s); });
  var names=mxRows.map(function(r){ return r.querySelector('strong').textContent; });
  var film=document.querySelector('.film-scroll');
  function clamp(v,a,b){ return v<a?a:v>b?b:v; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function pos(el){ var x=0,y=0; while(el){ x+=el.offsetLeft; y+=el.offsetTop; el=el.offsetParent; } return {x:x,y:y}; }
  var G={};
  function measure(){
    var a=pos(slot); G.x0=a.x; G.y0=a.y; G.H=fly.offsetHeight||1;
    var b=pos(lslot); G.x1=b.x; G.y1=b.y; G.s1=(lslot.offsetHeight||18)/G.H;
    G.T=Math.max(150,Math.min(220,innerHeight*0.2));   // scroll distance of the logo flight
  }
  // progress p: 0 = Layer 1 (top of hero), 1 = Layer 2 (logo docked in bar)
  var cur=-1, tgt=0, raf=0, mob=mq.matches;
  function goal(){ var y=scrollY; if(rm.matches) return y>G.T*0.5?1:0; return clamp(y/G.T,0,1); }
  function render(p){
    if(mob){
      fly.style.transform='translate3d('+G.x0+'px,'+G.y0+'px,0)'; fly.style.setProperty('--wp',0);
      gn.style.opacity=''; root.classList.remove('nav-l2'); return;
    }
    var e=1-Math.pow(1-p,3);                         // ease-out: shrink early, settle softly
    var x=lerp(G.x0,G.x1,e), y=lerp(G.y0,G.y1,e), s=lerp(1,G.s1,e);
    fly.style.transform='translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0) scale('+s.toFixed(4)+')';
    fly.style.setProperty('--wp',clamp((p-0.08)/0.42,0,1).toFixed(3));
    var q=clamp((p-0.32)/0.58,0,1), qe=1-Math.pow(1-q,3);
    ln.style.opacity=qe.toFixed(3);
    bar.style.transform='translateY('+((1-qe)*-6).toFixed(2)+'px) scale('+(0.94+0.06*qe).toFixed(4)+')';
    gn.style.opacity=(1-clamp(p/0.42,0,1)).toFixed(3);
    gn.style.pointerEvents=p>0.4?'none':'';
    root.classList.toggle('nav-l2',p>0.7);
  }
  function tick(){
    raf=0; tgt=goal();
    if(cur<0||rm.matches){ cur=tgt; }
    else { cur+=(tgt-cur)*0.24; if(Math.abs(tgt-cur)<0.002) cur=tgt; }
    render(cur);
    if(cur!==tgt) raf=requestAnimationFrame(tick);
  }
  function kick(){ if(!raf) raf=requestAnimationFrame(tick); }
  // reduced motion: swap with a quick fade instead of a flight
  var lastSnap=null;
  function reducedSwap(){ if(!rm.matches||mob) return false; var g=goal(); if(g===lastSnap) return false; lastSnap=g;
    fly.style.opacity=0; setTimeout(function(){ cur=g; render(g); fly.style.opacity=1; },140); return true; }

  // ---- scrollspy: the section bar (desktop) and the section header (phone) ----
  var k=-2, lastSub=null;
  function spy(){
    var n=0; secs.forEach(function(s,i){ if(s&&s.getBoundingClientRect().top<=innerHeight*0.35) n=i; });
    var changed=n!==k; k=n;
    // the desktop bar has fewer hooks than the page has sections: match by href, keep the last one lit
    var hk=null; for(var j=n;j>=0&&!hk;j--){ hooks.forEach(function(a){ if(a.getAttribute('href')===ids[j]) hk=a; }); }
    if(changed){ hooks.forEach(function(a){ a.classList.toggle('on',a===hk); });
      mxRows.forEach(function(r,i){ r.classList.toggle('on',i===n); if(i===n) r.setAttribute('aria-current','true'); else r.removeAttribute('aria-current'); });
      mhName.textContent=names[n]; mhK.textContent=(n<9?'0':'')+(n+1)+' / '+(ids.length<10?'0':'')+ids.length; }
    var h=hk; if(h&&h.offsetWidth){ lind.style.opacity=1; lind.style.width=h.offsetWidth+'px'; lind.style.transform='translateX('+h.offsetLeft+'px)'; }
    var sec=secs[n];
    if(mob&&sec){
      // a section can name the item you are on (pillar, term) through data-sub
      var sub=sec.dataset.sub||''; if(sub!==lastSub){ lastSub=sub; mhS.textContent=sub; }
      var r=sec.getBoundingClientRect(), p=clamp((60-r.top)/Math.max(1,r.height-innerHeight*0.5),0,1);
      mhPg.style.setProperty('--p',p.toFixed(3));
    }
  }
  // ---- phone: the section header stays on once you are past the hero, so you always know where you are ----
  function mhState(){ root.classList.toggle('mh-on',mob&&scrollY>innerHeight*0.42); }
  var sp=0;
  function onScroll(){ if(!reducedSwap()) kick(); if(!sp) sp=requestAnimationFrame(function(){ sp=0; spy(); mhState(); }); }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('ssb:sub',function(){ requestAnimationFrame(spy); });   // a section changed the item it is showing
  function relayout(){ mob=mq.matches; measure(); cur=-1; lastSnap=null; k=-2; lastSub=null; tick(); spy(); mhState(); }
  addEventListener('resize',relayout);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(relayout);
  setTimeout(relayout,400);
  relayout();

  // ---- smooth in-page jumps ----
  function jump(e){ var h=this.getAttribute('href'); if(!h||h.charAt(0)!=='#') return; e.preventDefault();
    closeSheet(true); closeMx(true); closeNm(true);
    var top=h==='#top'?0:(function(){ var t=document.querySelector(h); return t?t.getBoundingClientRect().top+scrollY-(mob?44:0):null; })();
    if(top===null) return; scrollTo({top:top,behavior:rm.matches?'auto':'smooth'}); }
  [].slice.call(document.querySelectorAll('.brand,.ln-slot,.ln a[href^="#"],.mh-mark,.mx-row,.sheet-hooks a,.nm-here a')).forEach(function(a){ a.addEventListener('click',jump); });

  // ---- menu sheet ----
  var sheet=document.getElementById('ssb-sheet'), panel=sheet.querySelector('.sheet-panel'), opener=null;
  [].slice.call(sheet.querySelectorAll('.sh-i')).forEach(function(el,i){ el.style.setProperty('--i',i); });
  function openSheet(btn){ opener=btn; root.classList.add('sheet-open'); sheet.setAttribute('aria-hidden','false');
    document.querySelectorAll('[data-open-sheet]').forEach(function(b){ b.setAttribute('aria-expanded','true'); });
    setTimeout(function(){ var x=sheet.querySelector('.sheet-x'); x&&x.focus({preventScroll:true}); },60); }
  function closeSheet(silent){ if(!root.classList.contains('sheet-open')) return; root.classList.remove('sheet-open'); sheet.setAttribute('aria-hidden','true');
    document.querySelectorAll('[data-open-sheet]').forEach(function(b){ b.setAttribute('aria-expanded','false'); });
    if(opener&&!silent) opener.focus({preventScroll:true}); }
  // desktop and tablet open the site menu panel; phones keep the bottom sheet
  document.querySelectorAll('[data-open-sheet]').forEach(function(b){ b.addEventListener('click',function(){ if(!mob){ openNm(b); return; } root.classList.contains('sheet-open')?closeSheet():openSheet(b); }); });

  // ---- site menu (desktop): the section bar grows into a panel; big page links, the image swaps on hover ----
  var nm=document.getElementById('nm'), nmBox=nm.querySelector('.nm-box'), nmIn=nm.querySelector('.nm-in'), lnMenu=document.querySelector('.ln-menu');
  var nmLinks=[].slice.call(nm.querySelectorAll('.nm-a')), nmIms=[].slice.call(nm.querySelectorAll('.nm-im')), nmOpener=null, nmT=0, nmLoaded=false;
  function nmSet(x,y,w,h,r){ nmBox.style.setProperty('--x',x+'px'); nmBox.style.setProperty('--y',y+'px'); nmBox.style.setProperty('--w',w+'px'); nmBox.style.setProperty('--h',h+'px'); nmBox.style.setProperty('--r',r+'px'); }
  function nmOrigin(btn){ var r=(root.classList.contains('nav-l2')&&ln.offsetWidth)?bar.getBoundingClientRect():(btn||lnMenu).getBoundingClientRect(); return r; }
  function nmTarget(){ var w1=Math.min(1040,innerWidth-48); nmIn.style.setProperty('--w1',w1+'px'); var h1=Math.min(nmIn.offsetHeight,innerHeight-16); nmBox.style.overflowY=nmIn.offsetHeight>innerHeight-16?'auto':'hidden'; return {x:(innerWidth-w1)/2,y:8,w:w1,h:h1}; }
  function nmShow(i){ nmLinks.forEach(function(a,k){ a.classList.toggle('on',k===i); }); nmIms.forEach(function(f,k){ f.classList.toggle('on',k===i); }); }
  function openNm(btn){
    if(root.classList.contains('nm-open')){ closeNm(); return; }
    clearTimeout(nmT); nm.classList.remove('is-closing'); nmOpener=btn||lnMenu;
    if(!nmLoaded){ nmLoaded=true; nm.querySelectorAll('img').forEach(function(im){ im.loading='eager'; }); }
    var o=nmOrigin(btn), t=nmTarget();
    nmBox.classList.add('is-snap'); nmSet(o.left,o.top,o.width,o.height,11); void nmBox.offsetWidth; nmBox.classList.remove('is-snap');
    root.classList.add('nm-open'); nm.setAttribute('aria-hidden','false');
    document.querySelectorAll('[data-open-nm],[data-open-sheet]').forEach(function(b){ b.setAttribute('aria-expanded','true'); });
    nmShow(0);
    requestAnimationFrame(function(){ nmSet(t.x,t.y,t.w,t.h,18); });
    setTimeout(function(){ nmBox.focus({preventScroll:true}); },280);   // keyboard users Tab into the links; no ring on open
  }
  function closeNm(silent){
    if(!root.classList.contains('nm-open')) return;
    var o=nmOrigin(nmOpener); nm.classList.add('is-closing'); root.classList.remove('nm-open'); nm.setAttribute('aria-hidden','true');
    nmBox.style.overflowY='hidden'; nmSet(o.left,o.top,o.width,o.height,11);
    document.querySelectorAll('[data-open-nm],[data-open-sheet]').forEach(function(b){ b.setAttribute('aria-expanded','false'); });
    nmT=setTimeout(function(){ nm.classList.remove('is-closing'); },rm.matches?0:650);
    if(!silent&&nmOpener&&nmOpener.focus) nmOpener.focus({preventScroll:true});
  }
  if(lnMenu) lnMenu.addEventListener('click',function(){ openNm(lnMenu); });
  nm.querySelectorAll('[data-nm-close]').forEach(function(b){ b.addEventListener('click',function(){ closeNm(); }); });
  nm.querySelectorAll('[data-lead]').forEach(function(b){ b.addEventListener('click',function(){ closeNm(true); }); });
  nmLinks.forEach(function(a,i){ a.addEventListener('mouseenter',function(){ nmShow(i); }); a.addEventListener('focus',function(){ nmShow(i); }); });
  addEventListener('resize',function(){ if(!root.classList.contains('nm-open')) return; if(mq.matches){ closeNm(true); return; } var t=nmTarget(); nmSet(t.x,t.y,t.w,t.h,18); });
  sheet.querySelectorAll('[data-close-sheet]').forEach(function(b){ b.addEventListener('click',function(){ closeSheet(); }); });
  // ---- section list (phone): opened from the section header ----
  var mxBtn=mh.querySelector('.mh-where');
  function openMx(){ root.classList.add('mx-open'); mx.setAttribute('aria-hidden','false'); mxBtn.setAttribute('aria-expanded','true');
    setTimeout(function(){ var on=mx.querySelector('.mx-row.on')||mx.querySelector('.mx-x'); on.focus({preventScroll:true}); },80); }
  function closeMx(silent){ if(!root.classList.contains('mx-open')) return; root.classList.remove('mx-open'); mx.setAttribute('aria-hidden','true'); mxBtn.setAttribute('aria-expanded','false');
    mxPanel.style.removeProperty('--drag'); if(!silent) mxBtn.focus({preventScroll:true}); }
  mxBtn.addEventListener('click',openMx);
  mx.querySelectorAll('[data-mx-close]').forEach(function(b){ b.addEventListener('click',function(){ closeMx(); }); });
  mx.querySelectorAll('[data-lead]').forEach(function(b){ b.addEventListener('click',function(){ closeMx(true); }); });
  var my0=0, mdy=0, mdrag=false, mhead=mx.querySelector('.mx-head');
  mhead.addEventListener('touchstart',function(e){ mdrag=true; my0=e.touches[0].clientY; mdy=0; mxPanel.classList.add('is-drag'); },{passive:true});
  mhead.addEventListener('touchmove',function(e){ if(!mdrag) return; mdy=Math.max(0,e.touches[0].clientY-my0); mxPanel.style.setProperty('--drag',mdy+'px'); },{passive:true});
  mhead.addEventListener('touchend',function(){ if(!mdrag) return; mdrag=false; mxPanel.classList.remove('is-drag'); if(mdy>90) closeMx(); else mxPanel.style.removeProperty('--drag'); });
  addEventListener('keydown',function(e){
    if(root.classList.contains('nm-open')){
      if(e.key==='Escape'){ closeNm(); return; }
      if(e.key==='Tab'){ var q=[].slice.call(nmBox.querySelectorAll('a,button')); var q0=q[0], q1=q[q.length-1];
        if(e.shiftKey&&document.activeElement===q0){ e.preventDefault(); q1.focus(); } else if(!e.shiftKey&&document.activeElement===q1){ e.preventDefault(); q0.focus(); } }
      return;
    }
    if(root.classList.contains('mx-open')){
      if(e.key==='Escape'){ closeMx(); return; }
      if(e.key==='Tab'){ var g=[].slice.call(mxPanel.querySelectorAll('a,button')); var g0=g[0], g1=g[g.length-1];
        if(e.shiftKey&&document.activeElement===g0){ e.preventDefault(); g1.focus(); } else if(!e.shiftKey&&document.activeElement===g1){ e.preventDefault(); g0.focus(); } }
      return;
    }
    if(!root.classList.contains('sheet-open')) return;
    if(e.key==='Escape'){ closeSheet(); return; }
    if(e.key==='Tab'){ var f=[].slice.call(panel.querySelectorAll('a,button')); var a=f[0], z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); } }
  });
  window.__nav={state:function(){ var r=fly.getBoundingClientRect(), br=bar.getBoundingClientRect();
    return {y:scrollY,p:cur,l2:root.classList.contains('nav-l2'),dark:root.classList.contains('nav-dark'),mhOn:root.classList.contains('mh-on'),mxOpen:root.classList.contains('mx-open'),
      logo:{x:r.left,y:r.top,w:r.width,h:r.height},bar:{x:br.left,y:br.top,w:br.width,h:br.height},lnOpacity:ln.style.opacity,gnOpacity:gn.style.opacity,active:k}; }};
})();
