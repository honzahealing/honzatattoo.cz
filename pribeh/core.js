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
  [13,   3980,360,1700,1050]
];
ST.KEYS=KEYS;
/* predlokti klientky: zapesti ve svete (W0) odpovida bodu C0 v detailu, K = jednotek detailu na jednotku sveta */
var ZW0=[2897,526],ZC0=[1320,478],ZK=36;ST.zoomMap={W0:ZW0,C0:ZC0,K:ZK};
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
  if(o.gold){glow=el('path',{d:ST.ellipse(0,-66,160,260),fill:'url(#gHalo)',opacity:0},g);
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
  return {g:g,items:items,dots:dots,total:total,dotLen:total*.12,glow:glow,fills:fills,last:-1};
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
  if(ST.slots.board)ST.bm=buildMotif(el('g',{transform:'translate(0,32) scale(.68)'},ST.slots.board),{cls:'sk',skin:'var(--t1)'});
  /* detail ruky */
  var cs=$('closeScene');ST.closeBack=ST.closeBack||el('g',{},cs);
  var motifG=el('g',{transform:'translate(760,532) scale(.8)'},cs);
  ST.closeFront=ST.closeFront||el('g',{},cs);
  ST.red=el('ellipse',{cx:760,cy:470,rx:240,ry:175,fill:'url(#gRed)',opacity:0});cs.insertBefore(ST.red,motifG);
  ST.tm=buildMotif(motifG,{cls:'tt',skin:'var(--skin)',gold:true});
  ST.film=el('path',{d:ST.rect(556,296,408,368,48),fill:'url(#gFilm)',stroke:'rgba(231,221,199,.22)','stroke-width':1.5,opacity:0},cs);
  cs.appendChild(ST.closeFront);
  if(!ST.closeParts.machine){var mg=el('g',{},ST.closeFront);el('path',{d:'M0,0 L120,-190','class':'ink bold'},mg);ST.closeParts.machine=mg}
  ST.needle=el('circle',{r:16,fill:'url(#gNeedle)',opacity:0},cs);
  var cl0=$('close'),bgS=el('svg',{id:'closeBg','aria-hidden':'true',preserveAspectRatio:'xMidYMid slice',viewBox:'0 0 1600 900'});
  cl0.parentNode.insertBefore(bgS,cl0);var bgRect=cl0.querySelector(':scope > rect');if(bgRect)bgS.appendChild(bgRect);bgS.appendChild(ST.closeBack);
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
  var zi=ss(7.5,8.25,T),zo=1-ss(10.45,11.05,T),zu=T<9.5?zi:zo;cam.zu=zu;
  if(zu>0&&ST.closeVB){
    var vb=ST.closeVB,q=Math.max(vw/vb[2],vh/vb[3]),ox=(vw-vb[2]*q)/2,oy=(vh-vb[3]*q)/2,sF=ZK*q;
    var fx=ZW0[0]-((ZC0[0]-vb[0])*q+ox-vw/2)/sF,fy=ZW0[1]-((ZC0[1]-vb[1])*q+oy-vh/2)/sF;
    var e=zu*zu*(3-2*zu),sN=cam.s*Math.pow(sF/cam.s,e);
    var a0x=(ZW0[0]-cam.x)*cam.s,a0y=(ZW0[1]-cam.y)*cam.s,a1x=(ZW0[0]-fx)*sF,a1y=(ZW0[1]-fy)*sF;
    cam.x=ZW0[0]-lerp(a0x,a1x,e)/sN;cam.y=ZW0[1]-lerp(a0y,a1y,e)/sN;cam.s=sN;
    cam.cz=cam.s/(ZK*q);
    cam.ctx=vb[0]+((ZW0[0]-cam.x)*cam.s+vw/2-ox)/q-ZC0[0]*cam.cz;cam.cty=vb[1]+((ZW0[1]-cam.y)*cam.s+vh/2-oy)/q-ZC0[1]*cam.cz;
  }
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
  var cl=$('close'),co=ss(7.72,8.05,T)*(1-ss(10.6,10.9,T));
  /* detail se pri najezdu zvetsuje spolu se svetem */
  var ctr=cam.zu>0&&cam.zu<1?'translate('+cam.ctx.toFixed(2)+','+cam.cty.toFixed(2)+') scale('+cam.cz.toFixed(5)+')':'';
  if(ctr!==ST._ctr){ST._ctr=ctr;$('closeScene').setAttribute('transform',ctr);if(ST.closeBack)ST.closeBack.setAttribute('transform',ctr)}
  cl.style.opacity=co;cl.style.visibility=co<=0?'hidden':'visible';
  var cb=$('closeBg');cb.style.opacity=co;cb.style.visibility=co<=0?'hidden':'visible';
  var wh=co>=.999?'none':'';if(world.style.display!==wh)world.style.display=wh;
  if(co>0){
    var tk=ss(8.1,9.5,T),tip=setMotif(ST.tm,tk);
    healMotif(ST.tm,ss(9.6,10.45,T));
    ST.red.setAttribute('opacity',(ss(8.6,9.5,T)*(1-ss(9.8,10.35,T))).toFixed(3));
    ST.film.setAttribute('opacity',(ss(9.45,9.62,T)*(1-ss(9.95,10.3,T))).toFixed(3));
    var mOn=ss(7.95,8.15,T)*(1-ss(9.45,9.62,T)),mach=ST.closeParts.machine;
    var tq=null;
    if(tip&&tip.e.getPointAtLength){var pt=tip.e.getPointAtLength(tip.len),M=$('closeScene').getCTM().inverse().multiply(tip.e.getCTM());tq=pt.matrixTransform(M);
      /* jehla pracuje na miste i pri zastavenem scrollu: kmita podel linky */
      if(!reduce&&tip.len>0){var p2=tip.e.getPointAtLength(Math.min(tip.e.getTotalLength(),tip.len+2)).matrixTransform(M),dx=p2.x-tq.x,dy=p2.y-tq.y,dl=Math.sqrt(dx*dx+dy*dy)||1,o=Math.sin(time*.012)*2.6;tq={x:tq.x+dx/dl*o,y:tq.y+dy/dl*o}}}
    else if(tk<=0)tq={x:1000,y:330};else if(tk>=1)tq={x:1040,y:300};
    /* presun mezi tahy: hrot plynule dojede a strojek se zvedne */
    var pv=ST._tipS;if(!pv||tk<=0||tk>=1)pv=tq;
    var gap=Math.sqrt((tq.x-pv.x)*(tq.x-pv.x)+(tq.y-pv.y)*(tq.y-pv.y)),fol=gap>7?.22:1;
    pv={x:pv.x+(tq.x-pv.x)*fol,y:pv.y+(tq.y-pv.y)*fol};ST._tipS=pv;
    ST.closeLift=Math.max(gap>7?Math.min(1,gap/40):0,(ST.closeLift||0)*.86);
    var j=reduce?0:Math.sin(time*.09)*.9;
    mach.setAttribute('transform','translate('+(pv.x+j).toFixed(1)+','+(pv.y-j).toFixed(1)+')');
    ST.needle.setAttribute('cx',pv.x.toFixed(1));ST.needle.setAttribute('cy',pv.y.toFixed(1));ST.closeTip={x:pv.x,y:pv.y};
    mach.setAttribute('opacity',mOn.toFixed(3));
    ST.needle.setAttribute('opacity',((tip&&tk>0&&tk<1?1:0)*mOn*(1-Math.min(1,ST.closeLift*2))*(reduce?1:.8+.2*Math.sin(time*.05))).toFixed(3));
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
  else{Tt=targetT();if(reduce)T=Tt;else{var f=1-Math.exp(-dt/110);T+=(Tt-T)*f;if(Math.abs(Tt-T)<.0005)T=Tt}}
  render(ts);lastT=T;ST.T=T;
  requestAnimationFrame(frame);
}
})();
