/* FAQ: one answer open at a time; opening one sets a shareable link (#faq-*) */
(function(){
  var sec=document.getElementById('faq'); if(!sec) return;
  var items=[].slice.call(sec.querySelectorAll('.fq-item'));
  function set(it,on){ it.classList.toggle('open',on); it.querySelector('.fq-b').setAttribute('aria-expanded',on?'true':'false'); }
  items.forEach(function(it){ it.querySelector('.fq-b').addEventListener('click',function(){
    var on=!it.classList.contains('open'); items.forEach(function(x){ set(x,false); }); set(it,on);
    history.replaceState(null,'',on?'#'+it.id:location.pathname+location.search); }); });
  var m=location.hash.match(/^#faq-[a-z-]+$/), t=m&&document.getElementById(location.hash.slice(1));
  if(t&&t.classList.contains('fq-item')){ set(t,true); setTimeout(function(){ t.scrollIntoView({block:'center'}); },300); }
  else if(items[0]) set(items[0],true);
})();
