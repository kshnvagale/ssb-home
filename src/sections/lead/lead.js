/* Lead modal: opens from every Apply / Brochure / Talk to an advisor link; desktop exit intent; carousel; form checks. No data is sent: this is a design preview. */
(function(){
  var ld=document.getElementById('ld'); if(!ld) return;
  var root=document.documentElement, box=ld.querySelector('.ld-box'), form=ld.querySelector('.ld-form'), done=ld.querySelector('.ld-done');
  var t=ld.querySelector('.ld-t'), sub=ld.querySelector('.ld-sub'), go=ld.querySelector('.ld-go-t');
  var rm=matchMedia('(prefers-reduced-motion: reduce)');
  var COPY={
    apply:{t:'Start your application',s:'Tell us a little about you. An admissions advisor will reach out about next steps.',b:'Continue to application'},
    brochure:{t:'Get the brochure',s:'The full curriculum, fees and Cohort 1 outcomes, sent to your email.',b:'Send me the brochure'},
    callback:{t:'Talk to an advisor',s:'Leave your number and an admissions advisor will call you back.',b:'Request a callback'},
    exit:{t:'Before you go',s:'Take the brochure with you: the curriculum, fees and Cohort 1 outcomes.',b:'Send me the brochure'}
  };
  var opener=null, shown=false;

  // which kind of lead a link asks for
  function kindOf(a){
    if(a.dataset.lead) return a.dataset.lead;
    var h=a.getAttribute('href')||'';
    if(/school-of-business\/admission/.test(h)) return 'apply';
    if(/#brochure$/.test(h)) return 'brochure';
    if(h==='#advisor') return 'callback';
    return null;
  }
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button>0) return;
    var a=e.target.closest('a[href],button[data-lead]'); if(!a||ld.contains(a)&&!a.dataset.lead) return;
    if(a.hasAttribute('data-no-lead')) return;   // page links (menus) go to the page itself
    if(a.closest('.ld-done')) return;
    var k=kindOf(a); if(!k) return;
    e.preventDefault(); open(k,a);
  });

  function open(kind,btn){
    var c=COPY[kind]||COPY.apply;
    ld.dataset.v=kind; t.textContent=c.t; sub.textContent=c.s; go.textContent=c.b;
    form.hidden=false; done.hidden=true;
    [].slice.call(form.querySelectorAll('.ld-f')).forEach(function(f){ f.classList.remove('is-bad'); });
    opener=btn||document.activeElement; shown=true;
    ld.classList.add('is-open'); ld.setAttribute('aria-hidden','false'); root.classList.add('ld-lock');
    car(0); play();
    setTimeout(function(){
      // phones: do not pop the keyboard; desktop: start typing straight away
      if(innerWidth>760) form.querySelector('input').focus({preventScroll:true}); else ld.querySelector('.ld-x').focus({preventScroll:true});
    },80);
  }
  function close(){
    if(!ld.classList.contains('is-open')) return;
    ld.classList.remove('is-open'); ld.setAttribute('aria-hidden','true'); box.style.removeProperty('--drag'); stop();
    root.classList.remove('ld-lock');
    if(opener&&opener.focus&&document.contains(opener)) opener.focus({preventScroll:true});
  }
  ld.querySelectorAll('[data-ld-close]').forEach(function(b){ b.addEventListener('click',close); });
  addEventListener('keydown',function(e){
    if(!ld.classList.contains('is-open')) return;
    if(e.key==='Escape'){ close(); return; }
    if(e.key==='Tab'){ var f=[].slice.call(box.querySelectorAll('a[href],button,input,select')).filter(function(x){ return x.offsetParent!==null; });
      var a=f[0], z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); } }
  });

  // ---- carousel: 5s a slide, the bar fills while it is on, a bar jumps to its slide ----
  var slides=[].slice.call(ld.querySelectorAll('.ld-sl')), bars=[].slice.call(ld.querySelectorAll('.ld-bars button')), si=0, t0=0, raf=0, DUR=5000;
  function car(i){ si=(i+slides.length)%slides.length; t0=performance.now();
    slides.forEach(function(s,k){ s.classList.toggle('is-on',k===si); });
    bars.forEach(function(b,k){ b.querySelector('i').style.setProperty('--f',k<si?1:0); b.setAttribute('aria-current',k===si?'true':'false'); }); }
  function frame(now){ var p=Math.min(1,(now-t0)/DUR); var b=bars[si]; if(b) b.querySelector('i').style.setProperty('--f',p.toFixed(3));
    if(p>=1) car(si+1); raf=requestAnimationFrame(frame); }
  function play(){ stop(); if(rm.matches){ bars[si].querySelector('i').style.setProperty('--f',1); return; } raf=requestAnimationFrame(frame); }
  function stop(){ cancelAnimationFrame(raf); raf=0; }
  bars.forEach(function(b,k){ b.addEventListener('click',function(){ car(k); play(); }); });

  // ---- form checks ----
  var rules={name:function(v){ return v.trim().length>1; },phone:function(v){ return /^[6-9]\d{9}$/.test(v.replace(/\D/g,'')); },email:function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },exp:function(v){ return !!v; }};
  form.querySelector('[name="phone"]').addEventListener('input',function(){ this.value=this.value.replace(/\D/g,'').slice(0,10); });
  form.addEventListener('input',function(e){ var f=e.target.closest('.ld-f'); if(f&&f.classList.contains('is-bad')&&rules[e.target.name](e.target.value)) f.classList.remove('is-bad'); });
  form.addEventListener('submit',function(e){
    e.preventDefault(); var first=null;
    Object.keys(rules).forEach(function(n){ var el=form.elements[n], ok=rules[n](el.value); el.closest('.ld-f').classList.toggle('is-bad',!ok); if(!ok&&!first) first=el; });
    if(first){ first.focus(); return; }
    // design preview: nothing is sent anywhere
    try{ localStorage.setItem('ssb-lead','1'); }catch(_){}
    done.querySelector('.ld-done-t span').textContent=form.elements.name.value.trim().split(/\s+/)[0];
    form.hidden=true; done.hidden=false; done.querySelector('.ld-done-k').focus&&done.querySelector('.ld-done-k').setAttribute('tabindex','-1'); done.querySelector('.ld-done-k').focus();
  });

  // ---- phone: swipe the photo strip down to close ----
  var strip=ld.querySelector('.ld-car'), y0=0, dy=0, drag=false;
  strip.addEventListener('touchstart',function(e){ if(innerWidth>760) return; drag=true; y0=e.touches[0].clientY; dy=0; box.classList.add('is-drag'); },{passive:true});
  strip.addEventListener('touchmove',function(e){ if(!drag) return; dy=Math.max(0,e.touches[0].clientY-y0); box.style.setProperty('--drag',dy+'px'); },{passive:true});
  strip.addEventListener('touchend',function(){ if(!drag) return; drag=false; box.classList.remove('is-drag'); if(dy>100) close(); else box.style.removeProperty('--drag'); });

  // ---- exit intent (desktop only): once a session, after 20s, never after a lead, never over another overlay ----
  var fine=matchMedia('(hover:hover) and (pointer:fine)'), born=Date.now();
  document.addEventListener('mouseout',function(e){
    if(e.relatedTarget||e.clientY>4||!fine.matches||innerWidth<=760) return;
    if(Date.now()-born<20000||shown) return;
    try{ if(sessionStorage.getItem('ssb-exit')||localStorage.getItem('ssb-lead')) return; sessionStorage.setItem('ssb-exit','1'); }catch(_){}
    if(root.classList.contains('pl-lock')||root.classList.contains('sheet-open')||root.classList.contains('mx-open')) return;
    open('exit',null);
  });
  window.__lead={open:open,close:close};
})();
