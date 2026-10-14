/* Global: page-ready intro and the film loop helper. */

(function(){
  var root=document.documentElement, done=false;
  function go(){ if(done) return; done=true; requestAnimationFrame(function(){ root.classList.add('is-ready'); }); }
  window.__ssbReady = go;
  if(!window.__holdIntro){
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
    setTimeout(go, 900);
  }
  // loop only the clean B-roll part of the sample film (0 to ~6.8s)
  document.querySelectorAll('video[data-loop-to]').forEach(function(v){
    var end=parseFloat(v.dataset.loopTo); if(v.dataset.rate) v.playbackRate=parseFloat(v.dataset.rate);
    v.addEventListener('play',function(){ if(v.dataset.rate) v.playbackRate=parseFloat(v.dataset.rate); });
    v.addEventListener('timeupdate',function(){ if(v.dataset.loopTo && v.currentTime>=end){ v.currentTime=0.15; v.play(); } });
  });
})();
