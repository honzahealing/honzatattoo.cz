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
   4. RUCE V RUKAVICICH A STROJEK
   Anatomie: kazdy prst ma tri clanky (zakladni, stredni, koncovy) se zuzenim a klouby,
   hrbet ruky s klouby zakladu prstu, slachami a vraskami nitrilu, manzeta rukavice
   s zarolovanym okrajem a za ni Honzovo tetovane predlokti.
   Svetlo od lampy shora: lesk nitrilu na horni hrane, teply odraz od kuze na spodni.
   ========================================================== */
(function(){var g=el('radialGradient',{id:'clShadowSoft'},defs);el('stop',{offset:0,'stop-color':'#000','stop-opacity':.6},g);el('stop',{offset:.6,'stop-color':'#000','stop-opacity':.22},g);el('stop',{offset:1,'stop-color':'#000','stop-opacity':0},g)})();
grad('clGlv','linearGradient',{x1:0,y1:0,x2:0,y2:1},[[0,'#2a2a30',1],[.35,'#121216',1],[1,'#060607',1]]);
grad('clSkinH','linearGradient',{x1:0,y1:0,x2:0,y2:1},[[0,'#2c2626',1],[.5,'#1d1a1a',1],[1,'#100e0e',1]]);
var LIGHT=[-.3,-.95],fid=0;
/* retez clanku [x,y,polomer] od zakladu ke spicce -> uzavreny obrys s kulatou spickou */
function chainOpen(Pp){var n=Pp.length,Lp=[],Rp=[],i;
  for(i=0;i<n;i++){var a=Pp[Math.max(0,i-1)],b=Pp[Math.min(n-1,i+1)],tx=b[0]-a[0],ty=b[1]-a[1],l=Math.sqrt(tx*tx+ty*ty)||1;tx/=l;ty/=l;
    Lp.push([Pp[i][0]-ty*Pp[i][2],Pp[i][1]+tx*Pp[i][2]]);Rp.push([Pp[i][0]+ty*Pp[i][2],Pp[i][1]-tx*Pp[i][2]]);Pp[i].t=[tx,ty]}
  var e=Pp[n-1],t=e.t,cap=[];for(i=1;i<6;i++){var an=Math.PI/2-i*Math.PI/6,c=Math.cos(an),sn=Math.sin(an);cap.push([e[0]+(-t[1]*c+t[0]*sn)*e[2],e[1]+(t[0]*c+t[1]*sn)*e[2]])}
  return cr(Lp.concat(cap,Rp.reverse()),false)}
function chain(Pp){
  var n=Pp.length,Lp=[],Rp=[],i;
  for(i=0;i<n;i++){var a=Pp[Math.max(0,i-1)],b=Pp[Math.min(n-1,i+1)],tx=b[0]-a[0],ty=b[1]-a[1],l=Math.sqrt(tx*tx+ty*ty)||1;tx/=l;ty/=l;
    Lp.push([Pp[i][0]-ty*Pp[i][2],Pp[i][1]+tx*Pp[i][2]]);Rp.push([Pp[i][0]+ty*Pp[i][2],Pp[i][1]-tx*Pp[i][2]]);Pp[i].t=[tx,ty]}
  var e=Pp[n-1],t=e.t,cap=[];for(i=1;i<6;i++){var an=Math.PI/2-i*Math.PI/6,c=Math.cos(an),sn=Math.sin(an);
    cap.push([e[0]+(-t[1]*c+t[0]*sn)*e[2],e[1]+(t[0]*c+t[1]*sn)*e[2]])}
  var s=Pp[0],ts=s.t,bc=[];for(i=1;i<6;i++){var an2=Math.PI/2+i*Math.PI/6,c2=Math.cos(an2),s2=Math.sin(an2);bc.push([s[0]+(-ts[1]*c2+ts[0]*s2)*s[2]*.9,s[1]+(ts[0]*c2+ts[1]*s2)*s[2]*.9])}
  return cr(Lp.concat(cap,Rp.reverse(),bc),true);
}
/* hrana retezu (side=+1 leva, -1 prava), k = podil polomeru */
function edge(Pp,side,k,from,to){var o=[],n=Pp.length;for(var i=from||0;i<(to==null?n:to);i++){var a=Pp[Math.max(0,i-1)],b=Pp[Math.min(n-1,i+1)],tx=b[0]-a[0],ty=b[1]-a[1],l=Math.sqrt(tx*tx+ty*ty)||1;tx/=l;ty/=l;
  o.push([Pp[i][0]-side*ty*Pp[i][2]*k,Pp[i][1]+side*tx*Pp[i][2]*k])}return o.length>1?cr(o,false):''}
/* strana, ktera miri ke svetlu */
function litSide(Pp){var a=Pp[0],b=Pp[Pp.length-1],tx=b[0]-a[0],ty=b[1]-a[1],l=Math.sqrt(tx*tx+ty*ty)||1;return ((-ty/l)*LIGHT[0]+(tx/l)*LIGHT[1])>0?1:-1}
/* vrasky pres prst v kloubu (na hrbetni strane) */
function crease(par,p,q,r,n,op){var tx=q[0]-p[0],ty=q[1]-p[1],l=Math.sqrt(tx*tx+ty*ty)||1;tx/=l;ty/=l;var d='';
  for(var i=0;i<n;i++){var o=(i-(n-1)/2)*r*.16,cx=p[0]+tx*o,cy=p[1]+ty*o,w=r*(.36-.08*Math.abs(i-(n-1)/2));
    d+='M'+f1(cx-ty*w)+','+f1(cy+tx*w)+' Q'+f1(cx+tx*r*.2)+','+f1(cy+ty*r*.2)+' '+f1(cx+ty*w)+','+f1(cy-tx*w)+' '}
  Q(par,d,{fill:'none',stroke:'rgba(231,221,199,.16)','stroke-width':.8,opacity:op||1})}
function Q(par,d,at){var a=at||{};a.d=d;return el('path',a,par)}
function clipOf(d){var id='clh'+(fid++),c=el('clipPath',{id:id},defs);el('path',{d:d},c);return 'url(#'+id+')'}
/* prst: vypln, lesk na svetle strane, teply odraz na stinove, klouby, obrys */
function finger(par,pts,o){o=o||{};var g=G(par),d=chain(pts),s=o.side||litSide(pts),n=pts.length;
  el('path',{d:d,fill:'url(#clGlv)'},g);
  var inn=G(g,{'clip-path':clipOf(d)});
  Q(inn,edge(pts,-s,.85),{fill:'none',stroke:'#000','stroke-width':pts[1][2]*.9,opacity:.55,'stroke-linecap':'round'});
  Q(inn,edge(pts,-s,1.02),{fill:'none',stroke:GOLD,'stroke-width':2.2,opacity:o.bounce==null?.22:o.bounce,'stroke-linecap':'round'});
  Q(inn,edge(pts,s,.42),{fill:'none',stroke:GL,'stroke-width':pts[1][2]*.55,opacity:.1,'stroke-linecap':'round'});
  /* ostry odlesk nitrilu prerusovany v kloubech */
  if(o.plain){var e0=pts[n-1];Q(inn,ST.ellipse(e0[0],e0[1]-e0[2]*.2,e0[2]*.8,e0[2]*.55),{fill:'#FFF6DF',opacity:.07});Q(inn,ST.ellipse(e0[0]+e0[2]*.2,e0[1]+e0[2]*.6,e0[2]*.9,e0[2]*.4),{fill:GOLD,opacity:.12})}
  for(var i=0;i<n-1&&!o.plain;i++){var a=pts[i],b=pts[i+1],m0=[a[0]+(b[0]-a[0])*.18,a[1]+(b[1]-a[1])*.18,a[2]],m1=[a[0]+(b[0]-a[0])*.82,a[1]+(b[1]-a[1])*.82,b[2]];
    Q(inn,edge([m0,m1],s,.5),{fill:'none',stroke:'#FFF6DF','stroke-width':1.3,opacity:.55-.1*i,'stroke-linecap':'round'})}
  /* bulka kloubu a vrasky */
  for(var j=1;j<n-1&&!o.plain;j++){crease(inn,pts[j],pts[j+1],pts[j][2],j===1?3:2,.9);
    var k=pts[j],t=k.t;Q(inn,'M'+f1(k[0]+s*t[1]*k[2]*.5-t[0]*k[2]*.3)+','+f1(k[1]-s*t[0]*k[2]*.5-t[1]*k[2]*.3)+' q'+f1(t[0]*k[2]*.3+s*t[1]*k[2]*.1)+','+f1(t[1]*k[2]*.3-s*t[0]*k[2]*.1)+' '+f1(t[0]*k[2]*.6)+','+f1(t[1]*k[2]*.6),{fill:'none',stroke:'#FFF6DF','stroke-width':1.6,opacity:.35,'stroke-linecap':'round'})}
  /* bříško: odlesk na spicce */
  var e=pts[n-1],te=e.t;el('ellipse',{cx:f1(e[0]+te[0]*e[2]*.35+s*te[1]*e[2]*.25),cy:f1(e[1]+te[1]*e[2]*.35-s*te[0]*e[2]*.25),rx:f1(e[2]*.35),ry:f1(e[2]*.18),fill:'#FFF6DF',opacity:.18,transform:'rotate('+f1(Math.atan2(te[1],te[0])/R)+' '+f1(e[0]+te[0]*e[2]*.35)+' '+f1(e[1]+te[1]*e[2]*.35)+')'},inn);
  el('path',{d:chainOpen(pts),fill:'none',stroke:'rgba(231,221,199,.5)','stroke-width':1.4,'stroke-linejoin':'round','stroke-linecap':'round'},g);
  return g;
}
/* plocha ruky (hrbet, dlan): vypln, vnitrni kresba pres callback, obrys */
function palm(par,pts,draw){var g=G(par),d=cr(pts,true);el('path',{d:d,fill:'url(#clGlv)'},g);var inn=G(g,{'clip-path':clipOf(d)});if(draw)draw(inn);
  el('path',{d:d,fill:'none',stroke:'rgba(231,221,199,.58)','stroke-width':1.6,'stroke-linejoin':'round'},g);return g}
function line(par,d,c,w,op,dash){return Q(par,d,{fill:'none',stroke:c,'stroke-width':w,opacity:op,'stroke-linecap':'round','stroke-dasharray':dash})}
/* tetovane predlokti tatera (zpoza manzety ven z obrazu) */
function forearm(par,pts,seed){var g=G(par),d=limb(pts);el('path',{d:d,fill:'url(#clSkinH)'},g);var inn=G(g,{'clip-path':clipOf(d)}),r=rng(seed);
  /* rukav tetovani: vinna reva s listy, kvety a teckovani (jen pozitivni motivy) */
  var a=pts[0],b=pts[pts.length-1],tx=b[0]-a[0],ty=b[1]-a[1],L=Math.hypot(tx,ty);tx/=L;ty/=L;var nx=-ty,ny=tx,vine='',lv='';
  for(var u=0;u<=L;u+=18){var w=Math.sin(u*.012)*a[2]*.45;vine+=(u?'L':'M')+f1(a[0]+tx*u+nx*w)+','+f1(a[1]+ty*u+ny*w)}
  line(inn,vine,GOLD,2.2,.75);
  for(var k=0;k<9;k++){var u2=40+k*L/9,w2=Math.sin(u2*.012)*a[2]*.45,sg=k%2?1:-1,px=a[0]+tx*u2+nx*w2,py=a[1]+ty*u2+ny*w2,ex=px+(tx*30+nx*sg*44),ey=py+(ty*30+ny*sg*44);
    lv+='M'+f1(px)+','+f1(py)+' Q'+f1(px+tx*36+nx*sg*10)+','+f1(py+ty*36+ny*sg*10)+' '+f1(ex)+','+f1(ey)+' Q'+f1(px+tx*4+nx*sg*40)+','+f1(py+ty*4+ny*sg*40)+' '+f1(px)+','+f1(py)+' M'+f1(px)+','+f1(py)+' L'+f1((px+ex)/2+tx*4)+','+f1((py+ey)/2+ty*4)+' '}
  line(inn,lv,GOLD,1.4,.6);
  var dots='';for(var q=0;q<160;q++){var uu=r()*L,ww=(r()-.5)*a[2]*1.8;dots+='M'+f1(a[0]+tx*uu+nx*ww)+','+f1(a[1]+ty*uu+ny*ww)+'h.1'}
  line(inn,dots,GL,2,.28);
  Q(inn,d,{fill:'url(#clVol)',stroke:'none',opacity:.8});
  line(inn,edge(pts,litSide(pts),.92),GL,2,.25);
  el('path',{d:d,fill:'none',stroke:'rgba(231,221,199,.5)','stroke-width':1.5},g);
  return g;
}
/* manzeta rukavice: zarolovany okraj pres zapesti (p1 -> p2) */
function cuff(par,p1,p2,dir){var nx=dir[0]*10,ny=dir[1]*10;
  Q(par,'M'+f1(p1[0])+','+f1(p1[1])+' Q'+f1((p1[0]+p2[0])/2+nx*.8)+','+f1((p1[1]+p2[1])/2+ny*.8)+' '+f1(p2[0])+','+f1(p2[1])+' L'+f1(p2[0]+nx)+','+f1(p2[1]+ny)+' Q'+f1((p1[0]+p2[0])/2+nx*1.8)+','+f1((p1[1]+p2[1])/2+ny*1.8)+' '+f1(p1[0]+nx)+','+f1(p1[1]+ny)+' Z',{fill:'#141418',stroke:'rgba(231,221,199,.6)','stroke-width':1.3,'stroke-linejoin':'round'});
  line(par,'M'+f1(p1[0]+nx*.5)+','+f1(p1[1]+ny*.5)+' Q'+f1((p1[0]+p2[0])/2+nx*1.3)+','+f1((p1[1]+p2[1])/2+ny*1.3)+' '+f1(p2[0]+nx*.5)+','+f1(p2[1]+ny*.5),'#FFF6DF',1.2,.4);
}

/* ---------- jen prava ruka: tater drzi pen strojek jako velkou tuzku ----------
   Podle reference (img/about.jpg, navody k drzeni pen strojku): ukazovak lezi navrchu gripu az ke kartridzi,
   palec svira grip z boku, prostrednik ho podpira zespodu, prstenik a malicek jsou zatocene do dlane
   a malickova hrana ruky se opira o kuzi klienta (kotva, ze ktere ruka vede linku).
   Pen: rovny valec ~16 cm, grip ~32 mm s vroubkovanim a pryzovymi krouzky, kartridz s pruhlednym nosem,
   telo motoru s kroužkem nastaveni zdvihu, bezdratova baterie s displejem napeti. Telo v cerne ochranne folii.
   lokalni souradnice: hrot jehly v 0,0, osa strojku po +x dozadu, +y strana palce. */
var MC=G(FR);ST.closeParts.machine=MC;
var needleG=null,needleIn=null,machLift=null,MR=null,led=null,curl=null;
function nail(par,pts,s,op){var n=pts.length,e=pts[n-1],q=pts[n-2],tx=e[0]-q[0],ty=e[1]-q[1],l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;
  var nx=-ty*s,ny=tx*s,r=e[2],cx=e[0]-tx*r*.25+nx*r*.38,cy=e[1]-ty*r*.25+ny*r*.38,ang=Math.atan2(ty,tx)/R;
  Q(par,ST.rect(-r*.62,-r*.3,r*1.15,r*.6,r*.28),{transform:'translate('+f1(cx)+','+f1(cy)+') rotate('+f1(ang)+')',fill:'#FFF6DF',opacity:op||.07,stroke:'rgba(255,246,223,.28)','stroke-width':.8})}
(function(){
  /* stiny strojku a ruky na kuzi */
  el('ellipse',{cx:120,cy:-100,rx:160,ry:12,fill:'url(#clShadowSoft)',opacity:.85,transform:'rotate(-52 120 -100)'},MC);
  el('ellipse',{cx:236,cy:-300,rx:180,ry:110,fill:'url(#clShadowSoft)',opacity:.72,transform:'rotate(-52 236 -300)'},MC);
  machLift=G(MC);MR=G(machLift,{transform:'rotate(-52)'});var M=G(MR,{transform:'scale(1.04)'});
  /* Ruka je kreslena z boku palce (jako na fotce img/about.jpg): -y = horni strana, +y = ke kuzi.
     Poradi odzadu: hrbet a dlan, zatocene prsty, prostrednik pod gripem, strojek v jamce, ukazovak navrchu, palec nejbliz. */
  curl=G(M);var body=G(M);
  /* kontaktni stin: zatoceny malicek a hrana dlane lezi na kuzi */
  Q(M,ST.ellipse(236,176,54,15),{fill:'url(#clShadowSoft)',opacity:.95,transform:'rotate(30 236 176)'});
  var mid=[[276,58,19],[216,58,17.5],[168,42,16],[134,26,14.5]];
  /* ===== PEN STROJEK ===== */
  /* skutecny pen je zavality: delka asi petinasobek prumeru gripu (cca 16 cm / 32 mm) */
  var mg=G(M,{transform:'scale(1,1.42)'});
  /* jehla: hrot venku, uvnitr nosu vidět svazek jehel a tyc */
  needleG=G(mg);
  line(needleG,'M 0,0 L 8,0',GL,2,.95);Q(needleG,ST.circ(0,0,1.4),{fill:'#FFF6DF',opacity:.9});
  needleIn=G(mg);line(needleIn,'M 8,-.8 L 62,-.8 M 8,.8 L 62,.8','#FFF6DF',.7,.5);line(needleIn,'M 62,0 L 84,0',GL,2.2,.4);
  /* nos kartridze: pruhledny kuzel s odleskem */
  var nose='M 5,-2.6 C 14,-4.6 28,-9 42,-12.2 L 42,12.2 C 28,9 14,4.6 5,2.6 Z';
  Q(mg,nose,{fill:'rgba(231,221,199,.09)',stroke:'rgba(231,221,199,.62)','stroke-width':1.1});
  line(mg,'M 9,-2.4 C 18,-4.4 30,-7.8 40,-10','#FFF6DF',1.1,.65);line(mg,'M 12,3 C 22,5.6 32,8.4 40,10','rgba(0,0,0,.5)',1);
  /* telo kartridze: pruhledne, rebra, membrana, barevny zadni kroužek */
  Q(mg,ST.rect(42,-14.5,44,29,3),{fill:'rgba(231,221,199,.07)',stroke:'rgba(231,221,199,.55)','stroke-width':1.1});
  var rb='';for(var i=0;i<5;i++)rb+='M '+(48+i*7.5)+',-14.5 V 14.5 ';line(mg,rb,'rgba(231,221,199,.2)',.8);
  line(mg,'M 44,-10 H 84','#FFF6DF',1.2,.42);Q(mg,ST.ellipse(76,0,2.6,9),{fill:'rgba(200,164,92,.25)',stroke:GOLD,'stroke-width':.6});
  Q(mg,ST.rect(84,-16,7,32,2),{fill:'#3a2f1c',stroke:GOLD,'stroke-width':1});
  /* grip: hlinikovy, prohnuty v pase, krizove vroubkovani, dva pryzove krouzky */
  var gp='M 91,-20.5 C 118,-18.2 152,-18.2 182,-20.5 L 182,20.5 C 152,18.2 118,18.2 91,20.5 Z';
  Q(mg,gp,{fill:'#131317',stroke:'rgba(231,221,199,.58)','stroke-width':1.2});
  var kn='';for(var x=96;x<182;x+=5.5){kn+='M '+x+',-19 l 8,38 M '+(x+8)+',-19 l -8,38 '}
  var kg=G(mg,{'clip-path':clipOf(gp)});line(kg,kn,'rgba(231,221,199,.15)',.65);
  Q(kg,'M 90,-21 L 183,-21 L 183,-8 L 90,-8 Z',{fill:'#FFF6DF',opacity:.07});Q(kg,'M 90,9 L 183,9 L 183,21 L 90,21 Z',{fill:'#000',opacity:.4});
  line(mg,'M 94,-14 C 120,-12.6 152,-12.6 179,-14.4','#FFF6DF',1.6,.34);
  [[101,6],[166,6]].forEach(function(r){Q(mg,ST.rect(r[0],-20.2,r[1],40.4,2),{fill:'#08080a',stroke:'rgba(231,221,199,.4)','stroke-width':.8});line(mg,'M '+(r[0]+1)+',-15 h '+(r[1]-2),'#FFF6DF',1,.18)});
  /* lemovany prechod grip / telo (stribrny) */
  Q(mg,ST.rect(182,-20,9,40,1.5),{fill:'#2a2a30',stroke:'rgba(231,221,199,.6)','stroke-width':1});line(mg,'M 183,-15 h 7','#FFF6DF',1.2,.5);
  /* telo motoru */
  var bd=ST.rect(191,-18.5,110,37,3);
  Q(mg,bd,{fill:'#0f0f12',stroke:'rgba(231,221,199,.52)','stroke-width':1.2});
  line(mg,'M 193,-12 H 299','#FFF6DF',2,.18);line(mg,'M 193,12 H 299','#000',3,.5);
  /* kroužek nastaveni zdvihu (mosaz, vroubky) a stupnice */
  Q(mg,ST.rect(258,-19.5,16,39,2),{fill:'#3a2f1c',stroke:GOLD,'stroke-width':1});
  var kr='';for(var y=-17;y<18;y+=3)kr+='M 259,'+y+' h 14 ';line(mg,kr,GL,.6,.45);
  var sc='';for(var k=0;k<7;k++)sc+='M '+(278+k*3)+',-18.5 v '+(k%3?3:5)+' ';line(mg,sc,GL,.6,.6);
  /* ryti na tele: pirko (Honzuv pozitivni motiv) */
  line(mg,'M 208,6 C 222,-4 236,-6 250,-2 M 215,4 l 3,-6 M 223,1 l 3,-6 M 231,-1 l 3,-5 M 239,-2 l 3,-5 M 219,5 l 2,5 M 227,3 l 2,5 M 235,1 l 2,4',GOLD,.8,.55);
  /* ochranna folie (barrier bag) pres telo: zmackana, leskla */
  var fol='M 186,-24 C 210,-26 240,-23 262,-25 C 290,-27 306,-24 318,-26 L 321,26 C 306,24 290,27 262,25 C 240,23 210,26 186,24 Z';
  Q(mg,fol,{fill:'rgba(231,221,199,.05)',stroke:'rgba(231,221,199,.3)','stroke-width':1});
  var rr=rng(91),cz='';for(var j=0;j<20;j++){var cx=192+rr()*124,cy=-22+rr()*44,l=6+rr()*15,an=(rr()-.5)*1.4;cz+='M '+f1(cx)+','+f1(cy)+' l '+f1(Math.cos(an)*l)+','+f1(Math.sin(an)*l*.35)+' '}
  line(mg,cz,'#FFF6DF',.8,.24);line(mg,'M 192,-16 C 230,-18 280,-16 318,-18','#FFF6DF',2.4,.15);
  /* bezdratova baterie: displej s napetim a tlacitko */
  Q(mg,ST.rect(301,-19.5,54,39,4),{fill:'#16161b',stroke:'rgba(231,221,199,.55)','stroke-width':1.1});
  Q(mg,ST.rect(311,-8,28,16,2),{fill:'#050507',stroke:'rgba(231,221,199,.4)','stroke-width':.8});
  led=el('text',{x:325,y:5,transform:'scale(1,.704)','font-size':12,'text-anchor':'middle','font-family':"'Outfit',sans-serif",fill:GL,'font-weight':500},mg);led.textContent='8.5';
  Q(mg,ST.circ(347,0,3.4),{fill:'#3a2f1c',stroke:GOLD,'stroke-width':.9});
  Q(mg,'M 355,-17 C 362,-17 366,-10 366,0 C 366,10 362,17 355,17 Z',{fill:'#1d1d22',stroke:'rgba(231,221,199,.5)','stroke-width':1});
  line(mg,'M 303,-14 H 353','#FFF6DF',1.4,.3);
  /* --- ruka z boku: hrbet nahore stoupa k zapesti, dole thenar a hrana dlane --- */
  palm(body,[[244,-40],[252,-62],[268,-70],[290,-70],[350,-80],[414,-84],[452,-74],[462,-20],[460,30],[432,62],[382,98],[324,138],[282,160],[252,160],[236,132],[238,80],[234,30],[238,-10]],function(inn){
    /* slacha ukazovaku a natazeny hrbet, svaly thenaru, vrasky rukavice */
    /* modelace: svetlo lampy na hrbetu, stin na dlani, bulka kloubu ukazovaku */
    Q(inn,ST.ellipse(330,-40,120,46),{fill:GL,opacity:.06,transform:'rotate(-6 330 -40)'});Q(inn,ST.ellipse(340,-56,80,18),{fill:'#FFF6DF',opacity:.05});
    Q(inn,'M 236,90 C 300,110 380,80 470,20 L 470,200 L 236,200 Z',{fill:'#000',opacity:.35});
    Q(inn,ST.ellipse(262,-60,16,10),{fill:'#FFF6DF',opacity:.08});line(inn,'M 252,-64 q 10,-8 22,-4','#FFF6DF',1.6,.5);
    line(inn,'M 262,-56 C 320,-68 380,-74 446,-72',GL,9,.07);line(inn,'M 266,-58 C 322,-70 382,-76 444,-74','#FFF6DF',1.4,.45);
    line(inn,'M 270,-40 C 330,-48 390,-52 440,-50','#FFF6DF',1,.14);
    line(inn,'M 296,22 C 320,6 360,0 410,8',GL,6,.06);
    line(inn,'M 300,60 C 330,80 360,96 392,96','#000',10,.4);
    line(inn,'M 260,120 C 290,132 320,130 350,120',GOLD,2.4,.22);
    line(inn,'M 420,-50 q 10,-3 18,3 M 424,-20 q 10,-3 18,3 M 424,12 q 10,-3 18,3 M 330,-74 q 8,-6 18,-4','rgba(231,221,199,.18)',.9);
  });
  cuff(body,[452,-80],[462,36],[1,.06]);
  forearm(body,[[510,-22,124],[740,-30,132],[1000,-38,140]],73);
  /* zatoceny malicek a prstenik (vidime zakladni clanek a ohnuty kloub), prostrednik podpira grip zespodu */
  finger(curl,[[276,140,16.5],[250,176,16],[232,184,16]],{plain:1});
  finger(curl,[[276,104,18.5],[244,142,17.5],[222,148,17]],{plain:1});
  finger(curl,mid);nail(curl,mid,1,.05);
  /* strojek lezi v jamce mezi palcem a ukazovakem, pres hranu hrbetu ruky */
  M.appendChild(mg);
  /* palec z boku gripu a ukazovak navrchu */
  var idx=[[268,-48,19],[198,-40,17.5],[148,-32,16],[108,-24,14.5]];finger(M,idx);nail(M,idx,-1,.09);
  var thb=[[318,24,27],[248,18,22],[188,11,19.5],[140,6,17.5]];finger(M,thb);nail(M,thb,-1,.1);
  /* prsty tlaci do gripu: jemne vrasky rukavice na brisku ukazovaku a palce */
  line(M,'M 140,0 q 6,3 12,1 M 152,-1 q 6,3 12,1 M 112,-12 q 5,-3 10,-2','rgba(231,221,199,.2)',.8);
  el('circle',{cx:6,cy:6,r:3.2,fill:'#2a2320',opacity:.8},MC);el('circle',{cx:5,cy:5,r:1.1,fill:'#FFF6DF',opacity:.6},MC);
})();

/* ==========================================================
   5. ZIVOT: jehla kmita uvnitr kartridze, ruka dycha, zapesti sleduje hrot, displej baterie
   ========================================================== */
var rotS=-52;
ST.on(function(T,time){
  if(T<7.6||T>10.95)return;
  var tip=ST.closeTip,tattoo=T>8.1&&T<9.5,pack=T>9.02&&T<9.5,br=ST.reduce?0:Math.sin(time*.0021);
  if(needleG&&!ST.reduce){var v=tattoo?Math.sin(time*.11)*1.8:0;needleG.setAttribute('transform','translate('+v.toFixed(2)+',0)');needleIn.setAttribute('transform','translate('+v.toFixed(2)+',0)')}
  /* zapesti se natoci podle polohy hrotu (prirozene drzeni), prsty opory se lehce posouvaji po kuzi */
  if(MR&&tip){var rt=-52+Math.max(-7,Math.min(7,(tip.x-760)*.04))-Math.max(-4,Math.min(4,(tip.y-470)*.02))+(pack&&!ST.reduce?Math.sin(time*.006)*2.5:0);rotS+=(rt-rotS)*.06;MR.setAttribute('transform','rotate('+rotS.toFixed(2)+')')}
  if(curl&&!ST.reduce)curl.setAttribute('transform','translate('+(br*1.2).toFixed(2)+','+(Math.sin(time*.0017)*1.2).toFixed(2)+')');
  if(led){var lv=tattoo?(8.4+.1*Math.round(Math.sin(time*.0007))).toFixed(1):'8.5';if(led.textContent!==lv)led.textContent=lv}
  if(machLift){var lift=ST.closeLift||0;machLift.setAttribute('transform','translate('+(lift*8).toFixed(1)+','+(-lift*14+br*1.2).toFixed(1)+')')}
});
});
