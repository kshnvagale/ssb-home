/* Navigation: global nav (layer 1), flying logo, section bar (layer 2), mobile tab bar, menu sheet */
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
  // ===== NAV v3: layer switch, flying logo, scrollspy, tab bar, menu sheet =====
  var root=document.documentElement, gn=document.querySelector('.gn'), fly=document.querySelector('.brand-fly');
  if(!gn||!fly) return;
  var slot=gn.querySelector('.gn-slot'), ln=document.querySelector('.ln'), bar=ln.querySelector('.ln-bar'), lslot=bar.querySelector('.ln-slot');
  var hooks=[].slice.call(ln.querySelectorAll('.ln-hooks a')), lind=ln.querySelector('.ln-ind');
  var tb=document.querySelector('.tb'), tabs=[].slice.call(tb.querySelectorAll('a[data-t]')), tind=tb.querySelector('.tb-ind');
  var mq=matchMedia('(max-width:760px)'), rm=matchMedia('(prefers-reduced-motion: reduce)');
  var ids=['#film','#outcomes','#programme','#built','#faculty','#campus','#admissions','#faq'], secs=ids.map(function(s){ return document.querySelector(s); });
  var tabOf=[0,1,2,2,3,3,-1,-1];               // ventures under Programme; faculty and campus under People; fees and FAQ live in More
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

  // ---- scrollspy for both the bar and the tab bar ----
  var k=-2;
  function spy(){
    var n=0; secs.forEach(function(s,i){ if(s&&s.getBoundingClientRect().top<=innerHeight*0.35) n=i; });
    var changed=n!==k; k=n;
    if(changed){ hooks.forEach(function(a,i){ a.classList.toggle('on',i===n); }); tabs.forEach(function(a,i){ a.classList.toggle('on',i===tabOf[n]); }); }
    var h=hooks[n]; if(h&&h.offsetWidth){ lind.style.opacity=1; lind.style.width=h.offsetWidth+'px'; lind.style.transform='translateX('+h.offsetLeft+'px)'; }
    var t=tabs[tabOf[n]]; if(!t) tind.style.opacity=0; if(t&&t.offsetWidth){ tind.style.opacity=1; tind.style.width=t.offsetWidth+'px'; tind.style.transform='translateX('+t.offsetLeft+'px)'; }
  }
  // ---- tab bar theme follows the section under the bottom edge ----
  function tbTheme(){
    if(!mob) return; var yb=innerHeight-40, dark=false;
    if(film){ var fr=film.getBoundingClientRect(), b=parseFloat(film.style.getPropertyValue('--bgp')||0); if(fr.top<yb&&fr.bottom>yb&&b>0.5) dark=true; }
    document.querySelectorAll('[data-nav]').forEach(function(s){ var r=s.getBoundingClientRect(); if(r.top<=yb&&r.bottom>yb) dark=s.dataset.nav==='dark'; });
    root.classList.toggle('tb-dark',dark);
  }
  // ---- tab bar: in after the first fold, out on a fast flick down, back on any scroll up ----
  var lastY=scrollY, lastT=performance.now(), acc=0;
  var jumping=false, jt=0;   // programmatic jumps (tab taps, anchors) never hide the bar
  function tbState(){
    var y=scrollY, now=performance.now(), d=y-lastY, v=d/Math.max(16,now-lastT); lastY=y; lastT=now;
    root.classList.toggle('tb-on',mob&&y>innerHeight*0.42);
    if(!mob) return;
    acc=(d>0)===(acc>0)?acc+d:d;
    var nearEnd=y+innerHeight>=document.documentElement.scrollHeight-80;
    if(d>0&&v>1.1&&acc>140&&d<innerHeight*0.6&&!nearEnd&&!jumping) root.classList.add('tb-hide');
    if(acc<-28||nearEnd||y<innerHeight*0.42) root.classList.remove('tb-hide');
  }
  var sp=0;
  function onScroll(){ if(!reducedSwap()) kick(); if(!sp) sp=requestAnimationFrame(function(){ sp=0; spy(); tbTheme(); tbState(); }); }
  addEventListener('scroll',onScroll,{passive:true});
  function relayout(){ mob=mq.matches; measure(); cur=-1; lastSnap=null; k=-2; tick(); spy(); tbTheme(); tbState(); }
  addEventListener('resize',relayout);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(relayout);
  setTimeout(relayout,400);
  relayout();

  // ---- smooth in-page jumps ----
  function jump(e){ var h=this.getAttribute('href'); if(!h||h.charAt(0)!=='#') return; e.preventDefault();
    closeSheet(true);
    jumping=true; clearTimeout(jt); jt=setTimeout(function(){ jumping=false; },1400); root.classList.remove('tb-hide');
    var top=h==='#top'?0:(function(){ var t=document.querySelector(h); return t?t.getBoundingClientRect().top+scrollY:null; })();
    if(top===null) return; scrollTo({top:top,behavior:rm.matches?'auto':'smooth'}); }
  [].slice.call(document.querySelectorAll('.brand,.ln-slot,.ln a[href^="#"],.tb a[href^="#"],.sheet-hooks a')).forEach(function(a){ a.addEventListener('click',jump); });

  // ---- menu sheet ----
  var sheet=document.getElementById('ssb-sheet'), panel=sheet.querySelector('.sheet-panel'), opener=null;
  [].slice.call(sheet.querySelectorAll('.sh-i')).forEach(function(el,i){ el.style.setProperty('--i',i); });
  function openSheet(btn){ opener=btn; root.classList.add('sheet-open'); sheet.setAttribute('aria-hidden','false');
    document.querySelectorAll('[data-open-sheet]').forEach(function(b){ b.setAttribute('aria-expanded','true'); });
    setTimeout(function(){ var x=sheet.querySelector('.sheet-x'); x&&x.focus({preventScroll:true}); },60); }
  function closeSheet(silent){ if(!root.classList.contains('sheet-open')) return; root.classList.remove('sheet-open'); sheet.setAttribute('aria-hidden','true');
    document.querySelectorAll('[data-open-sheet]').forEach(function(b){ b.setAttribute('aria-expanded','false'); });
    if(opener&&!silent) opener.focus({preventScroll:true}); }
  document.querySelectorAll('[data-open-sheet]').forEach(function(b){ b.addEventListener('click',function(){ root.classList.contains('sheet-open')?closeSheet():openSheet(b); }); });
  sheet.querySelectorAll('[data-close-sheet]').forEach(function(b){ b.addEventListener('click',function(){ closeSheet(); }); });
  addEventListener('keydown',function(e){
    if(!root.classList.contains('sheet-open')) return;
    if(e.key==='Escape'){ closeSheet(); return; }
    if(e.key==='Tab'){ var f=[].slice.call(panel.querySelectorAll('a,button')); var a=f[0], z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); } }
  });
  window.__nav={state:function(){ var r=fly.getBoundingClientRect(), br=bar.getBoundingClientRect();
    return {y:scrollY,p:cur,l2:root.classList.contains('nav-l2'),dark:root.classList.contains('nav-dark'),tbOn:root.classList.contains('tb-on'),tbHide:root.classList.contains('tb-hide'),tbDark:root.classList.contains('tb-dark'),
      logo:{x:r.left,y:r.top,w:r.width,h:r.height},bar:{x:br.left,y:br.top,w:br.width,h:br.height},lnOpacity:ln.style.opacity,gnOpacity:gn.style.opacity,active:k}; }};
})();
