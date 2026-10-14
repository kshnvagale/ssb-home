/* Hero: headline, CTAs, facts row, logo marquee, stat tiles, film card, warp lines */
(function(){
  // film card in the hero strip: load the source once the page is up, but keep it on its poster
  // until the visitor starts scrolling, so the first fold has fewer things moving at once
  var vids=[].slice.call(document.querySelectorAll('.hero video[data-src]'));
  vids.forEach(function(el){ el.src=el.dataset.src; el.preload='auto'; });
  var started=false;
  function go(){ if(started||window.scrollY<8) return; started=true; window.__heroPlay=true;
    vids.forEach(function(el){ el.play().catch(function(){}); });
    removeEventListener('scroll',go); }
  addEventListener('scroll',go,{passive:true}); go();
})();
(function(){
  var c=document.querySelector('.warp'); if(!c) return;
  var hero=c.closest('.hero'), row=document.querySelector('.logos-row'), ctx=c.getContext('2d');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W=0,H=0,dpr=1,O,rays=[],streaks=[],col='107,238,159',running=true,last=0;
  function rgb(){ var m=getComputedStyle(c).color.match(/\d+/g); if(m) col=m.slice(0,3).join(','); }
  function size(){
    var h=row.getBoundingClientRect().top-hero.getBoundingClientRect().top+10;
    hero.style.setProperty('--warp-h',h+'px'); hero.style.setProperty('--warp-h-sm',(h*0.62)+'px');
    var r=c.getBoundingClientRect(); dpr=Math.min(2,window.devicePixelRatio||1);
    W=r.width; H=r.height; c.width=W*dpr; c.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    O={x:W*0.02,y:H*1.08}; rgb(); build();
  }
  function build(){
    rays=[]; var n=34;
    for(var i=0;i<n;i++){ var a=(-6-(i/(n-1))*74+ (Math.random()-.5)*3)*Math.PI/180; rays.push({a:a,cos:Math.cos(a),sin:Math.sin(a),len:Math.hypot(W,H)*1.15}); }
    streaks=[]; for(var j=0;j<46;j++) streaks.push(spawn(true));
  }
  function spawn(any){ var r=rays[(Math.random()*rays.length)|0]; return {r:r,d:any?Math.random()*r.len:Math.random()*r.len*0.25,v:420+Math.random()*900,w:Math.random()<.25?1.4:0.9,a:.35+Math.random()*.5}; }
  function frame(t){
    if(!running) return;
    var dt=Math.min(0.05,(t-(last||t))/1000); last=t;
    ctx.clearRect(0,0,W,H);
    // faint guide rays
    ctx.lineWidth=0.6; ctx.strokeStyle='rgba('+col+',0.07)';
    ctx.beginPath(); rays.forEach(function(r){ ctx.moveTo(O.x,O.y); ctx.lineTo(O.x+r.cos*r.len,O.y+r.sin*r.len); }); ctx.stroke();
    if(!reduce){
      streaks.forEach(function(s,i){
        s.d+=s.v*dt*(0.45+s.d/s.r.len*1.6);            // accelerate as it travels: warp feel
        var L=30+s.d*0.22, x1=O.x+s.r.cos*s.d, y1=O.y+s.r.sin*s.d, x0=O.x+s.r.cos*(s.d-L), y0=O.y+s.r.sin*(s.d-L);
        var fade=Math.min(1,s.d/(s.r.len*0.25));
        var g=ctx.createLinearGradient(x0,y0,x1,y1); g.addColorStop(0,'rgba('+col+',0)'); g.addColorStop(1,'rgba('+col+','+(s.a*fade)+')');
        ctx.strokeStyle=g; ctx.lineWidth=s.w; ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
        if(s.d-L>s.r.len) streaks[i]=spawn(false);
      });
    }
    requestAnimationFrame(frame);
  }
  size(); addEventListener('resize',function(){ size(); });
  if(document.fonts) document.fonts.ready.then(size);
  new IntersectionObserver(function(e){ var vis=e[0].isIntersecting; if(vis&&!running){running=true;last=0;requestAnimationFrame(frame);} else if(!vis) running=false; }).observe(hero);
  document.addEventListener('visibilitychange',function(){ if(document.hidden) running=false; else if(!running){running=true;last=0;requestAnimationFrame(frame);} });
  requestAnimationFrame(frame);
})();
