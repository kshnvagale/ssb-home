/* Outcomes: the cards are not links, so hovering a row only slows its marquee (it never pauses or lifts a card) */
(function(){
  var sec=document.querySelector('.alumni-sec'); if(!sec) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [].slice.call(sec.querySelectorAll('.al-row')).forEach(function(row){
    var track=row.querySelector('.al-track'); if(!track||!track.getAnimations) return;
    var raf=0;
    function ease(to){
      cancelAnimationFrame(raf);
      var an=track.getAnimations(); if(!an.length) return;
      var from=an[0].playbackRate, t0=performance.now(), D=600;
      (function step(now){ var p=Math.min(1,(now-t0)/D), e=1-Math.pow(1-p,3), r=from+(to-from)*e;
        an.forEach(function(a){ a.playbackRate=r; }); if(p<1) raf=requestAnimationFrame(step); })(t0);
    }
    row.addEventListener('pointerenter',function(e){ if(e.pointerType==='mouse') ease(0.22); });
    row.addEventListener('pointerleave',function(e){ if(e.pointerType==='mouse') ease(1); });
  });
})();
