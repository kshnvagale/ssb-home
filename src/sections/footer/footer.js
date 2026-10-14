/* Footer: replica of the live V3 footer + draft footnotes */
(function(){
  var sec=document.getElementById('footer'); if(!sec) return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ticking=false;
  function upd(){ticking=false;
    var r=sec.getBoundingClientRect(),vh=window.innerHeight||1;
    var p=(vh-r.top)/Math.max(1,Math.min(r.height,vh)*0.9);
    p=p<0?0:p>1?1:p;
    sec.style.setProperty('--ft-lift',p.toFixed(3));}
  function onS(){if(!ticking){ticking=true;requestAnimationFrame(upd);}}
  window.addEventListener('scroll',onS,{passive:true});
  window.addEventListener('resize',onS);
  upd();
})();
