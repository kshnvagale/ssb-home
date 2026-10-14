/* Admissions & fees: scholarship sheets with shareable links (#scholarship-<slug>) */
(function(){
  var sec=document.getElementById('admissions'); if(!sec) return;
  var data=JSON.parse(document.getElementById('ad-data').textContent);
  var sheet=document.getElementById('ad-sheet'), panel=sheet.querySelector('.ad-panel'), pc=sheet.querySelector('.ad-pc'), opener=null;
  // the sheet lives in the section's markup but must sit above every section: lift it to <body>
  document.body.appendChild(sheet);
  sheet.addEventListener('click',function(e){ if(e.target.closest('[data-close]')) close(); });
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fill(i){ var d=data[i];
    pc.innerHTML='<p class="k">Scholarship · '+esc(d.k)+'</p><h3 id="ads-title">'+esc(d.t)+'</h3><p class="lede">'+esc(d.lede)+'</p>'+
      '<h4>You may be eligible if</h4><ul>'+d.c.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>'+
      '<p class="note">Up to 100% of the course fee. Decisions follow set rules, are made after your interview by the Scaler Impact Foundation and scholarship sponsors, and are final.</p>'+
      '<div class="row"><a class="cta" href="https://www.scaler.com/school-of-business/admission/">Start application <span class="orb"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a></div>';
    history.replaceState(null,'','#scholarship-'+d.slug); }
  function open(i,from){ opener=from||null; fill(i); sheet.hidden=false; document.documentElement.classList.add('ad-lock');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ sheet.classList.add('open'); panel.focus({preventScroll:true}); }); }); }
  function close(){ if(sheet.hidden) return; sheet.classList.remove('open'); history.replaceState(null,'',location.pathname+location.search);
    setTimeout(function(){ sheet.hidden=true; document.documentElement.classList.remove('ad-lock'); if(opener) opener.focus({preventScroll:true}); },450); }
  sec.addEventListener('click',function(e){ var b=e.target.closest('[data-sch]'); if(b) open(+b.dataset.sch,b); });
  addEventListener('keydown',function(e){ if(!sheet.hidden&&e.key==='Escape') close(); });
  // swipe down to close on a phone
  var ty=0, drag=false;
  panel.addEventListener('touchstart',function(e){ if(panel.scrollTop<=0){ ty=e.touches[0].clientY; drag=true; } },{passive:true});
  panel.addEventListener('touchend',function(e){ if(drag&&e.changedTouches[0].clientY-ty>110) close(); drag=false; },{passive:true});
  // deep link
  var m=location.hash.match(/^#scholarship-([a-z-]+)$/);
  if(m){ var i=data.findIndex(function(d){return d.slug===m[1];}); if(i>-1) setTimeout(function(){ sec.scrollIntoView(); open(i); },300); }
})();
