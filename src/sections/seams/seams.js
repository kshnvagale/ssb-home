/* Seams: the transitions between a dark and a light section (gradient horizon and pixel fill). */
(function(){
  var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cl=function(v){return v<0?0:v>1?1:v;};
  [].slice.call(document.querySelectorAll('.seam')).forEach(function(s){
    s.style.setProperty('--from',s.dataset.from); s.style.setProperty('--to',s.dataset.to);
  });
  var grads=[].slice.call(document.querySelectorAll('.seam-grad'));
  var bands=[].slice.call(document.querySelectorAll('.seam-px')).map(function(el){
    var cv=document.createElement('canvas'); el.appendChild(cv);
    var dark=parseInt(el.dataset.to.slice(1,3),16)<80;            // filling with dark (light to dark) or with light
    var acc=dark?['#1D925B','#0B5A33','#6BEE9F']:['#6BEE9F','#BFE9CF','#1D925B'];
    return {el:el,cv:cv,ctx:cv.getContext('2d'),to:el.dataset.to,acc:acc,cells:null,W:0,H:0,p:-1,vis:false};
  });
  function hash(i){ var x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); }
  function size(b){
    var r=b.el.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1);
    b.W=r.width; b.H=r.height; b.cv.width=Math.round(b.W*dpr); b.cv.height=Math.round(b.H*dpr); b.ctx.setTransform(dpr,0,0,dpr,0,0);
    var cell=Math.max(14,Math.round(b.W/72)), cols=Math.ceil(b.W/cell), rows=Math.ceil(b.H/cell), cs=[];
    for(var y=0;y<rows;y++) for(var x=0;x<cols;x++){
      var k=y*cols+x, fr=rows>1?y/(rows-1):1;                   // 0 at the top of the band, 1 at the bottom
      // bottom rows fill first; noise breaks the edge into steps
      var t=(1-fr)*0.78+hash(k)*0.34-0.06;
      var a=hash(k+999)<0.11?b.acc[(hash(k+77)*b.acc.length)|0]:null;
      cs.push({x:x*cell,y:b.H-(rows-y)*cell,t:t,a:a,on:false,v:0,from:0,ts:0});
    }
    b.cell=cell; b.cells=cs;
  }
  // a cell switches on when the scroll passes its threshold, then fades in over a fixed time,
  // so at rest every cell is either fully there or not: crisp squares, never grey half-steps
  var FADE=200, animating=false;
  function draw(b,p,now){
    var c=b.ctx, busy=false; c.clearRect(0,0,b.W,b.H);
    for(var i=0;i<b.cells.length;i++){ var e=b.cells[i], on=p>e.t;
      if(on!==e.on){ e.from=e.v||0; e.on=on; e.ts=now; }
      var k=e.ts?Math.min(1,(now-e.ts)/FADE):1; e.v=e.from+((e.on?1:0)-e.from)*(1-Math.pow(1-k,3));
      if(k<1) busy=true;
      if(e.v<=0.003) continue;
      // on the leading edge only, a few cells glint mint or green before they settle
      c.globalAlpha=e.v; c.fillStyle=(e.a&&p-e.t<0.16)?e.a:b.to; c.fillRect(e.x,e.y,b.cell+0.5,b.cell+0.5); }
    c.globalAlpha=1; return busy;
  }
  function frame(now){
    ticking=false; var vh=innerHeight, busy=false; now=now||performance.now();
    grads.forEach(function(g){ var r=g.getBoundingClientRect(); if(r.bottom<0||r.top>vh) return;
      g.style.setProperty('--sp',cl((vh-r.top)/(vh+r.height)).toFixed(3)); });
    bands.forEach(function(b){ var r=b.el.getBoundingClientRect(); if(r.bottom<-50||r.top>vh+50) return;
      if(!b.cells||Math.abs(r.width-b.W)>1) size(b);
      // 0 as the band enters at the bottom of the screen, full as its top nears the top of the screen
      if(draw(b, rm?1.2:cl((vh-r.top)/(vh*0.92))*1.14, now)) busy=true; });
    if(busy) req();
  }
  var ticking=false; function req(){ if(!ticking){ ticking=true; requestAnimationFrame(frame); } }
  addEventListener('scroll',req,{passive:true}); addEventListener('resize',function(){ bands.forEach(function(b){b.cells=null;}); req(); });
  req();
})();
