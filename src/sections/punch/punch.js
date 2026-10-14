/* Punch line: the spine of the page in one line; the two halves close in on a photo that changes as you scroll (MONOLOG style) */
(function(){
  var sec=document.getElementById('punch'); if(!sec) return;
  var track=sec.querySelector('.pn-track'), stage=sec.querySelector('.pn-stage'), ph=sec.querySelector('.pn-ph');
  var imgs=[].slice.call(ph.querySelectorAll('img'));
  var rm=matchMedia('(prefers-reduced-motion: reduce)'), mob=matchMedia('(max-width:760px)');
  var cl=function(v){return v<0?0:v>1?1:v;}, ease=function(t){return 1-Math.pow(1-t,3);};
  var cur=0,tgt=0,raf=0,shown=0;
  function render(p){
    var vw=innerWidth, vh=innerHeight, m=mob.matches;
    var close=ease(cl(p/0.72));
    // photo grows a little; the halves start far apart and end just over its edges
    var pw=m?vw*(0.34+0.12*close):Math.min(vw*(0.11+0.05*close),vh*0.46*0.8);
    var ph_h=pw*1.25;
    var g0=m?vh*0.5:vw*0.44, g1=m?ph_h*0.62:pw*0.62;
    sec.style.setProperty('--pw',pw+'px');
    sec.style.setProperty('--g',(g0+(g1-g0)*close)+'px');
    sec.style.setProperty('--ps',(1.12-0.12*close).toFixed(3));
    sec.style.setProperty('--np',cl((p-0.74)/0.14).toFixed(3));
    var i=Math.min(imgs.length-1,Math.floor(cl(p/0.86)*imgs.length));
    if(i!==shown){ imgs[shown].classList.remove('is-on'); imgs[i].classList.add('is-on'); shown=i; }
  }
  function prog(){ var r=track.getBoundingClientRect(), span=r.height-stage.offsetHeight; return span>0?cl(-r.top/span):0; }
  function loop(){ cur+=(tgt-cur)*0.18; if(Math.abs(tgt-cur)<0.0005) cur=tgt; render(cur); raf=cur!==tgt?requestAnimationFrame(loop):0; }
  function onScroll(){ if(rm.matches) return; tgt=prog(); if(!raf) raf=requestAnimationFrame(loop); }
  if(rm.matches){ render(1); return; }
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',function(){ render(cur); });
  cur=tgt=prog(); render(cur);
})();
