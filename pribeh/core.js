/* pribeh/core.js - jadro pribehu: plany s paralaxou, kamera, kresleni linek, casova osa, bubliny, UI.
   Moduly (street.js, studio.js, close.js, chars.js) se registruji pres ST.module(name, build) a kresli do ST.L / ST.plane(). */
(function(){
'use strict';
var NS='http://www.w3.org/2000/svg',R=Math.PI/180;
var ST=window.ST={GY:700,N:14,R:R,NS:NS,slots:{},L:{},mods:[],closeParts:{}};
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
/* repliky: ST.onSay(fn) -> fn(kdo 'c'|'h', text, t0, t1) pri vstupu bubliny scrollem dopredu */
var sayFns=[];ST.onSay=function(fn){sayFns.push(fn)};var lastT=0;
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
  [11.1, 2950,490, 950,640],
  [11.7, 3330,480,1100,700],
  [12.55,3980,360,1700,1050],
  [13.15,3980,360,1700,1050],
  [14,   3980,360,1700,1050]
];
ST.KEYS=KEYS;
/* predlokti klientky: zapesti ve svete (W0) odpovida bodu C0 v detailu, K = jednotek detailu na jednotku sveta */
var ZW0=[2897,526],ZC0=[1320,478],ZK=36;ST.zoomMap={W0:ZW0,C0:ZC0,K:ZK};
/* fotka andela v rame na zdi studia: na konci do ni kamera najede a fotka navaze na film (#hero) */
var PH={x:0,y:0,w:100,h:150,iw:1333,ih:2000,src:'img/hero.webp',st:'gold',light:1};ST.photo=PH;
/* galerie na zdi studia. GAL = fotky filmu v poradi zaberu (#hero .sc-shot), kamera mezi nimi preleta po zdi.
   Polohy pocita rozveseni (layoutWall): skupiny sloupcu, stejna mezera mezi vnejsimi okraji ramu, sloupce na spolecne ose.
   Nad tetovacim kreslem (x 2860-3100) zustava volno pro rameno lampy. */
var GAL=[PH,
  {iw:1024,ih:1536,src:'img/ja-u-prace.webp',st:'wood',light:1},
  {iw:455,ih:600,src:'img/tattoo6.jpg',st:'gold',light:1},
  {iw:400,ih:600,src:'img/tattoo1.jpg',st:'black'},
  {iw:345,ih:600,src:'img/tattoo5.jpg',st:'black'},
  {iw:533,ih:800,src:'img/tattoo_main.jpg',st:'gold',light:1}];
var WI={
  lev:{iw:400,ih:600,src:'img/tattoo2.jpg',st:'mat'},
  andel:{iw:400,ih:600,src:'img/tattoo3.jpg',st:'wood',light:1},
  prace:{iw:450,ih:600,src:'img/tattoo_work.jpg',st:'mat'},
  poseidon:{iw:337,ih:600,src:'img/tattoo7.jpg',st:'black'},
  postava:{iw:413,ih:600,src:'img/tattoo4.jpg',st:'black'},
  portret:{iw:600,ih:1067,src:'img/about.jpg',st:'mat'},
  omne:{card:1,tag:'O MNĚ',t:['Tetuji výhradně','*pozitivní* motivy'],b:['Každé tetování je pro mě','forma umění a výraz krásy.']},
  styl:{card:1,tag:'STYL',t:['Estetika a','*pozitivní energie*'],b:['Realismus · Zvířata · Portréty','Květiny · Nápisy · Barvy']},
  filo:{card:1,tag:'FILOZOFIE',t:['Tělo je plátno.','Jehla je *štětec.*'],b:['A výsledek: příběh navždy.']},
  rem:{card:1,tag:'ŘEMESLO',t:['Preciznost','v každém *detailu*'],b:['Návrh na míru · Praha, Žižkov','12+ let zkušeností · Konzultace zdarma']},
  s4:{card:1,tag:'SPECIALIZACE · 04',t:['*Colour*'],b:['Výrazné barvy, živé kompozice']},
  s2:{card:1,tag:'SPECIALIZACE · 02',t:['*Zvířata*'],b:['S respektem k charakteru']},
  s3:{card:1,tag:'SPECIALIZACE · 03',t:['*Abstrakt*'],b:['Geometrie, flow a tvar']},
  s1:{card:1,tag:'SPECIALIZACE · 01',t:['Black & *Grey*'],b:['Jemné přechody a hloubka']},
  cert:{cert:1}};
var FM={gold:9,wood:8,mat:11,black:5,card:4,cert:7};
/* sloupec zaveseny od horni linie (pod nim je na zdi volno) */
function tc(c){c.top=1;return c}
function it(o,w,h){o.w=w;o.h=h||(o.iw?w*o.ih/o.iw:w);o.m=FM[o.card?'card':o.cert?'cert':o.st];return o}
/* steny: [x0, x1, horni hrana, skupiny] ; skupina = sloupce, sloupec = obrazy shora dolu */
var WALLS=[
  /* prava stena (tetovaci kout): obrazy konci nad operadlem kresla, nastennou lampou a polici s lahvickami */
  {x0:2574,x1:3396,top:258,gap:12,groups:[
    [[it(WI.omne,54,54),it(WI.styl,54,54)],[it(GAL[1],86)],tc([it(WI.prace,52),it(WI.filo,52,38),it(WI.rem,52,46)])],
    [[it(PH,94)],[it(WI.postava,42),it(WI.poseidon,38)],tc([it(WI.portret,44)])]]},
  /* leva stena (cekarna a stul): sloupec nad monsterou je zaveseny shora, aby do nej listy nezasahovaly */
  {x0:988,x1:1774,top:258,gap:12,groups:[
    [[it(WI.s4,64,44),it(WI.lev,64)],[it(GAL[5],124)],tc([it(WI.s2,58,40),it(GAL[3],58)])],
    [[it(GAL[4],54),it(WI.s3,54,40)],[it(WI.andel,82)]],
    [[it(GAL[2],96)],[it(WI.s1,64,44),it(WI.cert,64,64)]]]}];
var WALLITEMS=[];
function layoutWall(W){
  var G=W.gap,gs=W.groups.map(function(gr){var cols=gr.cols||gr;
    var cw=cols.map(function(c){return Math.max.apply(null,c.map(function(o){return o.w+2*o.m}))}),
        ch=cols.map(function(c){return c.reduce(function(a,o){return a+o.h+2*o.m},0)+G*(c.length-1)});
    return {cols:cols,cw:cw,ch:ch,top:gr.top,hc:Math.max.apply(null,ch.filter(function(h,i){return !cols[i].top}).concat([0])),w:cw.reduce(function(a,b){return a+b},0)+G*(cols.length-1),h:Math.max.apply(null,ch)}});
  /* vsechny skupiny na spolecne vodorovne ose (stred nejvyssi skupiny), skupina nad lampou zarovnana nahoru */
  var axis=W.top+Math.max.apply(null,gs.map(function(g){return g.top?0:g.hc}))/2;
  /* krajni skupiny ke krajum steny, prostredni na stred volneho mista (nebo do zadaneho useku) */
  var gx=[];gx[0]=W.x0;gx[gs.length-1]=W.x1-gs[gs.length-1].w;
  if(gs.length===3){var lo=W.mid?W.mid[0]:gx[0]+gs[0].w,hi=W.mid?W.mid[1]:gx[2];gx[1]=(lo+hi-gs[1].w)/2}
  gs.forEach(function(g,gi){var x=gx[gi];
    g.cols.forEach(function(col,ci){var y=col.top?W.top:g.top?W.top+(g.h-g.ch[ci])/2:axis-g.ch[ci]/2;
      col.forEach(function(o){var ow=o.w+2*o.m;o.x=x+(g.cw[ci]-ow)/2+o.m;o.y=y+o.m;y+=o.h+2*o.m+G;WALLITEMS.push(o)});
      x+=g.cw[ci]+G})})}
WALLS.forEach(layoutWall);
ST.gal=GAL;ST.galCam=null;
/* film zavola pri prechodu mezi zabery: a, b = index fotky, k = 0..1, ra, rb = obdelnik fotky na obrazovce {L,T,W} na koncich */
ST.gallery={fly:function(a,b,k,ra,rb){ST.galCam=a==null?null:{a:a,b:b,k:k,ra:ra,rb:rb}}};
function camFor(ph,r){var sc=r.W/ph.w;return {s:sc,x:ph.x+(vw/2-r.L)/sc,y:ph.y+(vh/2-r.T)/sc}}
function photoZoom(T){return ss(13.15,14,T)}
/* plynuly rozjezd i dojezd (nulova rychlost i zrychleni na koncich) */
function sm5(t){t=clamp(t);return t*t*t*(t*(t*6-15)+10)}
/* let kamery mezi dvema zabery [stred x, stred y, sirka zaberu]: oddaleni, prelet a priblizeni v jednom plynulem
   oblouku se stalou vnimanou rychlosti (van Wijk a Nuij, Smooth and efficient zooming and panning) */
function flyPath(p0,p1,rho){
  var x0=p0[0],y0=p0[1],w0=p0[2],dx=p1[0]-x0,dy=p1[1]-y0,w1=p1[2],d2=dx*dx+dy*dy,r2=rho*rho,r4=r2*r2;
  if(d2<1e-6){var S0=Math.log(w1/w0)/rho;return function(t){return [x0+t*dx,y0+t*dy,w0*Math.exp(rho*t*S0)]}}
  var d1=Math.sqrt(d2),b0=(w1*w1-w0*w0+r4*d2)/(2*w0*r2*d1),b1=(w1*w1-w0*w0-r4*d2)/(2*w1*r2*d1),
      q0=Math.log(Math.sqrt(b0*b0+1)-b0),q1=Math.log(Math.sqrt(b1*b1+1)-b1),S=(q1-q0)/rho,c0=Math.cosh(q0),s0=Math.sinh(q0);
  return function(t){if(t<=0)return [x0,y0,w0];if(t>=1)return [p1[0],p1[1],w1];
    var a=rho*t*S+q0,u=w0/(r2*d1)*(c0*Math.tanh(a)-s0);return [x0+u*dx,y0+u*dy,w0*c0/Math.cosh(a)]}}
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
/* let mezi fotkami: tabulka posunu (posun je umerny sirce zaberu, takze na obrazovce bezi stalou rychlosti) */
var flyC=null;
function flyLUT(ca,cb){
  var key=[ca.x,ca.y,ca.s,cb.x,cb.y,cb.s,vw,vh].map(function(v){return Math.round(v*100)}).join(',');
  if(flyC&&flyC.key===key)return flyC;
  var l0=Math.log(vw/ca.s),l1=Math.log(vw/cb.s),por=vw<vh,dxf=Math.abs(ca.x-cb.x),
      wP=por?Math.min(560,Math.max(380,dxf*.5+260)):Math.min(2300,Math.max(900*vw/vh,dxf+760)),
      B=Math.max(0,Math.log(wP)-(l0+l1)/2),N=160,P=[0],i,acc=0,prev=Math.exp(l0);
  for(i=1;i<=N;i++){var u=i/N,w=Math.exp(l0+(l1-l0)*u+B*Math.sin(Math.PI*u));acc+=(w+prev)/2;prev=w;P.push(acc)}
  for(i=0;i<=N;i++)P[i]/=acc;
  /* vyrovnani tempa: tabulka U prevadi cas na polohu na draze tak, aby se obraz na obrazovce hybal rovnomerneji
     (bez toho let u fotek sviha a uprostred skoro stoji) */
  var M=[0],dxw=Math.hypot(cb.x-ca.x,cb.y-ca.y),lwp=l0,ma=0;
  for(i=1;i<=N;i++){var u2=i/N,lw2=l0+(l1-l0)*u2+B*Math.sin(Math.PI*u2);ma+=Math.abs(lw2-lwp)*vw*.5+(P[i]-P[i-1])*dxw*vw/Math.exp((lw2+lwp)/2);lwp=lw2;M.push(ma)}
  var U=[0],j=0;for(i=1;i<=N;i++){var tg=i/N*ma;while(j<N-1&&M[j+1]<tg)j++;U.push((j+(tg-M[j])/((M[j+1]-M[j])||1))/N)}
  /* v oddaleni se zaber posune tak, aby zustal uvnitr studia */
  var mid=(ca.x+cb.x)/2,lo=900+wP/2,hi=3410-wP/2,Xw=lo<hi?Math.min(hi,Math.max(lo,mid)):2155;
  return flyC={key:key,l0:l0,l1:l1,B:B,P:P,U:U,N:N,off:Xw-mid,por:por}}
var camX,camY,camW,camH;
function buildCam(){var kt=KEYS.map(function(k){return k[0]});
  camX=monotone(kt,KEYS.map(function(k){return k[1]}));camY=monotone(kt,KEYS.map(function(k){return k[2]}));
  camW=monotone(kt,KEYS.map(function(k){return Math.log(k[3])}));camH=monotone(kt,KEYS.map(function(k){return Math.log(k[4])}));}

/* ST.seenAt(x) = cas pribehu, kdy bod x poprve vstoupi do zaberu (podle skutecneho pomeru stran okna).
   Studio a obrazy na zdi se podle toho dokresluji tesne pred kamerou, takze v zaberu nikdy neni prazdna zed. */
var seenR=null;
ST.seenAt=function(x){
  if(!seenR){seenR=[];var w0=innerWidth,h0=innerHeight,m=-1e9;
    for(var i=0;i<=700;i++){var t=i*.02,sc=Math.min(w0/Math.exp(camW(t)),h0/Math.exp(camH(t)));if(w0<h0)sc*=1.5;m=Math.max(m,camX(t)+w0/2/sc);seenR.push(m)}}
  for(var j=0;j<seenR.length;j++)if(seenR[j]>=x)return j*.02;
  return 14};

/* ---------- motiv tetovani: ara na vetvi (Honzuv motiv papouska) ----------
   lokalni souradnice: papousek vzpriamene, hlava nahore (y -296), ocas dole (y +120), sirka x -125..125 */
var PARROT={
  out:[
    'M 48,-266 C 40,-284 22,-296 2,-294 C -20,-292 -34,-278 -36,-256 C -38,-238 -42,-224 -48,-208',
    'M 48,-266 C 64,-276 86,-266 90,-244 C 93,-230 88,-216 80,-210 C 78,-218 76,-226 70,-232 C 64,-238 56,-240 50,-240',
    'M 50,-240 C 58,-236 70,-232 74,-226 C 72,-218 62,-214 52,-218 C 46,-221 40,-227 38,-232',
    'M 46,-262 C 36,-270 18,-270 10,-260 C 4,-250 8,-238 20,-234 C 30,-231 40,-234 44,-240',
    ST.circ(26,-254,5.4),
    'M 38,-232 C 46,-214 50,-188 46,-160 C 42,-130 34,-104 24,-84 C 18,-72 14,-62 12,-52',
    'M -22,-206 C 0,-178 8,-122 0,-80 C -2,-50 -4,-28 -8,-8 C -10,-12 -12,-16 -13,-20 C -14,-4 -15,8 -17,18 C -19,12 -21,8 -22,4 C -23,20 -24,32 -27,44',
    'M -27,44 C -36,14 -48,-20 -52,-70 C -58,-130 -56,-180 -48,-208',
    'M -10,-56 C -14,0 -18,80 -27,160 C -23,167 -16,165 -14,157 C -8,80 -3,0 2,-54',
    'M -26,-34 C -32,10 -40,60 -48,118 C -44,123 -38,121 -36,115 C -28,60 -21,10 -14,-36',
    'M 6,-52 C 10,-6 13,44 10,100 C 14,105 19,103 20,96 C 22,44 19,-6 15,-50',
    'M -118,-30 C -60,-36 0,-42 30,-46 C 70,-52 100,-58 122,-62 C 127,-56 125,-50 120,-48 C 100,-44 70,-36 30,-30 C 0,-27 -60,-20 -116,-14 C -121,-18 -122,-25 -118,-30 Z',
    'M 100,-52 C 124,-30 124,6 108,32 C 92,8 90,-26 100,-52 Z',
    'M -88,-24 C -64,0 -78,40 -106,56 C -112,24 -108,-8 -88,-24 Z',
    'M 72,-50 C 64,-76 72,-96 90,-104 C 96,-82 90,-62 72,-50 Z'
  ],
  fine:[
    'M 54,-262 C 68,-266 82,-256 86,-240','M 50,-240 C 56,-238 64,-236 70,-232',
    'M 18,-259 C 21,-263 31,-263 34,-257','M 14,-250 l 6,-1 M 22,-248 l 6,-1 M 30,-247 l 6,-1 M 16,-243 l 6,-1 M 25,-241 l 6,-1 M 34,-241 l 5,-1 M 20,-237 l 5,-1 M 29,-236 l 5,-1',
    'M 10,-50 C 12,-44 14,-40 18,-38 c 3,2 4,6 2,9 M 10,-50 C 6,-44 2,-40 -2,-38 c -3,2 -4,6 -2,9 M 4,-46 c 2,4 2,8 0,11',
    'M -11,-50 C -13,10 -17,90 -20,152','M -24,-30 C -30,16 -36,66 -42,114','M 10,-48 C 13,0 16,50 15,96','M -8,-12 L -12,-40 M -17,18 L -19,-6 M -27,44 L -30,10',
    'M 100,-52 C 108,-22 110,6 108,32 M 104,-36 l 9,-4 M 106,-20 l 10,-3 M 107,-4 l 9,-1 M 106,10 l 7,1 M 103,-30 l -7,-3 M 104,-14 l -8,-2 M 104,2 l -7,0',
    'M -88,-24 C -88,4 -94,30 -106,56 M -89,-10 l 8,0 M -91,4 l 8,2 M -95,18 l 7,3 M -98,32 l 6,4 M -90,-4 l -7,-3 M -93,12 l -7,-1 M -97,28 l -6,0',
    'M 72,-50 C 78,-70 84,-88 90,-104 M 78,-66 l 6,1 M 82,-78 l 6,0 M 76,-62 l -5,-5 M 80,-74 l -5,-5',
    'M -90,-24 l 14,-2 M -40,-30 c 6,2 12,2 18,-1 M 40,-42 c 6,1 12,0 16,-3 M 84,-50 c 5,1 9,0 12,-2',
    ST.circ(60,-45,4)
  ],
  fills:[
    ['M 48,-266 C 40,-284 22,-296 2,-294 C -20,-292 -34,-278 -36,-256 C -38,-238 -42,-224 -48,-208 L -22,-206 C -2,-182 6,-130 -2,-70 L 12,-52 C 14,-62 18,-72 24,-84 C 34,-104 42,-130 46,-160 C 50,-188 46,-214 38,-232 Z','#A8402E'],
    ['M -22,-206 C 0,-178 8,-122 0,-80 C -2,-50 -4,-28 -8,-8 C -10,-12 -12,-16 -13,-20 C -14,-4 -15,8 -17,18 C -19,12 -21,8 -22,4 C -23,20 -24,32 -27,44 C -36,14 -48,-20 -52,-70 C -58,-130 -56,-180 -48,-208 Z','#3B6C8E'],
    ['M -22,-206 C -10,-190 -4,-160 -2,-128 L -48,-124 C -54,-160 -54,-190 -48,-208 Z','#C9A24E'],
    ['M -22,-206 C -16,-200 -12,-194 -10,-188 L -50,-186 C -50,-196 -49,-202 -48,-208 Z','#A8402E'],
    ['M -10,-56 C -14,0 -18,80 -27,160 C -23,167 -16,165 -14,157 C -8,80 -3,0 2,-54 Z','#A8402E'],
    ['M -26,-34 C -32,10 -40,60 -48,118 C -44,123 -38,121 -36,115 C -28,60 -21,10 -14,-36 Z','#3B6C8E'],
    ['M 6,-52 C 10,-6 13,44 10,100 C 14,105 19,103 20,96 C 22,44 19,-6 15,-50 Z','#3B6C8E'],
    ['M 46,-262 C 36,-270 18,-270 10,-260 C 4,-250 8,-238 20,-234 C 30,-231 40,-234 44,-240 Z','#E7DDC7'],
    ['M 48,-266 C 64,-276 86,-266 90,-244 C 93,-230 88,-216 80,-210 C 78,-218 76,-226 70,-232 C 64,-238 56,-240 50,-240 Z','#D8CAAF'],
    ['M 50,-240 C 58,-236 70,-232 74,-226 C 72,-218 62,-214 52,-218 C 46,-221 40,-227 38,-232 Z','#2A2523'],
    ['M -118,-30 C -60,-36 0,-42 30,-46 C 70,-52 100,-58 122,-62 C 127,-56 125,-50 120,-48 C 100,-44 70,-36 30,-30 C 0,-27 -60,-20 -116,-14 C -121,-18 -122,-25 -118,-30 Z','#3A2B21'],
    ['M 100,-52 C 124,-30 124,6 108,32 C 92,8 90,-26 100,-52 Z','#3E5D45'],
    ['M -88,-24 C -64,0 -78,40 -106,56 C -112,24 -108,-8 -88,-24 Z','#3E5D45'],
    ['M 72,-50 C 64,-76 72,-96 90,-104 C 96,-82 90,-62 72,-50 Z','#4A6B4E']
  ]
};
/* pera: rady supin na krku a hrudi, krovky a letky na kridle */
(function(){
  var f=PARROT.fine,r,i,x,y;
  for(r=0;r<7;r++){y=-212+r*17;var x0=-30+r*1.5,x1=36-Math.abs(r-2.5)*2.5;var d='M '+x0+','+y;for(x=x0;x<x1;x+=9)d+=' q 4.5,6 9,0';f.push(d)}
  for(r=0;r<4;r++){y=-196+r*17;var d2='M '+(-49+r)+','+y;for(x=-49+r;x<-8-r*1.2;x+=9)d2+=' q 4.5,7 9,0';f.push(d2)}
  f.push('M -48,-126 q 6,9 12,0 t 12,0 t 12,0 t 11,0');
  for(i=0;i<5;i++){x=-46+i*8.4;f.push('M '+x+',-126 C '+(x-1)+',-70 '+(-36+i*3)+',-30 '+(-30+i*4.4)+','+(10-i*5))}
  for(i=0;i<5;i++){f.push('M '+(-26+i*6)+',-284 l 3,4 M '+(-30+i*7)+',-274 l 3,4')}
  f.push('M 0,-150 c -3,10 -3,22 0,32 M 12,-140 c -3,10 -3,20 0,30');
})();
function buildMotif(parent,o){
  var g=el('g',{},parent),items=[],glow=null,rnd=ST.rng(77),fine=o.cls+' fine',fills=[];
  var stencil=null;if(o.stencil){stencil=el('g',{opacity:0},g);PARROT.out.concat(PARROT.fine).forEach(function(d){el('path',{d:d,fill:'none',stroke:'rgba(150,132,206,.6)','stroke-width':1.5,'stroke-linecap':'round','stroke-linejoin':'round'},stencil)})}
  if(o.gold)glow=el('path',{d:ST.ellipse(0,-66,160,260),fill:'url(#gHalo)',opacity:0},g);
  if(o.gold||o.fills){
    if(!document.getElementById('gTatShade')){var gs=el('linearGradient',{id:'gTatShade',x1:0,y1:0,x2:.35,y2:1},ST.closeDefs);
      el('stop',{offset:0,'stop-color':'#FFF6DF','stop-opacity':.16},gs);el('stop',{offset:.45,'stop-color':'#000','stop-opacity':0},gs);el('stop',{offset:1,'stop-color':'#000','stop-opacity':.42},gs)}
    PARROT.fills.forEach(function(q){var fg=el('g',{opacity:0},g);el('path',{d:q[0],fill:q[1],stroke:'none'},fg);el('path',{d:q[0],fill:'url(#gTatShade)',stroke:'none'},fg);fills.push(fg)})}
  function add(d,c){var e=el('path',{d:d,'class':c,pathLength:1},g);items.push({e:e});return e}
  PARROT.out.forEach(function(d){add(d,o.cls)});
  PARROT.fine.forEach(function(d){add(d,fine)});
  /* teckovani (stin): pod kridlem, pod hlavou, spodek vetve, na ocase */
  var dots=[],dc=o.gold?'#C8A45C':'#E7DDC7',pupil=el('path',{d:ST.circ(27,-254,2.6),fill:dc,opacity:0},g);dots.push(pupil);
  function cloud(cx,cy,rx,ry,n,rmax){for(var i=0;i<n;i++){var a=rnd()*6.283,rr=Math.sqrt(rnd());dots.push(el('path',{d:ST.circ(cx+Math.cos(a)*rx*rr,cy+Math.sin(a)*ry*rr,.6+rnd()*(rmax||1.1)),fill:dc,opacity:0},g))}}
  cloud(4,-110,9,40,40);cloud(26,-226,10,6,16);cloud(-36,-60,8,30,26);cloud(0,-22,60,4,34,.9);cloud(-16,70,6,60,30,.9);cloud(-36,-120,6,30,18,.8);cloud(30,-150,6,24,18);cloud(-6,-250,14,10,18,.9);
  var total=0;items.forEach(function(it){it.len=it.e.getTotalLength()||1;it.c=total;total+=it.len});
  var cen=fills.map(function(f){try{var b=f.getBBox();return [b.x+b.width/2,b.y+b.height/2,Math.min(b.width,b.height)/3]}catch(e){return [0,-80,10]}});
  return {g:g,items:items,dots:dots,total:total,dotLen:total*.12,glow:glow,fills:fills,cen:cen,stencil:stencil,last:-1};
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
function healMotif(m,h){if(Math.abs((m.lh||0)-h)<1e-4)return;m.lh=h;m.fills.forEach(function(f){f.setAttribute('opacity',(h*.82).toFixed(3))});if(m.glow)m.glow.setAttribute('opacity',(h*.7).toFixed(3))}
/* vybarvovani plochu po plose (k = 0..1) */
function packMotif(m,k){if(Math.abs((m.lp==null?-1:m.lp)-k)<1e-4)return;m.lp=k;var n=m.fills.length;m.fills.forEach(function(f,i){f.setAttribute('opacity',(ss(i/n,(i+1)/n,k)*.84).toFixed(3))})}

/* ---------- bubliny a kroky ---------- */
var BUB=[
  ['c',3.1,3.8,'Dobrý den. Přemýšlím o tetování, ale ještě nevím přesně jaké.'],
  ['h',3.45,4.25,'To je dobrý začátek. Co by pro vás mělo znamenat?'],
  ['c',3.95,4.62,'Něco světlého. Aby mi připomínalo, že to zvládnu.'],
  ['h',5.0,5.65,'Nakreslím vám návrh na míru. Ladíme ho, dokud nesedí.'],
  ['c',5.45,6.0,'Přesně tohle.'],
  ['h',6.02,6.62,'Termín potvrdíte zálohou. Všechno máme domluvené předem.'],
  ['h',7.36,7.8,'Pohodlně? Tak začneme.'],
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
  buildCam();ST.hasHero=!!document.getElementById('hero');
  ST.mods.forEach(function(m){
    if(ST.debug.only&&ST.debug.only.split(',').indexOf(m.name)<0)return;
    if(ST.debug.nochars&&m.name==='chars')return;
    try{m.build(ST)}catch(e){console.error('modul '+m.name+': '+e.message+'\n'+e.stack)}
  });
  sections.forEach(function(s){s.p=planeOf(s.parent)});
  /* skica na desce (slot od studia) */
  if(ST.slots.board){var bcp=el('clipPath',{id:'boardClip'},ST.defs);el('rect',{x:-205,y:-246,width:410,height:324},bcp);
    ST.bm=buildMotif(el('g',{transform:'translate(0,-45) scale(.6)'},el('g',{'clip-path':'url(#boardClip)'},ST.slots.board)),{cls:'sk',skin:'var(--t1)',fills:true})}
  /* detail ruky */
  var cs=$('closeScene');ST.closeBack=ST.closeBack||el('g',{},cs);
  var motifG=el('g',{transform:'translate(760,546) scale(.7)'},cs);
  ST.closeFront=ST.closeFront||el('g',{},cs);
  ST.red=el('ellipse',{cx:760,cy:498,rx:212,ry:166,fill:'url(#gRed)',opacity:0});cs.insertBefore(ST.red,motifG);
  ST.tm=buildMotif(motifG,{cls:'tt',skin:'var(--skin)',gold:true,stencil:true});
  ST.film=el('path',{d:ST.rect(590,320,340,356,44),fill:'url(#gFilm)',stroke:'rgba(231,221,199,.22)','stroke-width':1.5,opacity:0},cs);
  cs.appendChild(ST.closeFront);
  if(!ST.closeParts.machine){var mg=el('g',{},ST.closeFront);el('path',{d:'M0,0 L120,-190','class':'ink bold'},mg);ST.closeParts.machine=mg}
  ST.needle=el('circle',{r:16,fill:'url(#gNeedle)',opacity:0},cs);
  var cl0=$('close'),bgS=el('svg',{id:'closeBg','aria-hidden':'true',preserveAspectRatio:'xMidYMid slice',viewBox:'0 0 1600 900'});
  cl0.parentNode.insertBefore(bgS,cl0);var bgRect=cl0.querySelector(':scope > rect');if(bgRect)bgS.appendChild(bgRect);bgS.appendChild(ST.closeBack);
  /* galerie na zdi: ramy ruznych stylu, karty s texty, osvedceni */
  var FD="'Cormorant Garamond',Georgia,serif",FB="'Outfit',system-ui,sans-serif";
  function P2(g,d,a){a=a||{};a.d=d;return el('path',a,g)}
  function frameBox(g,x,y,w,h,st,m){
    m=m||FM[st]||5;var X0=x-m,Y0=y-m,W=w+2*m,H=h+2*m;
    P2(g,ST.rect(X0+4,Y0+6,W,H,1),{fill:'#000',opacity:.38});
    if(st==='gold'){
      P2(g,ST.rect(X0,Y0,W,H,1),{'class':'ink thin t1'});P2(g,ST.rect(X0+2.5,Y0+2.5,W-5,H-5,1),{'class':'ink hair gold'});
      P2(g,ST.rect(X0+6,Y0+6,W-12,H-12,0),{'class':'ink hair goldl'});P2(g,ST.rect(x-2.5,y-2.5,w+5,h+5,0),{'class':'ink hair gold'});
      [[X0+3.5,Y0+3.5],[X0+W-3.5,Y0+3.5],[X0+3.5,Y0+H-3.5],[X0+W-3.5,Y0+H-3.5]].forEach(function(c){P2(g,ST.circ(c[0],c[1],2.2),{'class':'ink hair gold t3'})});
      var dd='';for(var i=X0+10;i<X0+W-10;i+=6)dd+='M'+i+','+(Y0+1.2)+'v2.4 M'+i+','+(Y0+H-3.6)+'v2.4 ';for(var j=Y0+10;j<Y0+H-10;j+=6)dd+='M'+(X0+1.2)+','+j+'h2.4 M'+(X0+W-3.6)+','+j+'h2.4 ';
      P2(g,dd,{'class':'ink hair gold',opacity:.55});
    }else if(st==='wood'){
      P2(g,ST.rect(X0,Y0,W,H,1),{'class':'ink thin t3'});P2(g,ST.rect(X0,Y0,W,H,1),{fill:'url(#hatchV)',opacity:.7});
      P2(g,'M'+X0+','+Y0+' L'+(x-1)+','+(y-1)+' M'+(X0+W)+','+Y0+' L'+(x+w+1)+','+(y-1)+' M'+X0+','+(Y0+H)+' L'+(x-1)+','+(y+h+1)+' M'+(X0+W)+','+(Y0+H)+' L'+(x+w+1)+','+(y+h+1),{'class':'ink hair'});
      P2(g,ST.rect(x-1.5,y-1.5,w+3,h+3,0),{'class':'ink hair gold'});
    }else if(st==='mat'){
      P2(g,ST.rect(X0,Y0,W,H,1),{'class':'ink thin',fill:'#0a0a0c'});P2(g,ST.rect(X0+4,Y0+4,W-8,H-8,0),{'class':'ink hair t2'});
      P2(g,'M'+(X0+4)+','+(Y0+4)+' L'+(x-1)+','+(y-1)+' M'+(X0+W-4)+','+(Y0+4)+' L'+(x+w+1)+','+(y-1),{'class':'ink hair dim'});P2(g,ST.rect(x-1,y-1,w+2,h+2,0),{'class':'ink hair dim'});
    }else{
      P2(g,ST.rect(X0,Y0,W,H,.5),{'class':'ink thin',fill:'#09090b'});P2(g,ST.rect(x-1,y-1,w+2,h+2,0),{'class':'ink hair dim'});
    }
    /* drat a hrebik */
    P2(g,'M'+(x+w/2-Math.min(16,w*.3))+','+Y0+' L'+(x+w/2)+','+(Y0-12)+' L'+(x+w/2+Math.min(16,w*.3))+','+Y0,{'class':'ink hair dim'});P2(g,ST.circ(x+w/2,Y0-12.5,1.4),{'class':'ink hair gold t1'});
    return m;
  }
  function txt(g,x,y,sz,str,o){o=o||{};var t=el('text',{x:x,y:y,'font-size':sz,'text-anchor':'middle','font-family':o.f||FD,fill:o.c||'#E7DDC7','letter-spacing':o.ls||0,'font-weight':o.w||400},g);
    str.split('*').forEach(function(part,i){if(!part)return;var sp=el('tspan',{},t);sp.textContent=part;if(i%2){sp.setAttribute('font-style','italic');sp.setAttribute('fill','#C8A45C')}});return t}
  function card(g,c){var x=c.x,y=c.y,w=c.w,h=c.h,cx=x+w/2;frameBox(g,x,y,w,h,'black',c.m);
    P2(g,ST.rect(x,y,w,h,0),{fill:'#131418'});P2(g,ST.rect(x+2.5,y+2.5,w-5,h-5,0),{'class':'ink hair gold',opacity:.7});
    var ts=Math.min(w*.115,8.4),ty=y+h*.2,tl=c.t.length,by;
    txt(g,cx,ty,Math.min(2.9,w*.05),c.tag,{f:FB,c:'#E8D5A3',ls:.55,w:500});
    var y1=ty+ts*1.25+(tl===1?ts*.2:0);c.t.forEach(function(l,i){txt(g,cx,y1+i*ts*1.08,tl===1?ts*1.25:ts,l)});
    by=y1+(tl-1)*ts*1.08+ts*.55;P2(g,'M'+(cx-7)+','+by+' h14',{'class':'ink hair gold'});
    c.b.forEach(function(l,i){txt(g,cx,by+4.6+i*3.3,2.3,l,{f:FB,c:'rgba(231,221,199,.62)',w:300})});}
  function cert(g,c){var x=c.x,y=c.y,w=c.w,h=c.h,cx=x+w/2;frameBox(g,x,y,w,h,'wood',c.m);
    P2(g,ST.rect(x,y,w,h,0),{fill:'#1b1a18'});P2(g,ST.rect(x+3,y+3,w-6,h-6,0),{'class':'ink hair goldl',opacity:.7});
    txt(g,cx,y+13,5.4,'Osvědčení',{c:'#E8D5A3',w:500});txt(g,cx,y+19,2.3,'O ZDRAVOTNÍ ZPŮSOBILOSTI',{f:FB,c:'rgba(231,221,199,.55)',ls:.3});
    P2(g,'M'+(x+10)+','+(y+27)+' H'+(x+w-10)+' M'+(x+12)+','+(y+32)+' H'+(x+w-12)+' M'+(x+10)+','+(y+37)+' H'+(x+w-16),{'class':'ink hair dim'});
    P2(g,ST.circ(cx,y+h-15,6.5),{'class':'ink hair gold t1'});P2(g,ST.circ(cx,y+h-15,4),{'class':'ink hair gold'});
    P2(g,'M'+(cx-4)+','+(y+h-10)+' l-2,8 l4,-2.4 M'+(cx+4)+','+(y+h-10)+' l2,8 l-4,-2.4',{'class':'ink hair gold'});
    P2(g,'M'+(x+8)+','+(y+h-8)+' q4,-5 8,0 t8,0',{'class':'ink hair'});}
  function photo(g,P){var x=P.x,y=P.y,w=P.w,h=P.h;var m=frameBox(g,x,y,w,h,P.st||'black',P.m);
    P2(g,ST.rect(x,y,w,h,0),{fill:'#07080b'});
    var im=el('image',{x:x,y:y,width:w,height:h,preserveAspectRatio:'none'},g);im.setAttribute('href',P.src);
    P2(g,ST.rect(x,y,w,h,0),{fill:'none',stroke:'rgba(0,0,0,.6)','stroke-width':1.2});
    if(P.light){P2(g,'M'+(x+w/2-w*.18)+','+(y-m-4)+' h'+(w*.36)+' l-3,5 h'+(-(w*.36-6))+' Z',{'class':'ink hair gold t1'});
      P2(g,'M'+(x+w/2)+','+(y-m-4)+' v-6',{'class':'ink hair gold'});}
    var gl=P2(g,'M'+x+','+(y+h*.55)+' L'+(x+w*.45)+','+y+' L'+(x+w*.62)+','+y+' L'+x+','+(y+h*.75)+'Z',{fill:'#FFF6DF',opacity:.06});P.gl=gl;}
  /* tepla zare od svetylek na zdi za velkymi obrazy */
  var galL=el('g',{},ST.L.room);ST.L.room.insertBefore(galL,ST.L.room.firstChild);
  WALLITEMS.forEach(function(P){var g=ST.section(galL,P.x-40,P.x+P.w+40);
    if(P.light)P2(g,ST.ellipse(P.x+P.w/2,P.y+P.h*.35,P.w*.95,P.h*.75),{fill:'url(#gGlow)',opacity:.45});
    if(P.card)card(g,P);else if(P.cert)cert(g,P);else photo(g,P)});
  ST.on(function(T){var gc=ST.galCam,k=gc?0:photoZoom(T);GAL.forEach(function(P,i){var o=i===0?.06*(1-k):.06;if(gc&&(i===gc.a||i===gc.b)){var e=i===gc.a?1-gc.k:gc.k;o=.06*(1-ss(.6,1,e))}if(P.gl._o!==o){P.gl._o=o;P.gl.setAttribute('opacity',o.toFixed(3))}})});
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
  var asp=vw/vh,vb='0 0 1600 900';
  if(asp<1.25){var w=asp<.8?720:900,h=w/asp;vb=(760-w/2)+' '+(470-h/2)+' '+w+' '+h}
  ['close','closeBg'].forEach(function(id){var e=$(id);if(e)e.setAttribute('viewBox',vb)});
  ST.closeVB=vb.split(' ').map(Number);
  /* navazujici sekce s andelem (na webu) prekryva posledni obrazovku pribehu */
  var hero=document.getElementById('hero');if(hero&&(story.compareDocumentPosition(hero)&4))hero.style.marginTop=(-vh)+'px';
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
  /* najezd do detailu a zpet: z kamery casove osy do kamery, ve ktere detail sedi presne na svetove predlokti */
  var zi=sm5(lin(7.46,8.3,T)),zo=1-sm5(lin(10.4,11.1,T)),zu=T<9.5?zi:zo;cam.zu=zu;
  if(zu>0&&ST.closeVB){
    var vb=ST.closeVB,q=Math.max(vw/vb[2],vh/vb[3]),ox=(vw-vb[2]*q)/2,oy=(vh-vb[3]*q)/2,sF=ZK*q;
    var fx=ZW0[0]-((ZC0[0]-vb[0])*q+ox-vw/2)/sF,fy=ZW0[1]-((ZC0[1]-vb[1])*q+oy-vh/2)/sF;
    var e=zu,sN=cam.s*Math.pow(sF/cam.s,e);
    var a0x=(ZW0[0]-cam.x)*cam.s,a0y=(ZW0[1]-cam.y)*cam.s,a1x=(ZW0[0]-fx)*sF,a1y=(ZW0[1]-fy)*sF;
    cam.x=ZW0[0]-lerp(a0x,a1x,e)/sN;cam.y=ZW0[1]-lerp(a0y,a1y,e)/sN;cam.s=sN;
    cam.cz=cam.s/(ZK*q);
    cam.ctx=vb[0]+((ZW0[0]-cam.x)*cam.s+vw/2-ox)/q-ZC0[0]*cam.cz;cam.cty=vb[1]+((ZW0[1]-cam.y)*cam.s+vh/2-oy)/q-ZC0[1]*cam.cz;
  }
  /* zaver: najezd do fotky andela; na konci fotka sedi presne tam, kde ji ukazuje navazujici film */
  var pz=ST.hasHero?photoZoom(T):0;cam.pz=pz;
  if(pz>0){
    var hs=Math.max(vw/PH.iw,vh/PH.ih),rw=PH.iw*hs,rh=PH.ih*hs,hox=(vw-rw)/2,hoy=Math.min(0,Math.max(vh-rh,vh*.28-.29*rh));
    var sP=rw/PH.w,Ax=PH.x+PH.w/2,Ay=PH.y+PH.h/2;
    var b0x=(Ax-cam.x)*cam.s,b0y=(Ay-cam.y)*cam.s,b1x=hox+rw/2-vw/2,b1y=hoy+rh/2-vh/2;
    var ez=sm5(lin(13.12,14,T)),sZ=cam.s*Math.pow(sP/cam.s,ez);
    cam.x=Ax-lerp(b0x,b1x,ez)/sZ;cam.y=Ay-lerp(b0y,b1y,ez)/sZ;cam.s=sZ;
  }
  var gc=ST.galCam;
  if(gc){var A=GAL[gc.a],B=GAL[gc.b],ca=camFor(A,gc.ra),cb=camFor(B,gc.rb),F=flyLUT(ca,cb),t=clamp(gc.k),
        e0=t*t*(3-2*t),fe=e0*F.N,ie=Math.min(F.N-1,Math.floor(fe)),u=lerp(e0,F.U[ie]+(F.U[ie+1]-F.U[ie])*(fe-ie),.55),f=u*F.N,i0=Math.min(F.N-1,Math.floor(f)),pp=F.P[i0]+(F.P[i0+1]-F.P[i0])*(f-i0),sb=Math.sin(Math.PI*u),g2=sb*sb;
    /* jedna hladka krivka bez zastaveni: sirka zaberu je oblouk v logaritmu, posun bezi stalou rychlosti na obrazovce */
    cam.s=vw/Math.exp(F.l0+(F.l1-F.l0)*u+F.B*sb);
    cam.x=lerp(ca.x,cb.x,pp)+F.off*g2;cam.y=lerp(lerp(ca.y,cb.y,pp),F.por?480:455,g2*clamp(F.B/1.5));
  }
  if(ST.debug.cam){var dc=ST.debug.cam;cam.x=dc[0];cam.y=dc[1];cam.s=Math.min(vw/dc[2],vh/dc[3])}
  else if(!reduce){cam.x+=Math.sin(time*.00031)*2.2;cam.y+=Math.cos(time*.00027)*1.6}
  cam.vw=vw;cam.vh=vh;cam.T=T;
  var hw=vw/2/cam.s,hh=vh/2/cam.s;
  cam.x0=cam.x-hw;cam.x1=cam.x+hw;cam.y0=cam.y-hh;cam.y1=cam.y+hh;
  for(var i=0;i<planes.length;i++){var p=planes[i],ex=p.ax+(cam.x-p.ax)*p.f,ey=p.ay+(cam.y-p.ay)*p.f;p.ex=ex;
    p.g.setAttribute('transform','translate('+(vw/2).toFixed(1)+','+(vh/2).toFixed(1)+') scale('+cam.s.toFixed(4)+') translate('+(-ex).toFixed(1)+','+(-ey).toFixed(1)+')')}
  for(var j=0;j<sections.length;j++){var s=sections[j],ex2=s.p?s.p.ex:cam.x,v=s.x1>ex2-hw-150&&s.x0<ex2+hw+150;
    if(ST._keep&&s.p&&s.p.f===1)v=s.x1>860&&s.x0<3500;
    if(v!==s.vis){s.vis=v;s.g.style.display=v?'':'none'}}
}

function render(time){
  ST._keep=!!ST.hasHero&&Tt>=ST.N-.004;
  updateCam(time);
  /* spodek obrazu: kresba pod chodnikem se plynule ztraci do tmy (zadna ostra hrana) */
  var ffd=ST._ff||(ST._ff=story.querySelector('.floorfade')),gyp=(712-cam.y)*cam.s+vh/2;
  if(gyp<vh&&!ST.galCam){var fk=cam.s,fb=gyp.toFixed(0)+'|'+fk.toFixed(3);
    if(fb!==ST._ffb){ST._ffb=fb;ffd.style.display='';ffd.style.top=gyp.toFixed(0)+'px';ffd.style.height='auto';ffd.style.bottom='0';
      ffd.style.background='linear-gradient(to bottom,rgba(13,14,17,0) 0,rgba(13,14,17,.34) '+(14*fk).toFixed(0)+'px,rgba(13,14,17,.72) '+(30*fk).toFixed(0)+'px,rgba(13,14,17,.93) '+(46*fk).toFixed(0)+'px,#0D0E11 '+(66*fk).toFixed(0)+'px)'}}
  else if(ST._ffb!=='x'){ST._ffb='x';ffd.style.display='none'}
  var i,k;
  for(i=0;i<draws.length;i++){var d=draws[i];k=ss(d.t0,d.t1,T);if(Math.abs(k-d.k)<1e-4)continue;d.k=k;
    d.e.style.strokeDashoffset=(1-k);d.e.style.visibility=k<=0?'hidden':'visible';if(d.fill)d.e.style.fillOpacity=k}
  for(i=0;i<fades.length;i++){var f=fades[i];k=f.max*ss(f.t0,f.t1,T)*(f.t2!=null?1-ss(f.t2,f.t3,T):1);if(Math.abs(k-f.k)<1e-4)continue;f.k=k;f.e.setAttribute('opacity',k.toFixed(3))}
  for(i=0;i<ups.length;i++){try{ups[i](T,time,cam)}catch(e){if(!ups[i].err){ups[i].err=1;console.error(e)}}}
  if(ST.bm){setMotif(ST.bm,ss(5.05,5.6,T));packMotif(ST.bm,lin(5.6,5.95,T))}

  /* lampa: stmivani okoli */
  var lamp=ST.lamp(T),lp=toScreen(2866,500),dim=$('dimmer');
  dim.style.opacity=lamp;
  /* pri najezdu do detailu okoli ruky ztmavne, aby se pod detailem neprolinal zbytek studia */
  var zd=ss(7.5,7.8,T)*(1-ss(10.86,11.1,T));
  if(lamp>0){if(zd>0)lp=toScreen(lerp(2866,ZW0[0]-22,zd),lerp(500,ZW0[1],zd));
    var r0=lerp(130*cam.s,0,zd),r1=lerp(520*cam.s,Math.max(vw,vh)*.02,zd*zd);
    dim.style.background=zd>=.999?'rgb(4,5,7)':'radial-gradient(circle at '+lp.x.toFixed(0)+'px '+lp.y.toFixed(0)+'px, transparent 0, transparent '+r0.toFixed(0)+'px, rgba(4,5,7,'+lerp(.62,1,zd).toFixed(3)+') '+Math.max(r0+2,r1).toFixed(0)+'px)'}
  /* nejdriv plynule nabehne podklad s predloktim (zakryje svet), teprve potom kresba nad nim */
  var cl=$('close'),co=ss(7.9,8.1,T)*(1-ss(10.54,10.7,T)),bo=ss(7.68,7.84,T)*(1-ss(10.78,10.94,T));
  /* detail se pri najezdu zvetsuje spolu se svetem */
  var ctr=cam.zu>0&&cam.zu<1?'translate('+cam.ctx.toFixed(2)+','+cam.cty.toFixed(2)+') scale('+cam.cz.toFixed(5)+')':'';
  if(ctr!==ST._ctr){ST._ctr=ctr;$('closeScene').setAttribute('transform',ctr);if(ST.closeBack)ST.closeBack.setAttribute('transform',ctr)}
  cl.style.opacity=co;cl.style.visibility=co<=0?'hidden':'visible';
  /* clona: detail se otevira kruhem z mista tetovani a roste spolu s najezdem, takze neni videt okraj zmensene kresby */
  var mk='none';
  if(bo>0&&cam.zu>0&&cam.zu<1&&ST.closeVB){var vb2=ST.closeVB,q2=Math.max(vw/vb2[2],vh/vb2[3]),ox2=(vw-vb2[2]*q2)/2,oy2=(vh-vb2[3]*q2)/2,
      mx=(cam.ctx+760*cam.cz-vb2[0])*q2+ox2,my=(cam.cty+470*cam.cz-vb2[1])*q2+oy2,mr=1250*cam.cz*q2;
    if(mr<Math.sqrt(vw*vw+vh*vh)*.75)mk='radial-gradient(circle at '+mx.toFixed(0)+'px '+my.toFixed(0)+'px,#000 '+(mr*.5).toFixed(0)+'px,transparent '+mr.toFixed(0)+'px)'}
  if(mk!==ST._mk){ST._mk=mk;[cl,$('closeBg')].forEach(function(e){e.style.webkitMaskImage=mk;e.style.maskImage=mk})}
  var cb=$('closeBg');cb.style.opacity=bo;cb.style.visibility=bo<=0?'hidden':'visible';
  /* pod detailem je svet uplne schovany (zadna pohybujici se ruka v pozadi) */
  var wh=(zd>=.999||bo>=.999)?'none':'';if(world.style.display!==wh)world.style.display=wh;
  if(bo>0){
    var tk=ss(8.1,9.0,T),tip=setMotif(ST.tm,tk),pk=lin(9.02,9.5,T);
    packMotif(ST.tm,pk);if(ST.tm.glow)ST.tm.glow.setAttribute('opacity',(ss(9.6,10.45,T)*.7).toFixed(3));
    if(ST.tm.stencil)ST.tm.stencil.setAttribute('opacity',(ss(7.9,8.1,T)*(1-ss(9.35,9.7,T))*.9).toFixed(3));
    ST.red.setAttribute('opacity',(ss(8.6,9.5,T)*(1-ss(9.8,10.35,T))).toFixed(3));
    ST.film.setAttribute('opacity',(ss(9.6,9.72,T)*(1-ss(9.98,10.3,T))).toFixed(3));
    var mOn=ss(7.98,8.16,T)*(1-ss(9.5,9.66,T)),mach=ST.closeParts.machine;
    var tq=null;
    if(tip&&tip.e.getPointAtLength){var pt=tip.e.getPointAtLength(tip.len),M=$('closeScene').getCTM().inverse().multiply(tip.e.getCTM());tq=pt.matrixTransform(M);
      /* jehla pracuje na miste i pri zastavenem scrollu: kmita podel linky */
      if(!reduce&&tip.len>0){var p2=tip.e.getPointAtLength(Math.min(tip.e.getTotalLength(),tip.len+2)).matrixTransform(M),dx=p2.x-tq.x,dy=p2.y-tq.y,dl=Math.sqrt(dx*dx+dy*dy)||1,o=Math.sin(time*.012)*2.6;tq={x:tq.x+dx/dl*o,y:tq.y+dy/dl*o}}}
    else if(pk>0&&pk<1){var nf=ST.tm.fills.length,ci=Math.min(nf-1,Math.floor(pk*nf)),c=ST.tm.cen[ci],an=reduce?0:time*.011,rr=Math.min(14,c[2]);
      var MM=$('closeScene').getCTM().inverse().multiply(ST.tm.fills[ci].getCTM()),cp=$('closeScene').createSVGPoint();cp.x=c[0]+Math.cos(an)*rr;cp.y=c[1]+Math.sin(an*1.3)*rr;tq=cp.matrixTransform(MM);tip={e:null}}
    else if(tk<=0)tq={x:1000,y:330};else tq={x:1040,y:300};
    /* presun mezi tahy: hrot plynule dojede a strojek se zvedne */
    var pv=ST._tipS;if(!pv||(tk<=0)||(tk>=1&&!(pk>0&&pk<1)))pv=tq;
    var gap=Math.sqrt((tq.x-pv.x)*(tq.x-pv.x)+(tq.y-pv.y)*(tq.y-pv.y)),fol=gap>7?.22:1;
    pv={x:pv.x+(tq.x-pv.x)*fol,y:pv.y+(tq.y-pv.y)*fol};ST._tipS=pv;
    ST.closeLift=Math.max(gap>7?Math.min(1,gap/40):0,(ST.closeLift||0)*.86);
    var j=reduce?0:Math.sin(time*.09)*.9;
    mach.setAttribute('transform','translate('+(pv.x+j).toFixed(1)+','+(pv.y-j).toFixed(1)+')');
    ST.needle.setAttribute('cx',pv.x.toFixed(1));ST.needle.setAttribute('cy',pv.y.toFixed(1));ST.closeTip={x:pv.x,y:pv.y};
    mach.setAttribute('opacity',mOn.toFixed(3));
    ST.needle.setAttribute('opacity',((tip&&((tk>0&&tk<1)||(pk>0&&pk<1))?1:0)*mOn*(1-Math.min(1,ST.closeLift*2))*(reduce?1:.8+.2*Math.sin(time*.05))).toFixed(3));
  }
  var days=$('days');days.style.opacity=ss(9.55,9.7,T)*(1-ss(10.5,10.7,T));
  $('dayN').textContent=Math.round(1+20*lin(9.65,10.45,T));

  /* uvod a konec */
  var intro=$('intro'),io=1-ss(.3,1.0,T);intro.style.opacity=io;intro.style.transform='translateY('+(-50*(1-io)).toFixed(1)+'px)';intro.style.visibility=io<=0?'hidden':'visible';
  $('introfade').style.opacity=io;$('hint').style.opacity=1-ss(.05,.4,T);
  var cta=$('cta'),ct=ST.hasHero?0:ss(12.3,12.75,T);cta.style.opacity=ct;cta.style.transform='translate(-50%,'+(24*(1-ct)).toFixed(1)+'px)';cta.style.pointerEvents=ct>.5?'auto':'none';
  $('steps').style.opacity=1-ss(12.3,12.6,T)*.75;
  /* konec: scena se rozplyne do navazujici fotky andela */
  if(ST.hasHero){
    var ov=1-ss(13.25,13.85,T);['grain','vig','ffade'].forEach(function(k){if(!ST._ov)ST._ov={grain:$('grain'),vig:story.querySelector('.vignette'),ffade:story.querySelector('.floorfade')};ST._ov[k].style.opacity=k==='grain'?(.07*ov):ov});
    /* pri najezdu do fotky a pri letu po galerii postavy a popredi nezakryvaji obrazy */
    var lf=ST.galCam?0:1-ss(.55,.92,cam.pz||0);['front','fore','fig','light'].forEach(function(n){var v=n==='light'&&ST.galCam?1:lf,e=$('L-'+n);if(e&&e._o!==v){e._o=v;e.style.opacity=v}});
    var fl=!!ST.galCam;[['far',fl],['mid',fl],['fore',fl],['fig',fl],['front',fl],['sky',fl]].forEach(function(q){var e=$('L-'+q[0]);if(e&&e._h!==q[1]){e._h=q[1];e.style.visibility=q[1]?'hidden':''}});
    var sh=$('stShade');if(sh&&!ST.galCam)sh.style.opacity=ss(13.5,14,T).toFixed(3);
    var gone=Tt>=ST.N-.004,sg=$('stage'),gm=!!ST.galCam&&gone;
    if(gm!==ST._gm){ST._gm=gm;sg.classList.toggle('gal',gm)}
    sg.style.opacity=gone&&!gm?0:1;sg.style.visibility=gone&&!gm?'hidden':'';sg.style.pointerEvents=gone?'none':'';
    var ve=$('stVeil');
    if(gm){var gk=ST.galCam,out=1-ss(0,.35,gk.k),inn=ss(.65,1,gk.k);
      /* stin na koncich letu odpovida filmu: andel ma .sc-shade (35 %), ostatni zabery .sc-veil */
      $('stShade').style.opacity=(gk.a===0?.35*out:0).toFixed(3);
      ve.style.opacity=Math.max(gk.a===0?0:out,inn).toFixed(3);
    }else if(ve&&ve.style.opacity!=='0')ve.style.opacity='0';
    document.body.classList.toggle('in-story',Tt<ST.N-.01);
    $('steps').style.opacity=(1-ss(12.3,12.6,T)*.75)*(1-ss(12.9,13.2,T));
  }

  /* bubliny */
  var placed=[],capR=cap.getBoundingClientRect(),floor=vh-Math.max(110,(vh-capR.top)+14);
  ST.talk.c=0;ST.talk.h=0;
  for(var b=0;b<BUB.length;b++){
    var B=BUB[b],t0=B[1],t1=B[2],vis=ss(t0,t0+.07,T)*(1-ss(t1-.07,t1,T));
    if(vis<=0){B.said=0;if(B.shown){B.el.style.opacity=0;B.shown=false}continue}
    B.shown=true;
    var txt=B[3],n=Math.round(txt.length*lin(t0+.02,t0+(t1-t0)*.42,T));
    if(!B.said&&T>lastT&&T>t0+.02&&T<t0+(t1-t0)*.45){B.said=1;for(var si2=0;si2<sayFns.length;si2++)try{sayFns[si2](B[0],txt,t0,t1)}catch(e){console.error(e)}}
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
  else{Tt=targetT();if(reduce)T=Tt;else{var f=1-Math.exp(-dt/150);T+=(Tt-T)*f;if(Math.abs(Tt-T)<.0005)T=Tt}}
  var idle=ST.debug.T==null&&!!ST.hasHero&&Tt>=ST.N-.004&&T>=ST.N-.0006&&!ST.galCam;
  if(!(idle&&ST._idle))render(ts);
  ST._idle=idle;lastT=T;ST.T=T;
  requestAnimationFrame(frame);
}
})();
