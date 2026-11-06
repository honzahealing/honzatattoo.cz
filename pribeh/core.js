/* pribeh/core.js - jadro pribehu: plany s paralaxou, kamera, kresleni linek, casova osa, bubliny, UI.
   Moduly (street.js, studio.js, close.js, chars.js) se registruji pres ST.module(name, build) a kresli do ST.L / ST.plane(). */
(function(){
'use strict';
var NS='http://www.w3.org/2000/svg',R=Math.PI/180;
var ST=window.ST={GY:700,N:13,R:R,NS:NS,slots:{},L:{},mods:[],closeParts:{}};
var Q=new URLSearchParams(location.search);
ST.debug={T:Q.has('T')?+Q.get('T'):null,cam:Q.has('cam')?Q.get('cam').split(',').map(Number):null,nochars:Q.has('nochars'),only:Q.get('only')};
var reduce=ST.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- pomocne funkce ---------- */
function el(tag,a,p){var e=document.createElementNS(NS,tag);if(a)for(var k in a)if(a[k]!=null)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function clamp(v){return v<0?0:v>1?1:v}
function lin(a,b,v){return clamp((v-a)/(b-a))}
function ss(a,b,v){var t=lin(a,b,v);return t*t*(3-2*t)}
function lerp(a,b,t){return a+(b-a)*t}
ST.el=el;ST.clamp=clamp;ST.lin=lin;ST.ss=ss;ST.lerp=lerp;
ST.rng=function(seed){var s=(seed%2147483646)+1;return function(){s=(s*16807)%2147483647;return (s-1)/2147483646}};
ST.circ=function(cx,cy,r){return 'M'+(cx-r)+','+cy+'a'+r+','+r+' 0 1,0 '+(2*r)+',0a'+r+','+r+' 0 1,0 '+(-2*r)+',0'};
ST.ellipse=function(cx,cy,rx,ry){return 'M'+(cx-rx)+','+cy+'a'+rx+','+ry+' 0 1,0 '+(2*rx)+',0a'+rx+','+ry+' 0 1,0 '+(-2*rx)+',0'};
ST.rect=function(x,y,w,h,r){r=r||0;if(!r)return 'M'+x+','+y+'h'+w+'v'+h+'h'+(-w)+'Z';
  return 'M'+(x+r)+','+y+'h'+(w-2*r)+'q'+r+',0 '+r+','+r+'v'+(h-2*r)+'q0,'+r+' '+(-r)+','+r+'h'+(-(w-2*r))+'q'+(-r)+',0 '+(-r)+','+(-r)+'v'+(-(h-2*r))+'q0,'+(-r)+' '+r+','+(-r)+'Z'};
ST.wline=function(x0,x1,y,amp,step,rnd){rnd=rnd||Math.random;var d='M'+x0+','+y;for(var x=x0+step;x<=x1+.01;x+=step){d+=' Q'+(x-step/2).toFixed(1)+','+(y+(rnd()-.5)*amp*2).toFixed(1)+' '+x.toFixed(1)+','+(y+(rnd()-.5)*amp).toFixed(1)}return d};

/* ---------- svet: vrstvy a plany ---------- */
var world=document.getElementById('world');
ST.defs=world.querySelector('defs');ST.closeDefs=document.querySelector('#close defs');
var LAYERS=['sky','far','mid','back','room','light','fig','front','fore'],layers={};
LAYERS.forEach(function(n){layers[n]=el('g',{id:'L-'+n},world)});
var planes=[],sections=[];
/* plan s paralaxou: f=1 je hlavni rovina (postavy), f<1 dal (pomaleji), f>1 popredi (rychleji).
   ax,ay = kotva: obsah nakresleny ve svetovych souradnicich sedi presne, kdyz kamera stoji v kotve. */
ST.plane=function(layer,f,ax,ay){var g=el('g',{},layers[layer]);var p={g:g,f:f,ax:ax||0,ay:ay==null?470:ay};g._plane=p;planes.push(p);return g};
['back','room','light','fig','front'].forEach(function(n){ST.L[n]=ST.plane(n,1,0,0)});
function planeOf(g){while(g&&!g._plane)g=g.parentNode;return g?g._plane:null}
/* sekce: skupina, ktera se nevykresluje, kdyz je mimo zaber (vykon) */
ST.section=function(parent,x0,x1){var g=el('g',{},parent);sections.push({g:g,x0:x0,x1:x1,p:null,parent:parent,vis:true});return g};

/* ---------- kresleni linek a stmivani ---------- */
var draws=[],fades=[],ups=[];
ST.D=function(parent,d,cls,t0,t1,o){
  var p=el('path',{d:d,'class':'ink '+(cls||''),pathLength:1},parent);
  if(o&&o.fill)p.style.fill=o.fill;
  if(t0==='load'){p.classList.add('ld');p.style.animationDelay=(t1||0)+'s'}
  else if(t0!=null){p.classList.add('dr');draws.push({e:p,t0:t0,t1:t1,fill:!!(o&&o.fill)||/\b(solid|t1|t2|t3)\b/.test(cls||''),k:-1})}
  return p;
};
ST.fade=function(e,t0,t1,max,t2,t3){fades.push({e:e,t0:t0,t1:t1,max:max==null?1:max,t2:t2,t3:t3,k:-1});e.setAttribute('opacity',0);return e};
ST.on=function(fn){ups.push(fn)};
ST.slot=function(name,g){ST.slots[name]=g;return g};
ST.module=function(name,build){ST.mods.push({name:name,build:build})};
/* stav lampy u kresla (0..1) - pouziva studio i jadro */
ST.lamp=function(T){return ss(7.3,7.6,T)*(1-ss(10.95,11.3,T))};
ST.talk={c:0,h:0};
ST.heads={c:null,h:null};

/* ---------- kamera: [T, x, y, sirka zaberu, vyska zaberu] ---------- */
var KEYS=[
  [0,    0,   470,1500,900],
  [0.9,  160, 480,1400,860],
  [2.0,  820, 470,1150,720],
  [2.7,  1350,470,1050,680],
  [3.3,  1560,480, 900,600],
  [4.5,  1560,490, 880,600],
  [5.05, 1577,525, 520,380],
  [5.85, 1577,525, 520,380],
  [6.3,  1830,470, 760,520],
  [6.8,  2300,480,1150,720],
  [7.45, 2900,500, 820,560],
  [7.95, 2862,524, 300,210],
  [10.7, 2862,524, 300,210],
  [11.1, 2950,490, 950,640],
  [11.7, 3330,480,1100,700],
  [12.55,3980,360,1700,1050],
  [13,   3980,360,1700,1050]
];
ST.KEYS=KEYS;
function monotone(xs,ys){
  var n=xs.length,d=[],m=[],i;
  for(i=0;i<n-1;i++)d[i]=(ys[i+1]-ys[i])/(xs[i+1]-xs[i]);
  m[0]=0;m[n-1]=0;
  for(i=1;i<n-1;i++){if(d[i-1]*d[i]<=0)m[i]=0;else{var h0=xs[i]-xs[i-1],h1=xs[i+1]-xs[i],w1=2*h1+h0,w2=h1+2*h0;m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i])}}
  return function(x){
    if(x<=xs[0])return ys[0];if(x>=xs[n-1])return ys[n-1];
    var k=0;while(x>xs[k+1])k++;
    var h=xs[k+1]-xs[k],t=(x-xs[k])/h,t2=t*t,t3=t2*t;
    return (2*t3-3*t2+1)*ys[k]+(t3-2*t2+t)*h*m[k]+(-2*t3+3*t2)*ys[k+1]+(t3-t2)*h*m[k+1];
  };
}
var camX,camY,camW,camH;
function buildCam(){var kt=KEYS.map(function(k){return k[0]});
  camX=monotone(kt,KEYS.map(function(k){return k[1]}));camY=monotone(kt,KEYS.map(function(k){return k[2]}));
  camW=monotone(kt,KEYS.map(function(k){return Math.log(k[3])}));camH=monotone(kt,KEYS.map(function(k){return Math.log(k[4])}));}

/* ---------- motiv tetovani (lotos se slunecni aureolou) ---------- */
function petalD(w,h){return 'M0,0 C'+w+','+(-h*.35)+' '+(w*.55)+','+(-h*.86)+' 0,'+(-h)+' C'+(-w*.55)+','+(-h*.86)+' '+(-w)+','+(-h*.35)+' 0,0Z'}
function buildMotif(parent,o){
  var g=el('g',{},parent),items=[],glow=null,rnd=ST.rng(77),fine=o.cls+' fine';
  if(o.gold)glow=el('path',{d:ST.circ(0,-58,96),fill:'url(#gHalo)',opacity:0},g);
  function add(d,p,c){var e=el('path',{d:d,'class':c||o.cls,pathLength:1},p||g);items.push({e:e});return e}
  add(ST.circ(0,-58,84));
  add(ST.circ(0,-58,78),null,fine);
  [[0,30,118,0],[-36,27,100,0],[36,27,100,0],[-58,23,66,1],[58,23,66,1],[-17,25,84,1],[17,25,84,1]].forEach(function(q){
    var pg=el('g',{transform:'rotate('+q[0]+')'},g);
    var base=el('path',{d:petalD(q[1],q[2]),fill:o.skin,stroke:'none',opacity:0},pg),gf=null;
    if(o.gold)gf=el('path',{d:petalD(q[1],q[2]),fill:q[3]?'url(#gPetalF)':'url(#gPetalB)',stroke:'none',opacity:0},pg);
    var s=el('path',{d:petalD(q[1],q[2]),'class':o.cls,pathLength:1},pg);
    items.push({e:s,base:base,gf:gf});
    add('M0,-6 Q'+(q[1]*.14)+','+(-q[2]*.45)+' 0,'+(-q[2]*.8),pg,fine);
    add('M0,-4 C'+(q[1]*.62)+','+(-q[2]*.3)+' '+(q[1]*.36)+','+(-q[2]*.7)+' 0,'+(-q[2]*.84),pg,fine);
  });
  add('M-74,2 Q0,36 74,2');
  add('M-62,8 Q0,30 62,8',null,fine);
  add('M-96,24 c16,-7 32,-7 48,0 s32,7 48,0 s32,-7 48,0 s32,7 48,0');
  add('M-62,40 c15,-6 30,-6 45,0 s30,6 45,0 s30,-6 45,0');
  add('M-34,54 c11,-4 22,-4 34,0 s22,4 34,0',null,fine);
  for(var a=-160;a<=-20;a+=11.67){var lg=Math.round((a+160)/11.67)%2===0,r0=100,r1=lg?124:112;
    add('M'+(Math.cos(a*R)*r0).toFixed(1)+','+(-58+Math.sin(a*R)*r0).toFixed(1)+' L'+(Math.cos(a*R)*r1).toFixed(1)+','+(-58+Math.sin(a*R)*r1).toFixed(1),null,lg?o.cls:fine)}
  add('M0,-212 L6,-196 L0,-180 L-6,-196 Z');
  add('M0,-204 L0,-188 M-3,-196 L3,-196',null,fine);
  var dots=[],dc=o.gold?'#C8A45C':'#E7DDC7';
  for(var a2=-172;a2<=-8;a2+=8.2)dots.push(el('path',{d:ST.circ(Math.cos(a2*R)*92,-58+Math.sin(a2*R)*92,2.1),fill:dc,opacity:0},g));
  /* teckovani (dotwork) v dolni casti aureoly */
  for(var i=0;i<70;i++){var aa=(10+rnd()*160)*R,rr=60+rnd()*22,x=Math.cos(aa)*rr,y=-58+Math.sin(aa)*rr*.35+22;
    if(Math.abs(x)<40)continue;dots.push(el('path',{d:ST.circ(x,y,.9+rnd()*.9),fill:dc,opacity:0},g))}
  dots.push(el('path',{d:ST.circ(0,64,2.6),fill:dc,opacity:0},g));
  dots.push(el('path',{d:ST.circ(0,75,1.8),fill:dc,opacity:0},g));
  dots.push(el('path',{d:ST.circ(0,84,1.2),fill:dc,opacity:0},g));
  var total=0;items.forEach(function(it){it.len=it.e.getTotalLength()||1;it.c=total;total+=it.len});
  return {g:g,items:items,dots:dots,total:total,dotLen:total*.14,glow:glow,last:-1};
}
function setMotif(m,k){
  if(Math.abs(m.last-k)<1e-5)return m.tip;m.last=k;
  var target=k*(m.total+m.dotLen),tip=null;
  for(var i=0;i<m.items.length;i++){
    var it=m.items[i],u=clamp((target-it.c)/it.len);
    it.e.style.strokeDasharray='1 1';it.e.style.strokeDashoffset=(1-u);
    it.e.style.visibility=u<=0?'hidden':'visible';
    if(it.base)it.base.setAttribute('opacity',u);
    if(u>0&&u<1&&!tip)tip={e:it.e,len:it.len*u};
  }
  var dk=clamp((target-m.total)/m.dotLen),nd=Math.floor(dk*m.dots.length);
  for(var j=0;j<m.dots.length;j++)m.dots[j].setAttribute('opacity',j<nd?1:0);
  if(!tip&&dk>0&&dk<1)tip={e:m.dots[Math.min(m.dots.length-1,nd)],len:0};
  m.tip=tip;return tip;
}
function healMotif(m,h){m.items.forEach(function(it){if(it.gf)it.gf.setAttribute('opacity',(h*.95).toFixed(3))});if(m.glow)m.glow.setAttribute('opacity',(h*.9).toFixed(3))}

/* ---------- bubliny a kroky ---------- */
var BUB=[
  ['c',3.1,3.8,'Dobrý den. Přemýšlím o tetování, ale ještě nevím přesně jaké.'],
  ['h',3.45,4.25,'To je dobrý začátek. Co by pro vás mělo znamenat?'],
  ['c',3.95,4.62,'Něco světlého. Aby mi připomínalo, že to zvládnu.'],
  ['h',5.0,5.65,'Nakreslím vám návrh na míru. Ladíme ho, dokud nesedí.'],
  ['c',5.45,6.0,'Přesně tohle.'],
  ['h',6.02,6.62,'Termín potvrdíte zálohou. Všechno máme domluvené předem.'],
  ['h',7.5,7.98,'Pohodlně? Tak začneme.'],
  ['c',8.45,9.15,'Čas tady utíká nějak rychle.',{fx:.07,fy:.16,side:'l'}],
  ['h',8.8,9.45,'Kdykoli budete chtít pauzu, řekněte.',{fx:.93,fy:.3,side:'r',mfy:.7}],
  ['h',9.72,10.5,'Návod k péči dostanete s sebou. A kdyby cokoli, napište mi.',{fx:.5,fy:.13,side:'c',mfy:.7}],
  ['c',11.02,11.55,'Je to krásné.'],
  ['h',11.28,11.9,'Ať vám dělá radost každý den.']
];
var STEPS=[
  ['První kontakt',1.3,3.1,'Napíšete mi svou představu: motiv, velikost, umístění. Klidně přiložte reference.'],
  ['Konzultace',3.1,4.75,'Probereme detaily, styl a umístění. Osobní konzultace je nezávazná a zdarma.'],
  ['Návrh',4.75,5.95,'Připravím unikátní návrh na míru a pošlu vám náhled k odsouhlasení.'],
  ['Záloha a termín',5.95,6.9,'Termín potvrdíte zálohou 1 000–2 500 Kč. Odečte se z finální ceny.'],
  ['Tetování',6.9,9.55,'V klidu a pohodě ve studiu na Žižkově. Malé tetování 1–2 hodiny, větší 3–5.'],
  ['Péče a hojení',9.55,10.7,'Dostanete podrobný návod k péči. Hojení trvá 2–3 týdny a jsem po celou dobu k dispozici.'],
  ['Hotovo',10.7,12.35,'Zahojené tetování, které vás těší pokaždé, když se na něj podíváte.']
];

function $(id){return document.getElementById(id)}
var vw=0,vh=0,unit=0,T=0,Tt=0,lastTs=0,mobile=false,story,cap,capN,capT,capP,curStep=-1,cam={};
ST.cam=cam;

ST.start=function(){
  story=$('story');cap=$('caption');capN=$('capN');capT=$('capT');capP=$('capP');
  buildCam();
  ST.mods.forEach(function(m){
    if(ST.debug.only&&ST.debug.only.split(',').indexOf(m.name)<0)return;
    if(ST.debug.nochars&&m.name==='chars')return;
    try{m.build(ST)}catch(e){console.error('modul '+m.name+': '+e.message+'\n'+e.stack)}
  });
  sections.forEach(function(s){s.p=planeOf(s.parent)});
  /* skica na desce (slot od studia) */
  if(ST.slots.board)ST.bm=buildMotif(ST.slots.board,{cls:'sk',skin:'var(--t1)'});
  /* detail ruky */
  var cs=$('closeScene');ST.closeBack=ST.closeBack||el('g',{},cs);
  var motifG=el('g',{transform:'translate(760,578) scale(1.2,1.14)'},cs);
  ST.closeFront=ST.closeFront||el('g',{},cs);
  ST.red=el('ellipse',{cx:760,cy:470,rx:240,ry:175,fill:'url(#gRed)',opacity:0});cs.insertBefore(ST.red,motifG);
  ST.tm=buildMotif(motifG,{cls:'tt',skin:'var(--skin)',gold:true});
  ST.film=el('path',{d:ST.rect(556,296,408,368,48),fill:'url(#gFilm)',stroke:'rgba(231,221,199,.22)','stroke-width':1.5,opacity:0},cs);
  cs.appendChild(ST.closeFront);
  if(!ST.closeParts.machine){var mg=el('g',{},ST.closeFront);el('path',{d:'M0,0 L120,-190','class':'ink bold'},mg);ST.closeParts.machine=mg}
  ST.needle=el('circle',{r:16,fill:'url(#gNeedle)',opacity:0},cs);
  buildUI();
  size();T=Tt=ST.debug.T!=null?ST.debug.T:targetT();
  addEventListener('resize',size);
  requestAnimationFrame(frame);
};

function buildUI(){
  var bw=$('bubbles');
  BUB.forEach(function(b){
    var d=document.createElement('div');d.className='bub '+(b[4]?(b[4].side==='r'?'r':b[4].side==='c'?'free':'l'):(b[0]==='c'?'l':'r'));
    d.innerHTML='<b>'+(b[0]==='c'?'Vy':'Honza')+'</b><p><span class="v"></span><span class="h"></span></p>';
    bw.appendChild(d);b.el=d;b.v=d.querySelector('.v');b.h=d.querySelector('.h');b.n=-1;
  });
  var nav=$('steps');
  STEPS.forEach(function(s,i){
    var b=document.createElement('button');b.type='button';b.innerHTML='<span class="tr"><i></i></span>'+(i+1)+' · '+s[0];
    b.setAttribute('aria-label','Krok '+(i+1)+': '+s[0]);
    b.addEventListener('click',function(){scrollToT(s[1]+.25)});
    nav.appendChild(b);s.btn=b;s.bar=b.querySelector('i');
  });
  try{var c=document.createElement('canvas');c.width=c.height=180;var x=c.getContext('2d'),im=x.createImageData(180,180);
    for(var i=0;i<im.data.length;i+=4){var v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}
    x.putImageData(im,0,0);$('grain').style.backgroundImage='url('+c.toDataURL()+')'}catch(e){}
}

function size(){
  var nvw=innerWidth,nvh=innerHeight;
  if(nvw===vw&&Math.abs(nvh-vh)<120&&unit)return;
  vw=nvw;vh=nvh;mobile=vw<720;unit=vh*.85;
  story.style.height=(ST.N*unit+vh)+'px';
  var cl=$('close'),asp=vw/vh;
  if(asp>=1.25)cl.setAttribute('viewBox','0 0 1600 900');
  else{var w=asp<.8?720:900,h=w/asp;cl.setAttribute('viewBox',(760-w/2)+' '+(470-h/2)+' '+w+' '+h)}
}
function targetT(){var span=story.offsetHeight-vh;return clamp((scrollY-story.offsetTop)/span)*ST.N}
function scrollToT(t){var span=story.offsetHeight-vh;scrollTo({top:story.offsetTop+t/ST.N*span,behavior:reduce?'auto':'smooth'})}
ST.scrollToT=scrollToT;
function toScreen(x,y){return {x:(x-cam.x)*cam.s+vw/2,y:(y-cam.y)*cam.s+vh/2}}
ST.toScreen=toScreen;

function updateCam(time){
  var w=Math.exp(camW(T)),h=Math.exp(camH(T));
  cam.x=camX(T);cam.y=camY(T);cam.s=Math.min(vw/w,vh/h);
  if(vw<vh){cam.s*=1.5;cam.y=ST.GY-.17*vh/cam.s+(cam.y-470)*.4}
  if(ST.debug.cam){var dc=ST.debug.cam;cam.x=dc[0];cam.y=dc[1];cam.s=Math.min(vw/dc[2],vh/dc[3])}
  else if(!reduce){cam.x+=Math.sin(time*.00031)*2.2;cam.y+=Math.cos(time*.00027)*1.6}
  cam.vw=vw;cam.vh=vh;cam.T=T;
  var hw=vw/2/cam.s,hh=vh/2/cam.s;
  cam.x0=cam.x-hw;cam.x1=cam.x+hw;cam.y0=cam.y-hh;cam.y1=cam.y+hh;
  for(var i=0;i<planes.length;i++){var p=planes[i],ex=p.ax+(cam.x-p.ax)*p.f,ey=p.ay+(cam.y-p.ay)*p.f;p.ex=ex;
    p.g.setAttribute('transform','translate('+(vw/2).toFixed(1)+','+(vh/2).toFixed(1)+') scale('+cam.s.toFixed(4)+') translate('+(-ex).toFixed(1)+','+(-ey).toFixed(1)+')')}
  for(var j=0;j<sections.length;j++){var s=sections[j],ex2=s.p?s.p.ex:cam.x,v=s.x1>ex2-hw-150&&s.x0<ex2+hw+150;
    if(v!==s.vis){s.vis=v;s.g.style.display=v?'':'none'}}
}

function render(time){
  updateCam(time);
  var i,k;
  for(i=0;i<draws.length;i++){var d=draws[i];k=ss(d.t0,d.t1,T);if(Math.abs(k-d.k)<1e-4)continue;d.k=k;
    d.e.style.strokeDashoffset=(1-k);d.e.style.visibility=k<=0?'hidden':'visible';if(d.fill)d.e.style.fillOpacity=k}
  for(i=0;i<fades.length;i++){var f=fades[i];k=f.max*ss(f.t0,f.t1,T)*(f.t2!=null?1-ss(f.t2,f.t3,T):1);if(Math.abs(k-f.k)<1e-4)continue;f.k=k;f.e.setAttribute('opacity',k.toFixed(3))}
  for(i=0;i<ups.length;i++){try{ups[i](T,time,cam)}catch(e){if(!ups[i].err){ups[i].err=1;console.error(e)}}}
  if(ST.bm)setMotif(ST.bm,ss(5.05,5.85,T));

  /* lampa: stmivani okoli */
  var lamp=ST.lamp(T),lp=toScreen(2866,500),dim=$('dimmer');
  dim.style.opacity=lamp;
  if(lamp>0)dim.style.background='radial-gradient(circle at '+lp.x.toFixed(0)+'px '+lp.y.toFixed(0)+'px, transparent 0, transparent '+(130*cam.s).toFixed(0)+'px, rgba(4,5,7,.62) '+(520*cam.s).toFixed(0)+'px)';

  /* detail ruky */
  var cl=$('close'),co=ss(7.8,8.15,T)*(1-ss(10.55,10.85,T));
  cl.style.opacity=co;cl.style.visibility=co<=0?'hidden':'visible';
  if(co>0){
    var tk=ss(8.1,9.5,T),tip=setMotif(ST.tm,tk);
    healMotif(ST.tm,ss(9.6,10.45,T));
    ST.red.setAttribute('opacity',(ss(8.6,9.5,T)*(1-ss(9.8,10.35,T))).toFixed(3));
    ST.film.setAttribute('opacity',(ss(9.45,9.62,T)*(1-ss(9.95,10.3,T))).toFixed(3));
    var mOn=ss(7.95,8.15,T)*(1-ss(9.45,9.62,T)),mach=ST.closeParts.machine;
    if(tip){var pt=tip.e.getPointAtLength?tip.e.getPointAtLength(tip.len):null;
      if(pt){var M=$('closeScene').getCTM().inverse().multiply(tip.e.getCTM()),q=pt.matrixTransform(M),j=reduce?0:Math.sin(time*.09)*.9;
        mach.setAttribute('transform','translate('+(q.x+j).toFixed(1)+','+(q.y-j).toFixed(1)+')');
        ST.needle.setAttribute('cx',q.x.toFixed(1));ST.needle.setAttribute('cy',q.y.toFixed(1));ST.closeTip={x:q.x,y:q.y}}}
    else if(tk<=0)mach.setAttribute('transform','translate(1000,330)');
    else if(tk>=1)mach.setAttribute('transform','translate(1040,300)');
    mach.setAttribute('opacity',mOn.toFixed(3));
    ST.needle.setAttribute('opacity',((tip&&tk>0&&tk<1?1:0)*mOn).toFixed(3));
  }
  var days=$('days');days.style.opacity=ss(9.55,9.7,T)*(1-ss(10.5,10.7,T));
  $('dayN').textContent=Math.round(1+20*lin(9.65,10.45,T));

  /* uvod a konec */
  var intro=$('intro'),io=1-ss(.3,1.0,T);intro.style.opacity=io;intro.style.transform='translateY('+(-50*(1-io)).toFixed(1)+'px)';intro.style.visibility=io<=0?'hidden':'visible';
  $('introfade').style.opacity=io;$('hint').style.opacity=1-ss(.05,.4,T);
  var cta=$('cta'),ct=ss(12.3,12.75,T);cta.style.opacity=ct;cta.style.transform='translate(-50%,'+(24*(1-ct)).toFixed(1)+'px)';cta.style.pointerEvents=ct>.5?'auto':'none';
  $('steps').style.opacity=1-ss(12.3,12.6,T)*.75;

  /* bubliny */
  var placed=[],capR=cap.getBoundingClientRect(),floor=vh-Math.max(110,(vh-capR.top)+14);
  ST.talk.c=0;ST.talk.h=0;
  for(var b=0;b<BUB.length;b++){
    var B=BUB[b],t0=B[1],t1=B[2],vis=ss(t0,t0+.07,T)*(1-ss(t1-.07,t1,T));
    if(vis<=0){if(B.shown){B.el.style.opacity=0;B.shown=false}continue}
    B.shown=true;
    var txt=B[3],n=Math.round(txt.length*lin(t0+.02,t0+(t1-t0)*.42,T));
    if(n>0&&n<txt.length)ST.talk[B[0]]=1;
    if(n!==B.n){B.n=n;B.v.textContent=txt.slice(0,n);B.h.textContent=txt.slice(n)}
    var bw=B.el.offsetWidth,bh=B.el.offsetHeight,x,y;
    if(B[4]){var a=B[4];x=a.side==='r'?a.fx*vw-bw:a.side==='c'?a.fx*vw-bw/2:a.fx*vw;y=(mobile&&a.mfy?a.mfy:a.fy)*vh+(mobile?20:0)}
    else{var hd=ST.heads[B[0]];if(!hd)hd={x:B[0]==='c'?1330:1760,y:380};var sp=toScreen(hd.x,hd.y);
      y=sp.y-bh-22;x=B[0]==='c'?sp.x-34:sp.x-bw+34}
    x=Math.max(16,Math.min(vw-bw-16,x));y=Math.max(70,Math.min(floor-bh,y));
    for(var pi=0;pi<placed.length;pi++){var q2=placed[pi];
      if(x<q2.x+q2.w+8&&x+bw+8>q2.x&&y<q2.y+q2.h+8&&y+bh+8>q2.y){var up=q2.y-bh-12;y=up>=70?up:q2.y+q2.h+12}}
    placed.push({x:x,y:y,w:bw,h:bh});
    B.el.style.opacity=vis.toFixed(3);
    B.el.style.transform='translate('+x.toFixed(0)+'px,'+(y+(1-vis)*10).toFixed(0)+'px) scale('+(.94+.06*vis).toFixed(3)+')';
    B.el.style.transformOrigin=B[0]==='c'?'20px 100%':'calc(100% - 20px) 100%';
  }

  /* popisek kroku */
  var si=-1;for(var s=0;s<STEPS.length;s++){var st=STEPS[s];st.bar.style.width=(lin(st[1],st[2],T)*100).toFixed(1)+'%';if(T>=st[1]&&T<st[2])si=s}
  if(si!==curStep){if(curStep>=0)STEPS[curStep].btn.classList.remove('on');curStep=si;
    if(si>=0){STEPS[si].btn.classList.add('on');capN.textContent='Krok '+(si+1)+' ze 7';capT.textContent=STEPS[si][0];capP.textContent=STEPS[si][3]}}
  var cv=0;if(si>=0){var S2=STEPS[si];cv=ss(S2[1],S2[1]+.18,T)*(1-ss(S2[2]-.18,S2[2],T));if(si===0)cv=ss(1.3,1.55,T)*(1-ss(2.92,3.1,T))}
  cap.style.opacity=cv.toFixed(3);cap.style.transform='translateY('+((1-cv)*12).toFixed(1)+'px)';
}

function frame(ts){
  var dt=Math.min(64,ts-(lastTs||ts));lastTs=ts;
  if(ST.debug.T!=null)T=ST.debug.T;
  else{Tt=targetT();if(reduce)T=Tt;else{var f=1-Math.exp(-dt/110);T+=(Tt-T)*f;if(Math.abs(Tt-T)<.0005)T=Tt}}
  render(ts);
  requestAnimationFrame(frame);
}
})();
