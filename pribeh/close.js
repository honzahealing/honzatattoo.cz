/* pribeh/close.js - detail tetovani: predlokti klientky na operce, Honzova ruka v cerne rukavici s pen strojkem.
   Kresli se do ST.closeBack (pod motivem) a ST.closeFront (nad motivem). Platno 1600 x 900, motiv ma stred v 760,470.
   Meritko: predlokti je siroke ~390 jednotek. Ruka a strojek jsou v pomeru k nemu (grip strojku ~1/5 sirky predlokti),
   ruka je kreslena z boku palce podle fotky img/ja-u-prace.webp: ukazovak navrchu gripu, palec z boku,
   prostrednik podpira zespodu, prstenik a malicek zatocene, hrana dlane se opira o kuzi.
   Strojek je bez napisu a bez displeje. */
ST.module('close',function(ST){
'use strict';
var el=ST.el,rng=ST.rng,R=Math.PI/180;
var cs=document.getElementById('closeScene');
ST.closeBack=el('g',{},cs);ST.closeFront=el('g',{},cs);
var BK=ST.closeBack,FR=ST.closeFront,defs=ST.closeDefs;
var LINE='#E7DDC7',GOLD='#C8A45C',GL='#E8D5A3',WH='#FFF6DF';

/* ---------- pomocne ---------- */
function f1(n){return Math.round(n*10)/10}
function Q(par,d,at){var a=at||{};a.d=d;if(a.stroke==null)a.stroke='none';return el('path',a,par)}
function L(par,d,c,w,op,at){var a=at||{};a.d=d;a.fill='none';a.stroke=c||LINE;a['stroke-width']=w||1.5;a['stroke-linecap']='round';a['stroke-linejoin']='round';if(op!=null)a.opacity=op;return el('path',a,par)}
function G(par,at){return el('g',at||{},par)}
function grad(id,type,attrs,stops){var g=el(type,attrs,defs);g.setAttribute('id',id);
  stops.forEach(function(s){el('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]==null?1:s[2]},g)});return g}
function cr(pts,closed){var n=pts.length,d='M'+f1(pts[0][0])+','+f1(pts[0][1]),N=closed?n:n-1;
  for(var i=0;i<N;i++){
    var p0=pts[closed?(i-1+n)%n:Math.max(i-1,0)],p1=pts[i],p2=pts[(i+1)%n],p3=pts[closed?(i+2)%n:Math.min(i+2,n-1)];
    d+='C'+f1(p1[0]+(p2[0]-p0[0])/6)+','+f1(p1[1]+(p2[1]-p0[1])/6)+' '+f1(p2[0]-(p3[0]-p1[0])/6)+','+f1(p2[1]-(p3[1]-p1[1])/6)+' '+f1(p2[0])+','+f1(p2[1])}
  return closed?d+'Z':d}
function dense(pts){var out=[],n=pts.length;
  for(var i=0;i<n-1;i++){var p0=pts[Math.max(i-1,0)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(i+2,n-1)];
    var c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
    for(var k=0;k<10;k++){var t=k/10,u=1-t;out.push([u*u*u*p1[0]+3*u*u*t*c1x+3*u*t*t*c2x+t*t*t*p2[0],u*u*u*p1[1]+3*u*u*t*c1y+3*u*t*t*c2y+t*t*t*p2[1]])}}
  out.push(pts[n-1]);return out}
function yAt(a,x){for(var i=1;i<a.length;i++)if(a[i][0]>=x){var p=a[i-1],q=a[i],t=(x-p[0])/((q[0]-p[0])||1);return p[1]+(q[1]-p[1])*t}return a[a.length-1][1]}
/* retez clanku [x,y,polomer]: obrys s kulatou spickou. open = bez uzavreni u korene (koren je schovany pod dlani) */
function chainPts(Pp){var n=Pp.length,Lp=[],Rp=[],i,T=[];
  for(i=0;i<n;i++){var a=Pp[Math.max(0,i-1)],b=Pp[Math.min(n-1,i+1)],tx=b[0]-a[0],ty=b[1]-a[1],l=Math.sqrt(tx*tx+ty*ty)||1;tx/=l;ty/=l;T.push([tx,ty]);
    Lp.push([Pp[i][0]-ty*Pp[i][2],Pp[i][1]+tx*Pp[i][2]]);Rp.push([Pp[i][0]+ty*Pp[i][2],Pp[i][1]-tx*Pp[i][2]])}
  var e=Pp[n-1],t=T[n-1],cap=[];for(i=1;i<6;i++){var an=i*Math.PI/6,c=Math.cos(an),sn=Math.sin(an);cap.push([e[0]+(-t[1]*c+t[0]*sn)*e[2],e[1]+(t[0]*c+t[1]*sn)*e[2]])}
  return {all:Lp.concat(cap,Rp.slice().reverse()),L:Lp,R:Rp,T:T}}
var cid=0;
function clipOf(d){var id='clc'+(cid++),c=el('clipPath',{id:id},defs);el('path',{d:d},c);return 'url(#'+id+')'}

/* ---------- prechody ---------- */
grad('clSkin','radialGradient',{gradientUnits:'userSpaceOnUse',cx:800,cy:400,r:1150},[[0,'#3b312a'],[.3,'#342b25'],[.62,'#28211d'],[1,'#17130f']]);
grad('clSkinV','linearGradient',{gradientUnits:'userSpaceOnUse',x1:0,y1:280,x2:0,y2:730},[[0,WH,.13],[.12,WH,.03],[.3,'#000',0],[.7,'#000',.05],[.88,'#000',.34],[1,'#000',.62]]);
grad('clFadeL','linearGradient',{gradientUnits:'userSpaceOnUse',x1:-320,y1:0,x2:520,y2:0},[[0,'#000',.9],[.5,'#000',.4],[1,'#000',0]]);
grad('clFadeR','linearGradient',{gradientUnits:'userSpaceOnUse',x1:1240,y1:0,x2:1820,y2:0},[[0,'#000',0],[1,'#000',.5]]);
grad('clVig','radialGradient',{gradientUnits:'userSpaceOnUse',cx:780,cy:470,r:1150},[[.5,'#000',0],[1,'#000',.6]]);
grad('clCone','linearGradient',{x1:0,y1:0,x2:0,y2:1},[[0,GL,.02],[.6,GL,.07],[1,GOLD,.13]]);
grad('clPad','linearGradient',{gradientUnits:'userSpaceOnUse',x1:0,y1:560,x2:0,y2:900},[[0,'#000',.5],[.3,'#000',.1],[.75,'#000',.05],[1,'#000',.4]]);
grad('clGlv','linearGradient',{x1:0,y1:0,x2:.25,y2:1},[[0,'#34343b'],[.3,'#1b1b20'],[1,'#08080a']]);
grad('clGlvD','linearGradient',{x1:0,y1:0,x2:.25,y2:1},[[0,'#202025'],[.4,'#101013'],[1,'#050506']]);
grad('clHz','linearGradient',{x1:0,y1:0,x2:.3,y2:1},[[0,'#463a31'],[.5,'#2e2621'],[1,'#191512']]);
grad('clMet','linearGradient',{x1:0,y1:0,x2:0,y2:1},[[0,'#55555c'],[.25,'#26262b'],[.7,'#0c0c0e'],[1,'#1c1c20']]);
grad('clBrass','linearGradient',{x1:0,y1:0,x2:0,y2:1},[[0,'#E8D5A3'],[.3,'#9A7B3A'],[.75,'#4a3a1c'],[1,'#7a6230']]);
grad('clSh','radialGradient',{},[[0,'#000',.62],[.55,'#000',.3],[1,'#000',0]]);
var b1=el('filter',{id:'clBlur',x:'-20%',y:'-20%',width:'140%',height:'140%'},defs);el('feGaussianBlur',{stdDeviation:10},b1);
var b2=el('filter',{id:'clBlur2',x:'-40%',y:'-40%',width:'180%',height:'180%'},defs);el('feGaussianBlur',{stdDeviation:5},b2);

/* ==========================================================
   1. POZADI: studio v neostrosti, svetla, kuzel lampy
   ========================================================== */
(function(){
  var r=rng(41),bg=G(BK),g=G(bg,{filter:'url(#clBlur)'});
  Q(g,ST.rect(-600,-420,760,26,6),{fill:'#2a2a31',opacity:.8});
  for(var i=0;i<11;i++){var x=-560+i*62,h=70+r()*120;Q(g,ST.rect(x,-420-h,34+r()*14,h,8),{fill:i%3?'#26262d':'#3a3122',opacity:.75})}
  Q(g,ST.rect(1180,-560,520,400,10),{fill:'#22222a',opacity:.75});Q(g,ST.rect(1230,-510,420,300,4),{fill:'#3a3024',opacity:.5});
  Q(g,ST.rect(-700,40,2800,520,0),{fill:'#121217',opacity:.9});
  Q(g,ST.rect(-200,196,900,16,4),{fill:'#34343c',opacity:.8});
  for(var i2=0;i2<9;i2++){var x2=-160+i2*88+r()*20,h2=70+r()*90;Q(g,ST.rect(x2,196-h2,36+r()*22,h2,9),{fill:i2%3===1?'#4a3d26':'#2c2c34',opacity:.8})}
  Q(g,ST.rect(940,-80,300,250,6),{fill:'#2a2a32',opacity:.7});Q(g,ST.rect(972,-50,236,190,3),{fill:'#3b3226',opacity:.6});
  var gb=G(bg,{filter:'url(#clBlur2)'});
  for(var k=0;k<34;k++){var bx=-600+r()*2700,by=-820+r()*900,rad=16+r()*r()*58;
    el('circle',{cx:f1(bx),cy:f1(by),r:f1(rad),fill:'url(#gHalo)',opacity:f1(.25+r()*.45)},gb);
    if(r()<.4)el('circle',{cx:f1(bx),cy:f1(by),r:f1(rad*.8),fill:'none',stroke:GOLD,'stroke-width':1.4,opacity:.3},gb)}
  /* kuzel svetla lampy a teple svetlo na ruce */
  Q(bg,'M640,-900 L900,-900 L1900,760 L-380,760 Z',{fill:'url(#clCone)'});
  L(bg,'M640,-900 L-380,760 M900,-900 L1900,760',GOLD,1,.16);
})();

/* ==========================================================
   2. OPERKA: cerna kuze s prosivanim, jednorazova podlozka, kalisky s barvou
   ========================================================== */
var caps=[];
(function(){
  var r=rng(7),pad=G(BK);
  Q(pad,ST.rect(-900,1010,3400,900,0),{fill:'#0a0a0d'});
  /* horni plocha polstru a predni hrana */
  Q(pad,'M-900,570 L2500,548 L2500,900 L-900,900 Z',{fill:'#1b1b21'});
  Q(pad,'M-900,570 L2500,548 L2500,900 L-900,900 Z',{fill:'url(#stipple)',opacity:.35});
  Q(pad,ST.rect(-900,560,3400,340,0),{fill:'url(#clPad)'});
  L(pad,'M-900,570 L2500,548',LINE,1.4,.35);
  Q(pad,ST.rect(-900,892,3400,130,0),{fill:'#121216'});Q(pad,ST.rect(-900,892,3400,130,0),{fill:'url(#hatchV)',opacity:.6});
  L(pad,'M-900,892 C-200,886 700,898 1400,890 S2300,888 2500,892',LINE,2.4,.9);
  L(pad,'M-900,872 C-200,866 700,878 1400,870 S2300,868 2500,872',LINE,1.3,.5,{'stroke-dasharray':'12 9'});
  L(pad,'M-900,912 C-200,906 700,918 1400,910 S2300,908 2500,912',LINE,1,.3,{'stroke-dasharray':'12 9'});
  L(pad,'M-900,1010 H2500',LINE,1.6,.5);
  /* ohyb kuze: jemne vrasky */
  var d='';for(var i=0;i<60;i++){var x=-700+r()*2900,y=760+r()*110,l=10+r()*22;d+='M'+f1(x)+','+f1(y)+'l'+f1(l)+','+f1((r()-.5)*5)}
  L(pad,d,LINE,.9,.16);
  /* jednorazova podlozka pod rukou */
  var pp='M-260,628 L1640,592 L1720,812 C1500,834 1330,818 1150,836 C880,856 600,828 320,850 C100,866 -120,842 -300,852 Z';
  Q(pad,pp,{fill:'#000',opacity:.45,transform:'translate(6,14)'});
  Q(pad,pp,{fill:'#2f2e33'});Q(pad,pp,{fill:'url(#stipple)',opacity:.5});
  L(pad,pp,LINE,1.6,.75);
  var e='';for(var gx=-220;gx<1700;gx+=30)for(var gy=764;gy<842;gy+=24)e+='M'+(gx+((gy/24|0)%2)*15)+','+gy+'h4';
  L(pad,e,LINE,1,.16);
  ['M-120,812 C60,790 200,822 380,798','M940,846 C990,800 1060,774 1150,738','M1260,832 C1340,790 1420,780 1540,742','M500,842 C560,806 640,792 720,774'].forEach(function(q){L(pad,q,LINE,1,.4)});
  /* podnos s kalisky: barvy papouska (rozsviti se pri vybarvovani) */
  var tx=1010,ty=770;
  Q(pad,ST.ellipse(tx+110,ty+26,190,26),{fill:'url(#clSh)',opacity:.9});
  Q(pad,ST.rect(tx-60,ty-14,340,44,10),{fill:'#17171b',stroke:LINE,'stroke-width':1.6});L(pad,'M'+(tx-50)+','+(ty-6)+' h320',WH,1,.2);
  [['#B8452F',0],['#3F78A0',1],['#D2A848',2],['#4C7A56',3]].forEach(function(c){var cx=tx+c[1]*74,cy=ty-12;
    Q(pad,'M'+(cx-24)+','+(cy-26)+' v26 a24,8.5 0 0,0 48,0 v-26Z',{fill:'#0f0f12',stroke:LINE,'stroke-width':1.5});
    Q(pad,ST.ellipse(cx,cy-26,24,8.5),{fill:'#24242a',stroke:LINE,'stroke-width':1.5});
    var ink=Q(pad,ST.ellipse(cx,cy-25,19,6.3),{fill:c[0],opacity:.25});caps.push(ink);
    L(pad,'M'+(cx-11)+','+(cy-28)+' q8,-3.4 18,-1.4',WH,1,.5);L(pad,'M'+(cx-19)+','+(cy-18)+' v15',WH,1,.22)});
  /* slozena papirova uterka */
  var nx=470,ny=770;
  Q(pad,'M'+(nx-90)+','+(ny-16)+' L'+(nx+70)+','+(ny-30)+' L'+(nx+96)+','+(ny+20)+' L'+(nx-70)+','+(ny+36)+' Z',{fill:'#000',opacity:.4,transform:'translate(6,10)'});
  Q(pad,'M'+(nx-90)+','+(ny-16)+' L'+(nx+70)+','+(ny-30)+' L'+(nx+96)+','+(ny+20)+' L'+(nx-70)+','+(ny+36)+' Z',{fill:'#3a3a40',stroke:LINE,'stroke-width':1.5});
  L(pad,'M'+(nx-80)+','+(ny+8)+' L'+(nx+84)+','+(ny-6)+' M'+(nx-10)+','+(ny-24)+' L'+(nx+12)+','+(ny+28),LINE,.9,.35);
  /* easter egg: v rohu uterky malicke namalovane srdicko */
  L(pad,'M'+(nx+62)+','+(ny+8)+' c-3,-5 -10,-2 -7,3 l7,7 l7,-7 c3,-5 -4,-8 -7,-3',GOLD,1.1,.7);
})();

/* ==========================================================
   3. PREDLOKTI KLIENTKY (vnitrni strana, dlan nahoru) a ruka
   ========================================================== */
var TOPK=[[-520,226],[-200,244],[100,262],[400,279],[700,293],[1000,313],[1180,333],[1290,347],[1345,353],[1400,341],[1470,322],[1550,312],[1640,314],[1760,330]];
var BOTK=[[-520,772],[-200,756],[100,738],[400,720],[700,703],[1000,678],[1180,650],[1290,624],[1345,611],[1400,622],[1470,652],[1550,672],[1640,676],[1760,664]];
var TD=dense(TOPK),BD=dense(BOTK);
function top(x){return yAt(TD,x)}function bot(x){return yAt(BD,x)}
(function(){
  var r=rng(19),arm=G(BK);
  var dTop=cr(TOPK),shape=dTop+cr(BOTK.slice().reverse()).replace('M','L')+'Z',clip=clipOf(shape);
  /* stin ruky na podlozce */
  Q(arm,cr(BOTK.map(function(p){return [p[0]+10,p[1]+26]}))+'L1770,640 L-520,700Z',{fill:'#000',opacity:.6,filter:'url(#clBlur2)'});
  /* kuze: teply ton, svetlo lampy shora, stin u spodni hrany */
  Q(arm,shape,{fill:'url(#clSkin)'});
  var inn=G(arm,{'clip-path':clip});
  Q(inn,ST.rect(-600,200,2500,620,0),{fill:'url(#clSkinV)'});
  el('ellipse',{cx:800,cy:330,rx:720,ry:120,fill:'url(#gGlow)',opacity:.34},inn);
  /* palec (vzadu nahore) a dlan: thenar, cary dlane, zaklady prstu */
  var th=chainPts([[1420,352,60],[1500,300,50],[1580,262,42],[1650,236,36]]);
  Q(arm,cr(th.all,true),{fill:'url(#clSkin)'});Q(arm,cr(th.all,true),{fill:'#000',opacity:.25});
  L(arm,cr(th.all,false),LINE,2.2,.9);
  L(arm,'M1522,300 q10,14 4,30 M1590,262 q8,12 2,26',LINE,1,.4);
  arm.appendChild(inn);
  L(inn,'M1396,372 C1450,410 1500,470 1520,560 C1526,600 1516,640 1500,668',LINE,1.5,.55);
  L(inn,'M1470,360 C1540,420 1600,440 1700,430 M1500,520 C1560,500 1640,500 1720,520',LINE,1.2,.4);
  Q(inn,ST.ellipse(1440,470,70,120),{fill:WH,opacity:.035});
  /* rysy zapesti a slachy */
  L(inn,'M1318,372 C1338,440 1338,520 1320,592',LINE,1.4,.5);L(inn,'M1338,366 C1360,440 1358,524 1340,600',LINE,1,.35);
  L(inn,'M1296,380 C1312,440 1312,520 1298,586',LINE,.9,.25);
  L(inn,'M880,452 C1040,446 1180,452 1300,462',LINE,1.2,.3);L(inn,'M900,486 C1050,482 1190,490 1300,498',LINE,1,.22);
  /* hledacka: tenky naramek s priveskem pirka na zapesti */
  L(inn,'M1284,346 C1300,440 1300,530 1282,624',GOLD,2.6,.7);L(inn,'M1284,346 C1300,440 1300,530 1282,624',WH,.9,.4,{'stroke-dasharray':'3 7'});
  L(inn,'M1297,500 l10,14 M1307,514 q14,2 20,18 q-16,0 -20,-18 M1309,517 l14,12 M1313,516 l4,6 M1318,520 l3,5',GOLD,1.5,.85);
  /* zila pod kuzi */
  L(inn,'M260,560 C440,540 560,590 720,600 C900,612 1080,560 1280,548',"#6f86a0",5,.1);
  L(inn,'M720,600 C820,640 960,640 1080,616',"#6f86a0",4,.08);
  /* objem: vrstevnice pri spodni hrane (stin), ryte srafovani */
  [10,22,36,52,72].forEach(function(k,i){var pts=[];for(var x=-400;x<=1340;x+=60)pts.push([x,bot(x)-k*(1+.15*Math.sin(x*.006+k))]);
    L(inn,cr(pts),LINE,1,.34-i*.055,{'stroke-dasharray':(70+i*18)+' '+(10+i*4)+' '+(30+i*8)+' '+(14+i*3)})});
  var h1='';for(var x=-400;x<1340;x+=9){if(r()<.3)continue;var yb=bot(x),l=8+r()*r()*26;h1+='M'+f1(x)+','+f1(yb-3)+'l'+f1(-l*.45)+','+f1(-l)}
  L(inn,h1,LINE,.9,.3);
  var h2='';for(var x2=-300;x2<1340;x2+=14){if(r()<.4)continue;var yt=top(x2),l2=5+r()*10;h2+='M'+f1(x2)+','+f1(yt+4)+'l'+f1(-l2*.3)+','+f1(l2)}
  L(inn,h2,LINE,.8,.2);
  /* loketni jamka vlevo */
  L(inn,'M150,330 C210,420 214,560 160,690',LINE,1.3,.3);L(inn,'M186,350 C236,430 238,540 196,660',LINE,.9,.2);
  /* pory a jemne chloupky mimo oholene misto */
  var pt='',hh='';
  for(var j=0;j<260;j++){var px=-200+r()*1500,py=top(px)+14+r()*(bot(px)-top(px)-28);if(Math.pow((px-770)/260,2)+Math.pow((py-470)/230,2)<1)continue;
    pt+='M'+f1(px)+','+f1(py)+'h.1';if(j%3===0){var a=.2+(r()-.5)*.7,ll=6+r()*8;hh+='M'+f1(px)+','+f1(py)+'q'+f1(Math.cos(a)*ll*.5)+','+f1(Math.sin(a)*ll*.5-2)+' '+f1(Math.cos(a)*ll)+','+f1(Math.sin(a)*ll)}}
  L(inn,pt,LINE,1.5,.3);L(inn,hh,LINE,.7,.22);
  /* easter egg: ctyri pihy do tvaru srdce u zapesti */
  [[1168,560],[1184,552],[1200,560],[1184,578],[1176,569],[1192,569]].forEach(function(p,i){Q(inn,ST.circ(p[0],p[1],i<4?2.4:1.8),{fill:'#1a120d',opacity:.75})});
  /* tma u lokte a u prstu */
  Q(inn,ST.rect(-600,200,2500,620,0),{fill:'url(#clFadeL)'});Q(inn,ST.rect(-600,200,2500,620,0),{fill:'url(#clFadeR)'});
  /* obrys a odlesk horni hrany */
  L(arm,dTop,LINE,2.6,.95);L(arm,cr(BOTK),LINE,2.6,.95);
  L(arm,'M200,280 C500,296 800,310 1050,330 C1160,340 1240,352 1290,360',WH,1.4,.28,{'stroke-dasharray':'90 26 30 40'});
})();
/* vyhrnuty rukav vlevo */
(function(){
  var g=G(BK),r=rng(23);
  var sl=cr([[-700,150],[-360,150],[-150,170],[-40,214],[14,340],[26,500],[8,670],[-44,792],[-160,822],[-380,826],[-700,850]],true);
  Q(g,sl,{fill:'#2b2924'});Q(g,sl,{fill:'url(#hatchV)',opacity:.7});
  var f='';for(var i=0;i<22;i++){var y=214+i*27+r()*8,x0=-460+r()*80;f+='M'+f1(x0)+','+f1(y)+' C'+f1(x0+150)+','+f1(y-18-r()*14)+' '+f1(x0+260)+','+f1(y+20+r()*16)+' '+f1(-50+r()*40)+','+f1(y+(r()-.5)*36)}
  L(g,f,LINE,1.1,.4);L(g,sl,LINE,2.4,.9);
  var cuff=cr([[-56,190],[14,216],[58,340],[66,500],[44,672],[-12,800],[-104,812],[-78,650],[-70,500],[-72,340]],true);
  Q(g,cuff,{fill:'#37342d'});Q(g,cuff,{fill:'url(#hatchFine)',opacity:.7});L(g,cuff,LINE,2.4,.9);
  L(g,'M0,226 C44,340 54,500 34,664',LINE,1,.6,{'stroke-dasharray':'7 7'});
  Q(g,sl,{fill:'url(#clFadeL)',opacity:.6});
})();
Q(BK,ST.rect(-900,-900,3500,2800,0),{fill:'url(#clVig)'});

/* ==========================================================
   4. HONZOVA RUKA A PEN STROJEK
   lokalni souradnice: hrot jehly 0,0; osa strojku po +x (dozadu od hrotu); -y horni strana, +y spodni (ke kuzi)
   ========================================================== */
var MC=G(FR);ST.closeParts.machine=MC;
var needleG,MR,liftG,curlG,cable;
/* prst: vypln, stin spodni strany, lesk nitrilu, vrasky v kloubech, obrys */
function finger(par,pts,o){
  o=o||{};var c=chainPts(pts),d=cr(c.all,true),g=G(par),inn=G(g,{'clip-path':clipOf(d)});
  Q(g,d,{fill:o.dark?'url(#clGlvD)':'url(#clGlv)'});g.appendChild(inn);
  /* stin spodni strany (+y) a lesk horni (-y) */
  var lo=c.L.map(function(p,i){return [p[0]-c.T[i][1]*-pts[i][2]*.55,p[1]+c.T[i][0]*-pts[i][2]*.55]});
  L(inn,cr(c.L),'#000',pts[0][2]*.9,.4);
  var hi=c.R.map(function(p,i){return [p[0]-c.T[i][1]*pts[i][2]*.34,p[1]+c.T[i][0]*pts[i][2]*.34]});
  L(inn,cr(hi),WH,pts[0][2]*.22,o.dark?.1:.2);
  L(inn,cr(hi),WH,1.4,o.dark?.2:.5,{'stroke-dasharray':'34 8 16 12'});
  /* vrasky v kloubech */
  for(var i=1;i<pts.length-1;i++){var p=pts[i],t=c.T[i],rr=p[2];
    for(var k=-1;k<=1;k++){var ox=p[0]+t[0]*k*rr*.2,oy=p[1]+t[1]*k*rr*.2;
      L(inn,'M'+f1(ox+t[1]*rr*.9)+','+f1(oy-t[0]*rr*.9)+' Q'+f1(ox+t[0]*rr*.16)+','+f1(oy+t[1]*rr*.16)+' '+f1(ox-t[1]*rr*.2)+','+f1(oy+t[0]*rr*.2),LINE,.9,k?.2:.34)}}
  L(g,o.closed?d:cr(c.all,false),LINE,2.2,.92);
  return c;
}
(function(){
  /* stin ruky a strojku na kuzi */
  el('ellipse',{cx:150,cy:-70,rx:230,ry:20,fill:'url(#clSh)',opacity:.8,transform:'rotate(-50 150 -70)'},MC);
  el('ellipse',{cx:330,cy:-150,rx:250,ry:130,fill:'url(#clSh)',opacity:.75,transform:'rotate(-20 330 -150)'},MC);
  liftG=G(MC);MR=G(liftG,{transform:'rotate(-52)'});
  var M=MR;
  /* --- predlokti za rukavici (kuze s Honzovym tetovanim) --- */
  var fa=chainPts([[470,128,80],[620,226,92],[900,410,106],[1500,800,118]]),fad=cr(fa.L.concat(fa.R.slice().reverse()),true);
  Q(M,fad,{fill:'url(#clHz)'});
  var fin=G(M,{'clip-path':clipOf(fad)});
  L(fin,cr(fa.L),'#000',70,.38);L(fin,cr(fa.R.map(function(p){return [p[0]-10,p[1]+26]})),WH,10,.07);
  /* Honzuv rukav: vinna reva s listky, slunce, teckovani (stejne motivy jako na postave) */
  L(fin,'M600,170 C680,250 660,330 760,380 C860,430 880,520 990,560 C1080,594 1120,680 1240,720',GOLD,3,.7);
  [[652,250,1],[720,352,-1],[820,416,1],[900,506,-1],[1010,566,1],[1110,650,-1]].forEach(function(q){
    L(fin,'M'+q[0]+','+q[1]+' q'+(q[2]*34)+',-30 '+(q[2]*62)+',2 q'+(-q[2]*30)+',26 '+(-q[2]*62)+',-2 Z M'+q[0]+','+q[1]+' l'+(q[2]*58)+',2',GOLD,1.8,.6)});
  L(fin,ST.circ(770,250,30)+ST.circ(770,250,17),GOLD,1.8,.55);
  var sr='';for(var a=0;a<12;a++){var an=a*Math.PI/6;sr+='M'+f1(770+Math.cos(an)*37)+','+f1(250+Math.sin(an)*37)+'L'+f1(770+Math.cos(an)*(a%2?48:56))+','+f1(250+Math.sin(an)*(a%2?48:56))}
  L(fin,sr,GOLD,1.6,.5);
  var rd=rng(5),dt='';for(var q=0;q<70;q++){var u=rd(),v=rd();dt+=ST.circ(f1(600+u*640+v*-90),f1(170+u*520+v*150),1.6+rd()*1.4)}
  Q(fin,dt,{fill:GL,opacity:.34});
  L(M,cr(fa.L),LINE,2.2,.9);L(M,cr(fa.R),LINE,2.2,.9);
  /* --- rukavice: zapesti s rolovanym okrajem --- */
  var wr=chainPts([[420,96,74],[470,128,80],[540,174,86]]),wrd=cr(wr.L.concat(wr.R.slice().reverse()),true);
  Q(M,wrd,{fill:'url(#clGlv)'});
  L(M,cr(wr.L),LINE,2.2,.9);L(M,cr(wr.R),LINE,2.2,.9);
  var c0=wr.L[2],c1=wr.R[2];
  L(M,'M'+f1(c0[0])+','+f1(c0[1])+' Q'+f1((c0[0]+c1[0])/2+26)+','+f1((c0[1]+c1[1])/2+16)+' '+f1(c1[0])+','+f1(c1[1]),'#0a0a0c',13,1);
  L(M,'M'+f1(c0[0])+','+f1(c0[1])+' Q'+f1((c0[0]+c1[0])/2+26)+','+f1((c0[1]+c1[1])/2+16)+' '+f1(c1[0])+','+f1(c1[1]),LINE,2,.85,{transform:'translate(5,3)'});
  L(M,'M'+f1(c0[0])+','+f1(c0[1])+' Q'+f1((c0[0]+c1[0])/2+26)+','+f1((c0[1]+c1[1])/2+16)+' '+f1(c1[0])+','+f1(c1[1]),LINE,1.2,.5,{transform:'translate(-6,-4)'});
  L(M,'M452,60 q20,34 4,76 M478,84 q16,30 2,66 M500,112 q10,22 0,50',LINE,1,.24);
  /* --- zatocene prsty (malicek, prstenik) a hrbet ruky --- */
  curlG=G(M);
  /* prstenik a malicek jsou zatocene do dlane: zakladni clanek miri dopredu a dolu, v kloubu se prst lame
     a spicka se vraci zpet k dlani (ne nahoru ke strojku). Malicek lezi kloubem na kuzi. */
  finger(curlG,[[330,150,24],[290,178,23],[262,204,22],[282,226,20],[318,222,18]],{dark:1});
  finger(curlG,[[308,104,26],[262,132,25],[228,160,24],[244,190,22],[284,192,20]],{dark:1});
  var palm=cr([[262,-100],[300,-96],[352,-76],[410,-36],[462,14],[494,52],[468,120],[420,182],[366,208],[310,204],[272,176],[258,128],[262,60],[258,-10],[250,-66]],true);
  Q(M,palm,{fill:'url(#clGlv)'});
  var pin=G(M,{'clip-path':clipOf(palm)});
  Q(pin,'M240,110 C320,150 420,110 520,20 L520,260 L240,260 Z',{fill:'#000',opacity:.5});
  Q(pin,ST.ellipse(360,-50,110,34),{fill:WH,opacity:.07,transform:'rotate(34 360 -50)'});
  L(pin,'M276,-88 C330,-74 392,-34 452,22',WH,1.6,.42,{'stroke-dasharray':'46 12 20 14'});
  L(pin,'M290,-60 C340,-44 392,-8 440,40',WH,10,.05);
  L(pin,'M300,10 C340,0 380,10 420,40 M310,60 C350,56 384,70 410,100',LINE,1,.22);
  L(pin,'M270,-70 q20,-14 44,-6 M268,-30 q16,-8 34,-2',LINE,1,.26);
  L(pin,'M330,150 C360,168 400,160 430,130',GOLD,2.4,.16);
  L(M,palm,LINE,2.2,.92);
  /* prostrednik podpira grip zespodu */
  finger(M,[[286,84,26],[226,72,23.5],[178,60,21.5],[142,50,19.5]],{dark:1});
  /* --- PEN STROJEK --- */
  var mg=G(M);
  /* kabel od strojku ke zdroji */
  cable=L(mg,'M452,0 C560,-30 700,-150 1100,-260','#0b0b0d',9,1);L(mg,'M452,-3 C560,-33 700,-153 1100,-263',LINE,1.2,.4);
  /* jehla a pruhledny nos kartridze */
  needleG=G(mg);L(needleG,'M0,0 L20,0',WH,2.2,.95);L(needleG,'M20,-1.4 L84,-1.4 M20,1.4 L84,1.4',WH,1,.45);
  var nose='M14,-4 C30,-8 48,-14 66,-19 L66,19 C48,14 30,8 14,4 Z';
  Q(mg,nose,{fill:'rgba(231,221,199,.13)',stroke:LINE,'stroke-width':1.6,'stroke-opacity':.8});
  L(mg,'M20,-4 C34,-8 50,-13 62,-16',WH,1.5,.7);
  Q(mg,ST.rect(66,-23,52,46,4),{fill:'rgba(231,221,199,.1)',stroke:LINE,'stroke-width':1.6,'stroke-opacity':.8});
  var rb='';for(var i=0;i<5;i++)rb+='M'+(74+i*9)+',-23 V23 ';L(mg,rb,LINE,1,.25);L(mg,'M70,-16 H114',WH,1.6,.5);
  Q(mg,ST.ellipse(104,0,4,14),{fill:'rgba(200,164,92,.3)',stroke:GOLD,'stroke-width':1});
  Q(mg,ST.rect(118,-26,12,52,3),{fill:'url(#clBrass)',stroke:GOLD,'stroke-width':1.2});
  /* grip: cerna paska s krizovym vroubkovanim (jako na fotce) */
  var gp='M130,-36 C170,-33 226,-33 268,-37 L268,37 C226,33 170,33 130,36 Z';
  Q(mg,gp,{fill:'url(#clMet)'});
  var kg=G(mg,{'clip-path':clipOf(gp)}),kn='';for(var x=120;x<290;x+=9){kn+='M'+x+',-40 l26,80 M'+(x+26)+',-40 l-26,80 '}
  L(kg,kn,LINE,1,.26);Q(kg,ST.rect(126,-40,150,16,0),{fill:WH,opacity:.08});Q(kg,ST.rect(126,16,150,24,0),{fill:'#000',opacity:.5});
  L(kg,'M134,-26 C172,-23.4 226,-23.4 264,-27',WH,2,.4);
  L(mg,gp,LINE,2,.9);
  Q(mg,ST.rect(268,-35,14,70,2),{fill:'#3a3a41',stroke:LINE,'stroke-width':1.5});L(mg,'M270,-27 h10',WH,1.6,.6);
  /* telo motoru v ochranne folii, mosazny krouzek zdvihu, zadni vicko */
  var bd=ST.rect(282,-32,134,64,6);
  Q(mg,bd,{fill:'url(#clMet)',stroke:LINE,'stroke-width':2,'stroke-opacity':.9});
  Q(mg,ST.rect(350,-33.5,20,67,2),{fill:'url(#clBrass)',stroke:GOLD,'stroke-width':1.2});
  var kr='';for(var y=-30;y<31;y+=5)kr+='M351,'+y+' h18 ';L(mg,kr,'#2a2010',1,.6);
  Q(mg,'M416,-29 C438,-29 452,-15 452,0 C452,15 438,29 416,29 Z',{fill:'#1a1a1f',stroke:LINE,'stroke-width':2});
  var fol='M276,-41 C310,-45 350,-39 384,-43 C420,-47 446,-40 462,-44 L466,44 C446,40 420,47 384,43 C350,39 310,45 276,41 Z';
  Q(mg,fol,{fill:'rgba(231,221,199,.06)',stroke:LINE,'stroke-width':1.2,'stroke-opacity':.4});
  var rr=rng(91),cz='';for(var j=0;j<24;j++){var cx=284+rr()*170,cy=-36+rr()*72,l=8+rr()*22,an2=(rr()-.5)*1.5;cz+='M'+f1(cx)+','+f1(cy)+' l'+f1(Math.cos(an2)*l)+','+f1(Math.sin(an2)*l*.4)+' '}
  L(mg,cz,WH,1.1,.3);L(mg,'M286,-25 C330,-28 400,-25 446,-27',WH,3,.22);
  /* --- ukazovak navrchu gripu a palec z boku --- */
  var idx=finger(M,[[270,-74,26],[208,-63,23.5],[162,-50,21],[128,-40,18.5]]);
  var thb=finger(M,[[332,56,33],[270,32,28],[214,14,24],[168,4,21]]);
  /* nehty pod rukavici (jemny odlesk) */
  Q(M,ST.rect(-13,-8,24,16,7),{fill:WH,opacity:.09,stroke:WH,'stroke-width':1,'stroke-opacity':.3,transform:'translate(130,-48) rotate(16)'});
  Q(M,ST.rect(-14,-9,27,18,8),{fill:WH,opacity:.1,stroke:WH,'stroke-width':1,'stroke-opacity':.3,transform:'translate(170,-4) rotate(10)'});
  /* kapka barvy u hrotu */
  el('circle',{cx:5,cy:6,r:3.4,fill:'#1a1512',opacity:.85},MC);el('circle',{cx:4,cy:5,r:1.2,fill:WH,opacity:.6},MC);
})();

/* ==========================================================
   5. ZIVOT: jehla kmita, zapesti sleduje hrot, ruka dycha, kalisky se rozsviti pri vybarvovani
   ========================================================== */
var rotS=-52;
ST.on(function(T,time){
  if(T<7.6||T>10.95)return;
  var tip=ST.closeTip,work=T>8.1&&T<9.5,pack=T>9.02&&T<9.5,br=ST.reduce?0:Math.sin(time*.0021);
  if(needleG&&!ST.reduce)needleG.setAttribute('transform','translate('+(work?Math.sin(time*.11)*2.2:0).toFixed(2)+',0)');
  if(MR&&tip){var rt=-52+Math.max(-8,Math.min(8,(tip.x-760)*.05))-Math.max(-5,Math.min(5,(tip.y-470)*.025))+(pack&&!ST.reduce?Math.sin(time*.006)*2.2:0);
    rotS+=(rt-rotS)*.06;MR.setAttribute('transform','rotate('+rotS.toFixed(2)+')')}
  if(curlG&&!ST.reduce)curlG.setAttribute('transform','translate('+(br*1.4).toFixed(2)+','+(Math.sin(time*.0017)*1.4).toFixed(2)+')');
  if(liftG){var lift=ST.closeLift||0;liftG.setAttribute('transform','translate('+(lift*10).toFixed(1)+','+(-lift*18+br*1.4).toFixed(1)+')')}
  var ck=ST.ss(8.95,9.1,T);for(var i=0;i<caps.length;i++)caps[i].setAttribute('opacity',(.25+.65*ck).toFixed(2));
});
});
