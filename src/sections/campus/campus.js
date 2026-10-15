/* Campus life: the cohort arrives full-bleed and pulls back into the middle of a mosaic of the campus (the live site's lab moment) */
(function(){
  var root=document.getElementById('campus'); if(!root) return;
  var q=function(s){return root.querySelector(s);};
  var track=q('.cl-track'), stage=q('.cl-stage'), head=q('.cl-head'), slot=q('.cl-slot'), hero=q('.cl-hero'), photo=hero&&hero.querySelector('img');
  var tiles=[].slice.call(root.querySelectorAll('.cl-tile[data-area]')), overlay=q('.cl-social');
  if(!track||!stage||!head||!slot||!hero||!photo) return;
  root.classList.add('cl-js');
  var LIVE=matchMedia('(min-width:1056px) and (min-height:640px) and (prefers-reduced-motion:no-preference)');
  var CLOSE=0.82, SPREAD=1.28;
  // cubic-bezier easing, as the live site's motion tokens
  function bez(x1,y1,x2,y2){ function a(a1,a2){return 1-3*a2+3*a1;} function b(a1,a2){return 3*a2-6*a1;} function c(a1){return 3*a1;}
    function calc(t,a1,a2){return ((a(a1,a2)*t+b(a1,a2))*t+c(a1))*t;} function slope(t,a1,a2){return 3*a(a1,a2)*t*t+2*b(a1,a2)*t+c(a1);}
    return function(x){ if(x<=0) return 0; if(x>=1) return 1; var t=x; for(var i=0;i<8;i++){ var s=slope(t,x1,x2); if(!s) break; t-=(calc(t,x1,x2)-x)/s; } return calc(t,y1,y2); }; }
  var inOut=bez(.4,.14,.3,1), enter=bez(0,0,.3,1);
  var clamp=function(v){return v<0?0:v>1?1:v;};

  /* desktop: the scroll moment, scrubbed with light smoothing */
  var geo={top:0,right:0,bottom:0,left:0,cx:0,cy:0,scale:1,radius:14}, offs=[], cur=0, tgt=0, raf=0, live=false;
  function measure(){
    tiles.forEach(function(t){t.style.transform='';});
    var s=stage.getBoundingClientRect(), r=slot.getBoundingClientRect();
    geo.top=r.top-s.top; geo.left=r.left-s.left; geo.right=s.right-r.right; geo.bottom=s.bottom-r.bottom;
    geo.cx=geo.left+r.width/2; geo.cy=geo.top+r.height/2;
    geo.scale=Math.min(1,Math.max(r.width/2/geo.cx, r.width/2/(s.width-geo.cx), r.height/2/geo.cy, r.height/2/(s.height-geo.cy))*1.02);
    geo.radius=parseFloat(getComputedStyle(tiles[0]).borderTopLeftRadius)||14;
    offs=tiles.map(function(t){ var b=t.getBoundingClientRect(); return {x:b.left-s.left+b.width/2-geo.cx, y:b.top-s.top+b.height/2-geo.cy}; });
  }
  function render(p){
    var closed=inOut(clamp(p/CLOSE)), h=enter(clamp((p-CLOSE*0.5)/(CLOSE*0.4))), out=SPREAD-1;
    hero.style.clipPath='inset('+(geo.top*closed)+'px '+(geo.right*closed)+'px '+(geo.bottom*closed)+'px '+(geo.left*closed)+'px round '+(geo.radius*closed)+'px)';
    photo.style.transformOrigin=geo.cx+'px '+geo.cy+'px'; photo.style.transform='scale('+(1+(geo.scale-1)*closed)+')';
    tiles.forEach(function(t,i){ t.style.transform='translate('+(offs[i].x*out*(1-closed))+'px,'+(offs[i].y*out*(1-closed))+'px) scale('+(1+out*(1-closed))+')'; });
    head.style.opacity=h; head.style.transform='translateY('+((1-h)*12)+'px)';
    if(overlay) overlay.style.opacity=h;
  }
  function progress(){ var r=track.getBoundingClientRect(), span=r.height-stage.offsetHeight; return span>0?clamp(-r.top/span):0; }
  function loop(){ cur+=(tgt-cur)*0.16; if(Math.abs(tgt-cur)<0.0005) cur=tgt; render(cur); raf=cur!==tgt?requestAnimationFrame(loop):0; }
  function onScroll(){ if(!live) return; tgt=progress(); if(!raf) raf=requestAnimationFrame(loop); }
  function on(){ live=true; root.classList.add('cl-live'); measure(); cur=tgt=progress(); render(cur); }
  function off(){ live=false; root.classList.remove('cl-live'); hero.style.clipPath=''; photo.style.transform=''; photo.style.transformOrigin='';
    tiles.forEach(function(t){t.style.transform='';}); head.style.opacity=''; head.style.transform=''; if(overlay) overlay.style.opacity=''; }
  function mode(){ if(LIVE.matches) on(); else off(); }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',function(){ if(live){ measure(); render(cur); } });
  (LIVE.addEventListener?LIVE.addEventListener('change',mode):LIVE.addListener(mode));
  mode();
  addEventListener('load',function(){ if(live){ measure(); render(cur); } });

  /* elsewhere: the head fades up, each tile wipes open bottom to top as it is reached */
  if('IntersectionObserver' in window){
    var batch=0, bt=0;
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(!e.isIntersecting) return; var el=e.target; io.unobserve(el);
        if(el.classList.contains('cl-tile')){ el.style.setProperty('--dl',(batch++*0.09)+'s'); clearTimeout(bt); bt=setTimeout(function(){batch=0;},120); }
        el.classList.add('is-in'); });
    },{rootMargin:'0px 0px -15% 0px'});
    [head,hero].concat(tiles).forEach(function(el){ io.observe(el); });
  } else { [head,hero].concat(tiles).forEach(function(el){ el.classList.add('is-in'); }); }
})();

/* clubs strip: hovering eases the scroll down instead of stopping it */
(function(){
  var row=document.querySelector('.cl-strip-row'); if(!row||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tr=row.querySelector('.cl-strip-track'), raf=0;
  function ease(to){ cancelAnimationFrame(raf); var a=tr.getAnimations?tr.getAnimations()[0]:null; if(!a) return;
    var from=a.playbackRate, t0=performance.now();
    (function step(n){ var p=Math.min(1,(n-t0)/600), e=1-Math.pow(1-p,3); a.playbackRate=from+(to-from)*e; if(p<1) raf=requestAnimationFrame(step); })(t0); }
  row.addEventListener('pointerenter',function(e){ if(e.pointerType==='mouse') ease(0.22); });
  row.addEventListener('pointerleave',function(e){ if(e.pointerType==='mouse') ease(1); });
})();
