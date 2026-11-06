/* pribeh/close.js - detail: predlokti klienta, opěrka, ruka v rukavici, strojek.
   Vsechno kresleno do ST.closeBack (pod motivem) a ST.closeFront (nad motivem). */
ST.module('close',function(ST){
var el=ST.el,rng=ST.rng,R=Math.PI/180;
var cs=document.getElementById('closeScene');
ST.closeBack=el('g',{},cs);ST.closeFront=el('g',{},cs);
var BK=ST.closeBack,FR=ST.closeFront,defs=ST.closeDefs;
var LINE='#E7DDC7',GOLD='#C8A45C',GL='#E8D5A3',GLOVE='#0b0b0d';

/* ---------- pomocne ---------- */
function f1(n){return Math.round(n*10)/10}
function P(par,d,cls,at){var a=at||{};a.d=d;a['class']='ink '+(cls||'');return el('path',a,par)}
function Fl(par,d,fill,at){var a=at||{};a.d=d;a.fill=fill;a.stroke='none';return el('path',a,par)}
function G(par,at){return el('g',at||{},par)}
function grad(id,type,attrs,stops){var g=el(type,attrs,defs);g.setAttribute('id',id);
  stops.forEach(function(s){el('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},g)});return g}
function cr(pts,closed){var n=pts.length,d='M'+f1(pts[0][0])+','+f1(pts[0][1]),N=closed?n:n-1;
  for(var i=0;i<N;i++){
    var p0=pts[closed?(i-1+n)%n:Math.max(i-1,0)],p1=pts[i],p2=pts[(i+1)%n],p3=pts[closed?(i+2)%n:Math.min(i+2,n-1)];
    d+='C'+f1(p1[0]+(p2[0]-p0[0])/6)+','+f1(p1[1]+(p2[1]-p0[1])/6)+' '+f1(p2[0]-(p3[0]-p1[0])/6)+','+f1(p2[1]-(p3[1]-p1[1])/6)+' '+f1(p2[0])+','+f1(p2[1])}
  return closed?d+'Z':d}
function dense(pts){var out=[],n=pts.length;
  for(var i=0;i<n-1;i++){
    var p0=pts[Math.max(i-1,0)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(i+2,n-1)];
    var c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
    for(var k=0;k<10;k++){var t=k/10,u=1-t;
      out.push([u*u*u*p1[0]+3*u*u*t*c1x+3*u*t*t*c2x+t*t*t*p2[0],u*u*u*p1[1]+3*u*u*t*c1y+3*u*t*t*c2y+t*t*t*p2[1]])}}
  out.push(pts[n-1]);return out}
function yAt(a,x){for(var i=1;i<a.length;i++)if(a[i][0]>=x){var p=a[i-1],q=a[i],t=(x-p[0])/((q[0]-p[0])||1);return p[1]+(q[1]-p[1])*t}return a[a.length-1][1]}
function limbPts(pts){var n=pts.length,L=[],Rr=[],tx,ty,l;
  for(var i=0;i<n;i++){var a=pts[Math.max(i-1,0)],b=pts[Math.min(i+1,n-1)];tx=b[0]-a[0];ty=b[1]-a[1];l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;
    var w=pts[i][2]/2;L.push([pts[i][0]-ty*w,pts[i][1]+tx*w]);Rr.push([pts[i][0]+ty*w,pts[i][1]-tx*w])}
  var e=pts[n-1],s=pts[0],a2=pts[n-2]||s,b2=pts[1]||e;
  var ex=e[0]-a2[0],ey=e[1]-a2[1],el_=Math.hypot(ex,ey)||1,sx=b2[0]-s[0],sy=b2[1]-s[1],sl=Math.hypot(sx,sy)||1;
  var endc=[e[0]+ex/el_*e[2]*.52,e[1]+ey/el_*e[2]*.52],stc=[s[0]-sx/sl*s[2]*.52,s[1]-sy/sl*s[2]*.52];
  return L.concat([endc],Rr.reverse(),[stc])}
function limb(pts){return cr(limbPts(pts),true)}
/* hrana limbu (jedna strana) pro odlesky */
function side(pts,sgn,from,to,inset){var o=[],n=pts.length;
  for(var i=0;i<n;i++){var a=pts[Math.max(i-1,0)],b=pts[Math.min(i+1,n-1)],tx=b[0]-a[0],ty=b[1]-a[1],l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;
    var w=pts[i][2]/2-(inset||0);o.push([pts[i][0]-ty*w*sgn,pts[i][1]+tx*w*sgn])}
  return o}

/* ---------- gradienty ---------- */
grad('clVol','linearGradient',{x1:0,y1:0,x2:0,y2:1},[[0,LINE,.05],[.08,LINE,.24],[.3,LINE,.09],[.55,'#000',0],[.8,'#000',.25],[1,'#000',.66]]);
grad('clFadeL','linearGradient',{gradientUnits:'userSpaceOnUse',x1:-150,y1:0,x2:760,y2:0},[[0,'#000',.95],[.45,'#000',.62],[1,'#000',0]]);
grad('clFadeR','linearGradient',{gradientUnits:'userSpaceOnUse',x1:1250,y1:0,x2:1800,y2:0},[[0,'#000',0],[1,'#000',.5]]);
grad('clVig','radialGradient',{gradientUnits:'userSpaceOnUse',cx:800,cy:480,r:1000},[[.55,'#000',0],[1,'#000',.42]]);
grad('clCone','linearGradient',{x1:0,y1:0,x2:0,y2:1},[[0,GL,.0],[.55,GL,.07],[1,GOLD,.16]]);
grad('clPad','linearGradient',{x1:0,y1:0,x2:0,y2:1},[[0,'#000',.35],[.25,'#000',0],[1,'#000',.5]]);
grad('clPaper','linearGradient',{x1:0,y1:0,x2:0,y2:1},[[0,'#000',.5],[.22,'#000',0],[.6,LINE,.1],[1,LINE,.04]]);
var blur=el('filter',{id:'clBlur',x:'-20%',y:'-20%',width:'140%',height:'140%'},defs);el('feGaussianBlur',{stdDeviation:9},blur);
var blur2=el('filter',{id:'clBlur2',x:'-50%',y:'-50%',width:'200%',height:'200%'},defs);el('feGaussianBlur',{stdDeviation:3},blur2);

/* ==========================================================
   1. POZADI: studio v rozostreni, bokeh, kuzel lampy
   ========================================================== */
var bg=G(BK);
(function(){
  var r=rng(41),g=G(bg,{filter:'url(#clBlur)'});
  /* rozmazane obrysy: police, lahve, rám obrazu */
  Fl(g,ST.rect(-500,-250,640,300,8),'var(--t2)',{opacity:.55});
  Fl(g,ST.rect(-480,-420,600,18,4),'var(--t3)',{opacity:.5});
  Fl(g,ST.rect(1280,-180,420,260,10),'var(--t2)',{opacity:.5});
  Fl(g,ST.rect(1320,-130,340,170,6),'var(--t3)',{opacity:.28});
  for(var i=0;i<9;i++){var x=-440+i*52,h=60+r()*90;Fl(g,ST.rect(x,50-h,30+r()*10,h,6),'var(--t3)',{opacity:.3+r()*.25})}
  /* bokeh */
  var gb=G(bg,{filter:'url(#clBlur2)'});
  for(var k=0;k<46;k++){
    var x=-700+r()*2500,y=-900+r()*1130,rad=14+r()*r()*62,op=.06+r()*.2;
    el('circle',{cx:f1(x),cy:f1(y),r:f1(rad),fill:'url(#gHalo)',opacity:Math.min(.7,op*2.6)},gb);
    if(r()<.55)el('circle',{cx:f1(x),cy:f1(y),r:f1(rad*.8),fill:'none',stroke:r()<.5?GOLD:GL,'stroke-width':f1(1+r()*1.6),opacity:Math.min(.55,op*2)},gb);
  }
  /* kuzel svetla */
  Fl(bg,'M700,-900 L860,-900 L1700,700 L-100,700 Z','url(#clCone)',{});
  P(bg,'M700,-900 L-100,700 M860,-900 L1700,700','gold hair',{opacity:.22});
  P(bg,'M760,-900 L360,500 M800,-900 L1280,500','goldl hair',{opacity:.08});
  el('ellipse',{cx:800,cy:340,rx:760,ry:230,fill:'url(#gGlow)',opacity:.34},bg);
})();

/* ==========================================================
   2. OPERKA: kozeny polstr, prositi, papirova podlozka
   ========================================================== */
var pad=G(BK);
(function(){
  var r=rng(7);
  /* podlaha pod opěrkou + predni stena polstru */
  Fl(pad,ST.rect(-900,1150,3400,800,0),'var(--bg)');
  Fl(pad,ST.rect(-900,880,3400,300,0),'var(--t1)');
  for(var x=-880;x<2400;x+=36)P(pad,'M'+x+',900 q'+f1(r()*8-4)+',120 '+f1(r()*10-5)+',270','hair faint');
  Fl(pad,ST.rect(-900,880,3400,300,0),'url(#hatchV)',{opacity:.5});
  /* horni plocha polstru */
  Fl(pad,ST.rect(-900,520,3400,380,0),'var(--t2)');
  Fl(pad,ST.rect(-900,520,3400,380,0),'url(#stipple)',{opacity:.55});
  Fl(pad,ST.rect(-900,520,3400,380,0),'url(#clPad)');
  /* jemna kuze: popraskane linky */
  var d='';
  for(var i=0;i<130;i++){var x=-800+r()*2900,y=720+r()*165,a=r()*3.14,l=8+r()*16;d+='M'+f1(x)+','+f1(y)+'l'+f1(Math.cos(a)*l)+','+f1(Math.sin(a)*l*.4)}
  P(pad,d,'hair dim',{opacity:.35});
  /* hrana polstru: lemovka a dva rady stehu */
  P(pad,'M-900,884 C-300,878 600,892 1300,884 S2300,880 2500,886','',{});
  P(pad,'M-900,894 C-300,888 600,902 1300,894 S2300,890 2500,896','thin',{opacity:.7});
  P(pad,'M-900,858 C-300,852 600,866 1300,858 S2300,854 2500,860','thin dim',{opacity:.9,'stroke-dasharray':'11 8'});
  P(pad,'M-900,872 C-300,866 600,880 1300,872 S2300,868 2500,874','hair dim',{opacity:.8,'stroke-dasharray':'4 10'});
  Fl(pad,'M-900,886 C-300,880 600,894 1300,886 S2300,882 2500,888 L2500,926 L-900,926Z','url(#hatchFine)',{opacity:.9});
  /* paprova podlozka (jednorazovy hygienicky papir) */
  var pp='M-120,640 L1500,606 L1560,790 C1400,812 1300,800 1150,818 C900,834 600,806 330,830 C130,846 -20,822 -120,834 Z';
  Fl(pad,pp,'rgba(0,0,0,.4)',{transform:'translate(0,16)',opacity:.7});
  Fl(pad,pp,'var(--t3)');
  Fl(pad,pp,'url(#stipple)',{opacity:.7});
  Fl(pad,pp,'url(#clPaper)');
  P(pad,pp,'thin',{});
  /* embosace papiru */
  var e='';
  for(var gx=-80;gx<1560;gx+=26)for(var gy=720;gy<830;gy+=22){e+='M'+(gx+((gy/22)%2)*13)+','+(gy+((gx/26|0)%3))+'l3,0'}
  P(pad,e,'hair dim',{opacity:.28});
  /* zahyby papiru */
  var cr1=['M-60,790 C100,770 220,800 380,778','M300,830 C380,780 470,760 520,700','M900,826 C940,780 1010,756 1090,716','M1180,816 C1260,770 1340,760 1440,720','M520,822 C560,792 620,780 690,760','M1330,812 C1380,800 1440,800 1520,790'];
  cr1.forEach(function(d,i){P(pad,d,'hair',{opacity:.6});P(pad,d.replace(/(\d+),(\d+)/g,function(m,a,b){return (+a+5)+','+(+b+4)}),'hair dim',{opacity:.35})});
  /* strapec papiru a zahnute rohy */
  P(pad,'M1480,792 q20,-30 54,-26 q-10,22 -54,26','thin',{});
  Fl(pad,'M1480,792 q20,-30 54,-26 q-10,22 -54,26Z','url(#hatchFine)',{});
  /* zmuchlany ubrousek vlevo dole */
  var nx=380,ny=806,nap=[[nx-70,ny+6],[nx-52,ny-26],[nx-12,ny-44],[nx+30,ny-34],[nx+66,ny-14],[nx+74,ny+14],[nx+44,ny+36],[nx-6,ny+42],[nx-50,ny+32]];
  Fl(pad,cr(nap,true),'rgba(0,0,0,.5)',{transform:'translate(8,10)'});
  Fl(pad,cr(nap,true),'var(--t3)');
  P(pad,cr(nap,true),'',{});
  var nl='';
  for(var q=0;q<17;q++){var a=r()*6.28,l1=8+r()*18,l2=l1+10+r()*24;nl+='M'+f1(nx+Math.cos(a)*l1)+','+f1(ny-2+Math.sin(a)*l1*.7)+' L'+f1(nx+Math.cos(a+.15)*l2)+','+f1(ny-2+Math.sin(a+.15)*l2*.75)}
  P(pad,nl,'hair',{opacity:.8});
  P(pad,'M'+(nx-44)+','+(ny-10)+' q20,-22 50,-14 q20,8 36,-4 M'+(nx-30)+','+(ny+22)+' q30,-14 54,2 q16,10 30,-10','thin dim',{});
  Fl(pad,'M'+(nx-6)+','+(ny-20)+' q30,-12 56,6 q-14,30 -50,32 q-24,-10 -6,-38Z','url(#hatchFine)',{opacity:.9});
  /* kapsle s barvou (ink cap) vpravo dole */
  var cx=1210,cy=800;
  Fl(pad,'M'+(cx-36)+','+(cy+14)+' a36,13 0 1,0 72,0 a36,13 0 1,0 -72,0Z','rgba(0,0,0,.55)',{transform:'translate(10,10)'});
  Fl(pad,'M'+(cx-34)+','+(cy-30)+' v32 a34,12 0 0,0 68,0 v-32Z','var(--t1)');
  P(pad,'M'+(cx-34)+','+(cy-30)+' v32 a34,12 0 0,0 68,0 v-32','',{});
  Fl(pad,'M'+(cx-34)+','+(cy-30)+' v32 a34,12 0 0,0 68,0 v-32Z','url(#hatchV)',{opacity:.9});
  Fl(pad,ST.ellipse(cx,cy-30,34,12),'var(--t3)');
  P(pad,ST.ellipse(cx,cy-30,34,12),'',{});
  Fl(pad,ST.ellipse(cx,cy-29,28,9.5),'var(--bg)');
  P(pad,ST.ellipse(cx,cy-29,28,9.5),'thin dim',{});
  Fl(pad,ST.ellipse(cx+4,cy-30,14,4.5),'url(#gHalo)',{opacity:.9});
  P(pad,'M'+(cx-14)+','+(cy-33)+' q10,-5 24,-2','goldl hair',{opacity:.7});
  P(pad,'M'+(cx-27)+','+(cy-24)+' v22','goldl hair',{opacity:.35});
  Fl(pad,'M'+(cx+36)+','+(cy-8)+' q14,2 20,-8 q4,-10 -8,-8 q-12,2 -12,16Z','url(#gHalo)',{opacity:.4});
})();

/* ==========================================================
   3. PREDLOKTI KLIENTA
   ========================================================== */
var TOPK=[[-500,236],[-200,248],[100,268],[350,284],[600,297],[800,301],[1000,316],[1160,336],[1250,350],[1320,362],[1380,350],[1460,342],[1540,343],[1620,350]];
var BOTK=[[-500,748],[-200,740],[100,728],[350,718],[600,712],[800,706],[1000,688],[1160,664],[1260,644],[1320,630],[1380,640],[1450,660],[1540,664],[1620,660]];
var TD=dense(TOPK),BD=dense(BOTK);
function top(x){return yAt(TD,x)}function bot(x){return yAt(BD,x)}
var arm=G(BK);
(function(){
  var r=rng(19);
  var dTop=cr(TOPK),dBotRev=cr(BOTK.slice().reverse()).replace('M','L');
  var shape=dTop+dBotRev+'Z';
  /* stin pod rukou na papire */
  var sh='';
  for(var x=-200;x<1500;x+=6){var yb=bot(x);sh+='M'+x+','+f1(yb+3)+'l'+f1(-10-r()*8)+','+f1(18+r()*34*(1-x/1900))}
  Fl(arm,cr(BOTK.map(function(p){return [p[0],p[1]+20]}))+'L1620,664 L-500,748Z','#000',{opacity:.38,filter:'url(#clBlur2)'});
  P(arm,sh,'hair',{opacity:.55});
  /* kuze */
  Fl(arm,shape,'var(--skin)');
  Fl(arm,shape,'url(#stipple)',{opacity:.42});
  Fl(arm,shape,'url(#clVol)');
  /* objem: svetlo od lampy nahore */
  el('ellipse',{cx:800,cy:400,rx:760,ry:210,fill:'url(#gGlow)',opacity:.5},arm);
  /* rytinove srafovani: dolni okraj (stin) */
  var h1='',h2='',h3='';
  for(var x=-300;x<1600;x+=6.5){if(r()<.3)continue;var yb=bot(x),L=6+r()*r()*20*(.6+.4*Math.sin(x*.012));h1+='M'+f1(x)+','+f1(yb-3)+'l'+f1(-L*.5)+','+f1(-L)}
  for(var x2=-300;x2<1600;x2+=11){if(r()<.3)continue;var yb2=bot(x2),L2=10+r()*22;h2+='M'+f1(x2)+','+f1(yb2-12)+'l'+f1(L2*.55)+','+f1(-L2)}
  for(var x3=-300;x3<1600;x3+=9){if(r()<.35)continue;var yt=top(x3),L3=6+r()*12;h3+='M'+f1(x3)+','+f1(yt+3)+'l'+f1(-L3*.3)+','+f1(L3)}
  P(arm,h1,'hair',{opacity:.45});
  [8,17,28,41,56,74].forEach(function(k,i){var pts=[];for(var x=-300;x<=1620;x+=40)pts.push([x,bot(x)-k*(1+.22*Math.sin(x*.007+k))*(x>1200?.7:1)]);
    P(arm,cr(pts),'hair',{opacity:.55-i*.07,'stroke-dasharray':(60+i*14)+' '+(8+i*3)+' '+(26+i*8)+' '+(12+i*2)})});
  [10,26,48].forEach(function(k,i){var pts=[];for(var x=-300;x<=1620;x+=40)pts.push([x,top(x)+k*(1+.2*Math.sin(x*.006+k))]);
    P(arm,cr(pts),'hair dim',{opacity:.35-i*.08,'stroke-dasharray':(40+i*20)+' 14 '+(14+i*6)+' 20'})});P(arm,h2,'hair dim',{opacity:.55});P(arm,h3,'hair dim',{opacity:.6});
  /* objemove vrstevnice */
  var cont=[
    'M-100,610 C300,642 700,636 1050,596 S1230,566 1290,552',
    'M-100,590 C300,618 700,610 1050,572 S1220,544 1280,532',
    'M0,470 C400,492 800,470 1200,452',
    'M150,420 C500,438 900,420 1230,404',
    'M-50,372 C400,356 800,362 1240,384'];
  cont.forEach(function(d,i){P(arm,d,i<2?'thin dim':'hair dim',{opacity:i<2?.5:.45})});
  /* svalove skupiny a kuzni vazy */
  P(arm,'M180,540 C420,500 760,520 1020,470 C1140,446 1220,452 1290,466','hair dim',{opacity:.35});
  P(arm,'M500,500 C700,470 980,480 1190,430','hair dim',{opacity:.3});
  /* tikance v drazkach */
  var tk='';
  for(var t=0;t<70;t++){var x=20+t*18,y=470+Math.sin(x*.0035)*10+(x/1200)*-18+ (x>0?x*.014:0)-10;tk+='M'+x+','+f1(y)+'l-1.5,5'}
  P(arm,tk,'hair dim',{opacity:.35});
  /* ulna: hrana loketni kosti u horniho okraje a hlavicka u zapesti */
  P(arm,'M-100,316 C300,326 700,336 1060,358 C1160,366 1230,372 1262,372','thin dim',{opacity:.5});
  P(arm,'M-100,322 C300,332 700,342 1060,364','hair dim',{opacity:.4});
  var ul=cr([[1244,352],[1268,338],[1300,340],[1318,356],[1304,376],[1272,380],[1248,370]],true);
  P(arm,'M1250,368 C1262,380 1296,384 1314,368','thin',{opacity:.9});
  P(arm,'M1258,350 C1274,340 1296,342 1308,352','goldl hair',{opacity:.55});
  P(arm,'M1262,372 C1280,378 1296,376 1308,368 M1270,360 C1282,366 1294,364 1300,358','hair',{opacity:.7});
  /* rysy zapesti (zhyby kuze) */
  P(arm,'M1228,420 C1244,470 1242,520 1228,566 M1244,424 C1260,470 1258,520 1244,562','hair dim',{opacity:.55});
  P(arm,'M1190,452 q10,50 -4,100','hair dim',{opacity:.35});
  /* sliny a zily u zapesti */
  var tdn=[[1330,420,1600,372],[1336,460,1620,440],[1332,508,1620,504],[1324,552,1610,574]];
  tdn.forEach(function(q,i){var c1=[q[0]+110,q[1]+(i<2?-16:12)],c2=[q[2]-120,q[3]+(i<2?10:-6)];
    P(arm,'M'+q[0]+','+q[1]+' C'+c1[0]+','+c1[1]+' '+c2[0]+','+c2[1]+' '+q[2]+','+q[3],'thin dim',{opacity:.7});
    P(arm,'M'+q[0]+','+(q[1]+8)+' C'+(c1[0])+','+(c1[1]+9)+' '+(c2[0])+','+(c2[1]+9)+' '+q[2]+','+(q[3]+9),'hair dim',{opacity:.45});
    var th='';for(var u=0;u<14;u++){var tt=.08+u*.06,xx=q[0]+(q[2]-q[0])*tt;th+='M'+f1(xx)+','+f1(q[1]+(q[3]-q[1])*tt+ (i<2?-6:4))+'l3,6'}
    P(arm,th,'hair dim',{opacity:.35})});
  P(arm,'M1140,418 C1200,402 1250,430 1296,424 S1380,444 1440,430 M1296,424 C1316,444 1340,448 1356,470 M1190,414 C1210,396 1226,388 1250,392','thin dim',{opacity:.55});
  P(arm,'M1140,424 C1200,408 1250,436 1296,430 S1380,450 1440,436','hair dim',{opacity:.35});
  P(arm,'M1150,500 C1210,512 1260,500 1310,520 M1210,508 q22,24 60,26','thin dim',{opacity:.4});
  /* kloubova kost zakladu prstu */
  [[1568,356,22],[1612,360,24]].forEach(function(k){P(arm,'M'+(k[0]-k[2])+','+(k[1]+4)+' q'+k[2]+',-'+(k[2]*.8)+' '+(k[2]*2)+',0','thin dim',{opacity:.6})});
  /* chlupky: kratke tahy, stridave smer ke kloubu */
  var hh='',n=0;
  for(var i=0;i<900&&n<310;i++){
    var x=-60+r()*1330,yt=top(x),yb=bot(x),y=yt+16+r()*(yb-yt-32);
    if(Math.pow((x-770)/170,2)+Math.pow((y-505)/215,2)<1)continue;
    if(y>yb-30&&r()<.4)continue;
    var a=(r()-.5)*.9+.12,l=7+r()*9;n++;
    hh+='M'+f1(x)+','+f1(y)+'q'+f1(Math.cos(a)*l*.5)+','+f1(Math.sin(a)*l*.5-2.2)+' '+f1(Math.cos(a)*l)+','+f1(Math.sin(a)*l)}
  P(arm,hh,'hair dim',{opacity:.6});
  /* stipple u okraju hustsi: pory */
  var pt='';
  for(var j=0;j<260;j++){var x=-200+r()*1500,yt=top(x),yb=bot(x),y=yt+8+r()*(yb-yt-16);
    if(Math.pow((x-770)/170,2)+Math.pow((y-505)/215,2)<1)continue;pt+='M'+f1(x)+','+f1(y)+'l.1,.1'}
  P(arm,pt,'hair',{opacity:.55,'stroke-width':1.3});
  /* highlight horniho obrysu a odlesk lampy */
  P(arm,'M150,284 C400,296 700,308 950,320 C1100,330 1200,346 1240,356','goldl hair',{opacity:.3,'stroke-dasharray':'60 22 18 30'});
  P(arm,'M-60,274 C100,282 300,296 520,308','goldl hair',{opacity:.2,'stroke-dasharray':'40 30'});
  /* temnota vlevo a vpravo */
  Fl(arm,shape,'url(#clFadeL)');
  Fl(arm,shape,'url(#clFadeR)');
  /* obrys */
  P(arm,dTop,'',{});
  P(arm,cr(BOTK),'',{});
})();

/* ruka klienta: prsty a palec */
(function(){
  var g=G(BK);
  var fingers=[
    [[1570,390,66],[1660,386,58],[1745,396,52],[1830,418,46]],
    [[1575,456,68],[1670,454,60],[1765,468,54],[1850,494,48]],
    [[1575,520,64],[1668,522,56],[1750,542,50],[1825,574,44]],
    [[1572,580,54],[1644,592,48],[1706,614,42],[1756,644,36]]];
  fingers.forEach(function(f,i){
    var d=limb(f);
    Fl(g,d,'rgba(0,0,0,.4)',{transform:'translate(8,12)'});
    Fl(g,d,'var(--skin)');Fl(g,d,'url(#stipple)',{opacity:.4});Fl(g,d,'url(#clVol)',{opacity:.9});
    P(g,d,'',{});
    /* klouby, nehet */
    var e=f[3],p=f[2];
    P(g,'M'+(f[1][0]-6)+','+(f[1][1]-f[1][2]*.3)+' q6,'+(f[1][2]*.3)+' 0,'+(f[1][2]*.6)+' M'+(f[1][0]+4)+','+(f[1][1]-f[1][2]*.3)+' q6,'+(f[1][2]*.3)+' 0,'+(f[1][2]*.6),'hair dim',{opacity:.55});
    P(g,'M'+(f[2][0]-4)+','+(f[2][1]-f[2][2]*.28)+' q5,'+(f[2][2]*.28)+' 0,'+(f[2][2]*.56),'hair dim',{opacity:.5});
    var nail=cr([[e[0]-34,e[1]-e[2]*.3],[e[0]-8,e[1]-e[2]*.36],[e[0]+10,e[1]-e[2]*.14],[e[0]+10,e[1]+e[2]*.14],[e[0]-8,e[1]+e[2]*.34],[e[0]-34,e[1]+e[2]*.3]],true);
    Fl(g,nail,'var(--t3)');P(g,nail,'thin',{});P(g,'M'+(e[0]-24)+','+(e[1]-e[2]*.14)+' q12,-4 26,0','goldl hair',{opacity:.45});
    P(g,'M'+(f[0][0])+','+(f[0][1]-f[0][2]*.4)+' C'+(f[1][0])+','+(f[1][1]-f[1][2]*.36)+' '+(f[2][0])+','+(f[2][1]-f[2][2]*.38)+' '+(e[0]-34)+','+(e[1]-e[2]*.3),'goldl hair',{opacity:.22,'stroke-dasharray':'50 14'});
  });
  /* palec pod rukou */
  var th=[[1400,640,96],[1480,690,74],[1560,722,58],[1630,730,50]];
  var d=limb(th);
  Fl(g,d,'rgba(0,0,0,.4)',{transform:'translate(8,12)'});
  Fl(g,d,'var(--skin)');Fl(g,d,'url(#stipple)',{opacity:.4});Fl(g,d,'url(#clVol)');P(g,d,'',{});
  P(g,'M1500,676 q10,18 -2,36 M1556,700 q8,12 0,26','hair dim',{opacity:.55});
  var tn=cr([[1598,712],[1622,708],[1650,716],[1650,744],[1622,752],[1598,744]],true);
  Fl(g,tn,'var(--t3)');P(g,tn,'thin',{});
  /* stin nad hranou ruky na papir */
  P(g,'M1420,690 C1500,730 1580,760 1640,756','hair',{opacity:.5});
})();

/* rukav: vyhrnuta latka vlevo */
(function(){
  var g=G(BK),r=rng(23);
  /* vlnity rukav pred loktem */
  var sl=cr([[-620,170],[-300,160],[-80,176],[40,212],[88,330],[100,500],[82,660],[34,780],[-80,800],[-320,800],[-620,820]],true);
  Fl(g,sl,'var(--t2)');
  Fl(g,sl,'url(#hatchV)',{opacity:.85});
  P(g,sl,'',{});
  /* rasenina */
  var f='';
  for(var i=0;i<26;i++){var y=210+i*23+r()*8,x0=-380+r()*80,w=r()*40;
    f+='M'+f1(x0)+','+f1(y)+' C'+f1(x0+150)+','+f1(y-18-r()*16)+' '+f1(x0+260)+','+f1(y+22+r()*18)+' '+f1(30+w)+','+f1(y+(r()-.5)*40)}
  P(g,f,'thin',{opacity:.55});
  var f2='';
  for(var j=0;j<20;j++){var y2=230+j*28+r()*10,x2=-250+r()*70;
    f2+='M'+f1(x2)+','+f1(y2)+' c60,-12 110,16 170,2'}
  P(g,f2,'hair dim',{opacity:.55});
  /* vyhrnuty lem (manzeta) */
  var cuff=cr([[24,186],[88,212],[130,330],[138,500],[116,670],[62,800],[-34,810],[-8,640],[-4,500],[-2,330]],true);
  Fl(g,cuff,'var(--t3)');
  Fl(g,cuff,'url(#hatchFine)',{opacity:.8});
  P(g,cuff,'',{});
  P(g,'M40,212 C96,330 108,500 84,670 M60,206 C112,330 122,500 100,680','thin dim',{opacity:.7});
  P(g,'M0,210 C60,340 62,500 40,700','hair dim',{opacity:.6});
  /* prositi na lemu */
  P(g,'M70,224 C118,340 128,500 108,664','hair',{opacity:.8,'stroke-dasharray':'6 6'});
  /* stin latky na kuzi */
  Fl(g,sl,'url(#clFadeL)',{opacity:.35});
})();

/* vinetace a temne okraje */
Fl(BK,ST.rect(-900,-900,3500,2800,0),'url(#clVig)');

/* ==========================================================
   4. HONZOVA LEVA RUKA V RUKAVICI (closeFront)
   ========================================================== */
var LG=G(FR),LGi=G(LG);
ST.closeParts.glove=LG;
(function(){
  var g=LGi,r=rng(61);
  var forearm=[[480,140,140],[415,62,130],[345,-25,124],[270,-115,122]];
  var palm=[[462,120,150],[536,208,142]];
  var thumb=[[432,214,54],[462,282,48],[512,342,42],[560,388,36],[598,410,30]];
  var index=[[508,232,38],[538,262,36],[566,296,34],[592,328,29]];
  var mid=[[538,214,37],[568,238,36],[594,266,33],[607,296,29]];
  var ring=[[566,194,35],[592,212,33],[613,238,30],[623,263,26]];
  var pink=[[592,172,31],[612,186,29],[629,206,26],[637,228,23]];
  var parts=[forearm,palm,thumb,pink,ring,mid,index];
  /* kuze napnuta mezi palcem a ukazovakem */
  var st='';
  for(var i=0;i<13;i++){var a=(-30+i*5.8)*R,x0=596+Math.cos(a)*8,y0=372+Math.sin(a)*34,l=26+r()*26;
    st+='M'+f1(x0)+','+f1(y0)+' q'+f1(Math.cos(a)*l*.5+2)+','+f1(Math.sin(a)*l*.5-3)+' '+f1(Math.cos(a)*l)+','+f1(Math.sin(a)*l*.5)}
  P(g,st,'hair dim',{opacity:.7});
  P(g,'M612,336 C640,350 642,392 616,416 M622,338 C652,352 654,394 626,420','hair',{opacity:.4});
  P(g,'M560,350 C574,360 580,380 576,398','hair dim',{opacity:.5});
  /* stin rukavice na kuzi */
  var sh=G(g,{opacity:.42,transform:'translate(12,16)'});
  parts.forEach(function(p){Fl(sh,limb(p),'#000')});
  /* rukav triko */
  var sleeve=limb([[250,-140,152],[120,-300,176]]);
  Fl(g,sleeve,'var(--t1)');P(g,sleeve,'',{});
  var sf='';
  for(var s2=0;s2<9;s2++)sf+='M'+f1(150+s2*18)+','+f1(-230+s2*8)+' c-20,40 -34,70 -40,120';
  P(g,sf,'hair dim',{opacity:.6});
  var gl=function(p){var d=limb(p);Fl(g,d,GLOVE);P(g,d,'thin',{opacity:.92});return d};
  gl(thumb);gl(forearm);gl(palm);gl(pink);gl(ring);gl(mid);gl(index);
  /* manzeta */
  P(g,'M296,18 C330,6 366,-30 394,-66','ink',{opacity:.85});
  P(g,'M283,2 C318,-10 352,-46 380,-82','thin',{opacity:.55});
  P(g,'M300,30 C334,18 372,-18 400,-54','hair',{opacity:.5});
  /* odlesky */
  function hl(p,sgn,o,dash){P(g,cr(side(p,sgn,0,1,5)),'goldl hair',{opacity:o,'stroke-dasharray':dash||'46 18 12 22'})}
  hl(index,1,.5);hl(thumb,1,.5);hl(mid,1,.4);hl(ring,1,.3);hl(pink,1,.25);hl(forearm,1,.5);hl(forearm,-1,.25);hl(palm,1,.3);
  /* zahyby u kloubu (kolmo na prst) */
  function crease(p,t,n,w){var i=Math.floor(t),f=t-i,a=p[i],b=p[i+1],x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);dx/=l;dy/=l;
    var d='';for(var k=0;k<n;k++){var ox=x+dx*k*5,oy=y+dy*k*5;d+='M'+f1(ox-dy*w)+','+f1(oy+dx*w)+' q'+f1(dx*3)+','+f1(dy*3)+' '+f1(dy*2*w)+','+f1(-dx*2*w)}return d}
  var cz='';
  [index,mid,ring].forEach(function(p){cz+=crease(p,1,3,13)+crease(p,2,2,11)});
  cz+=crease(pink,1,2,10)+crease(pink,2,2,9)+crease(thumb,1.6,3,17)+crease(thumb,3,2,13);
  P(g,cz,'hair',{opacity:.75});
  /* klouby na hrbetu ruky */
  P(g,'M520,226 q18,-14 36,-4 M548,206 q18,-12 34,-2 M576,186 q16,-10 30,0 M596,168 q12,-8 22,0','thin',{opacity:.6});
  P(g,'M526,222 q14,-9 26,-3 M552,203 q14,-8 26,-2','goldl hair',{opacity:.5});
  /* zahyby na zapesti a hrbetu */
  P(g,'M440,70 q30,12 66,4 M428,92 q34,16 76,6 M446,150 q36,20 84,10 M336,-10 q28,18 60,10 M350,18 q26,18 56,10 M366,56 q24,14 50,8 M410,36 q16,14 40,12','hair dim',{opacity:.6});
  P(g,'M470,118 C490,160 500,190 508,222','goldl hair',{opacity:.3});
  /* dolni hrany (stin) */
  var sd='';
  [index,thumb,mid].forEach(function(p){sd+=cr(side(p,-1,0,1,3))});
  P(g,sd,'ink',{opacity:.5});
  /* tlak spicek */
  P(g,'M572,402 q16,-6 30,8','goldl hair',{opacity:.5});
  P(g,'M580,316 q10,-12 20,-2','goldl hair',{opacity:.5});
})();
ST.fade(LG,7.9,8.1,1,9.45,9.62);

/* ==========================================================
   5. STROJEK (pero) + pravá ruka v rukavici
   ========================================================== */
var MC=G(FR);
ST.closeParts.machine=MC;
var needleG=null;
(function(){
  var r=rng(83);
  /* kabel (vne rotace, ve skupine stroje, tip v 0,0) */
  var cab=G(MC);
  var cd='M171,-273 C232,-330 252,-300 288,-360 S388,-420 420,-520 S470,-640 520,-760';
  P(cab,cd,'bold',{opacity:.95,'stroke-width':7});
  Fl(cab,'M0,0','none');
  P(cab,cd,'goldl hair',{opacity:.35,transform:'translate(-2,-2)','stroke-width':1});
  /* druha zila: rca konektor kolem krytky */
  /* stin stroje na kuzi */
  var rot=G(MC,{transform:'rotate(-58)'});
  var shg=G(MC,{transform:'translate(14,16) rotate(-58)',opacity:.38});
  /* shadow shapes */
  Fl(shg,limb([[20,0,10],[110,0,26],[300,0,40]]),'#000');
  /* --- jehla, cartridge --- */
  needleG=G(rot);
  P(needleG,'M0,0 L56,0','goldl hair',{opacity:.95,'stroke-width':1.2});
  P(needleG,'M56,0 L100,0','goldl hair',{opacity:.5});
  /* nos cartridge */
  var nose='M14,-1.9 L50,-10.5 L50,10.5 L14,1.9 Z';
  Fl(rot,nose,'var(--t1)',{opacity:.55});
  P(rot,nose,'thin',{opacity:.9});
  P(rot,'M20,-4 L48,-9 M20,4 L48,9','hair',{opacity:.5});
  P(rot,'M18,-1.6 L46,-8','goldl hair',{opacity:.35});
  /* telo cartridge */
  var cart=ST.rect(50,-12,46,24,3);
  Fl(rot,cart,'var(--t1)',{opacity:.4});
  Fl(rot,cart,'url(#hatchFine)',{opacity:.5});
  P(rot,cart,'thin',{opacity:.95});
  P(rot,'M62,-12 v24 M70,-12 v24','hair dim',{opacity:.7});
  /* membrana, pruzina, vodici jehly */
  P(rot,'M74,-5 l4,10 l4,-10 l4,10 l4,-10 l4,10 l3,-10','hair dim',{opacity:.7});
  P(rot,'M96,-8 L56,-8','goldl hair',{opacity:.25});
  P(rot,'M54,-10 L92,-10','goldl hair',{opacity:.4,'stroke-dasharray':'20 6'});
  P(rot,'M54,0 L96,0','hair',{opacity:.45});
  /* gumovy grip */
  var grip='M96,-15 L100,-15 C130,-17 170,-19 206,-21 L206,21 C170,19 130,17 100,15 L96,15 Z';
  Fl(rot,grip,'var(--t2)');
  Fl(rot,'M98,2 C130,4 170,4 206,3 L206,21 C170,19 130,17 98,15Z','url(#hatchV)',{opacity:.8});
  P(rot,grip,'',{});
  var rb='';
  for(var x=106;x<202;x+=6.2){var h=15+((x-96)/110)*6;rb+='M'+f1(x)+','+f1(-h+2)+' q'+f1(2.4)+','+f1(h-2)+' 0,'+f1(2*h-4)}
  P(rot,rb,'hair',{opacity:.85});
  P(rot,'M104,-12 C130,-14 170,-15 202,-17','goldl hair',{opacity:.55});
  P(rot,'M104,-8 C130,-10 170,-11 202,-13','goldl hair',{opacity:.2});
  /* kovovy prsten na prechodu cartridge / grip */
  Fl(rot,ST.rect(90,-16,10,32,2),'var(--t3)');P(rot,ST.rect(90,-16,10,32,2),'thin',{});
  P(rot,'M93,-14 v28','goldl hair',{opacity:.55});
  /* kovove telo s ryskami */
  var body=ST.rect(206,-22,92,44,3);
  Fl(rot,body,'var(--t3)');P(rot,body,'',{});
  Fl(rot,ST.rect(206,2,92,20,3),'url(#hatchFine)',{opacity:.9});
  var rk='';
  for(var x2=214;x2<296;x2+=7)rk+='M'+x2+',-21 v42';
  P(rot,rk,'hair',{opacity:.6});
  P(rot,'M208,-17 L296,-17','goldl hair',{opacity:.6});
  P(rot,'M208,-13 L296,-13','goldl hair',{opacity:.2,'stroke-dasharray':'30 12'});
  /* zlaty prstenec + LED */
  Fl(rot,ST.rect(240,-23,7,46,1.5),'var(--gold)',{opacity:.9});
  P(rot,ST.rect(240,-23,7,46,1.5),'hair',{opacity:.85});
  P(rot,'M242,-20 v38','goldl hair',{opacity:.7});
  Fl(rot,ST.circ(264,-1,22),'url(#gHalo)',{opacity:.9});
  Fl(rot,ST.rect(257,-6,14,12,3),'var(--t1)');P(rot,ST.rect(257,-6,14,12,3),'thin',{});
  Fl(rot,ST.circ(264,0,3.6),'var(--gold-light)');
  Fl(rot,ST.circ(264,0,7),'url(#gNeedle)',{opacity:.9});
  /* krytka + vstup kabelu */
  var cap='M298,-18 L312,-16 C320,-12 322,-6 322,0 C322,6 320,12 312,16 L298,18 Z';
  Fl(rot,cap,'var(--t2)');P(rot,cap,'',{});
  P(rot,'M304,-16 v32 M310,-14 v28','hair',{opacity:.7});
  P(rot,'M300,-15 C308,-13 316,-10 319,-6','goldl hair',{opacity:.5});
  Fl(rot,ST.rect(321,-5,10,10,3),'var(--t3)');P(rot,ST.rect(321,-5,10,10,3),'thin',{});

  /* --- prava ruka v rukavici --- */
  function gl(g,p){var d=limb(p);Fl(g,d,GLOVE);P(g,d,'thin',{opacity:.9});return d}
  var hand=G(rot);
  var back=[[318,-2,128],[380,-4,124],[450,-8,118],[540,-14,122]];
  var mid=[[272,70,34],[232,54,30],[190,38,26],[156,28,22]];
  var thumb=[[300,62,48],[252,50,40],[200,34,34],[148,20,29]];
  var index=[[304,-62,42],[254,-52,36],[206,-36,31],[162,-22,27]];
  var sh2=G(MC,{transform:'translate(14,16) rotate(-58)',opacity:.34});
  [back,mid,thumb,index].forEach(function(p){Fl(sh2,limb(p),'#000')});
  gl(hand,back);
  gl(hand,mid);
  gl(hand,thumb);
  gl(hand,index);
  /* manzeta + rukav */
  var slv=limb([[600,-16,170],[760,-20,190]]);
  Fl(hand,slv,'var(--t1)');P(hand,slv,'',{});
  var sf='';
  for(var s=0;s<9;s++)sf+='M'+f1(580+s*22)+',-96 c10,40 -10,100 6,160';
  P(hand,sf,'hair dim',{opacity:.5});
  P(hand,'M556,-72 C566,-30 566,10 556,52 M544,-70 C554,-30 554,10 544,50','ink',{opacity:.75,'stroke-width':1.6});
  /* odlesky, zahyby na rukavici */
  function hl(g,p,sgn,o,dash){P(g,cr(side(p,sgn,0,1,5)),'goldl hair',{opacity:o,'stroke-dasharray':dash||'40 14 10 20'})}
  hl(hand,index,1,.55);hl(hand,index,-1,.18);hl(hand,thumb,-1,.45);hl(hand,back,1,.5);hl(hand,back,-1,.2);hl(hand,mid,-1,.25);
  var wr='M215,-46 q6,10 2,20 M200,-36 q5,8 2,16 M232,-52 q4,10 0,18 M226,40 q-4,10 -2,20 M192,26 q-2,8 2,14 M150,-24 q4,8 0,12 M150,14 q3,6 0,10 M300,-60 q16,36 6,100 M330,-50 q12,30 4,90 M360,-50 q12,24 6,80 M420,-60 q8,20 4,52 M470,-56 q10,24 6,60';
  P(hand,wr,'hair',{opacity:.65});
  P(hand,'M242,-52 q10,10 24,6 M250,60 q8,-6 20,-2','goldl hair',{opacity:.5});
  function crz(p,t,n,w){var i=Math.floor(t),f=t-i,a=p[i],b=p[i+1],x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);dx/=l;dy/=l;
    var d='';for(var k=0;k<n;k++){var ox=x+dx*k*5,oy=y+dy*k*5;d+='M'+f1(ox-dy*w)+','+f1(oy+dx*w)+' q'+f1(dx*3)+','+f1(dy*3)+' '+f1(dy*2*w)+','+f1(-dx*2*w)}return d}
  P(hand,crz(index,1,3,14)+crz(index,2,2,12)+crz(thumb,1,3,17)+crz(thumb,2,2,14)+crz(mid,1,2,12),'hair',{opacity:.75});
  P(hand,'M296,-78 q16,-12 36,-6 M300,-70 q12,-8 26,-3','goldl hair',{opacity:.5});
  /* kloub index: odlesk */
  P(hand,'M270,-66 q16,-10 34,-4','goldl',{opacity:.5,'stroke-width':1.4});
  /* kapicka barvy a vazelina u hrotu */
  var dr=G(MC);
  el('ellipse',{cx:2,cy:5,rx:11,ry:7,fill:'url(#gHalo)',opacity:.9},dr);
  el('ellipse',{cx:1,cy:5,rx:5,ry:3.2,fill:LINE,opacity:.22},dr);
  P(dr,'M-4,3 q4,-3 9,-1','goldl hair',{opacity:.7});
  Fl(dr,ST.circ(5,9,1.6),'var(--gold-light)',{opacity:.85});
  Fl(dr,ST.circ(-6,10,1),'var(--gold)',{opacity:.7});
})();

/* ==========================================================
   6. ZIVOT: jehla vibruje, rukavice sleduje hrot
   ========================================================== */
var gx=0,gy=0;
ST.on(function(T,time){
  if(T<7.7||T>10.9)return;
  var tip=ST.closeTip,tx=0,ty=0,tattoo=T>8.1&&T<9.5;
  if(tip&&tattoo){tx=Math.max(-15,Math.min(15,(tip.x-760)*.07));ty=Math.max(-15,Math.min(15,(tip.y-500)*.07))}
  gx+=(tx-gx)*.1;gy+=(ty-gy)*.1;
  LGi.setAttribute('transform','translate('+gx.toFixed(2)+','+gy.toFixed(2)+')');
  if(needleG&&!ST.reduce){var v=tattoo?Math.sin(time*.11)*1.6:0;needleG.setAttribute('transform','translate('+v.toFixed(2)+',0)')}
});
});
