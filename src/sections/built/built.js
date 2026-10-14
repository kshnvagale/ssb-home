/* Built at SSB: full-bleed company showcase, tabs inside the image, hotspots */
(function(){
  var sec=document.getElementById('built'); if(!sec) return;
  var stage=sec.querySelector('.bs-stage'), track=sec.querySelector('.bs-track'), bar=sec.querySelector('.bs-bar');
  var slides=[].slice.call(sec.querySelectorAll('.bs-slide'));
  var fds=[].slice.call(sec.querySelectorAll('.bs-fd'));
  var tabs=[].slice.call(sec.querySelectorAll('.bs-tab'));
  var list=sec.querySelector('.bs-tabs'), ind=sec.querySelector('.bs-ind'), fill=sec.querySelector('.bs-fill');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR=6.5, idx=0, auto=!reduce, inView=false, hover=false, openHs=null, closeT=0;
  stage.style.setProperty('--bs-dur',DUR+'s');

  /* close button for the docked (narrow) card */
  sec.querySelectorAll('.bs-card').forEach(function(c){
    var x=document.createElement('button'); x.className='bs-card-x'; x.setAttribute('aria-label','Close');
    x.innerHTML='<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    x.addEventListener('click',function(e){ e.stopPropagation(); closeCard(true); }); c.appendChild(x);
  });

  /* indicator: measured pill behind the active tab (Thanks: left = active/count, width = 1/count) */
  function placeInd(){ var t=tabs[idx]; ind.style.width=t.offsetWidth+'px'; ind.style.transform='translateX('+t.offsetLeft+'px)'; }
  function centerTab(smooth){ var t=tabs[idx]; if(list.scrollWidth<=list.clientWidth+1) return;
    list.scrollTo({left:t.offsetLeft-(list.clientWidth-t.offsetWidth)/2,behavior:(smooth&&!reduce)?'smooth':'auto'}); }

  /* hotspots: image-space coords mapped through object-fit:cover */
  function layout(){
    var w=stage.clientWidth,h=stage.clientHeight,narrow=w<640;
    stage.classList.toggle('is-narrow',narrow);
    bar.classList.toggle('is-scroll',list.scrollWidth>list.clientWidth+1);
    slides.forEach(function(s){
      var iw=+s.dataset.iw,ih=+s.dataset.ih,fx=+s.dataset.fx,fy=+s.dataset.fy;
      s.querySelector('.bs-img').style.objectPosition=(fx*100)+'% '+(fy*100)+'%';
      var k=Math.max(w/iw,h/ih),dw=iw*k,dh=ih*k,ox=(w-dw)*fx,oy=(h-dh)*fy;
      var top=s.querySelector('.bs-top').offsetHeight+18, bottom=narrow?84:92;
      s.querySelectorAll('.bs-hs').forEach(function(b){
        var x=+(narrow&&b.dataset.mx||b.dataset.x),y=+(narrow&&b.dataset.my||b.dataset.y);
        var px=Math.min(Math.max(ox+x*dw,32),w-32), py=Math.min(Math.max(oy+y*dh,top),h-bottom);
        b.style.left=px+'px'; b.style.top=py+'px'; b._p=[px,py];
      });
    });
    placeInd(); centerTab(false); if(openHs) positionCard(openHs);
    track.style.transform='translate3d('+(-idx*w)+'px,0,0)';
  }
  function cardOf(b){ return document.getElementById(b.getAttribute('aria-controls')); }
  function positionCard(b){
    var c=cardOf(b); if(stage.classList.contains('is-narrow')) return;
    var w=stage.clientWidth,h=stage.clientHeight,px=b._p[0],py=b._p[1],cw=c.offsetWidth,ch=c.offsetHeight,g=26;
    /* open away from the image centre (the subject), else whichever side has room */
    var fitsR=px+g+cw<=w-20, fitsL=px-g-cw>=20, right;
    if(px<w/2&&fitsL) right=false; else if(px>=w/2&&fitsR) right=true; else right=fitsR;
    var left=right?px+g:px-g-cw, top=Math.min(Math.max(py-30,20),h-92-ch);
    c.style.left=left+'px'; c.style.top=top+'px';
    c.style.setProperty('--ox',right?'0px':cw+'px'); c.style.setProperty('--oy',(py-top)+'px');
  }
  function openCard(b){ if(openHs===b) return; closeCard(false); openHs=b;
    b.setAttribute('aria-expanded','true'); positionCard(b); cardOf(b).classList.add('is-open'); syncPause(); }
  function closeCard(refocus){ if(!openHs) return; var b=openHs; openHs=null;
    b.setAttribute('aria-expanded','false'); cardOf(b).classList.remove('is-open');
    if(refocus) b.focus({preventScroll:true}); syncPause(); }

  /* slide change (Thanks: goToSlide tweens the track to snapPoints[i] over .8s) + founder swap */
  function go(i,opts){
    opts=opts||{}; i=(i+slides.length)%slides.length; closeCard(false); idx=i;
    track.style.transform='translate3d('+(-i*stage.clientWidth)+'px,0,0)';
    slides.forEach(function(s,n){ var on=n===i; s.classList.toggle('is-active',on); s.setAttribute('aria-hidden',on?'false':'true'); if(on) s.removeAttribute('inert'); else s.setAttribute('inert',''); });
    fds.forEach(function(f,n){ var on=n===i; f.classList.toggle('is-on',on); f.setAttribute('aria-hidden',on?'false':'true'); if(on) f.removeAttribute('inert'); else f.setAttribute('inert',''); });
    tabs.forEach(function(t,n){ var on=n===i; t.setAttribute('aria-selected',on?'true':'false'); t.tabIndex=on?0:-1; });
    placeInd(); centerTab(true); restartFill();
    if(opts.focus) tabs[i].focus({preventScroll:true});
  }
  /* autoplay: progress fill inside the indicator, then advance (Thanks: scaleX 0->1, stops on interaction) */
  function restartFill(){ fill.style.animation='none'; void fill.offsetWidth; fill.style.animation=''; }
  function stopAuto(){ if(!auto) return; auto=false; stage.classList.remove('is-auto'); }
  function syncPause(){ stage.classList.toggle('is-paused',!inView||hover||!!openHs||sec.contains(document.activeElement)&&document.activeElement!==document.body); }
  fill.addEventListener('animationend',function(){ if(auto) go(idx+1); });

  tabs.forEach(function(t,n){
    t.addEventListener('click',function(){ stopAuto(); go(n); });
    t.addEventListener('keydown',function(e){
      var m={ArrowRight:idx+1,ArrowLeft:idx-1,Home:0,End:slides.length-1};
      if(e.key in m){ e.preventDefault(); stopAuto(); go(m[e.key],{focus:true}); }
    });
  });

  /* hotspots: hover previews (fine pointer), click/tap pins, Escape closes */
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  sec.querySelectorAll('.bs-hs').forEach(function(b){
    var c=cardOf(b);
    b.addEventListener('click',function(e){ e.stopPropagation(); if(openHs===b&&!fine) closeCard(false); else openCard(b); });
    if(fine){
      var later=function(){ closeT=setTimeout(function(){ if(openHs===b) closeCard(false); },220); };
      b.addEventListener('mouseenter',function(){ clearTimeout(closeT); openCard(b); });
      c.addEventListener('mouseenter',function(){ clearTimeout(closeT); });
      b.addEventListener('mouseleave',later); c.addEventListener('mouseleave',later);
    }
    c.addEventListener('click',function(e){ e.stopPropagation(); });
  });
  stage.addEventListener('click',function(){ closeCard(false); });
  sec.addEventListener('keydown',function(e){ if(e.key==='Escape') closeCard(true); });
  [stage,sec.querySelector('.bs-fds')].filter(Boolean).forEach(function(el){
    el.addEventListener('mouseenter',function(){ hover=true; syncPause(); });
    el.addEventListener('mouseleave',function(){ hover=false; syncPause(); });
  });
  sec.addEventListener('focusin',syncPause); sec.addEventListener('focusout',function(){ setTimeout(syncPause,0); });

  /* swipe / drag the image (Thanks: Draggable x with snap) */
  var sx=0,sy=0,dx=0,drag=false,armed=false,t0=0;
  stage.addEventListener('pointerdown',function(e){
    if(e.button!==0||e.target.closest('.bs-bar,.bs-card,.bs-hs')) return;
    armed=true; drag=false; sx=e.clientX; sy=e.clientY; dx=0; t0=Date.now();
  });
  stage.addEventListener('pointermove',function(e){
    if(!armed) return; var mx=e.clientX-sx,my=e.clientY-sy;
    if(!drag){ if(Math.abs(mx)>8&&Math.abs(mx)>Math.abs(my)*1.2){ drag=true; stage.classList.add('is-drag'); closeCard(false); try{stage.setPointerCapture(e.pointerId);}catch(_){} } else if(Math.abs(my)>10){ armed=false; } return; }
    dx=mx; var w=stage.clientWidth,edge=(idx===0&&dx>0)||(idx===slides.length-1&&dx<0);
    track.style.transform='translate3d('+(-idx*w+(edge?dx*.3:dx))+'px,0,0)';
  });
  function end(){
    if(!armed) return; armed=false; if(!drag) return; drag=false; stage.classList.remove('is-drag');
    var v=Math.abs(dx)/Math.max(Date.now()-t0,1), th=Math.min(stage.clientWidth*.18,120);
    if((dx<-th||(dx<-30&&v>.5))&&idx<slides.length-1){ stopAuto(); go(idx+1); }
    else if((dx>th||(dx>30&&v>.5))&&idx>0){ stopAuto(); go(idx-1); }
    else go(idx);
    var k=function(e){ e.stopPropagation(); }; stage.addEventListener('click',k,true);
    setTimeout(function(){ stage.removeEventListener('click',k,true); },80);
  }
  stage.addEventListener('pointerup',end); stage.addEventListener('pointercancel',end);

  /* play only while on screen; warm all slide images once the section is near */
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ inView=es[0].isIntersecting; syncPause(); },{threshold:.45}).observe(stage);
    var warm=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ sec.querySelectorAll('.bs-img').forEach(function(im){ im.loading='eager'; }); warm.disconnect(); } },{rootMargin:'800px 0px'});
    warm.observe(sec);
  } else { inView=true; }

  if(auto) stage.classList.add('is-auto');
  window.addEventListener('resize',layout);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(layout);
  go(0); layout(); syncPause();
})();
