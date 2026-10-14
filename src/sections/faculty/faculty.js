/* Faculty and mentors: name list with brand monograms, sticky portrait, topic filter */
(function(){
  var sec=document.getElementById('faculty'); if(!sec) return;
  var list=sec.querySelector('.fx-list');
  var rows=[].slice.call(sec.querySelectorAll('.fx-row'));
  var figs=[].slice.call(sec.querySelectorAll('.fx-fig'));
  var caps=[].slice.call(sec.querySelectorAll('.fx-cap'));
  var chips=[].slice.call(sec.querySelectorAll('.fx-chip'));
  var lis=[].slice.call(sec.querySelectorAll('.fx-li,.fx-group'));
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)');
  var still=window.matchMedia('(prefers-reduced-motion:reduce)');
  var cur=-1, tapY=null, ticking=false;
  sec.classList.add('fx-js');
  lis.forEach(function(li,k){li.style.setProperty('--k',k);});

  function sel(i){
    if(i===cur) return; cur=i;
    rows.forEach(function(r){var on=+r.dataset.i===i; r.classList.toggle('is-on',on); r.setAttribute('aria-current',on?'true':'false');});
    figs.forEach(function(f){f.classList.toggle('is-on',+f.dataset.i===i);});
    caps.forEach(function(c){c.classList.toggle('is-on',+c.dataset.i===i);});
  }
  function visible(){return rows.filter(function(r){return !r.parentNode.hidden;});}

  /* desktop: mouseenter selects, no reset on leave (as in the reference) */
  rows.forEach(function(r){
    var i=+r.dataset.i;
    r.addEventListener('mouseenter',function(){ if(fine.matches) sel(i); });
    r.addEventListener('focus',function(){ sel(i); });
    r.addEventListener('click',function(){ sel(i); tapY=window.scrollY; });
  });

  /* scrolling: the selection follows the scroll on every frame. Browsers hold back hover events while a page
     scrolls under a still pointer, so on desktop we read the row under the last pointer position ourselves;
     with no pointer over the list (or on touch), the row crossing 55% of the viewport becomes active. */
  var px=-1, py=-1;
  window.addEventListener('mousemove',function(e){ px=e.clientX; py=e.clientY; },{passive:true});
  document.addEventListener('mouseleave',function(){ px=py=-1; });
  function scrollMode(){ return !fine.matches || window.innerWidth<=760; }
  function onScroll(){
    ticking=false;
    if(tapY!==null){ if(Math.abs(window.scrollY-tapY)<56) return; tapY=null; }
    var sr=sec.getBoundingClientRect(); if(sr.bottom<0||sr.top>window.innerHeight) return;
    if(!scrollMode()&&px>-1){
      var lr=list.getBoundingClientRect();
      if(px>=lr.left&&px<=lr.right&&py>=lr.top&&py<=lr.bottom){
        var el=document.elementFromPoint(px,py), row=el&&el.closest&&el.closest('.fx-row');
        if(row&&sec.contains(row)) sel(+row.dataset.i);
        return;
      }
    }
    var line=window.innerHeight*0.55, best=null, bd=1e9;
    visible().forEach(function(r){
      var b=r.getBoundingClientRect(), d=(line>=b.top&&line<=b.bottom)?0:Math.min(Math.abs(b.top-line),Math.abs(b.bottom-line));
      if(d<bd){bd=d;best=r;}
    });
    if(best) sel(+best.dataset.i);
  }
  window.addEventListener('scroll',function(){ if(!ticking){ticking=true; requestAnimationFrame(onScroll);} },{passive:true});

  /* topic filter */
  function apply(f){
    sec.querySelectorAll('.fx-li').forEach(function(li){ li.hidden=!(f==='all'||li.dataset.cat===f); });
    var g=sec.querySelector('.fx-group'); if(g) g.hidden=(f!=='all');
    var v=visible(); cur=-1; if(v.length) sel(+v[0].dataset.i);
  }
  chips.forEach(function(c){
    c.addEventListener('click',function(){
      if(c.getAttribute('aria-pressed')==='true') return;
      chips.forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false');});
      var f=c.dataset.f, strip=c.parentNode;
      if(strip.scrollWidth>strip.clientWidth){ strip.scrollTo({left:Math.max(0,strip.scrollLeft+c.getBoundingClientRect().left-strip.getBoundingClientRect().left-20),behavior:still.matches?'auto':'smooth'}); }
      if(still.matches){ apply(f); return; }
      list.classList.add('is-swap');
      setTimeout(function(){ apply(f); requestAnimationFrame(function(){ list.classList.remove('is-swap'); }); },180);
    });
  });

  /* entrance */
  if('IntersectionObserver' in window && !still.matches){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ sec.classList.add('is-in'); io.disconnect(); } }); },{threshold:0.08});
    io.observe(sec);
  } else sec.classList.add('is-in');

  sel(0);
})();
