/* pribeh/street.js - ulice na zacatku (x -1900..760) a na konci (x 3550..5800), obloha nad celym svetem.
   Plany: sky (hvezdy, Mlecna draha, oblaky, mesic), far (panorama, Zizkovsky vysilac, kostel sv. Prokopa),
   mid (zizkovske cinzaky), back (chodnik, vozovka, tramvaj, lampy, stromy), fore (dlazba a obrubnik v popredi). */
ST.module('street',function(ST){
'use strict';
var el=ST.el,RNG=ST.rng,PI=Math.PI,sin=Math.sin,cos=Math.cos,abs=Math.abs,mx=Math.max,mn=Math.min;
function n(v){return Math.round(v*10)/10}
function pt(x,y){return n(x)+','+n(y)}
function M(x,y){return 'M'+pt(x,y)}
function L(x,y){return 'L'+pt(x,y)}
function rect(x,y,w,h){return 'M'+pt(x,y)+'h'+n(w)+'v'+n(h)+'h'+n(-w)+'Z'}
function line(x0,y0,x1,y1){return 'M'+pt(x0,y0)+'L'+pt(x1,y1)}
function poly(a,close){var s='M'+pt(a[0][0],a[0][1]);for(var i=1;i<a.length;i++)s+='L'+pt(a[i][0],a[i][1]);return s+(close?'Z':'')}
function circ(x,y,r){return ST.circ(n(x),n(y),n(r))}
function dot(x,y){return 'M'+pt(x,y)+'h.01'}
/* okno s obloukem: levy horni roh x,y, sirka w, vyska h */
function arch(x,y,w,h){var r=w/2;return 'M'+pt(x,y+h)+'V'+n(y+r)+'a'+n(r)+','+n(r)+' 0 0 1 '+n(w)+',0V'+n(y+h)}
/* kresleni: na zacatku 'load' se zpozdenim, na konci tahem T 11,2..12,4 (dl = 0..1 poradi) */
var CTX={end:false};
function ink(p,d,cls,dl,o){
  dl=dl||0;
  if(CTX.end){var t0=11.2+mn(dl,1)*.9;return ST.D(p,d,cls,t0,mn(12.4,t0+.7),o)}
  return ST.D(p,d,cls,'load',mn(dl,1.04)*2.4,o);
}
var SHIFT=0;
var amb={balloon:[],neon:[],leaf:[],smoke:[],blink:[],walk:[],sway:[],cloud:[],bird:[],ufo:null,cw:0};
function sect(p,x0,x1){return ST.section(p,x0+SHIFT,x1+SHIFT)}
var mine=[];
function MP(l,f,ax,ay){var g=ST.plane(l,f,ax,ay);mine.push(g);return g}
function path(p,d,attrs){attrs=attrs||{};attrs.d=d;return el('path',attrs,p)}
function fillp(p,d,cls,extra){var a={d:d,'class':cls};if(extra)for(var k in extra)a[k]=extra[k];return el('path',a,p)}
function dots(p,d,w,op,cls){var e=el('path',{d:d,'class':'ink '+(cls||''),opacity:op==null?1:op},p);e.style.strokeWidth=w;return e}
/* na konci vyblednout dovnitr */
function appear(e,dl,max){if(CTX.end){var t0=11.2+mn(dl,1)*.9;ST.fade(e,t0,mn(12.4,t0+.7),max==null?1:max)}return e}

/* ---------- vlastni vzory a prechody ---------- */
(function(){
  var ns=ST.NS,t=document.createElementNS(ns,'g');
  t.innerHTML=
  '<linearGradient id="st_haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8A45C" stop-opacity="0"/><stop offset=".7" stop-color="#C8A45C" stop-opacity=".07"/><stop offset="1" stop-color="#E8D5A3" stop-opacity=".16"/></linearGradient>'+
  '<linearGradient id="st_wallg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>'+
  '<linearGradient id="st_glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8C77F" stop-opacity=".18"/><stop offset="1" stop-color="#C8A45C" stop-opacity=".55"/></linearGradient>'+
  '<pattern id="st_mos" patternUnits="userSpaceOnUse" width="28" height="14"><path d="M0,0H28M0,4.7H28M0,9.3H28M0,14H28M4.7,0V14M9.3,0V14M14,0V14M18.7,0V14M23.3,0V14M28,0V14" stroke="rgba(231,221,199,.15)" stroke-width=".55" fill="none"/><path d="M0,0h4.7v4.7h-4.7zM4.7,4.7h4.7v4.7h-4.7zM9.3,9.3h4.7v4.7h-4.7zM14,4.7h4.7v4.7h-4.7zM18.7,0h4.7v4.7h-4.7zM14,9.3h4.7v4.7h-4.7zM23.3,9.3h4.7v4.7h-4.7z" fill="rgba(231,221,199,.12)"/></pattern>'+
  '<pattern id="st_mosB" patternUnits="userSpaceOnUse" width="40" height="20"><path d="M0,0H40M0,6.7H40M0,13.3H40M0,20H40M6.7,0V20M13.3,0V20M20,0V20M26.7,0V20M33.3,0V20M40,0V20" stroke="rgba(231,221,199,.17)" stroke-width=".8" fill="none"/><path d="M0,0h6.7v6.7h-6.7zM6.7,6.7h6.7v6.7h-6.7zM13.3,13.3h6.7v6.7h-6.7zM20,6.7h6.7v6.7h-6.7zM26.7,0h6.7v6.7h-6.7zM20,13.3h6.7v6.7h-6.7zM33.3,13.3h6.7v6.7h-6.7z" fill="rgba(231,221,199,.10)"/></pattern>'+
  '<pattern id="st_sett" patternUnits="userSpaceOnUse" width="30" height="15"><path d="M0,15a15,15 0 0 1 30,0M-15,7.5a15,15 0 0 1 30,0M15,7.5a15,15 0 0 1 30,0M0,15a9,9 0 0 1 18,0M-15,7.5a8,8 0 0 1 16,0M15,7.5a8,8 0 0 1 16,0" stroke="rgba(231,221,199,.2)" stroke-width="1" fill="none"/></pattern>'+
  '<pattern id="st_settF" patternUnits="userSpaceOnUse" width="46" height="23"><path d="M0,23a23,23 0 0 1 46,0M-23,11.5a23,23 0 0 1 46,0M23,11.5a23,23 0 0 1 46,0M0,23a14,14 0 0 1 28,0M-23,11.5a12,12 0 0 1 24,0M23,11.5a12,12 0 0 1 24,0" stroke="rgba(231,221,199,.3)" stroke-width="1.6" fill="none"/></pattern>'+
  '<pattern id="st_brick" patternUnits="userSpaceOnUse" width="16" height="7"><path d="M0,0H16M0,3.5H16M0,7H16M4,0V3.5M12,3.5V7" stroke="rgba(231,221,199,.12)" stroke-width=".6" fill="none"/></pattern>'+
  '<pattern id="st_roof" patternUnits="userSpaceOnUse" width="9" height="6"><path d="M0,6H9M0,0H9M4.5,0V6" stroke="rgba(231,221,199,.2)" stroke-width=".7" fill="none"/></pattern>'+
  '<pattern id="st_rust" patternUnits="userSpaceOnUse" width="44" height="26"><path d="M0,0H44M0,13H44M0,26H44M0,0V13M22,13V26M44,0V13" stroke="rgba(231,221,199,.2)" stroke-width=".7" fill="none"/><path d="M0,1H44M0,14H44" stroke="rgba(231,221,199,.07)" stroke-width="2.2" fill="none"/></pattern>'+
  '<pattern id="st_cob" patternUnits="userSpaceOnUse" width="20" height="10"><path d="M0,0H20M0,5H20M0,10H20M5,0V5M15,0V5M0,5V10M10,5V10M20,5V10" stroke="rgba(231,221,199,.2)" stroke-width=".7" fill="none"/><path d="M2,2l.1,0M12,2l.1,0M7,7l.1,0M17,7l.1,0" stroke="rgba(231,221,199,.3)" stroke-width="1" stroke-linecap="round" fill="none"/></pattern>'+
  '<pattern id="st_plank" patternUnits="userSpaceOnUse" width="6" height="30"><path d="M0,0V30M3,4V12M2,20l.1,0" stroke="rgba(231,221,199,.16)" stroke-width=".6" fill="none"/></pattern>'+
  '<pattern id="st_slate" patternUnits="userSpaceOnUse" width="12" height="8"><path d="M0,8H12M0,0H12M3,0V8M9,0V8" stroke="rgba(231,221,199,.12)" stroke-width=".5" fill="none"/></pattern>'+
  '<clipPath id="st_clipA"><rect x="-4200" y="-200" width="4944" height="1200"/></clipPath>'+
  '<clipPath id="st_clipB"><rect x="3556" y="-200" width="3400" height="1200"/></clipPath>';
  while(t.firstChild)ST.defs.appendChild(t.firstChild);
})();

/* ================= OBLOHA ================= */
var twinkle=[];
function sparkle(g,x,y,s,op){
  var e=el('g',{opacity:op},g);
  el('path',{d:line(x-s,y,x+s,y)+line(x,y-s,x,y+s)+line(x-s*.45,y-s*.45,x+s*.45,y+s*.45)+line(x-s*.45,y+s*.45,x+s*.45,y-s*.45),'class':'ink hair'},e);
  var c=el('path',{d:dot(x,y),'class':'ink'},e);c.style.strokeWidth=3;
  return e;
}
function cloudShape(g,x,y,w,h,seed,hatchOp){
  var r=RNG(seed),k=4+Math.floor(r()*3),top=[],i,d;
  for(i=0;i<=k;i++){var u=i/k;top.push([x+w*u,y-h*Math.pow(sin(PI*u),.8)*(.55+.45*r())])}
  d=M(x,y);
  for(i=1;i<=k;i++){var a=top[i-1],b=top[i];d+='Q'+pt((a[0]+b[0])/2+(r()-.5)*w*.04,mn(a[1],b[1])-h*.22*r())+' '+pt(b[0],b[1])}
  d+='Q'+pt(x+w*.5,y+h*.1)+' '+pt(x,y)+'Z';
  fillp(g,d,'f-bg',{opacity:.78});
  el('path',{d:d,'class':'ink thin faint'},g);
  var h2='',rows=6;
  for(i=0;i<rows;i++){var yy=y-h*.42+i*h*.17,inset=w*(.05+r()*.12),len=w-inset*2-w*r()*.25;
    h2+=M(x+inset+r()*w*.1,yy)+'q'+n(len/2)+','+n(-2-r()*2)+' '+n(len)+',0'}
  el('path',{d:h2,'class':'ink hair faint',opacity:hatchOp||.9},g);
}
function buildSky(){
  var g=MP('sky',.06,2000,470),X0=300,X1=3800,Y0=-1300,Y1=640;
  el('rect',{x:X0,y:120,width:X1-X0,height:600,fill:'url(#st_haze)'},g);
  var rnd=RNG(11),c,i;
  for(c=0;c<3;c++){
    var cx0=X0+c*(X1-X0)/3,cx1=cx0+(X1-X0)/3,s=sect(g,cx0,cx1),dS='',dM='',dB='';
    for(i=0;i<1150;i++)dS+=dot(cx0+rnd()*(cx1-cx0),Y0+(Y1-Y0)*Math.pow(rnd(),1.12));
    for(i=0;i<320;i++)dM+=dot(cx0+rnd()*(cx1-cx0),Y0+(Y1-Y0)*Math.pow(rnd(),1.15));
    for(i=0;i<48;i++)dB+=dot(cx0+rnd()*(cx1-cx0),Y0+(Y1-Y0)*Math.pow(rnd(),1.3));
    dots(s,dS,1.5,.7);dots(s,dM,2.5,.9);dots(s,dB,4,1);
    for(i=0;i<6;i++){var sp=sparkle(s,cx0+rnd()*(cx1-cx0),-500+rnd()*800,4+rnd()*5,.8);twinkle.push({e:sp,s:s,f:.0007+rnd()*.0012,p:rnd()*6.28})}
    if(c===1){
      var cs=[[1890,-130],[1925,-95],[1960,-120],[1998,-80],[2040,-104]];
      el('path',{d:poly(cs),'class':'ink hair faint'},s);
      cs.forEach(function(q,j){dots(s,dot(q[0],q[1]),3.2+(j%2),1)});
      var bd=[[1320,-40],[1352,-22],[1390,-28],[1424,-8],[1446,-60],[1500,-72],[1512,-34],[1424,-8]];
      el('path',{d:poly(bd),'class':'ink hair faint'},s);
      bd.forEach(function(q,j){dots(s,dot(q[0],q[1]),2.6+(j%3)*.4,1)});
    }
  }
  /* Mlecna draha: pas ze skvrn a teckovani */
  var mw=sect(g,X0,X1),mS='',mM='',mB='',t,gs;
  function cyAt(x){return 150-(x-1500)*.25}
  for(i=0;i<3000;i++){t=X0+rnd()*(X1-X0);gs=(rnd()+rnd()+rnd()-1.5)*2*75;mS+=dot(t,cyAt(t)+gs)}
  for(i=0;i<1300;i++){t=X0+rnd()*(X1-X0);gs=(rnd()+rnd()+rnd()-1.5)*2*55;mM+=dot(t,cyAt(t)+gs)}
  for(i=0;i<330;i++){t=X0+rnd()*(X1-X0);gs=(rnd()+rnd()+rnd()-1.5)*2*38;mB+=dot(t,cyAt(t)+gs)}
  [[1900,.5],[1650,.4],[1400,.34]].forEach(function(q,j){
    var a=Math.atan(-.25)*180/PI;
    el('ellipse',{cx:q[0],cy:cyAt(q[0]),rx:1650-j*350,ry:120-j*28,transform:'rotate('+n(a)+' '+q[0]+' '+cyAt(q[0])+')',fill:'url(#stipple)',opacity:q[1]*1.1},mw)});
  dots(mw,mS,.9,.62);dots(mw,mM,1.4,.75);dots(mw,mB,2.1,.9);
  /* tenke oblaky s rytinovym srafovanim */
  var cl=[[1180,130,420,34,3],[1760,64,360,26,4],[2220,196,460,38,5],[2520,104,330,24,6],[1500,-210,520,40,7],[2050,-520,440,34,8],[1450,-640,380,28,9],[2150,-900,500,38,10],[2740,330,420,34,12],[2880,244,300,24,13]];
  cl.forEach(function(q,j){var s2=sect(g,q[0]-90,q[0]+q[2]+90),cgp=el('g',{},s2);cloudShape(cgp,q[0],q[1],q[2],q[3],q[4]*13);amb.cloud.push({g:cgp,s:s2,a:26+(j%4)*12,f:.00005+(j%3)*.00002,p:j*1.7})});
  /* ptaci prelétají oblohou */
  var bs=sect(g,X0,X1);
  for(i=0;i<5;i++){var bg=el('g',{},bs),bp=el('path',{d:'M-9,1Q-4.5,-6 0,0Q4.5,-6 9,1','class':'ink thin'},bg);amb.bird.push({g:bg,s:bs,y:60+i*45+(i%2)*30,sp:.016+i*.003,off:i*620,fl:.011+i*.0013,sc:1.3+(i%3)*.25})}
  /* letadlo s blikajicimi svetly a padajici hvezda */
  var pls=sect(g,X0,X1),pg=el('g',{},pls);
  path(pg,M(-14,0)+'q6,-3 14,-2.6q10,.2 14,2.6q-4,2.4 -14,2.6q-8,-.2 -14,-2.6Z'+M(-3,-1.8)+'l-6,-7.4l2.4,-.2l6,7.6M(-3,1)l-6,7.4l2.4,.2l6,-7.6'.replace('M(-3,1)','M-3,1')+M(-13,-.4)+'l-4,-5l1.6,0l3,5',{'class':'ink hair dim'});
  var pl1=el('path',{d:dot(-14,.2),'class':'ink gold'},pg);pl1.style.strokeWidth=2.6;
  var pl2=el('path',{d:dot(-3,2.6),'class':'ink goldl'},pg);pl2.style.strokeWidth=2;
  var ctr=el('path',{d:M(-24,0)+'h-200','class':'ink hair faint',opacity:.5,'stroke-dasharray':'2 6'},pg);
  amb.plane={g:pg,s:pls,a:pl1,b:pl2};
  var shs=sect(g,1700,2600),shg=el('path',{d:M(0,0)+'l-60,-30M-8,-4l-30,-15','class':'ink thin goldl',opacity:0},shs);
  amb.shoot={e:shg,s:shs};
  /* mesic se zari, krátery a srafy */
  var ms=sect(g,2200,3100),mo=el('g',{},ms),mi=el('g',{},mo),cx=2700,cy2=188,r=56;
  ST.fade(mo,11.6,12.5,1);
  el('circle',{cx:cx,cy:cy2,r:300,fill:'url(#gGlow)',opacity:.95},mi);
  el('circle',{cx:cx,cy:cy2,r:150,fill:'url(#gGlow)',opacity:.7},mi);
  var rays='';
  for(i=0;i<44;i++){var an=i/44*PI*2,l0=r+12+(i%2)*4,l1=r+26+((i*7)%5)*9+(i%4===0?18:0);rays+=line(cx+cos(an)*l0,cy2+sin(an)*l0,cx+cos(an)*l1,cy2+sin(an)*l1)}
  el('path',{d:rays,'class':'ink hair goldl',opacity:.5},mi);
  el('circle',{cx:cx,cy:cy2,r:r+9,'class':'ink hair goldl',opacity:.4},mi);
  el('circle',{cx:cx,cy:cy2,r:r,'class':'f-bg'},mi);el('circle',{cx:cx,cy:cy2,r:r,'class':'f-goldl',opacity:.9},mi);el('circle',{cx:cx,cy:cy2,r:r,'class':'ink thin goldl'},mi);
  function mare(d){fillp(mi,d,'',{fill:'var(--bg)','fill-opacity':.2,stroke:'var(--bg)','stroke-opacity':.4,'stroke-width':.8})}
  mare('M'+pt(cx-34,cy2-20)+'Q'+pt(cx-22,cy2-38)+' '+pt(cx-6,cy2-30)+'Q'+pt(cx+6,cy2-18)+' '+pt(cx-4,cy2-6)+'Q'+pt(cx-14,cy2+4)+' '+pt(cx-30,cy2-2)+'Q'+pt(cx-40,cy2-10)+' '+pt(cx-34,cy2-20)+'Z');
  mare('M'+pt(cx+8,cy2-12)+'Q'+pt(cx+22,cy2-26)+' '+pt(cx+34,cy2-16)+'Q'+pt(cx+38,cy2-2)+' '+pt(cx+26,cy2+8)+'Q'+pt(cx+14,cy2+6)+' '+pt(cx+8,cy2-12)+'Z');
  mare('M'+pt(cx-24,cy2+16)+'Q'+pt(cx-12,cy2+10)+' '+pt(cx-2,cy2+20)+'Q'+pt(cx-8,cy2+32)+' '+pt(cx-20,cy2+30)+'Q'+pt(cx-28,cy2+24)+' '+pt(cx-24,cy2+16)+'Z');
  var cr=[[-42,8,5],[-10,-42,4],[22,-38,5],[40,10,6],[12,24,8],[-4,4,3.5],[30,32,4],[-30,30,4],[2,-18,3],[44,-14,3]],cd='',ca='';
  cr.forEach(function(q){cd+=circ(cx+q[0],cy2+q[1],q[2]);ca+='M'+pt(cx+q[0]-q[2]*.7,cy2+q[1]+q[2]*.5)+'a'+n(q[2]*.8)+','+n(q[2]*.8)+' 0 0 0 '+n(q[2]*1.2)+','+n(q[2]*.7)});
  el('path',{d:cd,fill:'none',stroke:'var(--bg)','stroke-width':1.1,opacity:.5},mi);
  el('path',{d:ca,fill:'none',stroke:'var(--bg)','stroke-width':1.6,opacity:.4},mi);
  fillp(mi,'M'+pt(cx+r*.2,cy2-r*.98)+'A'+r+','+r+' 0 0 1 '+pt(cx-r*.2,cy2+r*.98)+'A'+n(r*1.5)+','+n(r*1.5)+' 0 0 0 '+pt(cx+r*.2,cy2-r*.98)+'Z','',{fill:'var(--bg)','fill-opacity':.3,stroke:'none'});
  fillp(mi,'M'+pt(cx+r*.55,cy2-r*.84)+'A'+r+','+r+' 0 0 1 '+pt(cx+r*.1,cy2+r*.99)+'A'+n(r*2.4)+','+n(r*2.4)+' 0 0 0 '+pt(cx+r*.55,cy2-r*.84)+'Z','',{fill:'var(--bg)','fill-opacity':.3,stroke:'none'});
  /* drobne UFO u mesice */
  var uf=el('g',{},mi);
  el('path',{d:'M'+pt(cx+105,cy2-82)+'a10,3.2 0 1,0 20,0a10,3.2 0 1,0 -20,0','class':'ink hair goldl'},uf);
  el('path',{d:'M'+pt(cx+109,cy2-83.5)+'q6,-9 12,0','class':'ink hair goldl'},uf);
  var ul=el('path',{d:dot(cx+108,cy2-81)+dot(cx+115,cy2-80)+dot(cx+122,cy2-81),'class':'ink gold'},uf);ul.style.strokeWidth=2;
  amb.ufo={g:uf,l:ul,s:ms};
  var moonState='';
  ST.on(function(T,time,cam){
    var por=cam.vw<cam.vh*.9,st=por?'p':'d';
    if(st!==moonState){moonState=st;mi.setAttribute('transform',por?'translate(-1008,-749)':'')}
  });
  ST.on(function(T,time,cam){
    if(ST.reduce)return;
    for(var j=0;j<twinkle.length;j++){var w=twinkle[j];if(w.s.style.display==='none')continue;
      w.e.setAttribute('opacity',(.25+.75*Math.pow(.5+.5*sin(time*w.f+w.p),1.6)).toFixed(2))}
  });
}

/* ================= VZDALENE PANORAMA ================= */
/* fragment strechy: zacina v (x,y) = vrch zdi vlevo, konci v (x+w,y) */
function roofFrag(x,w,y,kind){
  switch(kind){
    case 0:return L(x,y)+L(x,y-3)+L(x+w,y-3)+L(x+w,y);
    case 1:return L(x,y)+L(x+w/2,y-w*.3)+L(x+w,y);
    case 2:return L(x,y)+L(x+w*.1,y-w*.2)+L(x+w*.9,y-w*.2)+L(x+w,y);
    case 3:return L(x,y)+L(x+w*.2,y-w*.12)+L(x+w*.8,y-w*.12)+L(x+w,y);
    case 4:return L(x,y)+L(x,y-w*.12)+L(x+w*.2,y-w*.12)+L(x+w*.2,y-w*.2)+L(x+w*.4,y-w*.2)+L(x+w*.5,y-w*.34)+L(x+w*.6,y-w*.2)+L(x+w*.8,y-w*.2)+L(x+w*.8,y-w*.12)+L(x+w,y-w*.12)+L(x+w,y);
    case 5:{var r=w*.3;return L(x,y)+L(x+w*.2,y)+L(x+w*.2,y-6)+L(x+w*.5-r,y-6)+'a'+n(r)+','+n(r*1.1)+' 0 0 1 '+n(2*r)+',0'+L(x+w*.5+r*.1,y-6-r*1.1)+L(x+w*.5,y-6-r*1.1-12)+L(x+w*.5-r*.1,y-6-r*1.1)+L(x+w*.5+r,y-6)+L(x+w*.8,y-6)+L(x+w*.8,y)+L(x+w,y)}
  }
  return L(x,y)+L(x+w,y);
}
/* rada siluet strech */
function skylineRow(g,x0,x1,base,hMin,hMax,seed,o){
  var r=RNG(seed),x=x0,d=M(x0,base+30),walls='',win='',lit='',chim='',ant='',cor='';
  while(x<x1){
    var w=54+r()*86,low=null,i;
    if(o.gaps)for(i=0;i<o.gaps.length;i++){var q=o.gaps[i];if(x+w>q[0]&&x<q[1]){low=q;if(x<q[0]-10)w=mn(w,q[0]-x);else w=mn(w,q[1]-x)}}
    var h=low?(low[2]||40)*(.6+r()*.7):hMin+r()*(hMax-hMin);
    var kind=r()<.16?5:Math.floor(r()*5);if(h<60&&kind===5)kind=1;
    var yT=base-h;
    d+=roofFrag(x,w,yT,kind);
    walls+=line(x,yT,x,base);
    if(r()<.5&&kind!==5){var cxx=x+8+r()*(w-24);chim+=rect(cxx,yT-12-r()*12,6,22)+rect(cxx-1.5,yT-14-r()*0,9,2)}
    if(kind!==5){cor+=line(x,yT+7,x+w,yT+7);if(h>90)cor+=line(x,base-h*.5,x+w,base-h*.5)}
    if(r()<.28&&kind!==5&&kind!==4){var ax3=x+10+r()*(w-24),ay3=yT-(kind===1?w*.15:2);ant+=line(ax3,ay3,ax3,ay3-22)+line(ax3-6,ay3-18,ax3+6,ay3-18)+line(ax3-5,ay3-13,ax3+5,ay3-13)+line(ax3-4,ay3-8,ax3+4,ay3-8)}
    else if(r()<.1&&kind===0){var tx3=x+w*.5;ant+=rect(tx3-9,yT-22,18,18)+M(tx3-10,yT-22)+'l10,-7l10,7'+line(tx3-9,yT-4,tx3-11,yT)+line(tx3+9,yT-4,tx3+11,yT)}
    if(!o.noWin){
      for(var yy=yT+13;yy<base-8;yy+=12)for(var xx=x+9;xx<x+w-5;xx+=12){
        var q2=r();if(q2<.1&&!o.noLit)lit+=dot(xx,yy);else if(q2<.62)win+=dot(xx,yy)}
    }
    x+=w;
  }
  d+=L(x,base+30)+'Z';
  return {d:d,walls:walls,win:win,lit:lit,chim:chim,ant:ant,cor:cor};
}
function drawRow(g,row,o,dl){
  ink(g,row.d,o.cls||'dim solid',dl);
  ink(g,row.walls,'hair faint',dl+.05);
  if(row.cor)ink(g,row.cor,'hair faint',dl+.07);
  if(row.chim)ink(g,row.chim,'thin dim solid',dl+.1);
  if(row.ant)ink(g,row.ant,'hair faint',dl+.12);
  var w1=dots(g,row.win,1.3,o.winOp||.28);
  if(row.lit)dots(g,row.lit,1.9,.8,'gold');
}

/* ---- novogoticka vez kostela sv. Prokopa ---- */
function buildChurch(g,x,base,dl){
  var d;
  var nave=[[x-170,base],[x-170,base-62],[x-150,base-62],[x-98,base-112],[x-40,base-62],[x-18,base-62]];
  ink(g,poly(nave)+L(x-18,base)+'Z','thin dim solid',dl);
  ink(g,line(x-98,base-112,x-98,base-62)+line(x-150,base-62,x-40,base-62),'hair faint',dl);
  fillp(g,poly([[x-150,base-62],[x-98,base-112],[x-40,base-62]],true),'',{fill:'url(#st_roof)',stroke:'none'});
  var tw=19,y1=base-190;
  ink(g,rect(x-tw,y1,tw*2,base-y1),'thin dim solid',dl+.1);
  d=line(x-tw-2,base-90,x+tw+2,base-90)+line(x-tw-2,y1+6,x+tw+2,y1+6)+line(x-tw,base-150,x+tw,base-150);
  ink(g,d,'hair dim',dl+.12);
  d='';
  [-9,9].forEach(function(q){var cx=x+q;d+='M'+pt(cx-4,base-124)+'V'+n(base-152)+'Q'+pt(cx-4,base-162)+' '+pt(cx,base-170)+'Q'+pt(cx+4,base-162)+' '+pt(cx+4,base-152)+'V'+n(base-124)+'Z'});
  d+='M'+pt(x-4,base-60)+'V'+n(base-80)+'Q'+pt(x-4,base-86)+' '+pt(x,base-92)+'Q'+pt(x+4,base-86)+' '+pt(x+4,base-80)+'V'+n(base-60);
  ink(g,d,'hair dim',dl+.15,{fill:'url(#hatchFine)'});
  ink(g,circ(x,base-106,6)+line(x,base-106,x,base-110)+line(x,base-106,x+3,base-104),'hair dim',dl+.15);
  d=poly([[x-tw-5,base],[x-tw-5,base-84],[x-tw-2,base-92]])+poly([[x+tw+5,base],[x+tw+5,base-84],[x+tw+2,base-92]]);
  ink(g,d,'hair dim',dl+.15);
  var ys=y1,sh=150;
  d=poly([[x-tw,ys],[x-tw+4,ys-26],[x-tw+8,ys]])+poly([[x+tw,ys],[x+tw-4,ys-26],[x+tw-8,ys]])+poly([[x-9,ys],[x,ys-18],[x+9,ys]]);
  ink(g,d,'hair dim solid',dl+.2);
  var spire=[[x-tw+6,ys],[x-5,ys-sh*.55],[x-1.5,ys-sh],[x+1.5,ys-sh],[x+5,ys-sh*.55],[x+tw-6,ys]];
  ink(g,poly(spire,true),'thin dim solid',dl+.25);
  fillp(g,poly([[x+2,ys],[x+1.5,ys-sh],[x+tw-6,ys]],true),'',{fill:'url(#hatchFine)',stroke:'none'});
  d=line(x,ys,x,ys-sh);
  for(var k=1;k<8;k++){var yk=ys-sh*k/8.6,wk=(tw-6)*(1-k/8.6)*.95;d+=line(x-wk,yk,x+wk,yk)}
  ink(g,d,'hair faint',dl+.3);
  d='';for(k=1;k<7;k++){var yy=ys-sh*k/7.5,ww=(tw-6)*(1-k/7.5);d+=dot(x-ww-1,yy)+dot(x+ww+1,yy)}
  dots(g,d,2.2,.7,'dim');
  ink(g,line(x,ys-sh,x,ys-sh-16)+line(x-4,ys-sh-10,x+4,ys-sh-10),'thin dim',dl+.3);
  [-tw+1,tw-1].forEach(function(q){ink(g,poly([[x+q-2.5,ys-26],[x+q,ys-48],[x+q+2.5,ys-26]]),'hair dim',dl+.3)});
}

/* ---- stavebni jerab (dalka) ---- */
function buildCrane(g,x,base,h,dl){
  var m=14,top=base-h,d='',y,b2=M(x-m/2,base)+'V'+n(top)+M(x+m/2,base)+'V'+n(top);
  for(y=base;y>top+8;y-=14)d+=line(x-m/2,y,x+m/2,y-14)+line(x+m/2,y,x-m/2,y-14)+line(x-m/2,y,x+m/2,y);
  ink(g,b2+d,'hair faint',dl);
  d=poly([[x-m/2,top],[x,top-34],[x+m/2,top]])+M(x-210,top+8)+'H'+n(x+84)+M(x-210,top+3)+'H'+n(x+4)+M(x,top-34)+'L'+pt(x-70,top+4)+M(x,top-34)+'L'+pt(x-140,top+4)+M(x,top-34)+'L'+pt(x-210,top+4)+M(x,top-34)+'L'+pt(x+84,top+8)+rect(x+58,top+8,20,15)+rect(x+8,top+10,12,10)+M(x-150,top+8)+'V'+n(top+84)+rect(x-154,top+84,8,6)+M(x-210,top+3)+'v5';
  for(y=x-196;y<x;y+=14)d+=line(y,top+3,y+14,top+8)+line(y,top+8,y+14,top+3);
  ink(g,d,'hair faint',dl+.05);
  var lt=el('path',{d:dot(x,top-37),'class':'ink gold'},g);lt.style.strokeWidth=3;blinkers.push({a:el('circle',{cx:x,cy:top-37,r:9,fill:'url(#gGlow)',opacity:.6},g),b:lt,s:g,ph:x*.21});
}
/* ---- Zizkovsky vysilac ---- */
function babyD(cx,cy,ang,s,gl){
  var ca=cos(ang),sa=sin(ang);
  function T(x,y){return [cx+(x*ca-y*sa)*s,cy+(x*sa+y*ca)*s]}
  function P(x,y){var q=T(x,y);return pt(q[0],q[1])}
  function ell(x,y,rx,ry){var a=T(x-rx,y),b=T(x+rx,y);
    return 'M'+pt(a[0],a[1])+'A'+n(rx*s)+','+n(ry*s)+' '+n(ang*180/PI)+' 1,1 '+pt(b[0],b[1])+'A'+n(rx*s)+','+n(ry*s)+' '+n(ang*180/PI)+' 1,1 '+pt(a[0],a[1])+'Z'}
  var body=ell(-1,-1,6,3.5)+ell(8,-3.2,3.2,3.2);
  var limbs='M'+P(4,0)+'L'+P(7,5)+'L'+P(5,6.4)+'M'+P(2.5,1)+'L'+P(4,6.6)+'M'+P(-5,.5)+'L'+P(-8.5,4.5)+'L'+P(-5.5,6.4)+'M'+P(-3,1.6)+'L'+P(-5,6.8);
  if(gl){var g1=T(10.6,-4.6),g2=T(10.6,-1.8);limbs+=circ(g1[0],g1[1],1.7*s)+circ(g2[0],g2[1],1.7*s)+'M'+P(10.6,-3.2)+'l.01,.01'}
  return {body:body,limbs:limbs};
}
var blinkers=[];
function buildTower(g,bx,gb,H,dl){
  var myB=[];
  var u=function(k){return gb-H*k},s=[
    {dx:-38,h:.78,wb:12,wt:8.4},{dx:0,h:.86,wb:14,wt:9.6},{dx:40,h:.7,wb:12,wt:8.4}],i,d;
  var rings='',lines='';
  [[.5,-38,0],[.62,0,40],[.38,0,40],[.74,-38,0]].forEach(function(b){
    var y=u(b[0]),xa=bx+b[1]+10,xb=bx+b[2]-10;
    lines+=rect(xa,y-4,xb-xa,8)+line(xa,y-4,xb,y+4)+line(xa,y+4,xb,y-4)});
  ink(g,lines,'hair dim',dl+.05);
  s.forEach(function(sh,k){
    var x=bx+sh.dx,top=u(sh.h);
    var body=poly([[x-sh.wb,gb],[x-sh.wt,top],[x+sh.wt,top],[x+sh.wb,gb]],true);
    ink(g,body,'thin dim solid',dl+k*.05+.1);
    fillp(g,poly([[x+sh.wb*.28,gb],[x+sh.wt*.28,top],[x+sh.wt,top],[x+sh.wb,gb]],true),'',{fill:'url(#hatchV)',stroke:'none'});
    rings='';
    for(var yy=gb-10,j=0;yy>top+3;yy-=9+j%2,j++){var t=(gb-yy)/(gb-top),w=sh.wb+(sh.wt-sh.wb)*t;rings+=line(x-w,yy,x+w,yy)}
    rings+=line(x-sh.wb*.3,gb,x-sh.wt*.3,top);
    for(var yy2=gb-10,j2=0;yy2>top+14;yy2-=28,j2++){var t2=(gb-yy2)/(gb-top),w2=sh.wb+(sh.wt-sh.wb)*t2;rings+=line(x-w2,yy2,x+w2,yy2-18)+line(x+w2,yy2,x-w2,yy2-18)}
    ink(g,rings,'hair faint',dl+k*.05+.2);
    ink(g,rect(x-sh.wt-1.5,top-3,sh.wt*2+3,3.5),'hair dim solid',dl+.3);
    myB.push({x:x,y:top-6});
  });
  var yd=u(.7),px=bx;
  ink(g,poly([[px-34,yd],[px-22,yd+11],[px+22,yd+11],[px+34,yd],[px+30,yd-9],[px-30,yd-9]],true),'thin dim solid',dl+.3);
  d='';for(i=-26;i<=26;i+=5.2)d+=line(px+i,yd-7,px+i,yd+8);
  ink(g,d,'hair faint',dl+.3);
  ink(g,line(px-30,yd-9,px+30,yd-9)+rect(px-12,yd-17,24,8),'hair dim',dl+.3);
  var yt=u(.86),yH=gb-H,ax=bx;
  d=line(ax-3,yt,ax-1.8,yH+16)+line(ax+3,yt,ax+1.8,yH+16)+line(ax,yH+16,ax,yH);
  for(i=0;i<7;i++){var ya=yt-i*(yt-yH-16)/7,yb=yt-(i+1)*(yt-yH-16)/7;d+=line(ax-3+i*.17,ya,ax+3-i*.17-.2,yb)+line(ax+3-i*.17,ya,ax-3+i*.17,yb)}
  ink(g,d,'hair dim',dl+.35);
  ink(g,'M'+pt(ax+3,yH+34)+'q8,-2 10,-9q-10,-1 -10,9'+line(ax+3,yH+34,ax+8,yH+30)+rect(ax-9,yH+26,5,12)+rect(ax+3,yH+44,8,3),'hair dim',dl+.4);
  myB.push({x:ax,y:yH-2});
  var pods=[[bx-19,u(.27),56,34],[bx+21,u(.35),52,31],[bx-40,u(.44),46,28]];
  pods.forEach(function(p,k){
    var cx=p[0],cy=p[1],w=p[2],h=p[3];
    ink(g,poly([[cx-w*.3,cy+h*.5],[cx-w*.15,cy+h*.9],[cx+w*.15,cy+h*.9],[cx+w*.3,cy+h*.5]]),'hair dim',dl+.4+k*.03);
    ink(g,ST.rect(cx-w/2,cy-h/2,w,h,h*.45),'thin dim t3',dl+.45+k*.03);
    var ws='';for(var j=-1;j<=1;j++)ws+=ST.rect(cx+j*w*.24-w*.09,cy-h*.2,w*.18,h*.4,2);
    for(var jb=-w*.46;jb<w*.46;jb+=5)ws+=line(cx+jb,cy-h*.5,cx+jb*.9,cy-h*.34)+line(cx+jb,cy+h*.34,cx+jb*.9,cy+h*.5);
    ink(g,ws,'hair goldl',dl+.5);
    fillp(g,ST.rect(cx-w*.45,cy-h*.2,w*.9,h*.4,2),'',{fill:'url(#st_glass)',opacity:.55});
  });
  var bb=[[0,.13,-PI/2],[2,.2,PI/2],[1,.5,-PI/2],[0,.62,PI/2],[1,.78,PI/2],[2,.52,-PI/2],[0,.33,-PI/2]];
  bb.forEach(function(q,k){
    var sh=s[q[0]],yy=u(q[1]),t=q[1]/sh.h,w=sh.wb+(sh.wt-sh.wb)*t,x=bx+sh.dx+(k%2?-.4:.4)*w;
    var bd=babyD(x,yy,q[2],1.5,k===2);
    ink(g,bd.body,'hair dim t3',dl+.6);
    ink(g,bd.limbs,'hair goldl',dl+.62);
  });
  /* vystrazna svetla (jen zlata) */
  myB.forEach(function(b){var e1=el('circle',{cx:b.x,cy:b.y,r:15,fill:'url(#gGlow)',opacity:1},g);var e2=el('path',{d:dot(b.x,b.y),'class':'ink gold'},g);e2.style.strokeWidth=3.4;blinkers.push({a:e1,b:e2,s:g,ph:b.x*.37})});
}


function buildFarAll(){
  CTX.end=false;
  var A=MP('far',.22,0,470),TW=MP('far',.15,0,470),B=MP('far',.34,0,470),x,k=0,s,row;
  for(x=-1700;x<2000;x+=740,k++){
    s=sect(A,x,x+740);row=skylineRow(s,x,x+740,620,120,260,17+k,{noLit:true});
    drawRow(s,row,{cls:'faint t1',winOp:.12},.05);
    fillp(s,rect(x,400,740,260),'',{fill:'url(#st_haze)',opacity:.7});
  }
  var cr=sect(A,-700,-420);buildCrane(cr,-560,626,470,.15);
  /* vitkovsky kopec s pomnikem */
  var hx=-780,sh=sect(A,hx-440,hx+440),hd=M(hx-420,640)+'C'+pt(hx-300,600)+' '+pt(hx-240,560)+' '+pt(hx-120,552)+'C'+pt(hx-60,548)+' '+pt(hx+60,548)+' '+pt(hx+130,556)+'C'+pt(hx+240,568)+' '+pt(hx+320,610)+' '+pt(hx+440,640)+'Z';
  ink(sh,hd,'thin faint t1',.1);
  ink(sh,poly([[hx-52,551],[hx-52,500],[hx-40,494],[hx+40,494],[hx+52,500],[hx+52,551]])+line(hx-52,510,hx+52,510)+line(hx-30,494,hx-30,551)+line(hx+30,494,hx+30,551)+line(hx-6,494,hx-6,478)+line(hx+6,494,hx+6,478)+rect(hx-8,474,16,5),'hair faint solid',.12);
  /* kostel sv. Prokopa (jediny) */
  var sc=sect(A,-260,260),cgc=el('g',{transform:'translate(-20,640) scale(1.5) translate(20,-640)'},sc);
  buildChurch(cgc,-20,640,.22);
  /* Zizkovsky vysilac (jediny, velmi vzdaleny plan; v ST.on se plynule dosazuje do zaveru) */
  var st=sect(TW,-300,1100),tg=el('g',{},st);
  buildTower(tg,350,560,520,.12);
  amb.tower={g:tg,s:st};
  for(x=-1700,k=0;x<2700;x+=740,k++){
    s=sect(B,x,x+740);row=skylineRow(s,x,x+740,648,60,140,45+k,{});
    drawRow(s,row,{cls:'dim solid',winOp:.3},.1);
  }
}

/* ================= STREDNI PLAN: ZIZKOVSKE CINZAKY ================= */
var FH=96,SH=130;
function bird(x,y,s,dir){
  var d='M'+pt(x-7*s*dir,y)+'Q'+pt(x-4*s*dir,y-6*s)+' '+pt(x+3*s*dir,y-5*s)+'Q'+pt(x+6*s*dir,y-5*s)+' '+pt(x+7*s*dir,y-8*s)+'a'+n(2.4*s)+','+n(2.4*s)+' 0 1,1 '+n(2.6*s*dir)+','+n(1.8*s)+'L'+pt(x+8.4*s*dir,y-5*s)+'Q'+pt(x+6*s*dir,y-1*s)+' '+pt(x+2*s*dir,y)+'Z';
  d+=line(x-7*s*dir,y,x-11*s*dir,y+2*s)+line(x-7*s*dir,y-1*s,x-12*s*dir,y-1*s)+line(x+1*s*dir,y,x+1*s*dir,y+3*s)+line(x-2*s*dir,y,x-2*s*dir,y+3*s);
  return d;
}
function plantD(cx,y,r,s){
  var d='';
  for(var i=0;i<6;i++){var a=-PI/2+(i-2.5)*.5+(r()-.5)*.2,l=(8+r()*8)*s;d+=M(cx,y)+'q'+n(cos(a)*l*.4+(r()-.5)*3)+','+n(sin(a)*l*.6)+' '+n(cos(a)*l)+','+n(sin(a)*l)}
  return d;
}
function awning(g,x0,x1,y,h,dl){
  var st=Math.max(2,Math.round((x1-x0)/13)),a='',b='',out=M(x0,y)+L(x1,y)+L(x1+8,y+h);
  for(var i=st-1;i>=0;i--){
    var xa=x0+(x1-x0)*i/st,xb=x0+(x1-x0)*(i+1)/st,pxa=x0-8+(x1-x0+16)*i/st,pxb=x0-8+(x1-x0+16)*(i+1)/st;
    var d=M(xa,y)+L(xb,y)+L(pxb,y+h)+'q'+n(-(pxb-pxa)/2)+',5 '+n(-(pxb-pxa))+',0Z';
    if(i%2)a+=d;else b+=d;
    out+='q'+n(-(pxb-pxa)/2)+',5 '+n(-(pxb-pxa))+',0'}
  out+=L(x0-8,y+h)+'Z';
  fillp(g,a,'f-t3');fillp(g,b,'f-t1');
  ink(g,out,'thin',dl);
  fillp(g,rect(x0,y+h-5,x1-x0,6),'',{fill:'url(#hatchFine)',opacity:.7});
  var ad='';for(i=0;i<st;i++){var xc=x0+(x1-x0)*(i+.5)/st,pxc=x0-8+(x1-x0+16)*(i+.5)/st;ad+=line(xc,y+2,pxc,y+h-3)}
  ad+=M(x0-1,y+3)+'L'+pt(x0-9,y+h+7)+M(x1+1,y+3)+'L'+pt(x1+9,y+h+7)+rect(x0-2,y-4,x1-x0+4,4)+circ(x0-2,y-2,2)+circ(x1+2,y-2,2);
  path(g,ad,{'class':'ink hair',opacity:.8});
  fillp(g,rect(x0-8,y+h+1,x1-x0+16,9),'',{fill:'url(#gShadeDown)',opacity:.5});
}
/* S = {x,w,nF,gy,seed,roof,shop,wall,bal,lit,dl,pigeons} */
function facade(g,S){
  var r=RNG(S.seed),x=S.x,w=S.w,gy=S.gy,nF=S.nF,ys=gy-SH,yt=ys-nF*FH,dl=S.dl,wall=S.wall||'t2',i,f;
  var sec=sect(g,x-14,x+w+14);
  var nb=Math.max(3,Math.round((w-44)/64)),bw=(w-44)/nb,ww=Math.min(32,bw*.52),wh=60;
  var cxs=[];for(i=0;i<nb;i++)cxs.push(x+22+bw*(i+.5));
  var top=yt-16;
  var r2=RNG(S.seed+999),dk=[],smk=[];
  ink(sec,rect(x,top,w,gy-top+70),'thin '+wall,dl);
  fillp(sec,rect(x+w-30,top,30,gy-top),'',{fill:'url(#hatchV)',opacity:.8});
  fillp(sec,rect(x,top+10,w,gy-top-10),'',{fill:'url(#st_wallg)',opacity:.55});
  var q='',yy;
  for(yy=ys-6;yy>top+12;yy-=13){q+=line(x,yy,x+14,yy)+line(x+w-14,yy,x+w,yy)}
  q+=line(x+14,top+10,x+14,ys)+line(x+w-14,top+10,x+w-14,ys);
  ink(sec,q,'hair',dl+.05);
  q='';for(yy=ys+13;yy<gy;yy+=13)q+=line(x,yy,x+w,yy);
  ink(sec,q,'hair faint',dl+.05);
  fillp(sec,rect(x-4,ys-9,w+8,13),'f-'+wall);
  var cd=rect(x-4,ys-9,w+8,13)+line(x-4,ys-4,x+w+4,ys-4),xx;
  for(xx=x;xx<x+w;xx+=7)cd+=line(xx,ys-4,xx,ys+2);
  ink(sec,cd,'thin',dl+.08);
  /* bosaz v parteru a zvetraly stuk */
  fillp(sec,rect(x,ys+4,w,gy-ys-4),'',{fill:'url(#st_rust)',opacity:.95});
  fillp(sec,rect(x+14,top+10,w-28,ys-top-14),'',{fill:'url(#stipple)',opacity:.2});
  /* okna */
  var gl='',gh='',fr='',mu='',sl='',li='',lit=[],cu='',cuL='',gr='',pot='',pln='',pi='',stn='',bld='';
  var litP=S.lit==null?.34:S.lit;
  for(f=1;f<=nF;f++){
    var yb=ys-(f-1)*FH,bal=S.bal&&S.bal.indexOf(f)>=0;
    for(i=0;i<nb;i++){
      var cx=cxs[i],wx=cx-ww/2,hh=wh,sill=yb-24;
      var isBal=bal&&(i===Math.floor(nb/2)||(nb>4&&i===Math.floor(nb/2)-1));
      if(isBal){hh=wh+14;sill=yb-8}
      var wy=sill-hh;
      if(r()<litP)lit.push({x:wx,y:wy,w:ww,h:hh,sill:sill});
      else{gl+=rect(wx,wy,ww,hh);gh+=rect(wx+ww*.5,wy+hh*.45,ww*.5,hh*.55);dk.push([wx,wy,ww,hh]);
        gr+=line(wx+ww*.16,wy+hh-6,wx+ww*.5,wy+hh*.4)+line(wx+ww*.28,wy+hh-5,wx+ww*.7,wy+hh*.46)+line(wx+ww*.5,wy+hh*.34,wx+ww*.62,wy+hh*.34);
        var rd=r();
        if(rd<.4){
          cu+=M(wx,wy)+'L'+pt(wx+ww*.34,wy)+'Q'+pt(wx+ww*.2,wy+hh*.4)+' '+pt(wx+ww*.32,wy+hh*.72)+L(wx,wy+hh*.72)+'Z'+M(wx+ww,wy)+'L'+pt(wx+ww*.66,wy)+'Q'+pt(wx+ww*.8,wy+hh*.4)+' '+pt(wx+ww*.68,wy+hh*.72)+L(wx+ww,wy+hh*.72)+'Z';
          cuL+=line(wx-3,wy+2,wx+ww+3,wy+2)+line(wx+ww*.1,wy+2,wx+ww*.08,wy+hh*.7)+line(wx+ww*.2,wy+2,wx+ww*.2,wy+hh*.55)+line(wx+ww*.9,wy+2,wx+ww*.92,wy+hh*.7)+line(wx+ww*.8,wy+2,wx+ww*.8,wy+hh*.55)+dot(wx-3,wy+2)+dot(wx+ww+3,wy+2);
        }else if(rd<.58){
          pot+=M(cx-5,sill)+'l1,-8h8l1,8Z';pln+=plantD(cx,sill-8,r,1.15)+(r()<.5?circ(cx+r()*8-4,sill-20-r()*5,1.8):'');
        }else if(rd<.68){
          for(var yb2=wy+3;yb2<wy+hh*.5;yb2+=3.6)bld+=line(wx+1,yb2,wx+ww-1,yb2);bld+=line(wx+ww/2-4,wy+hh*.5,wx+ww/2+4,wy+hh*.5)+circ(wx+ww/2,wy+hh*.5+2,1.3);
        }
      }
      fr+=rect(wx-3,wy-3,ww+6,hh+3)+rect(wx,wy,ww,hh);
      mu+=line(wx+ww/2,wy,wx+ww/2,wy+hh)+line(wx,wy+hh*.3,wx+ww,wy+hh*.3);
      if(isBal)mu+=line(wx,wy+hh*.62,wx+ww,wy+hh*.62);
      mu+=rect(wx+2,wy+2,ww-4,hh-4)+line(wx+ww*.25,wy,wx+ww*.25,wy+hh*.3)+line(wx+ww*.75,wy,wx+ww*.75,wy+hh*.3)+line(wx+ww/2-4.5,wy+hh*.56,wx+ww/2-4.5,wy+hh*.56+5)+line(wx+ww/2+4.5,wy+hh*.56,wx+ww/2+4.5,wy+hh*.56+5);
      if(!isBal){sl+=rect(wx-6,sill,ww+12,4)+line(wx+3,sill+4,wx+3,sill+11)+line(wx+ww-3,sill+4,wx+ww-3,sill+11)+rect(wx+2,sill+12,ww-4,Math.max(2,yb-3-sill-12))+poly([[cx-3,sill+13.5],[cx,sill+12.2],[cx+3,sill+13.5]])+line(wx-6,sill+4.5,wx-6,sill+7)+line(wx+ww+6,sill+4.5,wx+ww+6,sill+7);
        stn+=line(wx-2,sill+4,wx-2.5,sill+4+8+r()*8)+line(wx+ww+2,sill+4,wx+ww+2.6,sill+4+6+r()*10)+line(cx+(r()-.5)*ww*.6,sill+5,cx+(r()-.5)*ww*.6,sill+9+r()*6)}
      if(f===1){
        if((i+nb)%2)li+=poly([[wx-7,wy-3],[cx,wy-16],[wx+ww+7,wy-3]])+line(wx-7,wy-3,wx+ww+7,wy-3)+dot(cx,wy-8);
        else li+=M(wx-7,wy-3)+'Q'+pt(cx,wy-19)+' '+pt(wx+ww+7,wy-3)+line(wx-7,wy-3,wx+ww+7,wy-3);
        li+=line(wx-6,wy-3,wx-6,wy+hh)+line(wx+ww+6,wy-3,wx+ww+6,wy+hh);
      }else if(f===2&&nF>2){li+=rect(wx-6,wy-10,ww+12,7)+rect(cx-3,wy-13,6,10)}
      else{li+=line(wx-6,wy-4,wx+ww+6,wy-4)+line(wx-4,wy-4,wx-4,wy-9)+line(wx+ww+4,wy-4,wx+ww+4,wy-9)+line(wx-4,wy-9,wx+ww+4,wy-9)}
    }
    if(f>1)li+=line(x+14,yb+1,x+w-14,yb+1);
  }
  /* pilastry a medailony mezi okny, konzoly pod rimsou */
  var pilOn=r2()<.6,pf,pxm,pT,pB;
  for(pf=1;pf<=nF;pf++){
    var ybp=ys-(pf-1)*FH,balF=S.bal&&S.bal.indexOf(pf)>=0;
    if(balF)continue;
    for(i=1;i<nb;i++){pxm=x+22+bw*i;
      if(pilOn){pT=ybp-88;pB=ybp-3;
        pi+=rect(pxm-6,pT,12,pB-pT)+rect(pxm-8.5,pT-3,17,3.5)+rect(pxm-8.5,pB,17,3.5)+line(pxm-2,pT+2,pxm-2,pB-2)+line(pxm+2,pT+2,pxm+2,pB-2)+M(pxm-6,pT)+'q3,-5 6,-1q3,-4 6,1'}
      else if(pf>1||nF<3){var my=ybp-54;
        pi+=circ(pxm,my,8)+circ(pxm,my,5)+M(pxm-8,my)+'q-6,7 -3,15M'+pt(pxm+8,my)+'q6,7 3,15'+M(pxm-3,my-8)+'q3,-5 6,0'+dot(pxm,my)+M(pxm-3,my+8)+'l-4,5M'+pt(pxm+3,my+8)+'l4,5'}
    }
  }
  fillp(sec,pi,pilOn?'f-t3':'f-t2',{opacity:.6});
  ink(sec,pi,'hair',dl+.12);
  /* konzolky pod hlavni rimsou */
  var cs2='';for(i=1;i<nb;i++){pxm=x+22+bw*i;cs2+=M(pxm-3.5,top+9)+'v7q0,5 3.5,5q3.5,0 3.5,-5v-7'+line(pxm,top+9,pxm,top+17)}
  ink(sec,cs2,'hair',dl+.14);
  appear(fillp(sec,gl,'f-t1'),dl+.1);
  appear(fillp(sec,gh,'',{fill:'url(#hatchFine)',opacity:.7}),dl+.1);
  fillp(sec,cu,'f-t3',{opacity:.9});
  ink(sec,cu,'hair',dl+.16);ink(sec,cuL,'hair',dl+.17);
  if(pot){fillp(sec,pot,'f-t3');ink(sec,pot,'hair',dl+.17);ink(sec,pln,'hair',dl+.18)}
  path(sec,bld,{'class':'ink hair',opacity:.6});
  path(sec,gr,{'class':'ink hair goldl',opacity:.22});
  path(sec,stn,{'class':'ink hair faint'});
  lit.forEach(function(L2){
    var rr=r(),sc=Math.floor(r()*8),op=.55+r()*.4;
    var eg=fillp(sec,rect(L2.x,L2.y,L2.w,L2.h),rr<.7?'':'f-gold');
    if(rr<.7){eg.setAttribute('fill','url(#gWin)');eg.setAttribute('opacity',op)}
    else eg.setAttribute('opacity',(op*.55).toFixed(2));
    appear(eg,dl+.12,rr<.7?op:op*.55);
    var cx=L2.x+L2.w/2,sill=L2.sill,dd='';
    if(sc===1){
      dd=M(L2.x,L2.y)+'q'+n(L2.w*.5)+','+n(L2.h*.35)+' '+n(L2.w*.3)+','+n(L2.h)+L(L2.x,L2.y+L2.h)+'Z';
      ink(sec,dd+M(L2.x+L2.w*.1,L2.y)+'q'+n(L2.w*.3)+','+n(L2.h*.4)+' '+n(L2.w*.18)+','+n(L2.h),'hair',dl+.2,{fill:'url(#hatchFine)'});
    }else if(sc===2){
      /* zavesna lampa (lustr) a obraz na zdi */
      appear(fillp(sec,M(cx-6,L2.y+12)+'q6,-7 12,0Z','f-t3'),dl+.2);
      appear(path(sec,line(cx,L2.y,cx,L2.y+12)+M(cx-6,L2.y+12)+'q6,-7 12,0'+rect(L2.x+3,L2.y+L2.h*.45,7,9),{'class':'ink hair'}),dl+.2);
    }else if(sc===7){
      /* kletka s ptackem */
      appear(fillp(sec,M(cx-6,sill-1)+'v-10q0,-8 6,-9q6,1 6,9v10Z','f-bg'),dl+.2);
      appear(path(sec,M(cx-3,sill-1)+'v-17M'+pt(cx+3,sill-1)+'v-17'+line(cx,sill-19,cx,sill-23)+circ(cx,sill-24.5,1.4)+line(cx-6,sill-6,cx+6,sill-6)+circ(cx,sill-9,1.8),{'class':'ink hair'}),dl+.2);
    }else if(sc===3){
      appear(fillp(sec,M(cx-4,sill)+'l1.5,-8h5l1.5,8Z','f-bg'),dl+.2);
      appear(path(sec,plantD(cx,sill-8,r,1.15),{'class':'ink hair'}),dl+.2);
    }else if(sc===4){
      appear(fillp(sec,M(cx-5,sill-14)+'l10,0l3,-9l-16,0Z','f-goldl',{opacity:.9}),dl+.2,.9);
      appear(fillp(sec,line(cx,sill-14,cx,sill)+line(cx-5,sill,cx+5,sill),'',{stroke:'var(--bg)','stroke-width':2.2}),dl+.2);
    }else if(sc===5){
      var bl='';for(var yy2=L2.y+3;yy2<L2.y+L2.h*.6;yy2+=4.5)bl+=line(L2.x+1,yy2,L2.x+L2.w-1,yy2);
      appear(path(sec,bl,{'class':'ink hair',opacity:.8}),dl+.2,.8);
    }else if(sc===6){
      var py=sill-4;appear(fillp(sec,circ(cx+2,py-22,5.2)+M(cx-8,sill)+'Q'+pt(cx-8,py-14)+' '+pt(cx+2,py-15)+'Q'+pt(cx+12,py-14)+' '+pt(cx+12,sill)+'Z','f-bg'),dl+.2);
    }
  });
  /* okna, ktera se obcas rozsviti, televize, prochazejici postava */
  var nbk=S.blink==null?2:S.blink,qq,be,ii;
  for(ii=0;ii<nbk&&dk.length;ii++){qq=dk.splice(Math.floor(r2()*dk.length),1)[0];
    be=fillp(sec,rect(qq[0],qq[1],qq[2],qq[3]),'',{fill:'url(#gWin)',opacity:0});
    amb.blink.push({e:be,s:sec,f:.00028+r2()*.0003,ph:r2()*6.28,max:.85,end:CTX.end,tv:false})}
  if(S.tv&&dk.length){qq=dk.splice(Math.floor(r2()*dk.length),1)[0];
    be=fillp(sec,rect(qq[0],qq[1],qq[2],qq[3]),'f-goldl',{opacity:0});
    amb.blink.push({e:be,s:sec,f:0,ph:r2()*100,max:.6,end:CTX.end,tv:true})}
  if(S.walker&&lit.length){var LW=lit[Math.min(lit.length-1,S.walker-1)],cid='st_cw'+(amb.cw++),cp=document.createElementNS(ST.NS,'clipPath');
    cp.setAttribute('id',cid);cp.innerHTML='<rect x="'+n(LW.x)+'" y="'+n(LW.y)+'" width="'+n(LW.w)+'" height="'+n(LW.h)+'"/>';ST.defs.appendChild(cp);
    var wg=el('g',{'clip-path':'url(#'+cid+')'},sec),pp=fillp(wg,circ(0,-30,5.2)+M(-9,0)+'Q'+pt(-10,-20)+' '+pt(0,-23)+'Q'+pt(10,-20)+' '+pt(9,0)+'Z','f-bg');
    amb.walk.push({e:pp,s:sec,x0:LW.x,w:LW.w,y:LW.sill-1,per:9000+r2()*5000,end:CTX.end});pp.setAttribute('opacity',0)}
  ink(sec,fr,'thin',dl+.15);
  ink(sec,mu,'hair',dl+.18);
  ink(sec,sl,'hair',dl+.2);
  ink(sec,li,'hair',dl+.22);
  /* tabulky: cislo popisne (cervena = zlata vypln) a orientacni (modra = sraf), uliční cedulka */
  var plx=x+17,pl1=ST.rect(plx,ys-72,13,8.5,3.5),pl2=rect(plx+1.5,ys-60,10,6);
  fillp(sec,pl1,'f-gold',{opacity:.45});fillp(sec,pl2,'',{fill:'url(#hatchFine)'});
  ink(sec,pl1+pl2+line(plx+3.5,ys-68,plx+9.5,ys-68)+line(plx+3,ys-57,plx+10,ys-57),'hair',dl+.25);
  if(S.cedulka){var cdx=x+w-46,cdy=ys-76;fillp(sec,rect(cdx,cdy,30,11),'f-t3');
    ink(sec,rect(cdx,cdy,30,11)+rect(cdx+1.5,cdy+1.5,27,8)+line(cdx+4,cdy+5,cdx+26,cdy+5)+line(cdx+8,cdy+8,cdx+22,cdy+8)+line(cdx+8,cdy+11,cdx+8,cdy+14)+line(cdx+22,cdy+11,cdx+22,cdy+14),'hair',dl+.26)}
  /* balkony */
  if(S.bal)S.bal.forEach(function(f2){
    var yb=ys-(f2-1)*FH;
    var picks=nb>4?[Math.floor(nb/2)-1,Math.floor(nb/2)]:[Math.floor(nb/2)];
    var x0b=cxs[picks[0]]-ww/2-14,x1b=cxs[picks[picks.length-1]]+ww/2+14,yp=yb-8;
    fillp(sec,rect(x0b,yp,x1b-x0b,5),'f-t3');
    ink(sec,rect(x0b,yp,x1b-x0b,5)+line(x0b+6,yp+5,x0b+6,yp+14)+'M'+pt(x0b+6,yp+14)+'q4,-2 8,-9'+'M'+pt(x1b-6,yp+14)+'q-4,-2 -8,-9'+line(x1b-6,yp+5,x1b-6,yp+14),'thin',dl+.25);
    var rl=line(x0b+2,yp-26,x1b-2,yp-26)+line(x0b+2,yp-4,x1b-2,yp-4)+line(x0b+2,yp-26,x0b+2,yp)+line(x1b-2,yp-26,x1b-2,yp),xp;
    for(xp=x0b+8;xp<x1b-4;xp+=6)rl+=line(xp,yp-26,xp,yp-4);
    for(xp=x0b+14;xp<x1b-10;xp+=18)rl+=circ(xp+3,yp-15,3.5);
    ink(sec,rl,'hair',dl+.28);
    var pots='',pl='';
    for(xp=x0b+10;xp<x1b-8;xp+=21+r()*6){pots+=M(xp,yp-26)+'l1.5,-7h9l1.5,7Z';pl+=plantD(xp+6,yp-33,r,1.3)+dot(xp+3+r()*6,yp-40-r()*5)}
    fillp(sec,pots,'f-t3');ink(sec,pots,'hair',dl+.3);
    ink(sec,pl,'hair',dl+.32);
    if(S.balloon===f2){var bx5=x1b-8,by5=yp-27,bl2=el('g',{},sec),bpath=M(bx5,by5)+'q-3,-18 3,-30M'+pt(bx5,by5)+'q4,-14 -1,-30';
      path(bl2,M(bx5,by5)+'C'+pt(bx5-4,by5-20)+' '+pt(bx5+4,by5-34)+' '+pt(bx5+1,by5-52),{'class':'ink hair'});
      var be2=ST.ellipse(bx5+1,by5-65,10,13);fillp(bl2,be2,'f-goldl',{opacity:.55});
      path(bl2,be2+M(bx5+1,by5-52)+'l-2.4,3.4h5.6Z'+M(bx5-4,by5-72)+'q1,-5 5,-7',{'class':'ink thin goldl'});
      amb.balloon.push({g:bl2,x:bx5,y:by5,s:sec,end:CTX.end})}
    if(S.sock===f2){var sx0=x0b+30,sy0=yp-26,sk=M(sx0-5,sy0)+'h10M'+pt(sx0,sy0)+'v8l-.1,.1M'+pt(sx0-4,sy0+2)+'v13q0,7 -7,8q-6,1 -6,-4q0,-3 4,-3v-14Z'+M(sx0-9,sy0+9)+'h5'+M(sx0-9,sy0+12)+'h5'+rect(sx0-6,sy0-4,3,6);fillp(sec,M(sx0-4,sy0+2)+'v13q0,7 -7,8q-6,1 -6,-4q0,-3 4,-3v-14Z','f-goldl',{opacity:.55});ink(sec,sk,'hair',dl+.34)}
  });
  /* hlavni rimsa */
  var cn=rect(x-6,top,w+12,9)+line(x-6,top+9,x+w+6,top+9);
  for(xx=x+3;xx<x+w;xx+=11)cn+=M(xx,top+9)+'l0,6l3,0l0,-6';
  fillp(sec,rect(x-6,top,w+12,9),'f-'+wall);
  ink(sec,cn,'thin',dl+.3);
  /* strecha */
  var ym=top,roof=S.roof||'mansard';
  if(roof==='mansard'){
    var rh=58,rp=poly([[x-4,ym],[x+12,ym-rh],[x+w-12,ym-rh],[x+w+4,ym]],true);
    ink(sec,rp,'thin t1',dl+.32);
    fillp(sec,rp,'',{fill:'url(#st_roof)'});
    ink(sec,line(x+12,ym-rh-3,x+w-12,ym-rh-3),'hair',dl+.34);
    var nd=Math.max(2,Math.round(w/105)),dg='',dgl='',dfr='';
    for(i=0;i<nd;i++){
      var dx=x+w*(i+.5)/nd,dy=ym-14;
      dg+=rect(dx-11,dy-30,22,30)+poly([[dx-15,dy-30],[dx,dy-46],[dx+15,dy-30]]);
      dfr+=rect(dx-8,dy-26,16,23)+line(dx,dy-26,dx,dy-3)+line(dx-8,dy-15,dx+8,dy-15)+poly([[dx-11,dy-31],[dx,dy-42],[dx+11,dy-31]])+line(dx,dy-46,dx,dy-55)+circ(dx,dy-57,1.6)+circ(dx,dy-35,2)+rect(dx-12,dy-3,24,3)+line(dx-11,dy-30,dx-13,dy-24)+line(dx+11,dy-30,dx+13,dy-24)+line(dx-4,dy-26,dx-4,dy-15)+line(dx+4,dy-26,dx+4,dy-15)+line(dx-8,dy-21,dx+8,dy-21);
      if(r()<.4)dgl+=rect(dx-8,dy-26,16,23);
    }
    fillp(sec,dg,'f-t1');
    if(dgl)appear(fillp(sec,dgl,'f-gold',{opacity:.42}),dl+.34,.42);
    S.ridge=ym-rh-3;
    ink(sec,dg,'thin',dl+.36);ink(sec,dfr,'hair',dl+.38);
    var ch='',ant='',pots2='',nc=1+Math.floor(r()*2);
    for(i=0;i<nc;i++){var chx=x+30+r()*(w-70);ch+=rect(chx,ym-rh-26,12,32)+rect(chx-2,ym-rh-30,16,5);pots2+=rect(chx+1.5,ym-rh-38,3.8,8)+rect(chx+6.7,ym-rh-38,3.8,8)+line(chx+1,ym-rh-38,chx+11,ym-rh-38);
      smk.push([chx+6,ym-rh-32]);
      if(r()<.6){var ax=chx+6,ay=ym-rh-30;ant+=line(ax,ay,ax,ay-30)+line(ax-6,ay-26,ax+6,ay-26)+line(ax-5,ay-20,ax+5,ay-20)+line(ax-4,ay-14,ax+4,ay-14)+line(ax-7,ay-30,ax+7,ay-30)}}
    fillp(sec,ch,'f-t2');fillp(sec,ch,'',{fill:'url(#st_brick)',opacity:1});ink(sec,ch,'thin',dl+.4);if(ant)ink(sec,ant,'hair',dl+.42);
    if(pots2){fillp(sec,pots2,'f-t1');ink(sec,pots2,'hair',dl+.42)}
  }else if(roof==='gable'){
    var cxg=x+w/2,gw=w*.46,rh2=34,rp2=poly([[x-4,ym],[x+16,ym-rh2],[x+w-16,ym-rh2],[x+w+4,ym]],true);
    ink(sec,rp2,'thin t1',dl+.32);
    fillp(sec,rp2,'',{fill:'url(#st_roof)'});
    var gd=M(cxg-gw/2,ym)+'V'+n(ym-34)+'q0,-8 8,-8q8,0 8,-14q0,-12 '+n(gw/2-16)+',-22q'+n(gw/2-16)+',10 '+n(gw/2-16)+',22q0,6 8,14q8,0 8,8V'+n(ym)+'Z';
    ink(sec,gd,'thin '+wall,dl+.36);
    ink(sec,circ(cxg,ym-38,9)+circ(cxg,ym-38,5.5)+line(cxg-9,ym-38,cxg+9,ym-38)+line(cxg,ym-47,cxg,ym-29)+M(cxg-gw/2+6,ym-14)+'h'+n(gw-12),'hair',dl+.38);
    ink(sec,line(cxg,ym-80,cxg,ym-90)+circ(cxg,ym-93,3),'thin',dl+.4);
    var ch2=rect(x+24,ym-rh2-24,12,30)+rect(x+22,ym-rh2-28,16,5)+rect(x+w-40,ym-rh2-22,12,28)+rect(x+w-42,ym-rh2-26,16,5);
    fillp(sec,ch2,'f-t2');ink(sec,ch2,'thin',dl+.4);smk.push([x+30,ym-rh2-30]);
  }else{
    var by=ym-18,bd=rect(x-2,by,w+4,4)+rect(x-2,ym-6,w+4,6),pp='';
    for(xx=x+4;xx<x+w-2;xx+=8)pp+=M(xx,by+4)+'v'+(ym-6-by-4)+M(xx-1.6,by+8)+'h3.2';
    ink(sec,bd,'thin '+wall,dl+.32);ink(sec,pp,'hair',dl+.34);
    for(i=0;i<3;i++){var ux=x+10+i*(w-30)/2;ink(sec,M(ux,by)+'l0,-8l-3,-5h12l-3,5l0,8Z'+line(ux-3,by-14,ux+9,by-14),'hair',dl+.36)}
  }
  if(S.angel&&S.ridge!=null){var ax2=x+S.angel,ay2=S.ridge,an=M(ax2-6,ay2)+'h12v-4h-12Z'+M(ax2-5,ay2-4)+'L'+pt(ax2-4,ay2-20)+'Q'+pt(ax2,ay2-23)+' '+pt(ax2+4,ay2-20)+'L'+pt(ax2+5,ay2-4)+circ(ax2,ay2-27,3.6)+'M'+pt(ax2-4,ay2-19)+'Q'+pt(ax2-17,ay2-30)+' '+pt(ax2-14,ay2-40)+'Q'+pt(ax2-9,ay2-32)+' '+pt(ax2-3,ay2-25)+'M'+pt(ax2+4,ay2-19)+'Q'+pt(ax2+17,ay2-30)+' '+pt(ax2+14,ay2-40)+'Q'+pt(ax2+9,ay2-32)+' '+pt(ax2+3,ay2-25)+'M'+pt(ax2+4,ay2-18)+'L'+pt(ax2+9,ay2-26)+'l3,-3';
    fillp(sec,an,'f-t3');ink(sec,an,'hair',dl+.4);ink(sec,ST.ellipse(ax2,ay2-33,4.5,1.3),'hair goldl',dl+.42)}
  smk.forEach(function(q,ii2){var pf=[];for(var u=0;u<3;u++)pf.push(el('circle',{cx:q[0],cy:q[1],r:4,'class':'ink hair',opacity:0},sec));
    amb.smoke.push({c:pf,x:q[0],y:q[1],s:sec,ph:ii2*.37+r2()*3,end:CTX.end})});
  var dpx=x+w-9,dp=line(dpx,top+12,dpx,gy)+line(dpx+3,top+12,dpx+3,gy)+M(dpx-5,top+9)+'l2,9h9l2,-9'+rect(dpx-2,top+18,7,3)+M(dpx,gy-14)+'q0,9 -8,11M'+pt(dpx+3,gy-14)+'q0,13 -11,15'+line(dpx-8,gy-3,dpx-8,gy);
  for(i=top+44;i<gy-24;i+=38)dp+=rect(dpx-2,i,7,3)+line(dpx-2,i+3,dpx-4,i+7);
  ink(sec,dp,'hair',dl+.3);
  var rdx=x+6,rt=roof==='mansard'?ym-61:(roof==='gable'?ym-34:ym-18),rd2=M(x+16,rt-22)+'V'+n(rt)+'L'+pt(rdx,ym)+'V'+n(gy+2)+circ(x+16,rt-24,1.5)+line(x+13,rt-14,x+19,rt-14);
  for(i=top+26;i<gy;i+=26)rd2+=M(rdx-2,i)+'h4';
  rd2+=line(rdx-4,gy+2,rdx+4,gy+2);
  ink(sec,rd2,'hair',dl+.3);
  if(S.pigeons)S.pigeons.forEach(function(px,k){appear(path(sec,bird(x+px,top-.5,.9,k%2?1:-1),{'class':'ink hair',fill:'var(--bg)'}),dl+.4)});
  shop(sec,S,ys,gy,r,dl,wall);
  return sec;
}
function label(p,x,y,txt,size,op,dl){
  var t=el('text',{x:x,y:y,'class':'label','text-anchor':'middle','font-size':size,'letter-spacing':n(size*.16)},p);
  t.textContent=txt;t.style.fontFamily='var(--font-display)';t.style.fontWeight=600;
  t.setAttribute('opacity',op==null?.95:op);
  if(CTX.end)ST.fade(t,11.5+mn(dl||0,1)*.7,12.3,op==null?.95:op);
  return t;
}
function shop(g,S,ys,gy,r,dl,wall){
  var x=S.x,w=S.w,kind=S.shop,ix0=x+22,ix1=x+w-22,iw=ix1-ix0,i;
  var yF=ys+34,yb=gy-22,sy=ys+8;
  ink(g,rect(x+14,sy,w-28,22),'thin t1',dl+.4);
  function win(x0,w0,glass){
    fillp(g,rect(x0,yF,w0,yb-yF),'',{fill:glass||'url(#st_glass)'});
    ink(g,rect(x0-3,yF-3,w0+6,yb-yF+6)+rect(x0,yF,w0,yb-yF),'thin',dl+.45);
    fillp(g,rect(x0-3,yb,w0+6,gy-yb),'f-'+wall);
    ink(g,rect(x0-3,yb,w0+6,gy-yb)+line(x0-3,yb+9,x0+w0+3,yb+9),'hair',dl+.45);
    var tr='',gx2;tr+=line(x0,yF+14,x0+w0,yF+14);
    for(gx2=x0+w0/Math.max(2,Math.round(w0/46));gx2<x0+w0-6;gx2+=w0/Math.max(2,Math.round(w0/46)))tr+=line(gx2,yF,gx2,yb);
    ink(g,tr,'hair',dl+.46);
    path(g,line(x0+8,yb-4,x0+8+Math.min(w0*.3,34),yF+18)+line(x0+16,yb-4,x0+16+Math.min(w0*.3,34),yF+18)+line(x0+w0-30,yF+16,x0+w0-12,yF+4)+line(x0+w0-22,yF+16,x0+w0-8,yF+7),{'class':'ink hair goldl',opacity:.28});
    ink(g,rect(x0-2,yF-9,w0+4,6)+M(x0,yF-9)+'v-4M'+pt(x0+w0,yF-9)+'v-4','hair',dl+.46);
  }
  function door(x0,w0,glass){
    ink(g,rect(x0,yF-4,w0,gy-yF+4)+rect(x0+4,yF,w0-8,gy-yF-6)+line(x0+w0/2,yF,x0+w0/2,gy-6),'thin t1',dl+.5);
    fillp(g,rect(x0+4,yF,w0-8,gy-yF-6),'',{fill:glass||'url(#gWin)',opacity:.6});
    ink(g,line(x0+4,yF+14,x0+w0-4,yF+14)+line(x0+w0/2,yF+14,x0+w0/2,gy-6),'hair',dl+.52);
    ink(g,rect(x0-3,gy-6,w0+6,6),'hair',dl+.5);
    fillp(g,rect(x0+4,gy-62,w0-8,56),'',{fill:'url(#st_plank)'});
    ink(g,rect(x0+8,gy-58,w0/2-10,46)+rect(x0+w0/2+2,gy-58,w0/2-10,46)+rect(x0+8,gy-20,w0-16,8)+line(x0+w0/2-5,yF+22,x0+w0/2-5,yF+34)+line(x0+w0/2+5,yF+22,x0+w0/2+5,yF+34)+circ(x0+w0/2-5,yF+42,1.6)+circ(x0+w0/2+5,yF+42,1.6)+rect(x0+w0/2+8,yF+50,2.6,9)+rect(x0+w0/2+3.5,yF+60,8,2.4)+rect(x0-6,gy-3,w0+12,3)+line(x0-9,gy,x0+w0+9,gy),'hair',dl+.52);
    path(g,M(x0+w0-7,yF+8)+'h3v12h-3Z',{'class':'ink hair goldl',opacity:.7});
  }
  var sx,yy,bx;
  if(kind==='bakery'){
    var wW=iw*.62;win(ix0,wW,'url(#gWin)');
    door(ix0+wW+16,iw-wW-16);
    var sh='',lo='',lo2='';
    for(i=1;i<=2;i++){yy=yF+(yb-yF)*i/3;sh+=line(ix0,yy,ix0+wW,yy)}
    ink(g,sh,'hair',dl+.5);
    for(i=0;i<3;i++){yy=yF+(yb-yF)*(i+1)/3;for(bx=ix0+10;bx<ix0+wW-10;bx+=15+r()*8){
      lo+=ST.ellipse(bx,yy-4,6.5,3.4);lo2+=M(bx-2,yy-6)+'l1.5,-1.5M'+pt(bx+1,yy-6.5)+'l1.5,-1.5'}}
    fillp(g,lo,'f-t3',{opacity:.9});
    ink(g,lo+lo2,'hair',dl+.55);
    awning(g,ix0-4,ix0+wW+4,ys+31,22,dl+.5);
    label(g,x+w/2+(S.signDx||0),sy+16,'PEKAŘSTVÍ',17,.95,dl);
    var tg2='';for(i=0;i<3;i++){yy=yF+(yb-yF)*(i+1)/3;tg2+=rect(ix0+wW-18,yy-7,10,5)+line(ix0+wW-16,yy-4.5,ix0+wW-10,yy-4.5)}
    ink(g,tg2,'hair',dl+.56);
    var kb=ix0+wW-1,kh='M'+pt(kb,gy)+'L'+pt(kb+6,gy-42)+L(kb+24,gy-42)+L(kb+30,gy)+'Z';
    fillp(g,kh,'f-t1');ink(g,kh,'thin',dl+.6);ink(g,rect(kb+8,gy-38,14,24)+line(kb+9,gy-33,kb+21,gy-33)+line(kb+9,gy-28,kb+19,gy-28)+line(kb+9,gy-23,kb+21,gy-23)+line(kb+3,gy-3,kb+27,gy-3),'hair',dl+.62);
    var ear='';[x+30,x+w-30].forEach(function(ex){ear+=line(ex,sy+4,ex,sy+19);for(var k=0;k<4;k++)ear+=M(ex,sy+16-k*3.6)+'q-4,-1 -5,-4M'+pt(ex,sy+16-k*3.6)+'q4,-1 5,-4'});
    ink(g,ear,'hair gold',dl+.5);
  }else if(kind==='pub'){
    door(ix0+iw*.55,iw*.28);
    var wl=iw*.5;win(ix0,wl,'url(#gWin)');
    var cu='';for(i=0;i<5;i++){var cxx=ix0+4+i*(wl-8)/4.2;cu+=M(cxx,yF)+'q-5,'+n((yb-yF)*.25)+' 0,'+n((yb-yF)*.5)}
    ink(g,cu,'hair',dl+.5);
    fillp(g,rect(ix0,yF+(yb-yF)*.5,wl,(yb-yF)*.5),'',{fill:'url(#hatchX)',opacity:.7});
    ink(g,M(ix0+wl*.5-5,yF+(yb-yF)*.5-12)+'l0,12h10l0,-12Z'+M(ix0+wl*.5+5,yF+(yb-yF)*.5-8)+'q5,0 5,4t-5,4','hair',dl+.6);
    label(g,x+w/2-20,sy+16,'HOSPODA',19,.95,dl);
    var neT=ST.rect(ix0+wl/2-22,yF+10,44,20,9),ne=el('path',{d:neT,'class':'ink thin gold',opacity:.9},g),ne2=el('text',{x:ix0+wl/2,y:yF+24.5,'class':'label','text-anchor':'middle','font-size':11,'letter-spacing':2.4},g);ne2.textContent='PIVO';
    amb.neon.push({e:[ne,ne2],s:g,end:CTX.end,ph:r()*50});
    var mg='';for(i=0;i<4;i++){var mxx=ix0+10+i*(wl-26)/3.2;mg+=rect(mxx,yb-12,8,10)+M(mxx+8,yb-9)+'q4,0 4,3.5t-4,3.5'+M(mxx,yb-12)+'q4,-3 8,0'}
    fillp(g,mg,'f-t3',{opacity:.9});ink(g,mg,'hair',dl+.6);
    var lx=x+w-18;
    ink(g,line(lx,ys+34,lx+16,ys+34)+M(lx+16,ys+34)+'v8'+rect(lx+10,ys+42,12,16)+line(lx+10,ys+50,lx+22,ys+50)+line(lx+16,ys+58,lx+16,ys+62),'thin',dl+.6);
    fillp(g,rect(lx+10,ys+42,12,16),'f-gold',{opacity:.6});
    appear(el('circle',{cx:lx+16,cy:ys+50,r:46,fill:'url(#gGlow)',opacity:.75},g),dl+.6,.75);
    ink(g,circ(lx-4,ys+90,10)+circ(lx-4,ys+90,7)+line(lx-4,ys+50,lx-4,ys+80)+line(lx-4,ys+90,lx-4,ys+96)+rect(lx-10,ys+88,12,8),'hair',dl+.6);
  }else if(kind==='grocery'){
    var wg=iw*.7;win(ix0,wg,'url(#gWin)');
    door(ix0+wg+14,iw-wg-14);
    var sh2='',bx2='';
    for(i=1;i<=3;i++){var yy2=yF+(yb-yF)*i/4;sh2+=line(ix0,yy2,ix0+wg,yy2);
      for(var bxx=ix0+6;bxx<ix0+wg-14;bxx+=11+r()*9){var bh=7+r()*8,bwid=6+r()*7;bx2+=rect(bxx,yy2-bh,bwid,bh);bxx+=bwid-8}}
    ink(g,sh2,'hair',dl+.5);ink(g,bx2,'hair',dl+.55);
    fillp(g,bx2,'f-t1',{opacity:.55});
    label(g,x+w/2+(S.signDx||0),sy+16,'VEČERKA',19,.95,dl);
    var cx0=ix0+wg-48,cr=rect(cx0,yb-16,36,16)+rect(cx0+2,yb-32,32,16),slt='',frt='';
    fillp(g,cr,'f-t3');
    for(i=0;i<2;i++){slt+=line(cx0+(i?2:0),yb-5-i*16,cx0+(i?34:36),yb-5-i*16);for(var q4=0;q4<4;q4++)frt+=circ(cx0+6+q4*8+i*2,yb-19-i*16+(q4%2),3.2)}
    fillp(g,frt,'f-bg');ink(g,cr+slt,'hair',dl+.6);ink(g,frt,'hair',dl+.62);
    ink(g,ST.rect(ix0+wg+16,ys+34,iw-wg-18,14,5),'thin gold',dl+.6);
    var nt=el('text',{x:ix0+wg+16+(iw-wg-18)/2,y:ys+44.5,'class':'label','text-anchor':'middle','font-size':8,'letter-spacing':1},g);nt.textContent='NONSTOP';
    if(CTX.end)ST.fade(nt,11.7,12.3,1);
  }else if(kind==='kiosk'){
    var wk=iw*.5;win(ix0+iw*.05,wk,'url(#gWin)');
    door(ix0+iw*.62,iw*.3);
    var nv='',nv2='';
    for(i=0;i<3;i++)for(var j=0;j<5;j++){var nx=ix0+iw*.05+8+j*(wk-16)/5,ny=yF+10+i*20,nw=(wk-16)/5-3;nv+=rect(nx,ny,nw,17);nv2+=line(nx+2,ny+4,nx+nw-2,ny+4)+line(nx+2,ny+8,nx+nw-5,ny+8)+rect(nx+2,ny+10,nw-4,4)}
    fillp(g,nv,'f-t3',{opacity:.85});ink(g,nv+nv2,'hair',dl+.55);
    label(g,x+w/2,sy+16,'TRAFIKA',19,.95,dl);
    var tsx=x+w-14,tsy=ys+50;
    ink(g,line(tsx+10,tsy-6,tsx,tsy-6)+circ(tsx-1,tsy+3,8)+circ(tsx-1,tsy+3,6)+line(tsx+10,tsy-10,tsx+10,tsy+6),'hair gold',dl+.6);
    var tt=el('text',{x:tsx-1,y:tsy+6.2,'class':'label','text-anchor':'middle','font-size':9},g);tt.textContent='T';tt.style.fontFamily='var(--font-display)';
    if(CTX.end)ST.fade(tt,11.7,12.3,1);
    awning(g,ix0+iw*.05-6,ix0+iw*.05+wk+6,ys+31,18,dl+.5);
  }else if(kind==='flowers'){
    var wf=iw*.58;win(ix0,wf,'url(#gWin)');door(ix0+wf+16,iw-wf-16);
    var fl='',fd='';
    for(i=0;i<9;i++){var fx=ix0+10+i*(wf-20)/8,fy=yb-4-(i%3)*3;fl+=M(fx,yb)+'q'+n((r()-.5)*8)+',-24 '+n((r()-.5)*10)+','+n(-26-r()*30);fd+=circ(fx+(r()-.5)*8,fy-26-r()*28,3.5)}
    ink(g,fl+fd,'hair',dl+.55);
    label(g,x+w/2,sy+16,'KVĚTINY',18,.95,dl);
    var bk='',bkb='',bkf='',bst='',bhd='';
    for(i=0;i<3;i++){var bx3=ix0+wf*.1+i*wf*.32;
      bk+=M(bx3-9,gy)+'L'+pt(bx3-7,gy-16)+'h14L'+pt(bx3+9,gy)+'Z';bkb+=line(bx3-8.4,gy-9,bx3+8.4,gy-9);
      bkf+=ST.ellipse(bx3,gy-26,12,11);
      for(var q5=0;q5<6;q5++){var fx2=bx3-9+q5*3.6+(r()-.5)*2,fy2=gy-23-r()*13;bst+=line(bx3-6+q5*2.4,gy-16,fx2,fy2);bhd+=circ(fx2,fy2,2.3)}}
    fillp(g,bkf,'f-t1');fillp(g,bk,'f-t2');ink(g,bk+bkb,'thin',dl+.6);ink(g,bst,'hair',dl+.62);fillp(g,bhd,'f-bg');ink(g,bhd,'hair',dl+.64);
    awning(g,ix0-4,ix0+wf+4,ys+31,20,dl+.5);
  }else if(kind==='passage'){
    var pw=iw*.42,pxx=ix0+iw*.1;
    ink(g,arch(pxx,yF-14,pw,gy-yF+14),'thin t1',dl+.4);
    fillp(g,arch(pxx+5,yF-9,pw-10,gy-yF+9),'',{fill:'url(#hatchV)',opacity:.9});
    fillp(g,arch(pxx+9,yF-5,pw-18,gy-yF+5),'f-bg');
    appear(el('ellipse',{cx:pxx+pw/2,cy:gy-40,rx:pw*.34,ry:34,fill:'url(#gWin)',opacity:.55},g),dl+.5,.55);
    ink(g,arch(pxx+9,yF-5,pw-18,gy-yF+5)+M(pxx+pw/2,yF-5)+'v14M'+pt(pxx+pw/2-6,yF+5)+'l6,6l6,-6','hair',dl+.5);
    door(ix0+iw*.62,iw*.3);
    label(g,ix0+iw*.62+iw*.15,ys+25,'č. '+(2+Math.floor(r()*40)*2),7,.9,dl);
    var mb='';for(i=0;i<2;i++)for(var j2=0;j2<3;j2++)mb+=rect(pxx+pw+4+j2*6,yF+i*8+14,5,6.5);
    ink(g,mb,'hair',dl+.55);ink(g,line(pxx+3,yF+10,pxx+3,gy)+line(pxx+pw-3,yF+10,pxx+pw-3,gy),'hair faint',dl+.5);
  }else{
    door(ix0+iw*.12,iw*.28);door(ix0+iw*.6,iw*.28);
  }
  ink(g,M(x+4,gy-3)+'h'+n(w-8),'hair',dl+.6);
}

/* ================= ULICE V HLAVNI ROVINE (back) ================= */
var glows=[];
function ground(g,xa,xb,dl,seed){
  var r=RNG(seed),W=xb-xa,i,d;
  var s=sect(g,xa,xb);
  /* vozovka s tramvajovymi kolejemi */
  fillp(s,rect(xa,660,W,26),'f-t1');
  fillp(s,rect(xa,660,W,26),'',{fill:'url(#st_sett)',opacity:.75});
  fillp(s,rect(xa,660,W,8),'',{fill:'url(#gShadeDown)',opacity:.9});
  d=M(xa,678)+'h'+W+M(xa,681.5)+'h'+W;
  ink(s,d,'thin',dl);
  ink(s,M(xa,671)+'h'+W+M(xa,673.5)+'h'+W,'hair dim',dl+.02);
  d='';for(i=xa+r()*20;i<xb;i+=34)d+=M(i,684)+'h10';
  ink(s,d,'hair faint',dl+.03);
  /* obrubnik u vozovky */
  fillp(s,rect(xa,686,W,8),'f-t3');
  d=M(xa,686)+'h'+W+M(xa,694)+'h'+W;
  for(i=xa+r()*40;i<xb;i+=44+r()*30)d+=M(i,686)+'v8';
  ink(s,d,'thin',dl+.04);
  /* chodnik: kamenny okraj + mozaika */
  fillp(s,rect(xa,694,W,56),'f-t2');
  fillp(s,rect(xa,694,W,9),'',{fill:'url(#st_mosB)',opacity:1});
  fillp(s,rect(xa,741,W,9),'',{fill:'url(#st_mosB)',opacity:1});
  fillp(s,rect(xa,703,W,38),'',{fill:'url(#st_mos)',opacity:1});
  d=M(xa,703)+'h'+W+M(xa,741)+'h'+W;
  for(i=xa+r()*30;i<xb;i+=28+r()*22)d+=M(i,694)+'v9'+M(i+r()*14,741)+'v9';
  ink(s,d,'hair',dl+.06);
  /* vlnovkovy vzor mozaiky */
  d='';var yw=[714,722,730];
  yw.forEach(function(y,k){d+=M(xa+(k*9)%24,y);for(var x=xa+(k*9)%24;x<xb;x+=24)d+='q6,-4.5 12,0t12,0'});
  ink(s,d,'hair faint',dl+.08);
  /* skvrny, kamínky: teckovani */
  d='';for(i=0;i<W/6;i++)d+=dot(xa+r()*W,696+r()*52);
  dots(s,d,1,.35);
  /* kasle, pokryvka, listi */
  d='';for(i=0;i<W/55;i++){var lx=xa+r()*W,ly=700+r()*40,a=r()*6.28;d+=M(lx,ly)+'q'+n(cos(a)*4)+','+n(sin(a)*3)+' '+n(cos(a)*7)+','+n(sin(a)*5)+'q-3,-1 '+n(-cos(a)*7)+','+n(-sin(a)*5)}
  ink(s,d,'hair',dl+.1);
  /* spodni obrubnik */
  fillp(s,rect(xa,750,W,8),'f-t3');
  fillp(s,rect(xa,758,W,10),'f-t1');
  d=M(xa,750)+'h'+W+M(xa,758)+'h'+W+M(xa,768)+'h'+W;
  for(i=xa+r()*50;i<xb;i+=60+r()*34)d+=M(i,758)+'v10'+M(i+4,750)+'v8';
  ink(s,d,'thin',dl+.12);
  fillp(s,rect(xa,758,W,10),'',{fill:'url(#hatchFine)',opacity:.9});
  /* vozovka: kocici hlavy, spojky kolejnic, zaplaty asfaltu */
  fillp(s,rect(xa,660,W,26),'',{fill:'url(#st_cob)',opacity:.55});
  d='';for(i=xa+40+r()*40;i<xb;i+=96+r()*30)d+=rect(i,676.6,16,6.2)+dot(i+3,679.8)+dot(i+13,679.8);
  d+=M(xa,676.6)+'h'+W;
  ink(s,d,'hair',dl+.14);
  d='';for(i=xa+120+r()*140;i<xb;i+=420+r()*200){var pw=40+r()*50;d+=M(i,662)+'q'+n(pw*.3)+',-2 '+n(pw*.6)+',1q'+n(pw*.4)+',4 '+n(pw*.4)+',9q-'+n(pw*.5)+',3 -'+n(pw)+',-1Z'}
  ink(s,d,'hair faint',dl+.15);
  /* vpusti v obrubniku, praskliny, travicky ve spárách, puntíky po zmuchlané reklame */
  d='';for(i=xa+70+r()*120;i<xb;i+=330+r()*170){d+=rect(i,686.6,26,7)+line(i+4,686.6,i+4,693.6)+line(i+8,686.6,i+8,693.6)+line(i+12,686.6,i+12,693.6)+line(i+16,686.6,i+16,693.6)+line(i+20,686.6,i+20,693.6)}
  ink(s,d,'hair',dl+.16);
  d='';for(i=xa+60+r()*80;i<xb;i+=240+r()*200){var cy2=704+r()*30;d+=M(i,cy2)+'l5,3l-2,5l6,4l3,-3'+M(i+5,cy2+3)+'l7,-3'}
  ink(s,d,'hair faint',dl+.17);
  d='';for(i=xa+20+r()*50;i<xb;i+=74+r()*90){d+=M(i,694)+'l-1.5,-5M'+pt(i+1,694)+'l1,-6M'+pt(i+2.4,694)+'l2.6,-4'}
  ink(s,d,'hair',dl+.18);
  /* kaluze na chodniku s odrazem */
  d='';for(i=xa+150+r()*160;i<xb;i+=470+r()*240){var py=716+r()*18,pw2=22+r()*20;d+=ST.ellipse(i,py,pw2,3.2)+M(i-pw2*.6,py-.4)+'h'+n(pw2*.7)+M(i-pw2*.3,py+1.4)+'h'+n(pw2*.8)}
  ink(s,d,'hair goldl',dl+.19);
  d='';for(i=0;i<W/90;i++)d+=dot(xa+r()*W,698+r()*45);
  dots(s,d,2.2,.5);
  return s;
}
/* sem tam skryty detail na dlazbe: skakaci panak, mince, slimak */
function groundEggs(g,xa,xb,dl,hop,coin,snail){
  var s=sect(g,xa,xb),d='',i;
  var hy=736;
  if(hop!=null){d=rect(hop,hy,13,6)+rect(hop,hy-6,13,6)+rect(hop-7,hy-12,13,6)+rect(hop+6,hy-12,13,6)+rect(hop,hy-18,13,6)+rect(hop-7,hy-24,13,6)+rect(hop+6,hy-24,13,6)+rect(hop,hy-30,13,6)+M(hop-4,hy-31)+'a10.5,3.8 0 0 1 21,0';
  d+=M(hop+3,hy-4)+'l4,-2M'+pt(hop+3,hy-9)+'l4,2l2,-4'+M(hop+3,hy-16)+'q3,-3 6,0q0,3 -6,3';
  path(s,d,{'class':'ink hair',opacity:.5})}
  if(coin!=null)path(s,circ(coin,729,2.6)+dot(coin,729),{'class':'ink thin gold',opacity:.9});
  if(snail==null)return;
  /* slimak na obrubniku */
  var sx=snail,sy=745,sn=M(sx-12,sy)+'q-2,-5 4,-5h8q6,-1 6,-6q0,-6 -6,-6q-6,0 -6,6q0,3 3,4'+M(sx+8,sy)+'q4,0 7,-1q3,-2 4,-5l-.6,-4M'+pt(sx+16,sy-9)+'l.8,-3M'+pt(sx+18,sy-8)+'l2.4,-2.6';
  fillp(s,M(sx-12,sy)+'q-2,-5 4,-5h8q6,-1 6,-6q0,-6 -6,-6q-6,0 -6,6q0,3 3,4q-4,2 -6,6Z','f-t3');
  ink(s,sn+circ(sx+.5,sy-12,2)+M(sx+.5,sy-12)+'m-1,0a1,1 0 1,0 2,0','hair',dl+.1);
  path(s,M(sx-14,sy+1)+'h30',{'class':'ink hair faint'});
}
/* vpust a poklop */
function streetDetail(s,x,dl,r){
  /* kanalizacni poklop na chodniku */
  ink(s,ST.ellipse(x,724,24,4.5)+ST.ellipse(x,724,18,3.2)+M(x-16,724)+'h32M'+pt(x,720)+'v8','hair',dl);
  /* vpust */
  ink(s,rect(x+120,760,34,8)+M(x+128,760)+'v8M'+pt(x+136,760)+'v8M'+pt(x+144,760)+'v8','hair',dl);
}

/* ---- tramvaj Tatra T3 (celem doleva), zaklad v (0,0), delka TL, vyska ~ 340 ---- */
function buildTram(g,TL,num,dl,pass){
  var s=el('g',{},g),r=RNG(500+TL),i,x;
  var wheels=[190,262,TL-262,TL-190],yw=-264,hw=122;
  /* podvozek: skrine, kabely, kola */
  var ub='',wd='',hubs='',sp='';
  ub+=rect(330,-44,120,16)+rect(TL*.5-60,-46,150,18)+rect(TL-460,-44,130,16)+M(330,-36)+'h120M'+pt(TL*.5-60,-38)+'h150';
  wheels.forEach(function(cx){wd+=circ(cx,-20,20);hubs+=circ(cx,-20,12)+circ(cx,-20,5);for(var a=0;a<8;a++){var an=a*PI/4+.2;sp+=line(cx+cos(an)*6,-20+sin(an)*6,cx+cos(an)*12,-20+sin(an)*12)}});
  fillp(s,ub,'f-t3');path(s,ub,{'class':'ink hair'});
  fillp(s,wd,'f-bg');path(s,wd,{'class':'ink thin'});path(s,hubs+sp,{'class':'ink hair'});
  /* telo */
  var body=M(0,-44)+'L0,-298'+'Q0,-320 24,-322'+'L'+pt(TL-24,-322)+'Q'+pt(TL,-320)+' '+pt(TL,-298)+'L'+pt(TL,-44)+'Z';
  fillp(s,body,'f-t2');
  /* spodni pas (zastery) */
  fillp(s,rect(0,-120,TL,76),'f-t1');
  fillp(s,rect(0,-120,TL,76),'',{fill:'url(#hatchV)',opacity:.8});
  fillp(s,rect(0,-300,TL,36),'',{fill:'url(#hatchFine)',opacity:.55});
  /* okna a dvere */
  var segs=[['c',130],['w',112],['w',112],['w',112],['d',104],['w',112],['w',112],['w',112],['d',104],['w',112],['w',112],['w',112],['d',104],['w',112],['w',112],['e',46]];
  var tot=0;segs.forEach(function(q){tot+=q[1]});
  var sc=(TL-24)/tot;x=12;
  var glass='',frames='',mul='',seat='',pax='',paxL='',strap='',glare='',doors='',stan='';
  segs.forEach(function(q,k){
    var w=q[1]*sc;
    if(q[0]==='w'){
      glass+=rect(x+5,yw,w-10,hw);frames+=rect(x+2,yw-3,w-4,hw+6)+rect(x+5,yw,w-10,hw)+rect(x+5,yw,w-10,36);
      mul+=line(x+w/2,yw+36,x+w/2,yw+hw)+line(x+w*.15,yw+36,x+w*.15,yw+hw);
      seat+=rect(x+8,yw+hw-34,w-16,26);paxL+=line(x+8,yw+hw-20,x+w-8,yw+hw-20);
      stan+=line(x,yw-3,x,yw+hw+3);
      glare+=line(x+12,yw+30,x+w*.5,yw+4)+line(x+26,yw+44,x+w*.7,yw+4)+line(x+42,yw+54,x+w-12,yw+16);
      var np=r()<(pass==null?.55:pass)?1+(r()<.35?1:0):0;
      for(var j=0;j<np;j++){
        var px=x+w*(.3+r()*.4)+(j?18:0),stand=r()<.4,hy=stand?yw+hw-74:yw+hw-48;
        pax+=circ(px,hy,7.4)+M(px-12,yw+hw-6)+'Q'+pt(px-13,hy+14)+' '+pt(px,hy+11)+'Q'+pt(px+13,hy+14)+' '+pt(px+12,yw+hw-6)+'Z';
        if(stand){strap+=line(px+10,hy+20,px+15,yw+14);}
      }
      for(var sx=x+18;sx<x+w-10;sx+=34)strap+=line(sx,yw+8,sx,yw+24)+circ(sx,yw+29,4);
    }else if(q[0]==='d'){
      var hd=hw+20;
      glass+=rect(x+5,yw-12,w/2-8,hd)+rect(x+w/2+3,yw-12,w/2-8,hd);
      frames+=rect(x+2,yw-15,w-4,hd+30)+rect(x+5,yw-12,w/2-8,hd)+rect(x+w/2+3,yw-12,w/2-8,hd)+rect(x+5,yw+hd-10,w/2-8,60)+rect(x+w/2+3,yw+hd-10,w/2-8,60);
      mul+=line(x+w/2,yw-15,x+w/2,-52)+M(x+w/2-6,yw+hd+10)+'v14M'+pt(x+w/2+6,yw+hd+10)+'v14'+M(x+10,yw+hd+30)+'h'+n(w-20)+rect(x+w*.3,-60,w*.4,8);
      glare+=line(x+12,yw+40,x+w*.4,yw-4);
      var px2=x+w*.28;pax+=circ(px2,yw+hw-56,7.2)+M(px2-12,yw+hw+4)+'Q'+pt(px2-13,yw+hw-32)+' '+pt(px2,yw+hw-36)+'Q'+pt(px2+13,yw+hw-32)+' '+pt(px2+12,yw+hw+4)+'Z';
    }else if(q[0]==='c'){
      glass+=rect(x+6,yw+6,w*.5,hw-6)+rect(x+w*.56,yw+6,w*.38,hw-6);
      frames+=rect(x+3,yw+3,w-8,hw+3)+rect(x+6,yw+6,w*.5,hw-6)+rect(x+w*.56,yw+6,w*.38,hw-6);
      mul+=line(x+w*.3,yw+6,x+w*.1,yw+hw)+M(x+w*.1,yw+hw)+'q'+n(w*.3)+',-30 '+n(w*.42)+',-20';
      /* ridic */
      pax+=circ(x+w*.34,yw+hw-60,8)+M(x+w*.34-14,yw+hw)+'Q'+pt(x+w*.34-15,yw+hw-34)+' '+pt(x+w*.34,yw+hw-38)+'Q'+pt(x+w*.34+15,yw+hw-34)+' '+pt(x+w*.34+14,yw+hw)+'Z';
      glare+=line(x+14,yw+50,x+w*.35,yw+8);
    }else{
      glass+=rect(x+4,yw+6,w-14,hw-6);frames+=rect(x+3,yw+3,w-8,hw+3)+rect(x+4,yw+6,w-14,hw-6);
    }
    x+=w;
  });
  var glG=fillp(s,glass,'',{fill:'url(#gWin)',opacity:.9});
  fillp(s,glass,'',{fill:'url(#st_glass)',opacity:.7});
  fillp(s,seat,'f-t1',{opacity:.75});
  fillp(s,pax,'f-bg',{opacity:.95});
  /* strop: svetelny pas */
  fillp(s,rect(14,yw-2,TL-28,5),'f-goldl',{opacity:.5});
  /* kontury */
  ink(s,body,'thin',dl);
  path(s,frames,{'class':'ink thin'});
  path(s,mul+stan,{'class':'ink hair'});
  path(s,seat?paxL+strap:'',{'class':'ink hair',opacity:.8});
  path(s,glare,{'class':'ink hair goldl',opacity:.35});
  /* panely: pasy a nity */
  var st=M(0,-120)+'H'+TL+M(0,-44)+'H'+TL+M(0,-298)+'H'+TL+M(0,-306)+'H'+TL+M(0,-130)+'H'+TL;
  for(i=112;i<TL-60;i+=112)st+=line(i,-120,i,-44);
  path(s,st,{'class':'ink hair'});
  var rv='';for(i=20;i<TL-10;i+=17)rv+=dot(i,-125)+dot(i,-302);
  dots(s,rv,1.6,.6);
  /* reklama na boku */
  ink(s,rect(TL*.34,-112,TL*.28,56)+M(TL*.34+10,-96)+'h'+n(TL*.28-20)+M(TL*.34+10,-84)+'h'+n(TL*.18),'hair gold',dl+.1);
  /* zastery kol */
  var sk='';wheels.forEach(function(cx){sk+='M'+pt(cx-27,-44)+'Q'+pt(cx-27,-80)+' '+pt(cx,-80)+'Q'+pt(cx+27,-80)+' '+pt(cx+27,-44)});
  fillp(s,sk,'f-bg');path(s,sk,{'class':'ink thin'});
  /* strecha */
  var rf=rect(TL*.16,-340,TL*.15,18)+rect(TL*.36,-334,TL*.1,12)+rect(TL*.52,-338,TL*.08,16)+rect(TL*.82,-334,TL*.07,12);
  fillp(s,rf,'f-t3');path(s,rf,{'class':'ink thin'});
  var rv2='';for(var rx=TL*.16+6;rx<TL*.31;rx+=7)rv2+=line(rx,-340,rx,-324);
  path(s,rv2,{'class':'ink hair'});
  /* pantograf */
  var px0=TL*.7,pan=rect(px0-34,-326,68,6)+M(px0-26,-326)+'v-6M'+pt(px0+26,-326)+'v-6'+M(px0-22,-332)+'L'+pt(px0+14,-366)+'L'+pt(px0-14,-396)+M(px0-14,-332)+'L'+pt(px0+22,-366)+'L'+pt(px0-6,-396)+M(px0-34,-398)+'h56M'+pt(px0-30,-401)+'h48'+M(px0+14,-366)+'l8,0';
  path(s,pan,{'class':'ink thin'});
  /* cela: reflektor, linka */
  var hl=fillp(s,rect(7,-300,30,30),'',{fill:'url(#gWin)',opacity:.95});
  ink(s,rect(7,-300,30,30)+rect(11,-296,22,22)+circ(22,-285,8),'hair',dl+.1);
  var tb=ST.rect(26,-330,64,26,4);fillp(s,tb,'f-bg');path(s,tb,{'class':'ink thin gold'});
  var tx=el('text',{x:58,y:-310,'class':'label','text-anchor':'middle','font-size':23,'font-weight':600},s);tx.textContent=num;tx.style.fontFamily='var(--font-display)';
  ink(s,circ(16,-66,6)+circ(TL-16,-66,6)+rect(-8,-84,8,40)+rect(TL,-84,8,40)+M(-8,-62)+'h-16M'+pt(TL+8,-62)+'h16'+M(-24,-62)+'v-8h8',' hair',dl+.12);
  var g1=el('circle',{cx:16,cy:-66,r:48,fill:'url(#gGlow)',opacity:.75},s);
  var g2=el('circle',{cx:TL-16,cy:-66,r:22,fill:'url(#gGlow)',opacity:.55},s);
  var lg=el('text',{x:TL*.48,y:-82,'class':'label','text-anchor':'middle','font-size':13,'letter-spacing':5,opacity:.6},s);lg.textContent='DOPRAVNÍ PODNIK';lg.style.fontFamily='var(--font-display)';
  /* kapka stinu pod tramvaji */
  fillp(s,rect(-10,-3,TL+20,8),'',{fill:'url(#hatch)',opacity:.6});
  return s;
}
function swallow(x,y,sc,dir){
  var b=M(x-5*sc*dir,y-4*sc)+'Q'+pt(x,y-9.4*sc)+' '+pt(x+5*sc*dir,y-6.4*sc)+'Q'+pt(x+8.4*sc*dir,y-4.4*sc)+' '+pt(x+5*sc*dir,y-2.2*sc)+'Q'+pt(x,y-.2*sc)+' '+pt(x-5*sc*dir,y-4*sc)+'Z';
  var t=M(x-5*sc*dir,y-4.4*sc)+'L'+pt(x-12*sc*dir,y+.5*sc)+L(x-10*sc*dir,y-4.2*sc)+L(x-12.5*sc*dir,y-8*sc)+L(x-5*sc*dir,y-5.4*sc);
  return b+t+line(x-1*sc*dir,y-1.4*sc,x-1*sc*dir,y)+line(x+2*sc*dir,y-1.2*sc,x+2*sc*dir,y)+M(x-3*sc*dir,y-6*sc)+'q4,-2 8,1';
}
function buildWire(g,x0,x1,y,dl,polesX,gy,birds){
  var s=sect(g,x0,x1),d=M(x0,y),k;
  var xs=[x0].concat(polesX).concat([x1]);
  for(k=1;k<xs.length;k++){var a=xs[k-1],b=xs[k];d+='Q'+pt((a+b)/2,y+8)+' '+pt(b,y)}
  ink(s,d,'hair dim',dl);
  d='';polesX.forEach(function(px){
    var body=M(px-4.6,gy)+'L'+pt(px-2.6,y-18)+L(px+2.6,y-18)+L(px+4.6,gy)+'Z';
    fillp(s,body,'f-t1');ink(s,body,'thin dim',dl+.04);
    fillp(s,M(px+.6,gy)+'L'+pt(px+.5,y-18)+L(px+2.6,y-18)+L(px+4.6,gy)+'Z','',{fill:'url(#hatchV)',opacity:.7});
    d+=M(px,y-18)+'q-6,-12 -42,-14M'+pt(px,y-8)+'L'+pt(px-40,y-8)+L(px-40,y)+M(px,y-30)+'q12,-16 40,-15';
    d+=rect(px-8,gy-14,16,14)+rect(px-6,gy-20,12,6)+rect(px-3.4,gy-122,6.8,18)+circ(px,gy-113,1.4);
    for(var ry=gy-60;ry>y;ry-=64)d+=rect(px-4.4+(gy-ry)*.0028,ry,8.8-(gy-ry)*.0057,3);
    d+=line(px-6,gy-30,px+6,gy-30)+line(px-5,gy-190,px+5,gy-190);
    /* izolatory na vyložníku a svítidlo typu kobra */
    d+=circ(px-40,y-8,2.2)+circ(px-22,y-13,1.6)+rect(px-11,y-25,22,5)+rect(px-8,y-34,16,6);
    var lx=px+40;
    d+=M(lx-12,y-45)+'q12,-9 26,-1q4,5 -4,6h-20q-6,0 -2,-5Z'+M(lx-8,y-43)+'h18';
    var lg=el('ellipse',{cx:lx+1,cy:y-37,rx:34,ry:22,fill:'url(#gGlow)',opacity:.4},s);
    el('path',{d:M(lx-8,y-39)+'q9,5 18,0','class':'ink thin goldl',opacity:.8},s);
    appear(lg,dl+.3,.4);
  });
  ink(s,d,'thin dim',dl+.05);
  /* vlastovky na drátě */
  if(birds){var xs2=[x0].concat(polesX).concat([x1]),sd='',sg=0;
    birds.forEach(function(bx,bi){
      for(var k2=1;k2<xs2.length;k2++){if(bx>=xs2[k2-1]&&bx<=xs2[k2]){var tt=(bx-xs2[k2-1])/(xs2[k2]-xs2[k2-1]);sd+=swallow(bx,y+16*tt*(1-tt)-.4,1.0,bi%2?1:-1)}}});
    var sw2=el('path',{d:sd,'class':'ink thin',fill:'var(--bg)'},s)}
  return s;
}
/* Skoda 120 (zaparkovana) */
function buildCar(g,x,y,dir,dl,seed,kk){
  kk=kk||1;var s=sect(g,x-10,x+560*kk),c=el('g',{transform:'translate('+x+','+y+') scale('+kk+')'+(dir<0?' translate(540,0) scale(-1,1)':'')},s);
  var body=M(0,-30)+'L0,-84'+'Q4,-92 18,-94'+'L96,-98'+'Q118,-102 134,-130'+'Q150,-152 176,-152'+'L292,-152'+'Q320,-152 336,-128'+'L356,-100'+'L458,-92'+'Q484,-88 490,-64'+'L492,-34'+'Q490,-26 480,-26'+'L10,-26'+'Q0,-26 0,-30Z';
  fillp(c,body,'f-t2');
  ink(c,body,'thin',dl);
  /* okna */
  var win=M(112,-100)+'Q130,-126 146,-143'+'L194,-143'+'L194,-102Z'+M(204,-143)+'L290,-143'+'Q308,-141 322,-120'+'L336,-102'+'L204,-102Z';
  fillp(c,win,'f-t1');
  fillp(c,win,'',{fill:'url(#hatchFine)',opacity:.7});
  ink(c,win,'hair',dl+.05);
  /* odlesk lampy na strese a kapote */
  path(c,'M146,-150L292,-150Q312,-150 330,-128M362,-100L456,-94',{'class':'ink thin goldl',opacity:.8});
  /* dvere, kliky, linka */
  ink(c,M(196,-143)+'V-34M'+pt(200,-96)+'h132'+M(334,-100)+'L334,-34M'+pt(214,-94)+'h10M'+pt(300,-94)+'h10'+M(110,-50)+'h-100'+M(380,-50)+'h104'+rect(0,-60,8,24)+rect(484,-70,8,16),'hair',dl+.08);
  /* mrizka, svetlo, spz */
  ink(c,M(468,-80)+'v30M'+pt(474,-80)+'v30M'+pt(480,-76)+'v26'+circ(472,-84,0.1),'hair',dl+.1);
  fillp(c,circ(468,-70,8),'f-goldl',{opacity:.35});
  ink(c,rect(18,-76,6,16),'hair gold',dl+.1);
  /* zrcatko, klika kufru */
  ink(c,M(334,-112)+'l12,-6l2,10l-12,2Z'+rect(40,-78,22,6),'hair',dl+.1);
  /* kola */
  var wd='',inner='';[[96],[396]].forEach(function(q){var cx=q[0];wd+=circ(cx,-30,34)+circ(cx,-30,22)+circ(cx,-30,6);inner+=line(cx-5,-30,cx+5,-30)+line(cx,-35,cx,-25);for(var a=0;a<5;a++){var an=a*1.2566;inner+=line(cx+cos(an)*8,-30+sin(an)*8,cx+cos(an)*20,-30+sin(an)*20)}});
  fillp(c,wd,'f-t1');
  fillp(c,circ(96,-30,34)+circ(396,-30,34),'f-bg');
  path(c,wd,{'class':'ink thin'});path(c,inner,{'class':'ink hair'});
  ink(c,'M62,-30Q62,-66 96,-66Q130,-66 130,-30M362,-30Q362,-66 396,-66Q430,-66 430,-30','thin',dl+.1);
  /* detaily karoserie: lemovani, lamely, kliky, nárazníky, SPZ, volant uvnitr */
  fillp(c,M(8,-58)+'H484V-30H8Z','',{fill:'url(#hatchFine)',opacity:.4});
  var tread='',bolt='',lv='',k2;
  [96,396].forEach(function(cx){for(k2=0;k2<22;k2++){var an=k2*PI/11;tread+=line(cx+cos(an)*30.5,-30+sin(an)*30.5,cx+cos(an)*34,-30+sin(an)*34)}
    for(k2=0;k2<5;k2++){var an2=k2*1.2566+.3;bolt+=circ(cx+cos(an2)*12,-30+sin(an2)*12,1.5)}
    for(k2=0;k2<16;k2++){var an3=k2*PI/8;bolt+=line(cx+cos(an3)*22,-30+sin(an3)*22,cx+cos(an3)*28,-30+sin(an3)*28)}});
  ink(c,tread+bolt,'hair',dl+.12);
  for(k2=0;k2<6;k2++)lv+=line(410+k2*8,-96+k2*.5,414+k2*8,-91+k2*.5);
  lv+=M(0,-70)+'h8M'+pt(0,-64)+'h8'+M(-6,-34)+'h-10v-5h10'+rect(10,-33,22,5)+rect(440,-33,34,5);
  lv+=rect(450,-52,24,9)+line(454,-49,470,-49)+line(454,-46,466,-46)+M(194,-120)+'h10M'+pt(340,-120)+'h-10';
  lv+=M(152,-150)+'q10,-8 20,0'+M(160,-130)+'l22,0'+circ(215,-118,3)+M(210,-112)+'q8,-6 22,-1';
  ink(c,lv,'hair',dl+.14);
  path(c,M(122,-104)+'Q140,-128 158,-142M150,-102Q160,-118 172,-134M212,-142L240,-108M230,-142L258,-108M262,-142L288,-108',{'class':'ink hair goldl',opacity:.3});
  ink(c,circ(300,-117,6.5)+line(300,-117,306,-110)+M(306,-110)+'L'+pt(318,-104)+M(298,-143)+'v8h6v-8','hair',dl+.14);
  ink(c,M(304,-142)+'L'+pt(430,-96)+'M'+pt(30,-84)+'q20,-10 40,-10','hair faint',dl+.14);
  /* stin pod autem */
  fillp(c,ST.ellipse(270,2,280,6),'',{fill:'url(#hatch)',opacity:.7});
  return s;
}

/* ---- historicka prazska lampa ---- */
function buildLamp(g,x,gy,dl,flick,H){
  var s=sect(g,x-280,x+280),top=gy-(H||480),d;
  var g1=el('circle',{cx:x,cy:top+40,r:290,fill:'url(#gGlow)',opacity:.95},s);appear(g1,dl+.2,.95);
  var g2=el('ellipse',{cx:x,cy:gy+6,rx:250,ry:22,fill:'url(#gGlow)',opacity:.5},s);appear(g2,dl+.2,.5);
  var cone=fillp(s,poly([[x-16,top+62],[x+16,top+62],[x+170,gy+14],[x-170,gy+14]],true),'',{fill:'url(#gCone)',opacity:.3});appear(cone,dl+.2,.3);
  /* podstavec */
  d=rect(x-18,gy-8,36,8)+rect(x-13,gy-24,26,16)+M(x-13,gy-24)+'L'+pt(x-8,gy-38)+L(x+8,gy-38)+L(x+13,gy-24)+M(x-9,gy-16)+'h18';
  fillp(s,d,'f-t2');ink(s,d,'thin',dl+.25);
  /* drik se zlaby */
  var sh=M(x-7,gy-38)+'L'+pt(x-4.4,top+100)+L(x+4.4,top+100)+L(x+7,gy-38)+'Z';
  fillp(s,sh,'f-t1');ink(s,sh,'thin',dl+.28);
  fillp(s,poly([[x+1.5,gy-38],[x+1.2,top+100],[x+4.4,top+100],[x+7,gy-38]],true),'',{fill:'url(#hatchV)'});
  d='';for(var k=0;k<4;k++){var yc=gy-48-k*108;d+=rect(x-9-k*.5*0,yc,18,5)+circ(x,yc-4,1.4)}
  ink(s,d,'hair',dl+.3);
  d='';for(var yy=gy-60;yy>top+110;yy-=22)d+=line(x-1.5,yy,x-1.5,yy-14);
  ink(s,d,'hair faint',dl+.3);
  /* zebrovany sokl, prstence, cedulka s nazvem ulice, nastrik na sloupu */
  d='';for(var fk=-9;fk<=9;fk+=3)d+=line(x+fk*.9,gy-10,x+fk*.75,gy-36);
  d+=rect(x-10,gy-40,20,3)+rect(x-8,gy-46,16,3)+rect(x-8,top+104,16,3)+rect(x-9.5,gy-176,19,3)+M(x-12,gy-176)+'q-3,3 0,6M'+pt(x+12,gy-176)+'q3,3 0,6';
  ink(s,d,'hair',dl+.3);
  var np=rect(x+8,gy-264,34,12);fillp(s,np,'f-t3');ink(s,np+rect(x+10,gy-262,30,8)+line(x+13,gy-258,x+37,gy-258)+line(x+16,gy-255.5,x+34,gy-255.5)+line(x+7,gy-258,x+2,gy-258)+circ(x+2,gy-258,1.2),'hair',dl+.32);
  /* priprazka pro zapalovaci zebrik */
  ink(s,line(x-16,gy-330,x+16,gy-330)+circ(x-18,gy-330,2.4)+circ(x+18,gy-330,2.4),'thin',dl+.3);
  /* hlavice: akantova miska, voluty */
  var cp=M(x-4.4,top+100)+'C'+pt(x-16,top+98)+' '+pt(x-22,top+88)+' '+pt(x-20,top+80)+'L'+pt(x+20,top+80)+'C'+pt(x+22,top+88)+' '+pt(x+16,top+98)+' '+pt(x+4.4,top+100)+'Z';
  fillp(s,cp,'f-t2');ink(s,cp,'thin',dl+.32);
  d=M(x-20,top+84)+'C'+pt(x-34,top+84)+' '+pt(x-38,top+98)+' '+pt(x-28,top+102)+'C'+pt(x-22,top+104)+' '+pt(x-20,top+98)+' '+pt(x-25,top+96)+
     M(x+20,top+84)+'C'+pt(x+34,top+84)+' '+pt(x+38,top+98)+' '+pt(x+28,top+102)+'C'+pt(x+22,top+104)+' '+pt(x+20,top+98)+' '+pt(x+25,top+96)+
     M(x-6,top+99)+'q-6,6 -2,14M'+pt(x+6,top+99)+'q6,6 2,14'+circ(x,top+92,2.2)+M(x-14,top+90)+'q4,5 7,2M'+pt(x+14,top+90)+'q-4,5 -7,2';
  ink(s,d,'thin',dl+.35);
  ink(s,rect(x-20,top+74,40,6)+line(x-17,top+77,x+17,top+77),'thin',dl+.35);
  /* lucerna */
  var gb=poly([[x-15,top+74],[x-24,top+22],[x+24,top+22],[x+15,top+74]],true);
  fillp(s,gb,'f-bg');fillp(s,gb,'f-goldl',{opacity:.34});
  fillp(s,gb,'',{fill:'url(#gWin)',opacity:.8});
  var bulb=el('circle',{cx:x,cy:top+50,r:9,'class':'f-goldl',opacity:.95},s);appear(bulb,dl+.3,.95);
  var fl=el('circle',{cx:x,cy:top+50,r:22,fill:'url(#gGlow)',opacity:1},s);
  ink(s,gb+line(x-6,top+74,x-9,top+22)+line(x+6,top+74,x+9,top+22)+line(x-19.5,top+48,x+19.5,top+48)+line(x-17,top+62,x+17,top+62)+line(x-22,top+34,x+22,top+34),'thin gold',dl+.38);
  ink(s,line(x-5,top+54,x+5,top+54)+circ(x,top+50,9),'hair',dl+.4);
  /* stresni cepicka */
  var cap=M(x-30,top+22)+'Q'+pt(x-24,top+14)+' '+pt(x-12,top+8)+'L'+pt(x-4,top-4)+L(x+4,top-4)+L(x+12,top+8)+'Q'+pt(x+24,top+14)+' '+pt(x+30,top+22)+'Z';
  fillp(s,cap,'f-t2');ink(s,cap,'thin',dl+.42);
  ink(s,M(x-12,top+8)+'L'+pt(x-4,top+22)+M(x+12,top+8)+'L'+pt(x+4,top+22)+M(x,top-4)+'V'+n(top+22)+line(x-22,top+14,x+22,top+14),'hair',dl+.44);
  ink(s,circ(x,top-8,3.4)+line(x,top-11.4,x,top-24)+M(x-4,top-17)+'h8'+M(x-5,top+22)+'q-5,9 -2,10M'+pt(x+5,top+22)+'q5,9 2,10','thin',dl+.46);
  if(flick)glows.push({a:g1,b:g2,c:fl,s:s,x:x,ph:x*.01});
  /* odraz svetla na mokre dlazbe chodniku */
  var rf='';for(k=0;k<7;k++)rf+=M(x-30+k*3,gy+14+k*5.5)+'h'+n(60-k*6);
  path(s,rf,{'class':'ink hair goldl',opacity:.4});
  return s;
}

/* ---- lipa ---- */
function bump(cx,cy,r,rnd,nb){
  nb=nb||8;var d='',pts=[],i,a;
  for(i=0;i<nb;i++){a=i/nb*PI*2;var rr=r*(.88+rnd()*.22);pts.push([cx+cos(a)*rr,cy+sin(a)*rr*.86])}
  d=M(pts[0][0],pts[0][1]);
  for(i=1;i<=nb;i++){var p=pts[i%nb],q=pts[i-1],mxx=(p[0]+q[0])/2-cx,myy=(p[1]+q[1])/2-cy,l=Math.sqrt(mxx*mxx+myy*myy)||1;
    d+='Q'+pt(cx+mxx/l*(l+r*.22),cy+myy/l*(l+r*.22))+' '+pt(p[0],p[1])}
  return d+'Z';
}
function limb(x0,y0,x1,y1,w0,w1,bend){
  var dx=x1-x0,dy=y1-y0,l=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/l,ny=dx/l,mx2=(x0+x1)/2+nx*bend,my2=(y0+y1)/2+ny*bend;
  return M(x0-nx*w0,y0-ny*w0)+'Q'+pt(mx2-nx*(w0+w1)/2,my2-ny*(w0+w1)/2)+' '+pt(x1-nx*w1,y1-ny*w1)+L(x1+nx*w1,y1+ny*w1)+'Q'+pt(mx2+nx*(w0+w1)/2,my2+ny*(w0+w1)/2)+' '+pt(x0+nx*w0,y0+ny*w0)+'Z';
}
function buildTree(g,x,gy,sc,seed,dl,o){
  o=o||{};
  var r=RNG(seed),cy=gy-310*sc,cx=x+(o.dx||0),s=sect(g,x-230*sc,x+230*sc),k,d,j;
  /* kmen s kořenovým náběhem */
  var ty=gy-150*sc;
  var tr=M(x-13*sc,gy)+'C'+pt(x-10*sc,gy-50*sc)+' '+pt(x-9*sc,gy-100*sc)+' '+pt(x-8*sc,ty)+'L'+pt(x+8*sc,ty)+'C'+pt(x+9*sc,gy-100*sc)+' '+pt(x+11*sc,gy-50*sc)+' '+pt(x+14*sc,gy)+
    'Q'+pt(x+24*sc,gy+1)+' '+pt(x+32*sc,gy+5)+'L'+pt(x-30*sc,gy+5)+'Q'+pt(x-22*sc,gy+1)+' '+pt(x-13*sc,gy)+'Z';
  /* ochranna mrizka kolem kmene */
  var gp=ST.ellipse(x+1*sc,gy+4,38*sc,6.5)+ST.ellipse(x+1*sc,gy+4,20*sc,3.2),gs='';
  fillp(s,gp.split('M').slice(1,2).length?('M'+gp.split('M')[1]):gp,'f-t1');
  for(k=0;k<14;k++){var ga=k/14*PI*2;gs+=line(x+1*sc+cos(ga)*21*sc,gy+4+sin(ga)*3.4,x+1*sc+cos(ga)*37*sc,gy+4+sin(ga)*6.3)}
  ink(s,gp+gs,'hair',dl);
  fillp(s,tr,'f-t1');
  fillp(s,tr,'',{fill:'url(#hatchV)',opacity:.9});
  ink(s,tr,'thin',dl);
  d='';for(k=0;k<8;k++){var bx=x-9*sc+k*2.6*sc,y0=gy-r()*20,ln=26+r()*70;d+=M(bx,y0)+'q'+n((r()-.5)*3)+','+n(-ln/2)+' '+n((r()-.5)*2)+','+n(-ln)}
  d+=circ(x+3*sc,gy-70*sc,3*sc)+circ(x-4*sc,gy-110*sc,2.2*sc);
  for(k=0;k<7;k++){var by2=gy-20*sc-k*18*sc;d+=M(x-8*sc,by2)+'q'+n(3*sc)+',-4 '+n(6*sc)+',-1q'+n(3*sc)+',3 '+n(7*sc)+',-2'}
  ink(s,d,'hair',dl+.05);
  if(o.house){var bhx=x+o.house[0]*sc,bhy=gy-o.house[1]*sc,hb=rect(bhx,bhy,18,20),hr=poly([[bhx-3,bhy],[bhx+9,bhy-10],[bhx+21,bhy]],true);
    fillp(s,hb,'f-t3');fillp(s,hr,'f-t1');ink(s,hb+hr+circ(bhx+9,bhy+8,3.2)+line(bhx+5,bhy+15,bhx+13,bhy+15)+line(bhx+9,bhy+15,bhx+9,bhy+18),'hair',dl+.06)}
  /* hlavni vetve: tri konare */
  var lb=[[x,ty+8*sc,cx-84*sc,cy+52*sc,9*sc,3*sc,-14*sc],[x,ty,cx-4*sc,cy+10*sc,8*sc,3*sc,8*sc],[x+2*sc,ty+6*sc,cx+88*sc,cy+46*sc,9*sc,3*sc,16*sc],[x-2*sc,ty+30*sc,cx-40*sc,cy+90*sc,5*sc,2*sc,-8*sc],[x+3*sc,ty+34*sc,cx+46*sc,cy+98*sc,5*sc,2*sc,8*sc]],ld='';
  lb.forEach(function(q){ld+=limb(q[0],q[1],q[2],q[3],q[4],q[5],q[6])});
  fillp(s,ld,'f-t1');
  ink(s,ld,'thin',dl+.08);
  var S0=s,cg=el('g',{},s);s=cg;
  /* koruna: shluky listu zezadu dopredu */
  var cl=[],N=o.n||38;
  for(k=0;k<N;k++){var a=r()*PI*2,rr=Math.sqrt(r()),px=cx+cos(a)*rr*172*sc,py=cy+sin(a)*rr*122*sc*(sin(a)<0?1:.82);cl.push([px,py,(32+r()*26)*sc])}
  cl.sort(function(a,b){return a[1]-b[1]});
  var shade='',leaves='',spark='';
  cl.forEach(function(c,j){
    var dd=bump(c[0],c[1],c[2],r,10);
    var cls=j<N*.35?'hair dim t1':(j<N*.7?'hair t2':'hair t2');
    ink(s,dd,cls,dl+.1+j/N*.5);
    shade+=M(c[0]-c[2]*.85,c[1]+c[2]*.12)+'q'+n(c[2]*.85)+','+n(c[2]*1.05)+' '+n(c[2]*1.7)+',0q'+n(-c[2]*.85)+','+n(-c[2]*.35)+' '+n(-c[2]*1.7)+',0';
    for(var q=0;q<7;q++){var lx=c[0]+(r()-.5)*c[2]*1.4,ly=c[1]+(r()-.5)*c[2]*1.2;leaves+=M(lx,ly)+'l'+n(2.5+r()*2)+','+n(-1.5-r()*2)+'l'+n(2.4+r()*2)+','+n(1.5+r()*2)}
    if(c[0]>cx)for(q=0;q<5;q++)spark+=dot(c[0]+(r()-.2)*c[2],c[1]-c[2]*.6+r()*c[2]*.5)
  });
  fillp(s,shade,'',{fill:'url(#hatchFine)',opacity:.95});
  ink(s,leaves,'hair',dl+.7);
  /* kvetovi lipy: zlute tecky ve svetle lampy */
  if(o.glow){dots(s,spark,2,.6,'goldl');var gg=el('ellipse',{cx:cx+o.glow[0],cy:cy+o.glow[1],rx:120*sc,ry:80*sc,fill:'url(#gGlow)',opacity:.3},s);appear(gg,dl+.5,.3)}
  /* predni vetvicky pres korunu */
  d='';for(k=0;k<4;k++){var sx=cx+(r()-.5)*110*sc,sy=cy+30*sc+r()*60*sc;d+=M(sx,sy)+'q'+n((r()-.5)*40)+','+n(-20-r()*20)+' '+n((r()-.5)*60)+','+n(-30-r()*20)}
  ink(s,d,'hair',dl+.75);
  if(o.parrot){var pxx=cx+o.parrot[0]*sc,pyy=cy+o.parrot[1]*sc,pd=M(pxx-14,pyy+9)+'h30M'+pt(pxx-3,pyy+9)+'v2M'+pt(pxx+4,pyy+9)+'v2'+ST.ellipse(pxx,pyy-2,5.5,9)+circ(pxx+2,pyy-14,4.2)+'M'+pt(pxx+5.5,pyy-16)+'q5,0 4,5q-1,-2 -4,-1.5M'+pt(pxx-3,pyy+6)+'l-5,14M'+pt(pxx-1,pyy+7)+'l-1,15M'+pt(pxx+1,pyy+7)+'l3,13'+'M'+pt(pxx-2,pyy-6)+'q-3,6 1,12';
    fillp(s,ST.ellipse(pxx,pyy-2,5.5,9)+circ(pxx+2,pyy-14,4.2),'f-t3');ink(s,pd,'thin',dl+.8);
    dots(s,dot(pxx+3.4,pyy-15)+dot(pxx,pyy-3),1.6,1,'goldl')}
  if(o.plane){var ppx=cx+o.plane[0]*sc,ppy=cy+o.plane[1]*sc,pp2=poly([[ppx,ppy],[ppx+26,ppy-10],[ppx+9,ppy+7]],true);
    fillp(s,pp2,'f-bg');ink(s,pp2+line(ppx,ppy,ppx+14,ppy+2)+line(ppx+26,ppy-10,ppx+14,ppy+2)+M(ppx+9,ppy+7)+'l5,-5','hair goldl',dl+.8)}
  if(o.leaf){var lf=el('g',{},S0);path(lf,M(0,0)+'q4,-5 9,-2q-1,6 -9,2Z'+line(0,0,-4,2)+line(1,-.4,7,-2),{'class':'ink hair goldl'});amb.leaf.push({e:lf,x:cx+o.leaf*sc,y0:cy+70*sc,y1:gy+8,s:S0,per:11000+r()*4000,ph:r()*5000})}
  s=S0;
  if(o.heart){var hx2=x+o.heart[0]*sc,hy2=gy-o.heart[1]*sc;
    ink(s,M(hx2,hy2+5)+'C'+pt(hx2-9,hy2-1)+' '+pt(hx2-5,hy2-8)+' '+pt(hx2,hy2-3)+'C'+pt(hx2+5,hy2-8)+' '+pt(hx2+9,hy2-1)+' '+pt(hx2,hy2+5)+'Z','hair goldl',dl+.8);
    var ht=el('text',{x:hx2,y:hy2+1,'class':'label','text-anchor':'middle','font-size':4.2},s);ht.textContent='J+K';ht.style.fontFamily='var(--font-display)';
    if(CTX.end)ST.fade(ht,11.8,12.4,1)}
  amb.sway.push({g:cg,x:x,y:gy-150*sc,f:.0011+r()*.0006,ph:r()*6.28,s:S0});
  fillp(s,ST.ellipse(x+14*sc,gy+22,130*sc,10),'',{fill:'url(#hatch)',opacity:.55});
  return s;
}
function buildColumn(g,x,gy,dl,seed){
  /* plakatovaci sloup */
  var s=sect(g,x-60,x+60),r=RNG(seed),w=36,top=gy-270,d,i;
  var sh=rect(x-w,top+44,2*w,gy-16-top-44);
  fillp(s,sh,'f-t2');
  ink(s,sh,'thin',dl);
  fillp(s,rect(x+w*.45,top+44,w*.55,gy-16-top-44),'',{fill:'url(#hatchV)',opacity:.9});
  /* plakaty */
  var py=top+56,pk='',pg='',gl='';
  [[0,52],[56,62],[122,40],[166,50]].forEach(function(q,j){
    var h=q[1],xx=x-w+3+(j%2)*3,ww2=2*w-8-(j%2)*3,y0=py+q[0];
    if(y0+h>gy-24)return;
    pk+=rect(xx,y0,ww2,h-3);
    if(j===0){pg+=circ(x,y0+22,13)+circ(x,y0+22,7)+line(xx+4,y0+h-14,xx+ww2-4,y0+h-14)+line(xx+4,y0+h-9,xx+ww2-14,y0+h-9)}
    else if(j===1){pg+=poly([[xx+6,y0+8],[x,y0+36],[xx+ww2-6,y0+8]],true)+line(xx+4,y0+h-12,xx+ww2-4,y0+h-12)+line(xx+4,y0+h-7,xx+ww2-10,y0+h-7);gl+=rect(xx,y0,ww2,h-3)}
    else if(j===2){for(var q2=0;q2<5;q2++)pg+=line(xx+4,y0+6+q2*6,xx+ww2-4-q2*3,y0+6+q2*6)}
    else {pg+=circ(x-6,y0+16,9)+M(x+4,y0+10)+'l12,0M'+pt(x+4,y0+16)+'l9,0M'+pt(xx+4,y0+h-10)+'h'+n(ww2-8)}
  });
  fillp(s,pk,'f-t3',{opacity:.8});
  fillp(s,gl,'f-gold',{opacity:.22});
  ink(s,pk,'hair',dl+.05);ink(s,pg,'hair',dl+.08);
  /* socl a hlavice s kupoli */
  var cp=rect(x-w-5,gy-16,2*w+10,16)+rect(x-w-2,gy-24,2*w+4,8);
  fillp(s,cp,'f-t3');ink(s,cp,'thin',dl+.1);
  d=rect(x-w-3,top+38,2*w+6,8)+M(x-w,top+38)+'Q'+pt(x-w+2,top+6)+' '+pt(x,top-4)+'Q'+pt(x+w-2,top+6)+' '+pt(x+w,top+38)+M(x-w*.5,top+36)+'Q'+pt(x-w*.5,top+10)+' '+pt(x,top-4)+M(x+w*.5,top+36)+'Q'+pt(x+w*.5,top+10)+' '+pt(x,top-4)+circ(x,top-9,4)+line(x,top-13,x,top-22);
  fillp(s,M(x-w,top+38)+'Q'+pt(x-w+2,top+6)+' '+pt(x,top-4)+'Q'+pt(x+w-2,top+6)+' '+pt(x+w,top+38)+'Z','f-t2');
  ink(s,d,'thin',dl+.12);
  ink(s,rect(x-w+4,top+30,2*w-8,6)+M(x-w+8,top+30)+'v6M'+pt(x-w+16,top+30)+'v6',' hair',dl+.14);
  fillp(s,ST.ellipse(x+10,gy+22,52,6),'',{fill:'url(#hatch)',opacity:.6});
}
/* ---- lavicka, kose, kolo, holubi ---- */
function halo(p,d,w){return el('path',{d:d,fill:'none',stroke:'var(--bg)','stroke-width':w||5,'stroke-linecap':'round','stroke-linejoin':'round'},p)}
function buildBench(g,x,gy,dl){
  var s=sect(g,x-80,x+80),d,i;
  /* zadni opera a sedak: podklad zakryva, co je za lavickou */
  fillp(s,rect(x-52,gy-78,104,40),'f-bg');
  fillp(s,rect(x-52,gy-40,104,22),'f-bg');
  /* nohy litinove s volutami */
  d='';[-46,46].forEach(function(o){var bx=x+o,sg=o>0?1:-1;d+=M(bx-9,gy)+'h18M'+pt(bx,gy)+'V'+n(gy-40)+'q'+n(sg*10)+',-4 '+n(sg*10)+',-14M'+pt(bx,gy-40)+'q'+n(-sg*6)+',-34 '+n(-sg*2)+',-52'+circ(bx+sg*10,gy-16,3.2)+M(bx-4,gy-12)+'q-5,-4 -2,-9M'+pt(bx,gy-52)+'q'+n(sg*8)+',-6 '+n(sg*13)+',0q'+n(sg*3)+',3 0,6'+circ(bx+sg*10,gy-24,1.4)});
  halo(s,d.replace(/[Cc][^MmLlVvHhQqTtAaZz]*/g,''),5);
  ink(s,d,'thin',dl);
  var sl='',sc='';
  for(i=0;i<3;i++){sl+=rect(x-52,gy-40+i*9,104,5);}
  for(i=0;i<4;i++){sl+=rect(x-52,gy-76+i*9,104,5);}
  fillp(s,sl,'f-t3');
  fillp(s,rect(x-52,gy-40,104,23),'',{fill:'url(#hatchFine)',opacity:.35});
  ink(s,sl,'thin',dl+.05);
  d='';for(i=0;i<7;i++){d+=M(x-48+i*14,gy-74)+'h8M'+pt(x-46+i*14,gy-65)+'h9'}
  for(i=0;i<8;i++){sc+=dot(x-48+i*13.5,gy-38)+dot(x-48+i*13.5,gy-29)}
  ink(s,d,'hair',dl+.08);dots(s,sc,1.8,.8);
  /* podrucky */
  d=M(x-52,gy-40)+'v-14q0,-4 5,-4h6'+M(x+52,gy-40)+'v-14q0,-4 -5,-4h-6';
  ink(s,d,'thin',dl+.08);
  /* zapomenute noviny na sedaku */
  var nw=M(x+8,gy-41)+'l22,-1l-4,-12l-22,1Z';
  fillp(s,nw,'f-bg');ink(s,nw+M(x+10,gy-46)+'l14,-.5M'+pt(x+11,gy-49)+'l12,-.4'+M(x+16,gy-43)+'l8,-.3','hair',dl+.1);
  fillp(s,ST.ellipse(x,gy+3,70,4),'',{fill:'url(#hatch)',opacity:.6});
}
function buildBin(g,x,gy,dl){
  var s=sect(g,x-30,x+30),d;
  /* odpadkovy kos na sloupku */
  halo(s,M(x,gy)+'V'+n(gy-96),5);
  d=M(x-1.6,gy)+'V'+n(gy-96)+M(x+1.6,gy)+'V'+n(gy-96)+rect(x-10,gy-6,20,6)+rect(x-6,gy-12,12,6);
  fillp(s,rect(x-10,gy-6,20,6)+rect(x-6,gy-12,12,6),'f-t3');
  ink(s,d,'thin',dl);
  var bn=M(x-15,gy-96)+'L'+pt(x-12,gy-142)+L(x+12,gy-142)+L(x+15,gy-96)+'Z';
  fillp(s,bn,'f-t1');ink(s,bn,'thin',dl+.05);
  d='';for(var i=-10;i<=10;i+=4)d+=line(x+i,gy-104,x+i*.85,gy-134);
  ink(s,d,'hair',dl+.08);
  ink(s,rect(x-15,gy-102,30,4)+rect(x-13,gy-139,26,3),'hair',dl+.08);
  fillp(s,ST.ellipse(x,gy-142,13,3),'f-t3');
  ink(s,ST.ellipse(x,gy-142,13,3)+line(x-13,gy-142,x-13,gy-146)+line(x+13,gy-142,x+13,gy-146)+rect(x-3,gy-149,6,3),'thin',dl+.1);
  ink(s,M(x-16,gy-100)+'l-5,-1v-6l5,0Z'+M(x+15,gy-100)+'l7,1','hair',dl+.1);
  /* nalepka a popelnik */
  ink(s,circ(x,gy-122,4.4)+M(x-2.5,gy-122)+'h5','hair gold',dl+.12);
}
function buildBin2(g,x,gy,dl){
  var s=sect(g,x-34,x+34),i;
  /* popelnice na kolecka */
  var b=M(x-22,gy-4)+'L'+pt(x-26,gy-84)+L(x+26,gy-84)+L(x+22,gy-4)+'Z';
  fillp(s,b,'f-t2');ink(s,b,'thin',dl);
  fillp(s,M(x+8,gy-4)+'L'+pt(x+10,gy-84)+L(x+26,gy-84)+L(x+22,gy-4)+'Z','',{fill:'url(#hatchV)',opacity:.9});
  var d='';for(i=-17;i<=17;i+=6)d+=line(x+i,gy-8,x+i*1.15,gy-80);
  ink(s,d,'hair',dl+.05);
  ink(s,rect(x-27,gy-60,54,5)+rect(x-24,gy-30,48,4),'hair',dl+.06);
  var lid=rect(x-30,gy-94,60,10);
  fillp(s,lid,'f-t3');
  ink(s,lid+M(x-30,gy-94)+'q30,-8 60,0'+rect(x-8,gy-97,16,3)+circ(x-18,gy-2,6)+circ(x+18,gy-2,6)+circ(x-18,gy-2,2)+circ(x+18,gy-2,2),'thin',dl+.1);
  fillp(s,circ(x-18,gy-2,6)+circ(x+18,gy-2,6),'f-bg');
  ink(s,circ(x-18,gy-2,6)+circ(x+18,gy-2,6),'thin',dl+.1);
  ink(s,M(x-12,gy-48)+'h24M'+pt(x-12,gy-43)+'h24'+rect(x-10,gy-74,20,10)+M(x-7,gy-71)+'h14M'+pt(x-7,gy-68)+'h9','hair',dl+.12);
  fillp(s,ST.ellipse(x,gy+1,34,3),'',{fill:'url(#hatch)',opacity:.5});
}
function buildBike(g,x,gy,dl){
  var s=sect(g,x-80,x+80),r=34,w1=x-44,w2=x+44,d='',sp='',i;
  /* kola: plny kotouc, aby bylo zakryto, co je za nimi */
  [w1,w2].forEach(function(cx){
    fillp(s,circ(cx,gy-r,r+1),'f-t1');
    d+=circ(cx,gy-r,r)+circ(cx,gy-r,r-4)+circ(cx,gy-r,4);
    for(var a=0;a<24;a++){var an=a*PI/12;sp+=line(cx+cos(an)*4,gy-r+sin(an)*4,cx+cos(an)*(r-5),gy-r+sin(an)*(r-5))}
  });
  /* blatniky */
  var fe=M(w2-r*1.1,gy-r*1.2)+'A'+n(r*1.14)+','+n(r*1.14)+' 0 0 1 '+pt(w2+r*1.1,gy-r*1.05)+M(w1-r*1.1,gy-r*1.1)+'A'+n(r*1.14)+','+n(r*1.14)+' 0 0 1 '+pt(w1+r*.7,gy-r*1.9)+L(w1+r*.9,gy-r*1.85);
  ink(s,sp,'hair faint',dl+.04);ink(s,d,'thin',dl);ink(s,fe,'thin',dl+.04);
  var fr=M(w1,gy-r)+'L'+pt(x-14,gy-r-44)+L(x+26,gy-r-44)+L(w2,gy-r)+M(x-14,gy-r-44)+'L'+pt(x+6,gy-r)+L(w1,gy-r)+M(x+6,gy-r)+'L'+pt(x+26,gy-r-44)+M(x+26,gy-r-44)+'L'+pt(x+34,gy-r-60)+M(x+28,gy-r-62)+'h14'+M(x-18,gy-r-46)+'h-12'+M(x-14,gy-r-44)+'L'+pt(x-18,gy-r-58);
  halo(s,fr,4.6);
  ink(s,fr,'thin',dl+.08);
  /* sedlo, kliky, pedaly, retez */
  fillp(s,M(x-26,gy-r-58)+'q8,-6 22,-1l-3,4h-14Z','f-t3');ink(s,M(x-26,gy-r-58)+'q8,-6 22,-1l-3,4h-14Z','hair',dl+.1);
  ink(s,circ(x+6,gy-r,8)+line(x+6,gy-r,x+1,gy-r+16)+rect(x-3,gy-r+16,8,3)+M(x+6,gy-r)+'L'+pt(w1,gy-r)+M(x+6,gy-r-8)+'L'+pt(w1,gy-r-3)+M(x+6,gy-r+8)+'L'+pt(w1,gy-r+3),'hair',dl+.1);
  /* kosik s bagetou a kvetinami na rizeni */
  var bk=M(x+30,gy-r-66)+'h28l-3,18h-22Z';
  fillp(s,bk,'f-t3');
  var wk='';for(i=0;i<5;i++)wk+=line(x+32+i*5.5,gy-r-66,x+31+i*5,gy-r-48);for(i=0;i<3;i++)wk+=line(x+31,gy-r-62+i*5,x+57,gy-r-62+i*5);
  ink(s,bk+wk,'hair',dl+.12);
  var bg=M(x+36,gy-r-66)+'l16,-26l4,2l-16,26Z'+M(x+39,gy-r-69)+'l8,-13';
  fillp(s,bg,'f-t3');ink(s,bg,'hair',dl+.14);
  ink(s,M(x+49,gy-r-66)+'q2,-9 5,-8M'+pt(x+52,gy-r-66)+'q5,-5 8,-2'+circ(x+54.5,gy-r-75,2.4)+circ(x+61,gy-r-70,2.2),'hair',dl+.14);
  /* zvonek a svetlo */
  ink(s,circ(x+32,gy-r-65,0.1)+M(x+24,gy-r-62)+'a3.2,3.2 0 1,1 6.4,0Z'+rect(w2-4,gy-r-26,7,5),'hair',dl+.1);
  path(s,dot(w2+6,gy-r-24),{'class':'ink gold',style:'stroke-width:3.6'});
  /* stojan */
  ink(s,M(w1+10,gy-8)+'l8,6M'+pt(w1+14,gy-9)+'l6,9','hair',dl+.1);
  fillp(s,ST.ellipse(x,gy+3,76,3.5),'',{fill:'url(#hatch)',opacity:.55});
}
function buildPigeons(g,x,gy,dl,n2,hat){
  var s=sect(g,x-60,x+60),d='',r=RNG(x|0),hd='';
  for(var i=0;i<n2;i++){var bx=x+i*20+r()*8,dr=r()<.5?1:-1;d+=bird(bx,gy,1.25,dr);
    if(hat===i){var hx=bx+9.3*1.25*dr,hy=gy-9.6*1.25;hd+=M(hx-4.5,hy+.5)+'h9M'+pt(hx-3,hy+.5)+'v-8h6v8M'+pt(hx-3,hy-5)+'h6'}}
  path(s,d,{'class':'ink thin',fill:'var(--bg)'});
  if(hd){var he=path(s,hd,{'class':'ink thin goldl'})}
}
function buildCourtyard(g,xa,xb,gy,dl){
  var s=sect(g,xa,xb),d,W=xb-xa,i;
  /* cihlova zed s pilastry */
  var wy=gy-52;
  ink(s,rect(xa,wy,W,52),'thin t1',dl);
  fillp(s,rect(xa,wy,W,52),'',{fill:'url(#st_brick)',opacity:1});
  d=rect(xa,wy-5,W,6);
  for(i=xa;i<=xb;i+=64)d+=rect(i-5,wy-14,10,66);
  ink(s,d,'thin',dl+.05);
  /* zelezny plot: tyce se spicemi a vrata */
  d=M(xa,wy-28)+'h'+W+M(xa,wy-8)+'h'+W;
  for(i=xa+8;i<xb;i+=8){d+=M(i,wy-5)+'v-44'+M(i-2.2,wy-49)+'l2.2,-7l2.2,7Z'}
  ink(s,d,'hair',dl+.08);
  /* vrata uprostred */
  var gx=(xa+xb)/2;
  ink(s,rect(gx-34,wy-62,68,110)+M(gx,wy-62)+'v110'+M(gx-34,wy-14)+'h68'+M(gx-34,wy-36)+'h68'+circ(gx-34,wy-66,4)+circ(gx+34,wy-66,4),'thin',dl+.1);
  d='';for(i=-30;i<=30;i+=6)if(abs(i)>3)d+=line(gx+i,wy-58,gx+i,wy+44);
  ink(s,d,'hair',dl+.12);
  fillp(s,rect(gx-34,wy-62,68,110),'',{fill:'url(#gWin)',opacity:.22});
}

/* ================= POPREDI (fore): jeden souvisly plan pres cely svet ================= */
function buildFore(){
  var f=MP('fore',1.4,0,470),xa=-1900,xb=7700,W=xb-xa,s=sect(f,xa,xb),r=RNG(55),i,d;
  var dl=0;
  fillp(s,rect(xa,768,W,700),'f-t1');
  fillp(s,rect(xa,768,W,700),'',{fill:'url(#st_settF)',opacity:1});
  fillp(s,rect(xa,768,W,700),'',{fill:'url(#gShadeDown)',opacity:.45});
  fillp(s,rect(xa,768,W,36),'',{fill:'url(#hatchFine)',opacity:.7});
  /* odrazy lamp na mokre dlazbe (konecna lampa se dokresli v zaveru) */
  [[560,false],[3700+1592,true]].forEach(function(q){
    var lx=q[0],gl=fillp(s,ST.ellipse(lx,860,70,200),'',{fill:'url(#gGlow)',opacity:.38});
    d='';for(i=0;i<16;i++){var yy=784+i*i*1.3+i*8,ln=44-i*1.8;if(ln<6)break;d+=M(lx-ln/2+(r()-.5)*8,yy)+'h'+n(ln)}
    var rf=el('path',{d:d,'class':'ink thin goldl',opacity:.5},s);
    if(q[1]){ST.fade(gl,11.4,12.4,.38);ST.fade(rf,11.4,12.4,.5)}
  });
  d='';for(i=0;i<60;i++){var x=xa+r()*W,y=790+r()*480,w2=60+r()*130,h2=14+r()*30;d+=M(x,y)+'q'+n(w2*.3)+','+n(-h2)+' '+n(w2*.6)+','+n(-h2*.4)+'t'+n(w2*.4)+','+n(h2*.9)}
  ink(s,d,'hair faint',dl);
  d='';[-300,4450+1592,1500].forEach(function(mx){d+=ST.ellipse(mx,940,58,20)+ST.ellipse(mx,940,46,15)+M(mx-44,940)+'h88M'+pt(mx-30,930)+'h60M'+pt(mx-30,950)+'h60M'+pt(mx,925)+'v30'});
  ink(s,d,'hair',dl);
  /* druhe kolejiste v popredi */
  fillp(s,rect(xa,868,W,92),'f-t2',{opacity:.75});
  fillp(s,rect(xa,868,W,92),'',{fill:'url(#hatchFine)',opacity:.8});
  d=M(xa,868)+'h'+W+M(xa,960)+'h'+W+M(xa,884)+'h'+W+M(xa,890)+'h'+W+M(xa,930)+'h'+W+M(xa,936)+'h'+W;
  ink(s,d,'thin',dl);
  d='';for(i=xa+r()*30;i<xb;i+=58)d+=M(i,894)+'v30M'+pt(i+3,894)+'v30';
  ink(s,d,'hair faint',dl);
  ink(s,M(xa,886)+'h'+W+M(xa,933)+'h'+W,'hair goldl',dl);
  d='';for(i=0;i<22;i++){var px=xa+r()*W,py=1000+r()*40;d+=rect(px,py,120+r()*90,18+r()*14)}
  fillp(s,d,'',{fill:'url(#hatchX)',opacity:.9});ink(s,d,'hair',dl);
  /* obrubnik a chodnik u divaka */
  fillp(s,rect(xa,1050,W,30),'f-t3');
  fillp(s,rect(xa,1080,W,60),'f-t2');
  fillp(s,rect(xa,1080,W,60),'',{fill:'url(#hatchV)',opacity:.7});
  d=M(xa,1050)+'h'+W+M(xa,1080)+'h'+W+M(xa,1140)+'h'+W;
  for(i=xa+r()*60;i<xb;i+=120+r()*60)d+=M(i,1050)+'v90';
  ink(s,d,'thin',dl);
  fillp(s,rect(xa,1140,W,400),'f-t2');
  fillp(s,rect(xa,1140,W,400),'',{fill:'url(#st_mosB)',opacity:1});
  fillp(s,rect(xa,1140,W,400),'',{fill:'url(#gShadeDown)',opacity:.5});
  ink(s,M(xa,1160)+'h'+W+M(xa,1190)+'h'+W,'hair faint',dl);
  /* rozmazane silhouety: auto v druhem pruhu, sloup, kmen */
  var fs=el('g',{filter:'url(#blurFore)'},s);
  var cs=el('g',{opacity:.6},fs);
  buildCar(cs,-420,1010,1,.3,7,1.25);
  CTX.end=true;buildCar(cs,4560+1592-120,1010,-1,.6,8,1.25);CTX.end=false;
  [[-700,160,'lamp'],[4830+1592,150,'tree']].forEach(function(p){
    var px=p[0],tp=p[1],end=p[0]>3000;CTX.end=end;
    if(p[2]==='tree'){
      var tr=M(px-34,1500)+'C'+pt(px-26,1000)+' '+pt(px-44,600)+' '+pt(px-20,tp+40)+'L'+pt(px+20,tp+40)+'C'+pt(px+40,600)+' '+pt(px+30,1000)+' '+pt(px+40,1500)+'Z';
      ink(fs,tr,'dim solid',.2);
      var b='';for(i=0;i<10;i++){var bx=px-24+i*5;b+=M(bx,1400)+'q'+n((r()-.5)*14)+',-300 '+n((r()-.5)*10)+',-'+n(500+r()*160)}
      ink(fs,b,'hair dim',.3);
      ink(fs,M(px-18,tp+60)+'q-50,-26 -110,-30M'+pt(px+18,tp+50)+'q40,-30 80,-24','thin dim',.3);
    }else{
      var tr2=M(px-12,1500)+'L'+pt(px-8,tp+100)+L(px+8,tp+100)+L(px+12,1500)+'Z';
      ink(fs,tr2,'dim solid',.2);
      ink(fs,rect(px-16,tp+86,32,16)+rect(px-14,tp+360,28,10)+rect(px-14,tp+760,28,10)+M(px-8,tp+100)+'q-26,-8 -34,-46M'+pt(px+8,tp+100)+'q26,-8 34,-46'+M(px-8,tp+86)+'v-26h16v26'+circ(px,tp+50,5),'thin dim',.3);
    }
    CTX.end=false;
  });
}

/* ================= SESTAVENI ================= */
var trams=[];
var INTRO=[
  {x:-1560,w:330,nF:3,roof:'mansard',shop:'pub',wall:'t2',bal:[2],lit:.3,seed:101,blink:3,walker:1},
  {x:-1230,w:300,nF:4,roof:'gable',shop:'grocery',wall:'t3',lit:.3,seed:102,tv:true},
  {x:-930,w:340,nF:3,roof:'mansard',shop:'passage',wall:'t1',bal:[1,2],lit:.3,seed:103},
  {x:-590,w:260,nF:3,roof:'attic',shop:'kiosk',wall:'t2',lit:.3,seed:104},
  {x:-330,w:300,nF:2,roof:'gable',shop:'passage',wall:'t3',bal:[1],lit:.34,seed:105,pigeons:[60,80,220],tv:true},
  {x:-30,w:280,nF:2,roof:'mansard',shop:'flowers',wall:'t2',lit:.34,seed:106,walker:2},
  {x:450,w:320,nF:4,roof:'mansard',shop:'bakery',wall:'t2',bal:[2,3],lit:.4,seed:107,signDx:62,pigeons:[60,76,230],angel:48,sock:2,balloon:3,cedulka:true,blink:3,walker:2}
];
var END=[
  {x:3550,w:330,nF:2,roof:'mansard',shop:'grocery',wall:'t2',bal:[],lit:.4,seed:201,signDx:62,pigeons:[40,54,200],blink:2,cedulka:true},
  {x:3880,w:380,nF:2,roof:'attic',shop:'pub',wall:'t3',bal:[1],lit:.28,seed:202,tv:true},
  {x:4500,w:290,nF:3,roof:'gable',shop:'kiosk',wall:'t1',bal:[2],lit:.3,seed:203,pigeons:[90,110],walker:1},
  {x:4790,w:300,nF:2,roof:'mansard',shop:'flowers',wall:'t2',lit:.3,seed:204},
  {x:5090,w:330,nF:4,roof:'attic',shop:'bakery',wall:'t3',bal:[2],lit:.3,seed:205},
  {x:5420,w:330,nF:3,roof:'mansard',shop:'passage',wall:'t2',bal:[1],lit:.3,seed:206}
];
var MIDF=.68,MSHX=-3980*(1-MIDF),MSHY=110*(1-MIDF);

function buildMid(){
  var mB=MP('mid',.5,0,470),mA=MP('mid',MIDF,0,470),x,k=0,s,row;
  /* zadni rada: souvisle pres cely svet */
  for(x=-1700;x<3000;x+=780,k++){
    s=sect(mB,x,x+780);row=skylineRow(s,x,x+780,646,250,420,41+k*3,{cls:'ink dim t1',gaps:[[262,438,46],[2232,2408,46]]});
    drawRow(s,row,{cls:'dim t1',winOp:.3},.1);
  }
  /* uvodni ulice */
  CTX.end=false;
  INTRO.forEach(function(S){S.gy=660;S.dl=Math.min(.95,Math.abs(S.x+150-100)/1500);facade(mA,S)});
  buildCourtyard(mA,252,448,660,.1);
  /* vypln nad strechou studia (x 770 az 2290 v rovine) */
  for(x=770,k=0;x<2290;x+=760,k++){
    s=sect(mA,x,x+760);row=skylineRow(s,x,x+760,660,520,600,91+k,{cls:'ink dim t1'});
    drawRow(s,row,{cls:'dim t1',winOp:.3},.3);
  }
  /* koncova ulice: stejny plan, posunuty tak, aby v zaveru sedel na hlavni rovinu */
  CTX.end=true;SHIFT=MSHX;
  var sh=el('g',{transform:'translate('+MSHX+','+MSHY+')'},mA);
  END.forEach(function(S){S.gy=660;S.dl=Math.min(.95,(S.x-3550)/2300*.9);facade(sh,S)});
  buildCourtyard(sh,4262,4498,660,.4);
  SHIFT=0;CTX.end=false;
}

function buildBack(end){
  CTX.end=end;
  var back=ST.L.back,g0=end?3556:-1900,g1=end?5800:758,ch=end?[g0,4250,4950,g1]:[g0,-1200,-500,200,g1],i;
  for(i=0;i<ch.length-1;i++)ground(back,ch[i],ch[i+1],end?(ch[i]-3550)/2300*.9:Math.abs(ch[i]+ch[i+1]-200)/4000,end?60+i:50+i);
  buildWire(back,g0,g1,350,.2,end?[4020,4950]:[-820,230],684,end?[4160,4182,4207]:[330,352,392]);
  var cg=el('g',{'clip-path':end?'url(#st_clipB)':'url(#st_clipA)'},back),tg=el('g',{},cg);
  buildTram(tg,1740,'9',end?.8:.2,.6);
  trams.push({g:tg,end:end});
  if(!end){
    buildCar(back,-650,684,1,.25,5);
    buildTree(back,-470,697,1.0,71,.3,{glow:[40,10],parrot:[70,55],leaf:-70,house:[10,105]});
    buildTree(back,-1180,697,.85,72,.4,{n:30,leaf:30});
    streetDetail(sect(back,-300,0),-100,.3,RNG(3));groundEggs(back,100,200,.4,130,null,null);groundEggs(back,-440,-380,.4,null,-410,null);groundEggs(back,-130,-50,.4,null,null,-90);
    buildBin(back,-250,697,.3);buildBin2(back,10,697,.3);
    buildBench(back,330,697,.2);
    buildBike(back,606,697,.3);
    buildPigeons(back,420,697,.4,3,1);buildPigeons(back,-130,697,.4,2);
    buildLamp(back,560,697,.1,true);buildColumn(back,222,697,.2,5);
  }else{
    buildTree(back,4730,697,.8,81,.4,{n:30,heart:[-6,70],plane:[96,40],leaf:-30,house:[-18,95]});
    buildTree(back,5060,697,.95,82,.6,{n:34});
    buildBin(back,3620,697,.3);buildBin2(back,4075,697,.35);
    buildBench(back,4330,697,.4);
    buildBike(back,3745,697,.4);
    buildPigeons(back,4460,697,.5,3);
    streetDetail(sect(back,3600,3800),3690,.3,RNG(4));groundEggs(back,4150,4210,.5,null,4180,null);groundEggs(back,4570,4650,.5,null,null,4610);
    buildLamp(back,3700,697,.15,true,440);buildColumn(back,4960,697,.5,9);
  }
  CTX.end=false;
}

buildSky();
buildFarAll();
buildMid();
buildBack(false);
buildBack(true);
buildFore();
CTX.end=false;

/* ================= AMBIENTNI POHYB (vzdy neco se hybe) ================= */
var stage=ST.ss;
ST.on(function(T,time,cam){
  var k,tm=ST.reduce?0:time,vis=function(o){return o.s.style.display!=='none'};
  /* tramvaje: poloha podle scrollu i casu, projizdeji dokola */
  for(k=0;k<trams.length;k++){
    var t=trams[k],u;
    if(t.end){u=(tm*.045+(T-11)*70)%4400;t.g.setAttribute('transform','translate('+n(4800-u)+',678) scale(.82)')}
    else{u=(2245+tm*.045+T*160)%3700;t.g.setAttribute('transform','translate('+n(745-u)+',678) scale(.82)')}
  }
  /* vysilac: plynule dosazeni vpravo od textu Kontakt v zaveru, na mobilu mensi */
  if(amb.tower){
    var por=cam.vw<cam.vh*.9,e=ST.ss(10.8,12.6,T),sc=por?.65-.2*e:1;
    amb.tower.g.setAttribute('transform','translate('+n(577*e)+',0) translate(350,560) scale('+n(sc)+') translate(-350,-560)');
  }
  /* neon PIVO: občas zablikne */
  for(k=0;k<amb.neon.length;k++){var nn=amb.neon[k];if(!vis(nn))continue;
    var ng=nn.end?stage(11.9,12.5,T):1,fl2=ST.reduce?1:((((time+nn.ph*100)%7300)<260)?(((time>>5)&1)?.25:1):1);
    nn.e[0].setAttribute('opacity',n(.9*fl2*ng));nn.e[1].setAttribute('opacity',n(fl2*ng))}
  /* balonek na balkone se houpe */
  for(k=0;k<amb.balloon.length;k++){var bb2=amb.balloon[k];if(!vis(bb2))continue;
    bb2.g.setAttribute('transform','rotate('+n(ST.reduce?0:sin(time*.0011+k)*4+sin(time*.0027)*1.6)+' '+n(bb2.x)+' '+n(bb2.y)+')')}
  /* padajici list */
  for(k=0;k<amb.leaf.length;k++){var lf2=amb.leaf[k];if(ST.reduce){lf2.e.setAttribute('opacity',0);continue}if(!vis(lf2))continue;
    var lq=((time+lf2.ph)%lf2.per)/lf2.per;
    lf2.e.setAttribute('transform','translate('+n(lf2.x+sin(lq*11)*26+lq*40)+','+n(lf2.y0+(lf2.y1-lf2.y0)*lq)+') rotate('+n(sin(lq*9)*70)+')');
    lf2.e.setAttribute('opacity',n(Math.min(1,lq*10)*(lq>.9?(1-lq)*10:1)))}
  /* blikani majaku, mihotani lamp */
  for(k=0;k<blinkers.length;k++){var bl=blinkers[k];if(!vis(bl))continue;
    var on=ST.reduce?1:(((time+bl.ph*40)%2300)<420?1:.3);bl.a.setAttribute('opacity',on.toFixed(2));bl.b.setAttribute('opacity',(.55+.45*on).toFixed(2))}
  if(ST.reduce)return;
  for(k=0;k<glows.length;k++){var gw=glows[k];if(gw.s.style.display==='none')continue;
    var fv=1+.045*sin(time*.0037+gw.ph)+.03*sin(time*.0113+gw.ph*2);
    gw.c.setAttribute('opacity',(fv>1?1:fv).toFixed(3));gw.a.setAttribute('opacity',(.95*fv).toFixed(3))}
  /* oblaka plují */
  for(k=0;k<amb.cloud.length;k++){var c=amb.cloud[k];if(!vis(c))continue;c.g.setAttribute('transform','translate('+n(c.a*sin(time*c.f+c.p))+',0)')}
  /* ptaci */
  for(k=0;k<amb.bird.length;k++){var b=amb.bird[k];if(!vis(b))continue;
    var bx=900+((time*b.sp+b.off)%2800),by=b.y+sin(time*.0006+k)*8;
    b.g.setAttribute('transform','translate('+n(bx)+','+n(by)+') scale('+n(b.sc)+','+n(b.sc*sin(time*b.fl+k)*.9)+')')}
  if(amb.ufo&&vis(amb.ufo)){amb.ufo.g.setAttribute('transform','translate('+n(sin(time*.0004)*14)+','+n(sin(time*.0011)*3)+')');
    amb.ufo.l.setAttribute('opacity',(.4+.6*(((time%900)<450)?1:.2)).toFixed(2))}
  /* letadlo a padajici hvezda */
  if(amb.plane&&vis(amb.plane)){var px9=300+((time*.011+1250)%3700);amb.plane.g.setAttribute('transform','translate('+n(px9)+','+n(36+sin(time*.0002)*6)+') scale(1.15)');
    var pb=((time%1100)<110)?1:.25;amb.plane.a.setAttribute('opacity',pb);amb.plane.b.setAttribute('opacity',(((time+500)%1100)<110)?1:.3)}
  if(amb.shoot&&vis(amb.shoot)){var sq=(time%19000)/19000;if(sq<.04){var sp2=sq/.04;amb.shoot.e.setAttribute('transform','translate('+n(2420-sp2*320)+','+n(-60+sp2*160)+')');amb.shoot.e.setAttribute('opacity',n(Math.sin(sp2*Math.PI)*.9))}else amb.shoot.e.setAttribute('opacity',0)}
  /* kour z komínu */
  for(k=0;k<amb.smoke.length;k++){var sm=amb.smoke[k];if(!vis(sm))continue;
    var gate=sm.end?stage(11.9,12.5,T):1;
    for(var u2=0;u2<3;u2++){var ph=(time*.00011+sm.ph+u2/3)%1;
      sm.c[u2].setAttribute('cx',n(sm.x+sin(ph*5+u2)*5+ph*14));sm.c[u2].setAttribute('cy',n(sm.y-ph*80));sm.c[u2].setAttribute('r',n(3.5+ph*10));
      sm.c[u2].setAttribute('opacity',n((1-ph)*.6*Math.min(1,ph*8)*gate))}}
  /* okna se rozsviti a zhasnou, televize bliká */
  for(k=0;k<amb.blink.length;k++){var w=amb.blink[k];if(!vis(w))continue;
    var g2=w.end?stage(11.9,12.5,T):1,o;
    if(w.tv)o=(.35+.65*(((Math.floor(time/110+w.ph)*2654435761)>>>8)%100)/100)*w.max;
    else o=Math.max(0,Math.min(1,(sin(time*w.f+w.ph)+.2)*2.2))*w.max;
    w.e.setAttribute('opacity',n(o*g2))}
  /* siluety prochází za oknem */
  for(k=0;k<amb.walk.length;k++){var wk=amb.walk[k];if(!vis(wk))continue;
    var q=((time+k*2300)%wk.per)/wk.per,xx=wk.x0-12+q*(wk.w+24),g3=wk.end?stage(11.9,12.5,T):1;
    wk.e.setAttribute('opacity',n(.95*g3));wk.e.setAttribute('transform','translate('+n(xx)+','+n(wk.y)+') scale(1.1)')}
  /* listi šustí */
  for(k=0;k<amb.sway.length;k++){var sw=amb.sway[k];if(!vis(sw))continue;
    sw.g.setAttribute('transform','rotate('+n(sin(time*sw.f+sw.ph)*.9+sin(time*sw.f*2.7)*.35)+' '+n(sw.x)+' '+n(sw.y)+')')}
});
});
