/* Campus film: the hero film card lifts into a full-screen frame on scroll */
(function(){
  var sec=document.querySelector('.film-scroll'); if(!sec) return;
  var sticky=sec.querySelector('.film-sticky'), flyer=sec.querySelector('.flyer'), fv=flyer.querySelector('video');
  var card=document.querySelector('.tile.film');
  var cardVid=card?card.querySelector('video'):null;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function lerp(a,b,t){return a+(b-a)*t;}
  function target(){ var vw=innerWidth,vh=innerHeight,w,h;
    if(vw<=640){ w=vw-24; h=Math.min(vh*0.74,w*1.5); } else { w=Math.min(vw*0.9,vh*0.84*16/9); h=w*9/16; }
    return {x:(vw-w)/2,y:(vh-h)/2,w:w,h:h}; }
  function start(){ if(card){ var r=card.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height}; }
    var s=sec.getBoundingClientRect(), w=Math.min(innerWidth*0.34,460), h=w*9/16; return {x:(innerWidth-w)/2,y:s.top-h-40,w:w,h:h}; }
  var flying=false, pending=false, T={x:0,y:0,w:0,h:0};
  function update(){
    pending=false;
    var vh=innerHeight, s=sec.getBoundingClientRect(), c=sticky.getBoundingClientRect();
    var pA=clamp((vh-s.top)/vh,0,1), pH=clamp(-s.top/(vh*0.9),0,1), e=reduce?(pA>0.5?1:0):ease(pA);
    var st=start(), tg=target(); T=tg;
    var x=lerp(st.x-c.left,tg.x,e), y=lerp(st.y-c.top,tg.y,e), w=lerp(st.w,tg.w,e), h=lerp(st.h,tg.h,e);
    flyer.style.transform='translate('+x+'px,'+y+'px)'; flyer.style.width=w+'px'; flyer.style.height=h+'px';
    flyer.style.borderRadius=lerp(innerWidth<=640?18:22,innerWidth<=640?18:24,e)+'px';
    var on=pA>0.002;
    flyer.style.opacity=card?(on?1:0):clamp(pA*4,0,1);
    if(card) card.style.visibility=on?'hidden':'';
    if(on&&!flying){ flying=true; if(cardVid&&!isNaN(cardVid.currentTime)) try{fv.currentTime=cardVid.currentTime;}catch(_){}
      fv.play().catch(function(){}); }
    if(!on&&flying){ flying=false; }
    var live=s.bottom>0; var bg=live?e:0;
    sec.style.setProperty('--bgp',bg); sec.style.setProperty('--wp',live?e:0);
    sec.style.setProperty('--cp',clamp((pH-0.12)/0.35,0,1));
    window.__stageWarp&&window.__stageWarp(live?e:0,tg);
  }
  function req(){ if(!pending){ pending=true; requestAnimationFrame(update); } }
  addEventListener('scroll',req,{passive:true}); addEventListener('resize',req);
  setTimeout(update,50); setTimeout(update,1600);
  var qs=new URLSearchParams(location.search), ty=qs.get('y'), to=qs.get('to');
  if(ty||to) setTimeout(function(){ var y=ty?parseFloat(ty)*innerHeight:0; if(to){ var el=document.querySelector(to); if(el) y=el.getBoundingClientRect().top+scrollY+(parseFloat(qs.get('off')||0)); } scrollTo(0,y); req(); }, 1700);
  // no autoplay at load: the frame starts playing only once it lifts out of the hero on scroll
  sec.querySelector('.fc-sound').addEventListener('click',function(){ fv.removeAttribute('data-loop-to'); fv.removeAttribute('data-rate'); fv.muted=false; fv.playbackRate=1; fv.currentTime=0; fv.loop=false; fv.play(); this.style.display='none'; });

  // warp behind the film: streaks fly outward from the centre of the frame
  var cv=sec.querySelector('.stage-warp'), ctx=cv.getContext('2d'), W,H,dpr,rays=[],sts=[],O={x:0,y:0},level=0,running=false,last=0,col='107,238,159';
  function size(){ var r=cv.getBoundingClientRect(); dpr=Math.min(2,devicePixelRatio||1); W=r.width; H=r.height; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    O={x:W/2,y:H/2}; rays=[]; var n=72; for(var i=0;i<n;i++){ var a=(i/n)*Math.PI*2+(Math.random()-.5)*.05; rays.push({cos:Math.cos(a),sin:Math.sin(a),len:Math.hypot(W,H)*.62}); }
    sts=[]; for(var j=0;j<90;j++) sts.push(sp(true)); }
  function sp(any){ var r=rays[(Math.random()*rays.length)|0]; return {r:r,d:any?Math.random()*r.len:r.len*(.15+Math.random()*.2),v:500+Math.random()*1100,w:Math.random()<.2?1.5:.9,a:.3+Math.random()*.55}; }
  function frame(t){ if(!running) return; var dt=Math.min(.05,(t-(last||t))/1000); last=t; ctx.clearRect(0,0,W,H);
    var inner=Math.min(W,H)*0.18;
    ctx.lineWidth=.6; ctx.strokeStyle='rgba('+col+',0.06)'; ctx.beginPath();
    rays.forEach(function(r){ ctx.moveTo(O.x+r.cos*inner,O.y+r.sin*inner); ctx.lineTo(O.x+r.cos*r.len,O.y+r.sin*r.len); }); ctx.stroke();
    if(!reduce) sts.forEach(function(s,i){ s.d+=s.v*dt*(0.5+s.d/s.r.len*1.8); var L=30+s.d*.26;
      var x1=O.x+s.r.cos*s.d,y1=O.y+s.r.sin*s.d,x0=O.x+s.r.cos*(s.d-L),y0=O.y+s.r.sin*(s.d-L);
      var g=ctx.createLinearGradient(x0,y0,x1,y1); g.addColorStop(0,'rgba('+col+',0)'); g.addColorStop(1,'rgba('+col+','+s.a+')');
      ctx.strokeStyle=g; ctx.lineWidth=s.w; ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
      if(s.d-L>s.r.len) sts[i]=sp(false); });
    requestAnimationFrame(frame); }
  window.__stageWarp=function(e){ level=e; if(e>0.02&&!running){ running=true; last=0; requestAnimationFrame(frame);} else if(e<=0.02) running=false; };
  size(); addEventListener('resize',size);
})();
