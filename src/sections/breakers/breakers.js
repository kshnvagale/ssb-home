/* Breakers: videos load and play only while on screen; the voices breaker crossfades every 9s, controls at the bottom */
(function(){
  var secs=[].slice.call(document.querySelectorAll('.bk-sec')); if(!secs.length) return;
  var rm=matchMedia('(prefers-reduced-motion: reduce)');
  function play(v){ if(rm.matches) return; if(!v.getAttribute('src')) v.src=v.dataset.src; var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
  function stop(v){ if(!v.paused) v.pause(); }
  secs.forEach(function(sec){
    var slides=[].slice.call(sec.querySelectorAll('.bk-slide')), bars=[].slice.call(sec.querySelectorAll('.bk-bars button')), cur=0, seen=false, t0=0, raf=0, DUR=9000;
    function vidOf(i){ return slides[i]&&slides[i].querySelector('video'); }
    function show(i){ i=(i+slides.length)%slides.length;
      slides.forEach(function(s,k){ s.classList.toggle('is-on',k===i); if(slides.length>1) s.setAttribute('aria-hidden',k===i?'false':'true'); var v=vidOf(k); if(v&&k!==i) stop(v); });
      cur=i; t0=performance.now(); bars.forEach(function(b,k){ b.querySelector('i').style.setProperty('--f',k<i?1:0); b.setAttribute('aria-current',k===i?'true':'false'); });
      if(seen) play(vidOf(i)); }
    function loop(now){ if(!seen||slides.length<2||rm.matches){ raf=0; return; } var p=Math.min(1,(now-t0)/DUR); var b=bars[cur]; if(b) b.querySelector('i').style.setProperty('--f',p.toFixed(3));
      if(p>=1) show(cur+1); raf=requestAnimationFrame(loop); }
    bars.forEach(function(b,k){ b.addEventListener('click',function(){ show(k); }); });
    [].slice.call(sec.querySelectorAll('[data-step]')).forEach(function(b){ b.addEventListener('click',function(){ show(cur+ +b.dataset.step); }); });
    var sx=0; sec.addEventListener('touchstart',function(e){ sx=e.touches[0].clientX; },{passive:true});
    sec.addEventListener('touchend',function(e){ var dx=e.changedTouches[0].clientX-sx; if(slides.length>1&&Math.abs(dx)>50) show(cur+(dx<0?1:-1)); },{passive:true});
    new IntersectionObserver(function(es){ es.forEach(function(en){
      seen=en.isIntersecting;
      if(seen){ play(vidOf(cur)); t0=performance.now()-(t0?0:0); if(!raf) raf=requestAnimationFrame(loop); }
      else { slides.forEach(function(s,k){ var v=vidOf(k); if(v) stop(v); }); }
    }); },{rootMargin:'0px 0px -10% 0px',threshold:0.15}).observe(sec);
    show(0);
  });
})();
