/* pribeh/studio.js - budova tetovaciho studia (rez budovou), x 760 az 3550.
   Zony: fasada 0.9-1.8, vstup+stul (x<2040) 1.9-3.0, prostor ke kreslu 4.8-6.0, tetovaci kout 6.3-7.3, dvere 2 10.8-11.5. */
ST.module('studio',function(ST){
var el=ST.el,R=ST.rect,rng=ST.rng,ss=ST.ss,PI=Math.PI,sin=Math.sin,cos=Math.cos;

/* ---------- pomocne: cas, kresleni ---------- */
var Z=[1.9,3.0];
function zone(a,b){Z=[a,b]}
function zx(x){if(x<2040)zone(1.9,3.0);else if(x<2600)zone(4.8,6.0);else if(x<3420)zone(6.3,7.3);else zone(10.8,11.5)}
function tt(a,b){a=a||0;b=b==null?1:b;return [Z[0]+(Z[1]-Z[0])*a,Z[0]+(Z[1]-Z[0])*b]}
function D(g,d,c,a,b,o){var t=tt(a,b);return ST.D(g,d,c,t[0],t[1],o)}
function FILL(g,d,c,a,b,o){var p=D(g,d,c,a,b,o);p.style.stroke='none';return p}
function FO(g,d,c,max,a,b,at){var e=el('path',{d:d,'class':c},g),t=tt(a,b);if(at)for(var k in at)e.setAttribute(k,at[k]);ST.fade(e,t[0],t[1],max);return e}
function TX(g,s,x,y,sz,c,a,b,mx,at){var e=el('text',{x:x,y:y,'class':c||'f-line','font-size':sz,'text-anchor':'middle'},g),t=tt(a,b);e.textContent=s;if(at)for(var k in at)e.setAttribute(k,at[k]);ST.fade(e,t[0],t[1],mx==null?1:mx);return e}
function G(p,tf){return el('g',tf?{transform:tf}:null,p)}
function n1(v){return Math.round(v*10)/10}
function cir(cx,cy,r){var k=.5523*r;return 'M'+n1(cx+r)+','+n1(cy)+' C'+n1(cx+r)+','+n1(cy+k)+' '+n1(cx+k)+','+n1(cy+r)+' '+n1(cx)+','+n1(cy+r)+' C'+n1(cx-k)+','+n1(cy+r)+' '+n1(cx-r)+','+n1(cy+k)+' '+n1(cx-r)+','+n1(cy)+' C'+n1(cx-r)+','+n1(cy-k)+' '+n1(cx-k)+','+n1(cy-r)+' '+n1(cx)+','+n1(cy-r)+' C'+n1(cx+k)+','+n1(cy-r)+' '+n1(cx+r)+','+n1(cy-k)+' '+n1(cx+r)+','+n1(cy)+'Z'}
function ell(cx,cy,rx,ry){var kx=.5523*rx,ky=.5523*ry;return 'M'+n1(cx+rx)+','+n1(cy)+' C'+n1(cx+rx)+','+n1(cy+ky)+' '+n1(cx+kx)+','+n1(cy+ry)+' '+n1(cx)+','+n1(cy+ry)+' C'+n1(cx-kx)+','+n1(cy+ry)+' '+n1(cx-rx)+','+n1(cy+ky)+' '+n1(cx-rx)+','+n1(cy)+' C'+n1(cx-rx)+','+n1(cy-ky)+' '+n1(cx-kx)+','+n1(cy-ry)+' '+n1(cx)+','+n1(cy-ry)+' C'+n1(cx+kx)+','+n1(cy-ry)+' '+n1(cx+rx)+','+n1(cy-ky)+' '+n1(cx+rx)+','+n1(cy)+'Z'}
function rr(x,y,w,h){return 'M'+x+','+y+'h'+w+'v'+h+'h'+(-w)+'Z'}
function star4(cx,cy,r){var q=r*.24;return 'M'+cx+','+n1(cy-r)+' L'+n1(cx+q)+','+n1(cy-q)+' L'+n1(cx+r)+','+cy+' L'+n1(cx+q)+','+n1(cy+q)+' L'+cx+','+n1(cy+r)+' L'+n1(cx-q)+','+n1(cy+q)+' L'+n1(cx-r)+','+cy+' L'+n1(cx-q)+','+n1(cy-q)+'Z'}
/* transformace absolutni cesty (M L C Q Z): stred 50,50 -> (cx,cy), meritko s, rotace, zrcadleni */
function X(str,cx,cy,s,rot,fx){
  var a=(rot||0)*PI/180,c=cos(a)*s,sn=sin(a)*s,f=fx||1,out=[],buf=[],t=str.match(/[MLCQZ]|-?\d*\.?\d+/g)||[];
  for(var i=0;i<t.length;i++){var k=t[i];
    if(/[MLCQZ]/.test(k)){out.push(k);continue}
    buf.push(+k);
    if(buf.length===2){var px=(buf[0]-50)*f,py=buf[1]-50;out.push(n1(cx+px*c-py*sn)+','+n1(cy+px*sn+py*c));buf=[]}
  }
  return out.join(' ').replace(/([MLCQ]) /g,'$1');
}
function petalRad(cx,cy,r0,r1,an,w){var ca=cos(an),sa=sin(an),px=-sa,py=ca,m=(r0+r1)/2,mx=cx+ca*m,my=cy+sa*m;
  return 'M'+n1(cx+ca*r0)+','+n1(cy+sa*r0)+' Q'+n1(mx+px*w*1.6)+','+n1(my+py*w*1.6)+' '+n1(cx+ca*r1)+','+n1(cy+sa*r1)+' Q'+n1(mx-px*w*1.6)+','+n1(my-py*w*1.6)+' '+n1(cx+ca*r0)+','+n1(cy+sa*r0)+'Z'}
function mandalaArt(cx,cy,r,n){var a=[cir(cx,cy,r),cir(cx,cy,r*.9),cir(cx,cy,r*.2)],b=[cir(cx,cy,r*.36),cir(cx,cy,r*.68)],i,an;
  for(i=0;i<n;i++){an=i*2*PI/n;a.push(petalRad(cx,cy,r*.22,r*.6,an,r*.11));b.push(petalRad(cx,cy,r*.56,r*.88,an+PI/n,r*.09));
    b.push('M'+n1(cx+cos(an)*r*.92)+','+n1(cy+sin(an)*r*.92)+' L'+n1(cx+cos(an)*r*1.0)+','+n1(cy+sin(an)*r*1.0));
    b.push(cir(cx+cos(an+PI/n)*r*.8,cy+sin(an+PI/n)*r*.8,r*.025+.4))}
  return {a:a.join(' '),b:b.join(' ')}}
function sunArt(cx,cy,r,n){var a=[cir(cx,cy,r*.4),cir(cx,cy,r*.3)],b=[cir(cx,cy,r*.5)],i,an;
  for(i=0;i<n;i++){an=i*2*PI/n;var L=i%2?r*.78:r;
    a.push('M'+n1(cx+cos(an-.1)*r*.56)+','+n1(cy+sin(an-.1)*r*.56)+' L'+n1(cx+cos(an)*L)+','+n1(cy+sin(an)*L)+' L'+n1(cx+cos(an+.1)*r*.56)+','+n1(cy+sin(an+.1)*r*.56));}
  b.push(cir(cx-r*.12,cy-r*.05,r*.04),cir(cx+r*.12,cy-r*.05,r*.04),'M'+n1(cx-r*.14)+','+n1(cy+r*.1)+' Q'+cx+','+n1(cy+r*.2)+' '+n1(cx+r*.14)+','+n1(cy+r*.1));
  return {a:a.join(' '),b:b.join(' ')}}
function featherArt(){var a=[],b=[],P0=[22,94],P1=[34,40],P2=[82,6],t,i;
  function B(t){var u=1-t;return [u*u*P0[0]+2*u*t*P1[0]+t*t*P2[0],u*u*P0[1]+2*u*t*P1[1]+t*t*P2[1]]}
  function Tn(t){var u=1-t,dx=2*u*(P1[0]-P0[0])+2*t*(P2[0]-P1[0]),dy=2*u*(P1[1]-P0[1])+2*t*(P2[1]-P1[1]),l=Math.sqrt(dx*dx+dy*dy);return [dx/l,dy/l]}
  a.push('M'+P0[0]+','+P0[1]+' Q'+P1[0]+','+P1[1]+' '+P2[0]+','+P2[1]);
  var L=[],Rr=[];
  for(t=.2;t<=1.0001;t+=.04){var p=B(t),tn=Tn(t),w=17*sin(PI*Math.pow(t,.7))*(1-.2*t)+1;
    var lx=p[0]-tn[1]*w+tn[0]*w*.5,ly=p[1]+tn[0]*w+tn[1]*w*.5,rx=p[0]+tn[1]*w+tn[0]*w*.5,ry=p[1]-tn[0]*w+tn[1]*w*.5;
    L.push(n1(lx)+','+n1(ly));Rr.push(n1(rx)+','+n1(ry));
    if(Math.round((t-.2)/.04)%2===0){b.push('M'+n1(p[0])+','+n1(p[1])+' L'+n1(lx)+','+n1(ly));b.push('M'+n1(p[0])+','+n1(p[1])+' L'+n1(rx)+','+n1(ry))}}
  a.push('M'+L[0]+' L'+L.join(' L')+' L'+Rr.slice().reverse().join(' L')+'Z');
  return {a:a.join(' '),b:b.join(' ')}}
function daisyArt(){var a=[],i;for(i=0;i<9;i++)a.push(X('M50,50 C42,38 44,20 50,12 C56,20 58,38 50,50Z',50,50,1,i*40,1));
  return {a:a.join(' '),b:cir(50,50,7)+' '+cir(50,50,3.5)+' M50,62 L50,98 M50,82 C40,80 32,84 26,92 C38,92 46,88 50,82 M50,76 C60,72 68,74 74,82 C64,84 56,82 50,76'}}

var ART={
 lotus:{a:'M50,78 C62,66 62,40 50,24 C38,40 38,66 50,78Z M50,78 C68,76 84,62 86,40 C70,42 58,56 50,78Z M50,78 C32,76 16,62 14,40 C30,42 42,56 50,78Z M50,80 C70,86 92,78 98,60 C80,60 62,68 50,80Z M50,80 C30,86 8,78 2,60 C20,60 38,68 50,80Z',
        b:'M50,72 L50,38 M52,74 C60,64 72,54 78,48 M48,74 C40,64 28,54 22,48 M54,80 C66,76 82,70 90,64 M46,80 C34,76 18,70 10,64 M10,90 Q30,84 50,90 Q70,96 90,90 M26,97 Q50,92 74,97 '+cir(50,46,46)},
 peony:{a:'M20,56 C14,40 28,26 40,32 C42,22 58,22 60,32 C72,26 88,40 80,56 C92,64 82,82 66,78 C60,88 40,88 34,78 C18,82 8,64 20,56Z M30,56 C28,46 36,38 44,42 C48,34 58,36 58,42 C66,40 72,50 68,58 C74,66 64,74 56,70 C50,76 40,74 38,68 C30,70 24,62 30,56Z M42,56 C40,50 46,46 50,50 C56,46 62,52 58,58 C60,64 52,66 48,62 C42,64 38,60 42,56Z',
        b:'M48,56 C48,52 54,52 54,56 C54,60 48,60 47,55 M50,84 C40,92 24,92 14,86 C26,80 40,80 50,84Z M50,84 C60,92 76,92 86,86 C74,80 60,80 50,84Z M50,86 L50,99 M40,86 C32,86 26,88 22,88 M60,86 C68,86 74,88 78,88 M26,50 C28,44 32,40 36,38 M74,50 C72,44 68,40 64,38'},
 moon:{a:'M62,14 C34,16 18,40 26,64 C34,88 66,94 86,78 C62,80 46,64 50,44 C52,30 56,20 62,14Z',
        b:star4(78,30,7)+' '+star4(20,20,5)+' '+star4(86,58,4)+' '+cir(72,52,1.3)+' '+cir(14,50,1.1)+' M58,22 C40,26 30,44 36,62 C42,78 58,84 74,78 M10,88 Q18,80 28,86 Q36,78 46,86 Q54,84 62,90 L10,90'},
 wave:{a:'M4,76 C12,52 28,34 48,30 C64,27 76,34 78,46 C72,42 64,44 62,52 C70,50 76,56 72,64 C66,60 58,62 56,70 M44,30 C42,24 46,18 52,18 C56,18 58,22 56,26',
        b:cir(60,24,1.5)+' '+cir(68,19,1.1)+' '+cir(72,28,1.3)+' M0,86 Q12,80 24,86 Q36,92 48,86 Q60,80 72,86 Q84,92 96,86 M0,94 Q12,88 24,94 Q36,100 48,94 Q60,88 72,94 Q84,100 96,94 M16,68 C22,54 34,44 48,41 M26,72 C30,62 38,54 50,52 M38,76 C42,68 48,62 56,60'},
 fox:{a:'M50,88 L20,58 L12,16 L38,32 C46,30 54,30 62,32 L88,16 L80,58 Z',
        b:'M20,26 L32,36 L24,48Z M80,26 L68,36 L76,48Z M34,58 Q38,54 44,59 M66,58 Q62,54 56,59 M45,74 L55,74 L50,81Z M50,81 L50,86 M22,60 L38,72 L50,86 M78,60 L62,72 L50,86 M50,34 L50,48 M44,36 L47,46 M56,36 L53,46'},
 colibri:{a:'M22,40 C24,34 32,32 36,36 C46,40 58,50 66,64 L76,84 L68,80 L62,88 L58,76 C48,66 36,58 30,50 C26,46 22,44 22,40Z M40,40 C48,24 66,14 88,12 C80,22 70,34 56,48Z',
        b:'M22,39 L4,34 M52,38 C62,28 72,20 82,16 M48,44 C60,36 70,28 80,24 M58,46 C66,40 74,34 84,30 '+cir(28,38,1.6)+' M8,66 C14,60 22,62 24,70 C20,76 12,76 8,72Z M16,72 C20,80 22,88 20,96 M16,84 C10,84 6,88 4,92'},
 swallow:{a:'M14,52 C24,46 40,44 56,46 C64,47 70,46 76,42 C80,48 72,54 60,54 C46,56 32,56 14,52Z M50,46 C46,30 38,16 22,8 C34,22 44,34 60,44Z M52,54 C46,66 40,76 28,84 C44,76 56,66 64,54Z M30,50 L4,64 L24,56 L8,74 L32,54',
        b:'M72,42 C76,38 82,40 84,44 L90,46 L84,48 C82,50 78,50 74,48 '+cir(76,43,1.2)+' M58,50 C66,49 72,48 76,46 M40,48 C34,38 28,28 22,20 M44,56 C40,64 36,70 32,76'},
 sprig:{a:'M50,92 C50,60 52,30 50,8 M50,70 C34,66 26,56 24,44 C38,48 46,58 50,70Z M50,56 C66,52 74,42 76,30 C62,34 54,44 50,56Z M50,38 C40,34 36,26 36,18 C44,22 48,28 50,38Z M50,26 C58,22 62,16 62,10 C56,14 52,18 50,26Z',b:'M50,70 L30,52 M50,56 L70,38 M50,38 L40,24'}
};
ART.mandala=mandalaArt(50,50,46,10);ART.sun=sunArt(50,50,46,16);ART.feather=featherArt();ART.daisy=daisyArt();
function art(g,nm,cx,cy,s,rot,fx,a,b,c1,c2){var A=ART[nm];D(g,X(A.a,cx,cy,s,rot,fx),c1||'thin',a,b);if(A.b)D(g,X(A.b,cx,cy,s,rot,fx),c2||'hair',a,b)}
/* zarameovany obrazek: x,y,w,h = vnejsi rozmer */
function frame(g,x,y,w,h,nm,a,b,o){o=o||{};var s=Math.min(w-18,h-18)/100;
  D(g,R(x,y,w,h),'t3',a,b);D(g,R(x+4,y+4,w-8,h-8),'thin t1',a,b);
  if(o.paper!==false)D(g,R(x+8,y+8,w-16,h-16),'hair t2',a,b);
  art(g,nm,x+w/2,y+h/2,s*.92,o.rot||0,o.fx||1,a,b);
  D(g,'M'+(x+w*.2)+','+(y+h-8)+' L'+(x+w*.55)+','+(y+8)+' M'+(x+w*.34)+','+(y+h-8)+' L'+(x+w*.7)+','+(y+8),'hair faint',a,b);
  D(g,'M'+(x+w/2-w*.16)+','+y+' L'+(x+w/2)+','+(y-9)+' L'+(x+w/2+w*.16)+','+y,'hair dim',a,b)}

/* ---------- sekce a vrstvy ---------- */
var RX=[[600,1300],[1300,2040],[2040,2600],[2600,3640]],SEC={};
function sec(layer,i){var k=layer+i;return SEC[k]||(SEC[k]=ST.section(ST.L[layer],RX[i][0],RX[i][1]))}
function secAt(layer,x){return sec(layer,x<1300?0:x<2040?1:x<2600?2:3)}
['back','room','light','front'].forEach(function(l){for(var i=0;i<4;i++)sec(l,i)});
function rY(x){return x<2133?222-50*(x-704)/1429:222-50*(3562-x)/1429}
var STIP='url(#stipple)',HF='url(#hatchFine)',HX='url(#hatchX)',HV='url(#hatchV)',HH='url(#hatch)';

/* ---------- odhalene cihly ---------- */
function bricks(g,x0,y0,x1,y1,seed,jag,a,b){
  var r=rng(seed),bw=15,bh=7.5,rows=Math.floor((y1-y0)/bh),d=[],d2=[],row,x;
  for(row=0;row<rows;row++){
    var y=y0+row*bh,off=(row%2)?bw/2:0,xs=x0+r()*jag,xe=x1-r()*jag;
    if(row<3)xs+=(3-row)*r()*20;if(rows-row<4)xe-=(4-(rows-row))*r()*22;
    for(x=x0-off+Math.floor((xs-x0+off)/bw)*bw;x<xe;x+=bw){
      var bx=Math.max(x,xs),ex=Math.min(x+bw,xe);if(ex-bx<3)continue;
      var s='M'+n1(bx)+','+n1(y)+'h'+n1(ex-bx)+'v'+bh+'h'+n1(bx-ex)+'Z';
      d.push(s);if(r()<.28)d2.push(s)}}
  D(g,d.join(''),'hair dim t2',a,b);
  FILL(g,d2.join(''),'hair',a,b,{fill:HF});
}

/* ---------- plaste ---------- */
function floorBoards(g,fa,fb,a,b){
  var d=[],kn=[],gr=[],r,x;
  d.push('M'+fa+',707 H'+fb+' M'+fa+',714 H'+fb);
  for(r=0;r<3;r++){var rg=rng(31+r*7),yy=[700,707,714,722][r],yh=[700,707,714,722][r+1];
    for(x=800+rg()*160;x<3520;x+=140+rg()*110){if(x>fa&&x<fb)d.push('M'+n1(x)+','+yy+' V'+yh)}
    var rk=rng(77+r);for(x=820+rk()*260;x<3520;x+=300+rk()*380){if(x>fa&&x<fb){var ky=(yy+yh)/2;kn.push(ell(x,ky,3.4,1.7),ell(x,ky,1.7,.8))}}
    var rw=rng(5+r*3+Math.floor(fa));gr.push(ST.wline(fa,fb,(yy+yh)/2,.5,22,rw))}
  D(g,d.join(' '),'hair dim',a,b);D(g,kn.join(' '),'hair dim',a,b);D(g,gr.join(' '),'hair faint',a,b);
  D(g,'M'+fa+',722 H'+fb,'ink',a,b);
  /* celo podlahy: prkno v rezu, trámy, vyplň */
  D(g,R(fa,722,fb-fa,11),'thin t3',a,b);
  D(g,ST.wline(fa,fb,727.5,.6,26,rng(9+Math.floor(fa))),'hair faint',a,b);
  FILL(g,R(fa,733,fb-fa,33),'hair',a,b,{fill:STIP});
  var bm=[],e=[];for(x=800+Math.ceil((fa-800)/110)*110;x<fb;x+=110){bm.push('M'+x+',733h16v33h-16Z');e.push('M'+(x+4)+',738 q4,-2 8,0 M'+(x+3)+',746 q5,-3 10,0 M'+(x+4)+',754 q4,-2 8,0')}
  D(g,bm.join(''),'thin t2',a,b);D(g,e.join(' '),'hair dim',a,b);
  /* zaklad - kamenne zdivo */
  var st=[],rg2=rng(41+Math.floor(fa));
  for(r=0;r<3;r++){var y0=766+r*12;st.push('M'+fa+','+y0+' H'+fb);for(x=fa-(fa%40)+(r%2)*20-40;x<fb;x+=38+rg2()*30)if(x>fa&&x<fb)st.push('M'+n1(x)+','+y0+' v12')}
  D(g,R(fa,766,fb-fa,36),'thin t1',a,b);D(g,st.join(' '),'hair dim',a,b);
  FILL(g,R(fa,766,fb-fa,36),'hair',a,b,{fill:HF});
  [1300,2200,3100].forEach(function(vx){if(vx>fa+16&&vx<fb-16){D(g,'M'+(vx-15)+',802 V786 Q'+vx+',768 '+(vx+15)+',786 V802Z','thin solid',a,b);
    D(g,'M'+(vx-8)+',802 V780 M'+vx+',802 V776 M'+(vx+8)+',802 V780','hair',a,b)}});
}

/* ---------- strecha ---------- */
function roofPart(g,a,b,A,B){
  var xa=Math.max(a,704),xb=Math.min(b,3562);if(xb<=xa)return;
  var x0=704+Math.floor((xa-704)/15)*15,x,pts=[],bot=[],top=['M'+x0+','+n1(rY(x0))],und=['M'+x0+','+n1(rY(x0)+9)],seam=[],bat=[];
  for(x=x0;x<xb;x+=15){var y0=rY(x),y1=rY(x+15);
    top.push('Q'+n1(x+7)+','+n1((y0+y1)/2-4.5)+' '+(x+15)+','+n1(y1));
    und.push('Q'+n1(x+11)+','+n1((y0+y1)/2+11)+' '+(x+15)+','+n1(y1+9));
    seam.push('M'+n1(x+15)+','+n1(y1)+' L'+n1(x+15)+','+n1(y1+9));
    bat.push('M'+(x+5)+','+n1(y0+10)+'h4v3h-4Z');pts.push(x+','+n1(y0));bot.push((x)+','+n1(y0+9))}
  var xe=x;pts.push(xe+','+n1(rY(xe)));bot.push(xe+','+n1(rY(xe)+9));
  FILL(g,'M'+pts.join(' L')+' L'+bot.reverse().join(' L')+'Z','t3',A,B);
  D(g,top.join(' '),'ink',A,B);D(g,und.join(' '),'thin',A,B);D(g,seam.join(' '),'hair',A,B);D(g,bat.join(''),'hair dim',A,B);
  /* krokve */
  var rp=[],rb=[];for(x=x0;x<=xe;x+=60){rp.push(n1(x)+','+n1(rY(x)+14));rb.push(n1(x)+','+n1(rY(x)+20))}
  D(g,'M'+rp.join(' L')+' L'+rb.reverse().join(' L')+'Z','thin t2',A,B);
  /* podkroví */
  var ap=[],ok=false;for(x=xa;x<=xb;x+=10){var tp=Math.min(rY(x)+20,230);if(230-tp>6)ok=true;ap.push(n1(x)+','+n1(tp))}
  if(ok)FILL(g,'M'+xa+',230 L'+ap.join(' L')+' L'+xb+',230Z','solid',A,B);
  /* vazby */
  var tr=[];[1700,1960,2133,2306,2560,2820].forEach(function(tx){if(tx<xa||tx>xb)return;var yy=rY(tx)+20;if(230-yy<14)return;
    tr.push('M'+tx+',230 V'+n1(yy)+' M'+tx+','+n1(yy+14)+' L'+(tx-62)+',230 M'+tx+','+n1(yy+14)+' L'+(tx+62)+',230')});
  if(tr.length)D(g,tr.join(' '),'thin dim',A,B);
  /* krytina - hrebenace */
  if(xa<=2133&&xb>=2133){D(g,'M2112,172 Q2112,164 2124,164 H2142 Q2154,164 2154,172Z','ink t3',A,B);D(g,'M2118,168 H2148','hair',A,B)}
  /* podkrovi - bedny */
  if(xa<=2290&&xb>=2250){D(g,R(2248,216,44,14),'thin t2',A,B);D(g,'M2258,216 V230 M2282,216 V230 M2248,222 H2292','hair',A,B);D(g,R(2266,222,8,5),'hair gold',A,B)}
  if(xa<=1900&&xb>=1860){D(g,R(1864,217,28,13),'thin t2',A,B);D(g,R(1870,205,18,12),'thin t3',A,B);D(g,'M1864,223 H1892 M1870,211 H1888','hair',A,B)}
  /* okapy a stitove desky */
  if(xa<=704){D(g,R(698,221,9,24),'thin t3',A,B);D(g,'M700,226 V244 M704,226 V244','hair',A,B)}
  if(xb>=3562){D(g,R(3559,221,9,24),'thin t3',A,B);D(g,'M3562,226 V244 M3566,226 V244','hair',A,B)}
}

/* ---------- komin s koureem, korouhvicka ---------- */
function chimney(g,A,B){
  var cx=3192,w=44,top=96,d=[],h=[],y,i,r=rng(61);
  D(g,R(cx,top,w,Math.round(rY(cx+22))-top+10),'ink t2',A,B);
  for(y=top+8,i=0;y<rY(cx)+6;y+=8,i++){h.push('M'+cx+','+y+' H'+(cx+w));for(var x=cx+((i%2)?5:13);x<cx+w;x+=16)h.push('M'+x+','+y+' v8')}
  D(g,h.join(' '),'hair dim',A,B);
  FILL(g,R(cx,top,12,Math.round(rY(cx+22))-top+10),'hair',A,B,{fill:HV});
  D(g,R(cx-7,top-8,w+14,9),'ink t3',A,B);D(g,'M'+(cx-7)+','+(top-4)+' H'+(cx+w+7),'hair',A,B);
  D(g,R(cx+8,top-22,12,14),'thin t3',A,B);D(g,R(cx+25,top-18,12,10),'thin t3',A,B);
  D(g,'M'+(cx+8)+','+(top-18)+' H'+(cx+20)+' M'+(cx+25)+','+(top-14)+' H'+(cx+37),'hair',A,B);
  FILL(g,R(cx,top+4,w,24),'hair',A,B,{fill:HF});
  D(g,'M'+(cx+2)+','+(rY(cx)+10)+' V230 M'+(cx+w-2)+','+(rY(cx)+10)+' V230','hair dim',A,B);
  D(g,'M'+(cx-2)+','+(rY(cx)+4)+' L'+(cx+w+2)+','+(rY(cx+w)+4),'thin',A,B);
}
function weathervane(g,A,B){
  D(g,'M2133,166 V124','ink',A,B);D(g,cir(2133,146,3.4),'thin t3',A,B);
  D(g,'M2116,146 H2150 M2133,142 V150','hair',A,B);
  D(g,cir(2133,122,3),'thin gold',A,B);
  art(g,'swallow',2133,106,.3,0,1,A,B,'thin','hair');
}

/* ---------- stena interieru, strop, podlaha ---------- */
function shellPart(i,a,b,z0,z1){
  zone(z0,z1);var g=sec('back',i),wa=Math.max(a,890),wb=Math.min(b,3420),x,d,e;
  if(wb>wa){
    FILL(g,R(wa,240,wb-wa,460),'t1',0,.8);
    FILL(g,R(wa,252,wb-wa,448),'hair',0,.8,{fill:STIP});
    FILL(g,R(wa,252,wb-wa,22),'hair',.1,.9,{fill:HF});
    /* obklad (wainscot), sokl, lista */
    d=[];e=[];for(x=Math.ceil(wa/62)*62;x<wb-50;x+=62){d.push(rr(x+3,611,48,58));e.push(rr(x+8,616,38,48))}
    D(g,'M'+wa+',603 H'+wb+' M'+wa+',609 H'+wb,'thin',.1,.9);D(g,d.join(''),'hair',.1,.9);D(g,e.join(''),'hair faint',.1,.9);
    FILL(g,rr(wa,609,wb-wa,67),'hair',.1,.9,{fill:HV});
    D(g,'M'+wa+',678 H'+wb+' M'+wa+',684 H'+wb+' M'+wa+',700 H'+wb,'thin',.1,.9);D(g,'M'+wa+',700 H'+wb,'ink',.1,.9);
    /* strop: lista s dentilky */
    d=[];for(x=Math.ceil(wa/14)*14;x<wb;x+=14)d.push('M'+x+',244 v6');
    D(g,'M'+wa+',256 H'+wb+' M'+wa+',251 H'+wb,'thin',.1,.9);D(g,d.join(' '),'hair',.1,.9);
    /* praskliny a skvrny na omitce */
    var rc=rng(Math.floor(wa)+3),cr=[];for(var k=0;k<4;k++){var cx0=wa+rc()*(wb-wa),cy0=270+rc()*150,p='M'+n1(cx0)+','+n1(cy0);
      for(var j=0;j<5;j++){cx0+=(rc()-.4)*14;cy0+=6+rc()*12;p+=' L'+n1(cx0)+','+n1(cy0)}cr.push(p)}
    D(g,cr.join(' '),'hair dim',.2,1);
    /* odhalene cihly */
    [[2330,255,2580,560,201,26],[2965,252,3118,418,202,22],[3300,300,3418,640,203,16],[890,252,962,334,204,12]].forEach(function(p){
      if(p[0]<b&&p[2]>a)bricks(g,Math.max(p[0],wa),p[1],Math.min(p[2],wb),p[3],p[4],p[5],.2,1)});
  }
  /* podlaha */
  var fa=Math.max(a,800),fb=Math.min(b,3510);if(fb>fa)floorBoards(g,fa,fb,.1,.9);
  /* strop (rez) */
  var ca=Math.max(a,712),cb=Math.min(b,3556);
  if(cb>ca){D(g,R(ca,230,cb-ca,10),'thin t2',0,.7);FILL(g,R(ca,230,cb-ca,10),'hair',0,.7,{fill:HX});
    d=[];for(x=Math.ceil(ca/36)*36;x<cb;x+=36)d.push('M'+x+',232h18v6h-18Z');D(g,d.join(''),'hair dim',0,.7)}
  roofPart(g,a,b,0,1);
  if(a<=2133&&b>2133)weathervane(g,0,1);
  if(a<=3192&&b>3192)chimney(g,0,1);
}
shellPart(0,704,1300,.9,1.8);shellPart(1,1300,2040,.9,1.8);shellPart(2,2040,2600,4.6,5.3);shellPart(3,2600,3420,6.1,6.7);shellPart(3,3420,3562,10.6,11.0);

/* ---------- reznaz zed nad dvermi, nadpraží, prah, zaklad ---------- */
function doorWall(dx){
  var g=sec('back',dx?3:0),x=800+dx;
  FILL(g,R(x,240,90,120),'t2',0,.6);FILL(g,R(x,240,90,120),'hair',.1,.7,{fill:HH});
  D(g,'M'+x+',230 V360 M'+(x+90)+',230 V360','ink',0,.6);
  D(g,'M'+(x+6)+',240 V338 M'+(x+84)+',240 V338','hair',.2,.8);
  D(g,'M'+(x+12)+',250 H'+(x+78)+' M'+(x+12)+',290 H'+(x+78)+' M'+(x+12)+',320 H'+(x+78),'hair dim',.3,.9);
  /* preklad + klenak */
  D(g,R(x-6,338,102,22),'ink t3',.2,.7);
  D(g,'M'+(x+14)+',338 V360 M'+(x+30)+',338 V360 M'+(x+60)+',338 V360 M'+(x+76)+',338 V360','hair',.3,.8);
  D(g,'M'+(x+38)+',338 H'+(x+52)+' L'+(x+49)+',360 H'+(x+41)+'Z','thin',.3,.8);
  /* ostení, prah, zaklad */
  D(g,'M'+x+',360 V700 M'+(x+90)+',360 V700','ink',.2,.8);
  D(g,'M'+(x+3)+',362 V700 M'+(x+87)+',362 V700','hair',.3,.9);
  D(g,R(x-4,695,98,7),'thin t3',.4,.9);D(g,'M'+(x+2)+',698.5 H'+(x+88),'hair',.5,1);
  D(g,R(x,702,90,98),'ink t2',.3,1);FILL(g,R(x,702,90,98),'hair',.3,1,{fill:HH});
  D(g,'M'+x+',726 H'+(x+90)+' M'+x+',750 H'+(x+90)+' M'+x+',774 H'+(x+90)+' M'+(x+30)+',702 V726 M'+(x+60)+',726 V750 M'+(x+30)+',750 V774 M'+(x+60)+',774 V800','hair dim',.4,1);
}
function doorLeaf(g,dx,sign){
  var x=803+dx,k;
  D(g,R(x,362,84,338),'ink t3',0,.5);
  D(g,R(x+6,368,72,326),'thin',.1,.6);
  D(g,R(x+12,376,60,118),'thin solid',.2,.7);
  FO(g,R(x+12,376,60,118),'f-gold',.2,.2,.7);
  D(g,'M'+(x+32)+',376 V494 M'+(x+52)+',376 V494 M'+(x+12)+',415 H'+(x+72)+' M'+(x+12)+',455 H'+(x+72),'thin',.3,.8);
  D(g,'M'+(x+16)+',486 L'+(x+34)+',392 M'+(x+24)+',490 L'+(x+44)+',386 M'+(x+56)+',490 L'+(x+66)+',440','hair faint',.4,.9);
  D(g,R(x+6,494,72,16),'thin',.3,.7);D(g,R(x+24,498,36,6,2),'thin gold',.4,.8);
  [512,602].forEach(function(py){D(g,R(x+12,py,60,84,3),'thin',.3,.8);D(g,R(x+18,py+6,48,72,2),'hair',.4,.9);FILL(g,R(x+24,py+12,36,60),'hair',.4,.9,{fill:HV});D(g,R(x+24,py+12,36,60),'hair faint',.4,.9)});
  D(g,R(x+3,534,12,42,5),'thin gold',.5,.9);D(g,'M'+(x+9)+',556 H'+(x+42),'thin gold',.5,.9);D(g,cir(x+9,556,3.2),'thin gold t1',.5,.9);
  D(g,cir(x+45,545,6),'hair gold',.5,.9);D(g,'M'+(x+45)+',539 V535 M'+(x+40)+',535 H'+(x+50),'hair gold',.5,.9);
  for(k=0;k<3;k++)D(g,R(x+80,[386,520,646][k],6,24,1),'thin gold',.5,.9);
  D(g,R(x+8,674,70,18,2),'thin gold',.5,.9);D(g,cir(x+13,683,1)+cir(x+73,683,1),'hair gold',.5,.9);
  if(sign){
    D(g,'M'+(x+42)+',362 V372','hair',.4,.8);
    D(g,R(x+22,416,40,24,3),'thin solid',.5,.9);D(g,R(x+25,419,34,18,2),'hair gold',.5,.9);
    TX(g,'OTEVŘENO',x+42,431,6.6,'label',.5,.9,1);
  }
}

/* ---------- fasada na ulici (x 712 az 800) ---------- */
function facade(){
  zone(.9,1.8);var g=sec('back',0),gl=sec('light',0),k,d;
  /* omitka */
  FILL(g,R(712,242,88,458),'t2',0,.6);FILL(g,R(712,242,88,458),'hair',.1,.7,{fill:STIP});
  FILL(g,R(712,560,88,92),'hair',.2,.8,{fill:HV});FILL(g,R(712,244,88,24),'hair',.2,.8,{fill:HF});
  d=[];var rc=rng(88);for(k=0;k<3;k++){var cx0=736+rc()*50,cy0=300+rc()*200,p='M'+n1(cx0)+','+n1(cy0);for(var j=0;j<6;j++){cx0+=(rc()-.5)*10;cy0+=8+rc()*10;p+=' L'+n1(cx0)+','+n1(cy0)}d.push(p)}
  D(g,d.join(' '),'hair dim',.3,.9);
  /* nárožní armatura */
  d=[];for(k=0;k<14;k++)d.push(rr(712,252+k*28,k%2?20:30,27));
  D(g,d.join(''),'thin',.2,.8);FILL(g,d.join(''),'hair',.2,.8,{fill:HF});
  D(g,'M712,242 V700','ink',0,.6);
  /* sokl */
  D(g,R(712,650,88,50),'ink t3',.3,.9);
  d=['M712,664 H800 M712,678 H800 M712,692 H800'];for(k=0;k<3;k++)for(var xx=720+(k%2)*22;xx<800;xx+=36)d.push('M'+xx+','+(650+k*14)+' v14');
  D(g,d.join(' '),'hair',.4,1);FILL(g,R(712,650,88,50),'hair',.4,1,{fill:HF});D(g,'M706,650 H806','thin',.4,1);
  /* kordon a dentilky */
  D(g,R(706,226,100,16),'ink t3',0,.6);d=[];for(k=712;k<800;k+=10)d.push('M'+k+',232 v6');D(g,d.join(' ')+' M706,236 H806','hair',.2,.8);
  /* obklad dveri */
  D(g,'M790,360 V700','thin',.3,.8);D(g,'M794,338 V700','hair',.3,.8);
  /* zelezna konzola a stit */
  D(g,'M800,424 H696','ink',.3,.8);D(g,'M798,455 C782,452 764,442 752,426','thin',.4,.9);
  D(g,'M772,424 C772,412 758,410 758,420 C758,428 766,428 766,422','thin',.4,.9);
  D(g,'M730,424 C730,416 722,414 722,420 C722,425 727,425 727,421','hair',.4,.9);
  D(g,cir(692,424,3.4),'thin gold t1',.5,.9);D(g,'M696,424 V438 M786,424 V438','thin',.5,.9);D(g,cir(696,431,1.4)+cir(786,431,1.4),'hair',.5,.9);
  D(g,R(684,438,112,42,7),'ink solid',.4,1);D(g,R(689,443,102,32,4),'thin gold',.5,1);
  D(g,cir(692,441,1.4)+cir(788,441,1.4)+cir(692,477,1.4)+cir(788,477,1.4),'hair gold',.6,1);
  TX(g,'HONZA',740,461,17,'label',.6,1,1,{'letter-spacing':2});TX(g,'TATTOO',740,472.5,8.6,'label',.65,1,1,{'letter-spacing':4.2});
  FO(g,star4(699,469,3.4),'f-gold',.9,.7,1);FO(g,star4(781,469,3.4),'f-gold',.9,.7,1);
  /* tabulky */
  D(g,R(727,257,66,24,3),'ink t2',.5,1);D(g,R(730,260,60,18,2),'hair goldl',.5,1);
  D(g,cir(731,262,1)+cir(789,262,1)+cir(731,276,1)+cir(789,276,1),'hair goldl',.6,1);
  TX(g,'PRAHA 3',760,267,4.4,'f-goldl',.6,1,.8);TX(g,'TÁBORITSKÁ',760,275.5,8.2,'f-goldl',.6,1,1,{'letter-spacing':.5});
  D(g,R(738,292,30,22,3),'thin t2 goldl',.5,1);D(g,R(742,296,22,14,2),'hair goldl',.6,1);TX(g,'1284',753,306.6,8.6,'f-goldl',.6,1,1);
  D(g,R(772,297,20,16,2),'thin t3 gold',.5,1);TX(g,'17',782,308.6,8.6,'f-gold',.6,1,1);
  /* zvonek */
  D(g,R(773,516,20,48,3),'thin solid gold',.6,1);d=[];for(k=0;k<3;k++)d.push(cir(783,527+k*14,2.6));
  D(g,d.join(' '),'thin gold',.7,1);d=[];for(k=0;k<3;k++)d.push('M776,'+(532+k*14)+' h14');D(g,d.join(' '),'hair',.7,1);
  D(g,R(776,566,14,5,1),'hair gold',.7,1);
  /* svetlo u dveri */
  D(g,'M800,372 H784 Q779,372 779,378','thin',.5,1);D(g,'M772,382 L792,382 L789,408 L775,408Z','thin t1',.6,1);D(g,'M770,382 L782,371 L794,382Z','thin t3',.6,1);
  D(g,'M782,382 V408 M777,396 H787','hair gold',.7,1);D(g,'M776,410 H788','hair',.7,1);
  var gw=el('path',{d:cir(782,396,52),fill:'url(#gGlow)'},gl),tw=tt(.6,1);ST.fade(gw,tw[0],tw[1],.8);ST.on(function(T,time,cam){if(cam.x0<900&&cam.x1>600)gw.setAttribute('opacity',(.55+(ST.reduce?0:.1*sin(time*.0017))).toFixed(3)*ss(1.1,1.7,T))});
  /* svod dverí a dvere 1 */
  doorWall(0);
  var gr=sec('room',0),gD=G(gr);doorLeaf(gD,0,false);
  ST.on(function(T,time,cam){if(cam.x0>1100||cam.x1<700)return;var o=ss(1.95,2.2,T)*(1-ss(2.5,2.8,T));gD.setAttribute('transform','translate(887,0) scale('+(1-.85*o).toFixed(3)+',1) translate(-887,0)')});
}
facade();

/* ---------- pravá fasáda a dvere 2 ---------- */
function rightFacade(){
  zone(10.8,11.5);var g=sec('back',3),gl=sec('light',3),k,d;
  FILL(g,R(3510,242,46,458),'t2',0,.6);FILL(g,R(3510,242,46,458),'hair',.1,.7,{fill:STIP});FILL(g,R(3510,560,46,92),'hair',.2,.8,{fill:HV});
  d=[];for(k=0;k<14;k++)d.push(rr(k%2?3536:3526,252+k*28,k%2?20:30,27));D(g,d.join(''),'thin',.2,.8);
  D(g,'M3556,242 V700','ink',0,.6);D(g,R(3510,650,48,50),'ink t3',.3,.9);D(g,'M3510,664 H3558 M3510,678 H3558 M3510,692 H3558 M3530,650 V664 M3546,664 V678 M3530,678 V692','hair',.4,1);
  D(g,R(3504,226,56,16),'ink t3',0,.6);D(g,'M3504,236 H3560','hair',.2,.8);
  D(g,R(3522,462,22,34,2),'thin solid gold',.6,1);D(g,'M3527,470 H3539 M3527,476 H3539 M3527,482 H3535','hair gold',.7,1);D(g,cir(3533,490,1.6),'hair gold',.7,1);
  D(g,'M3510,372 H3524 Q3530,372 3530,378','thin',.5,1);D(g,'M3522,382 L3542,382 L3539,408 L3525,408Z','thin t1',.6,1);D(g,'M3520,382 L3532,371 L3544,382Z','thin t3',.6,1);D(g,'M3532,382 V408','hair gold',.7,1);
  var gw=el('path',{d:cir(3532,396,50),fill:'url(#gGlow)'},gl),tw=tt(.6,1);ST.fade(gw,tw[0],tw[1],.7);
  doorWall(2620);
  var gD=G(sec('room',3));doorLeaf(gD,2620,true);
  ST.on(function(T,time,cam){if(cam.x0>3600||cam.x1<3300)return;var o=ss(11.75,11.95,T);gD.setAttribute('transform','translate(3507,0) scale('+(1-.85*o).toFixed(3)+',1) translate(-3507,0)')});
}
rightFacade();

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
  return s;
}
/* vpust a poklop */
function streetDetail(s,x,dl,r){
  /* kanalizacni poklop na chodniku */
  ink(s,ST.ellipse(x,724,24,4.5)+ST.ellipse(x,724,18,3.2)+M(x-16,724)+'h32M'+pt(x,720)+'v8','hair',dl);
  /* vpust */
  ink(s,rect(x+120,760,34,8)+M(x+128,760)+'v8M'+pt(x+136,760)+'v8M'+pt(x+144,760)+'v8','hair',dl);
}

/* ---- tramvaj Tatra T3 (zleva doprava, celem doleva), zaklad v (0,0), delka L, vyska ~ 340 ---- */
function buildTram(g,L,num,dl,pass){
  var s=el('g',{},g),H=-336,r=RNG(500+L);
  var gW=function(x,y,w,h){return rect(x,y,w,h)};
  /* podvozek a kola */
  var wh=[190,262,L-262,L-190],wd='',hubs='',sp='';
  wh.forEach(function(cx){wd+=circ(cx,-19,19);hubs+=circ(cx,-19,5.5);for(var a=0;a<6;a++){var an=a*PI/3+.3;sp+=line(cx+cos(an)*6,-19+sin(an)*6,cx+cos(an)*17,-19+sin(an)*17)}});
  fillp(s,wd,'f-t1');
  path(s,wd,{'class':'ink thin'});path(s,hubs+sp,{'class':'ink hair'});
  /* telo */
  var body=M(0,-44)+'L0,-300'+'Q0,-318 20,-320'+'L'+pt(L-20,-320)+'Q'+pt(L,-318)+' '+pt(L,-300)+'L'+pt(L,-44)+'Z';
  fillp(s,body,'f-t2');
  /* rozsvicena okna pas */
  var segs=[['c',104],['w',112],['w',112],['w',112],['d',102],['w',112],['w',112],['w',112],['d',102],['w',112],['w',112],['w',112],['d',102],['w',112],['w',112],['c',0]];
  var tot=0;segs.forEach(function(q){tot+=q[1]});
  var sc=(L-20)/tot,x=10,yw=-262,hw=118,glass='',gl2='',frames='',mul='',pax='',paxh='',hand='';
  var wi=0;
  segs.forEach(function(q){
    var w=q[1]*sc;if(!w)return;
    if(q[0]==='c'){glass+=rect(x+6,yw+8,w-14,hw-8);frames+=rect(x+6,yw+8,w-14,hw-8);mul+=line(x+w*.55,yw+8,x+w*.55,yw+hw)}
    else if(q[0]==='w'){glass+=rect(x+5,yw,w-10,hw);frames+=rect(x+5,yw,w-10,hw)+rect(x+5,yw,w-10,34);mul+=line(x+w/2,yw+34,x+w/2,yw+hw);
      if(wi%3!==2||true){/* cestujici */
        var px=x+w*(.28+r()*.44),sh=r();
        if(sh<(pass==null?.55:pass)){var ph=yw+hw-8;paxh+=circ(px,ph-58+(r()-.5)*5,7.2)+M(px-13,ph)+'Q'+pt(px-13,ph-40)+' '+pt(px,ph-42)+'Q'+pt(px+13,ph-40)+' '+pt(px+13,ph)+'Z'}
      }
      wi++}
    else{glass+=rect(x+4,yw-8,w/2-6,hw+8)+rect(x+w/2+2,yw-8,w/2-6,hw+8);frames+=rect(x+4,yw-8,w/2-6,hw+8)+rect(x+w/2+2,yw-8,w/2-6,hw+8)+rect(x,yw-14,w,hw+14)+M(x+w*.2,-40)+'h'+n(w*.6);}
    x+=w;
  });
  /* zavesna madla */
  for(var hx=40;hx<L-40;hx+=48)hand+=M(hx,yw+14)+'v10'+circ(hx,yw+30,3.5);
  var gW2=fillp(s,glass,'',{fill:'url(#gWin)',opacity:.85});
  fillp(s,glass,'',{fill:'url(#st_glass)',opacity:.6});
  fillp(s,paxh,'f-bg',{opacity:.9});
  /* kostra, obrysy */
  ink(s,body,'thin',dl);
  path(s,frames,{'class':'ink thin'});
  path(s,mul,{'class':'ink hair'});
  path(s,hand,{'class':'ink hair',opacity:.8});
  /* spodní pas, sokl */
  var st=M(0,-84)+'H'+L+M(0,-70)+'H'+L+M(0,-44)+'H'+L+M(0,-290)+'H'+L+M(0,-136)+'H'+L;
  path(s,st,{'class':'ink hair'});
  fillp(s,rect(0,-84,L,14),'',{fill:'url(#hatchV)'});
  fillp(s,rect(0,-136,L,52),'',{fill:'url(#hatchFine)',opacity:.5});
  fillp(s,rect(0,-300,L,14),'',{fill:'url(#hatchX)',opacity:.6});
  /* clanek dvere: zelezne rohy */
  /* podlozi + zástěry kol */
  var sk='';wh.forEach(function(cx){sk+=M(cx-26,-44)+'v10q0,-4 0,0'+M(cx-24,-44)+'Q'+pt(cx-24,-74)+' '+pt(cx,-74)+'Q'+pt(cx+24,-74)+' '+pt(cx+24,-44)});
  path(s,sk,{'class':'ink thin'});
  /* strecha: klimatizace, odpor, pantograf */
  var rf=rect(L*.18,-336,L*.16,16)+rect(L*.4,-332,L*.1,12)+rect(L*.6,-336,L*.18,16)+rect(L*.82,-332,L*.08,12);
  fillp(s,rf,'f-t3');path(s,rf,{'class':'ink thin'});
  var rv='';for(var rx=L*.18+6;rx<L*.34;rx+=7)rv+=line(rx,-336,rx,-322);
  for(rx=L*.6+6;rx<L*.78;rx+=7)rv+=line(rx,-336,rx,-322);
  path(s,rv,{'class':'ink hair'});
  var px0=L*.72,pan=M(px0-30,-336)+'L'+pt(px0,-372)+L(px0+40,-336)+M(px0,-372)+'L'+pt(px0+20,-345)+M(px0-10,-373)+'h'+n(40)+M(px0-14,-376)+'h46'+M(px0-30,-336)+'h70';
  path(s,pan,{'class':'ink thin'});
  /* cela: reflektor, linka, svetla */
  fillp(s,rect(6,-298,26,32),'',{fill:'url(#gWin)',opacity:.9});
  ink(s,rect(6,-298,26,32)+rect(10,-294,18,24),'hair',dl+.1);
  var tb=ST.rect(24,-322,64,24,4);fillp(s,tb,'f-bg');path(s,tb,{'class':'ink thin gold'});
  var tx=el('text',{x:56,y:-304,'class':'label','text-anchor':'middle','font-size':21,'font-weight':600},s);tx.textContent=num;tx.style.fontFamily='var(--font-display)';
  /* svetla, zrcatko, nárazník */
  ink(s,circ(14,-62,6)+circ(L-14,-62,6)+M(-4,-52)+'h8M'+pt(L-4,-52)+'h8'+rect(-6,-76,6,36)+rect(L,-76,6,36)+M(-6,-58)+'h-14M'+pt(L+6,-58)+'h14','hair',dl+.12);
  var hl=el('circle',{cx:14,cy:-62,r:42,fill:'url(#gGlow)',opacity:.7},s);
  var gl3=el('circle',{cx:L-14,cy:-62,r:18,fill:'url(#gGlow)',opacity:.5},s);
  /* nápis ve zlate a logo dopravnika */
  var lg=el('text',{x:L*.5,y:-100,'class':'label','text-anchor':'middle','font-size':14,'letter-spacing':4,opacity:.6},s);lg.textContent='DOPRAVNÍ PODNIK';lg.style.fontFamily='var(--font-display)';
  return s;
}
function buildWire(g,x0,x1,y,dl,polesX,gy){
  var s=sect(g,x0,x1),d=M(x0,y),k;
  var xs=[x0].concat(polesX).concat([x1]);
  for(k=1;k<xs.length;k++){var a=xs[k-1],b=xs[k];d+='Q'+pt((a+b)/2,y+8)+' '+pt(b,y)}
  ink(s,d,'hair dim',dl);
  d='';polesX.forEach(function(px){
    d+=M(px-4,gy)+'L'+pt(px-2.6,y-18)+L(px+2.6,y-18)+L(px+4,gy)+M(px,y-18)+'q-6,-12 -42,-14M'+pt(px,y-8)+'L'+pt(px-40,y-8)+L(px-40,y);
    d+=line(px-6,gy-30,px+6,gy-30)+line(px-5,gy-190,px+5,gy-190)});
  ink(s,d,'thin dim',dl+.05);
  return s;
}
/* Skoda 120 (zaparkovana) */
function buildCar(g,x,y,dir,dl,seed){
  var s=sect(g,x-10,x+560),c=el('g',{transform:'translate('+x+','+y+')'+(dir<0?' translate(540,0) scale(-1,1)':'')},s);
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
  /* stin pod autem */
  fillp(s,ST.ellipse(x+270,y+2,280,6),'',{fill:'url(#hatch)',opacity:.7});
  return s;
}

/* ---- historicka prazska lampa ---- */
function buildLamp(g,x,gy,dl,flick){
  var s=sect(g,x-280,x+280),top=gy-480,d;
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
  fillp(s,gb,'f-goldl',{opacity:.34});
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
function buildTree(g,x,gy,sc,seed,dl,o){
  o=o||{};
  var r=RNG(seed),cy=gy-300*sc,cx=x+(o.dx||0),s=sect(g,x-200*sc,x+200*sc),k,d;
  /* kmen */
  var tr=M(x-9*sc,gy)+'C'+pt(x-8*sc,gy-60*sc)+' '+pt(x-6*sc,gy-120*sc)+' '+pt(x-7*sc,gy-170*sc)+'L'+pt(x+7*sc,gy-170*sc)+'C'+pt(x+6*sc,gy-120*sc)+' '+pt(x+9*sc,gy-60*sc)+' '+pt(x+10*sc,gy)+
    'Q'+pt(x+18*sc,gy+2)+' '+pt(x+22*sc,gy+4)+'L'+pt(x-22*sc,gy+4)+'Q'+pt(x-16*sc,gy)+' '+pt(x-9*sc,gy)+'Z';
  fillp(s,tr,'f-t1');
  fillp(s,tr,'',{fill:'url(#hatchV)',opacity:.9});
  ink(s,tr,'thin',dl);
  d='';for(k=0;k<7;k++){var bx=x-6*sc+k*2*sc,y0=gy-r()*20,ln=30+r()*60;d+=M(bx,y0)+'q'+n((r()-.5)*3)+','+n(-ln/2)+' '+n((r()-.5)*2)+','+n(-ln)}
  ink(s,d,'hair',dl+.05);
  /* vetve */
  d='';var br=[[-1,.9],[1,.92],[0,1],[-.5,.8],[.6,.82]];
  br.forEach(function(b){d+=M(x+b[0]*3*sc,gy-165*sc)+'Q'+pt(x+b[0]*40*sc,gy-210*sc)+' '+pt(cx+b[0]*85*sc,cy+30*sc)});
  ink(s,d,'thin',dl+.08);
  /* koruna: shluky listu zezadu dopredu */
  var cl=[],N=o.n||34;
  for(k=0;k<N;k++){var a=r()*PI*2,rr=Math.sqrt(r()),px=cx+cos(a)*rr*150*sc,py=cy+sin(a)*rr*112*sc*(sin(a)<0?1:.85);cl.push([px,py,(26+r()*18)*sc])}
  cl.sort(function(a,b){return a[1]-b[1]});
  var shade='',leaves='';
  cl.forEach(function(c,j){
    var dd=bump(c[0],c[1],c[2],r,9);
    var cls=j%3===0?'thin t2':'thin t1';
    ink(s,dd,cls,dl+.1+j/N*.5);
    /* stin ve spodni casti shluku */
    shade+=M(c[0]-c[2]*.8,c[1]+c[2]*.15)+'q'+n(c[2]*.8)+','+n(c[2]*.95)+' '+n(c[2]*1.6)+',0q'+n(-c[2]*.8)+','+n(-c[2]*.3)+' '+n(-c[2]*1.6)+',0';
    for(var q=0;q<5;q++){var lx=c[0]+(r()-.5)*c[2]*1.3,ly=c[1]+(r()-.5)*c[2]*1.1;leaves+=M(lx,ly)+'l'+n(2.5+r()*2)+','+n(-1.5-r()*2)+'l'+n(2.4+r()*2)+','+n(1.5+r()*2)}
  });
  fillp(s,shade,'',{fill:'url(#hatchFine)',opacity:.9});
  ink(s,leaves,'hair',dl+.7);
  /* lampy zari do koruny (svetlo) */
  if(o.glow){var gg=el('ellipse',{cx:cx+o.glow[0],cy:cy+o.glow[1],rx:100*sc,ry:70*sc,fill:'url(#gGlow)',opacity:.35},s);appear(gg,dl+.5,.35)}
  /* stin na dlazbe */
  fillp(s,ST.ellipse(x+14*sc,gy+22,110*sc,10),'',{fill:'url(#hatch)',opacity:.55});
  return s;
}

/* ---- lavicka, kose, kolo, holubi ---- */
function buildBench(g,x,gy,dl){
  var s=sect(g,x-80,x+80),d;
  /* nohy litinove s volutami */
  d='';[-46,46].forEach(function(o){var bx=x+o;d+=M(bx-8,gy)+'h16M'+pt(bx,gy)+'V'+n(gy-40)+'q'+n(o>0?10:-10)+',-4 '+n(o>0?10:-10)+',-14M'+pt(bx,gy-40)+'q'+n(o>0?-6:6)+',-34 '+n(o>0?-2:2)+',-52'+circ(bx+(o>0?10:-10),gy-16,3.2)});
  ink(s,d,'thin',dl);
  fillp(s,rect(x-52,gy-40,104,5)+rect(x-52,gy-31,104,5)+rect(x-52,gy-22,104,5),'f-t3');
  fillp(s,rect(x-52,gy-76,104,5)+rect(x-52,gy-67,104,5)+rect(x-52,gy-58,104,5)+rect(x-52,gy-49,104,5),'f-t3');
  ink(s,rect(x-52,gy-40,104,5)+rect(x-52,gy-31,104,5)+rect(x-52,gy-22,104,5)+rect(x-52,gy-76,104,5)+rect(x-52,gy-67,104,5)+rect(x-52,gy-58,104,5)+rect(x-52,gy-49,104,5),'thin',dl+.05);
  d='';for(var i=0;i<7;i++){d+=M(x-48+i*14,gy-74)+'h8M'+pt(x-46+i*14,gy-65)+'h9'}
  ink(s,d,'hair',dl+.08);
  fillp(s,ST.ellipse(x,gy+3,70,4),'',{fill:'url(#hatch)',opacity:.6});
}
function buildBin(g,x,gy,dl){
  var s=sect(g,x-30,x+30),d;
  /* odpadkovy kos na sloupku */
  d=M(x-1.6,gy)+'V'+n(gy-96)+M(x+1.6,gy)+'V'+n(gy-96)+rect(x-10,gy-6,20,6);
  ink(s,d,'thin',dl);
  var bn=M(x-15,gy-96)+'L'+pt(x-12,gy-142)+L(x+12,gy-142)+L(x+15,gy-96)+'Z';
  fillp(s,bn,'f-t1');ink(s,bn,'thin',dl+.05);
  d='';for(var i=-10;i<=10;i+=4)d+=line(x+i,gy-104,x+i*.85,gy-134);
  ink(s,d,'hair',dl+.08);
  ink(s,ST.ellipse(x,gy-142,13,3)+line(x-13,gy-142,x-13,gy-146)+line(x+13,gy-142,x+13,gy-146),'thin',dl+.1);
}
function buildBin2(g,x,gy,dl){
  var s=sect(g,x-34,x+34);
  /* popelnice na kolecka */
  var b=M(x-22,gy-4)+'L'+pt(x-26,gy-84)+L(x+26,gy-84)+L(x+22,gy-4)+'Z';
  fillp(s,b,'f-t2');ink(s,b,'thin',dl);
  var d='';for(var i=-17;i<=17;i+=6)d+=line(x+i,gy-8,x+i*1.15,gy-80);
  ink(s,d,'hair',dl+.05);
  ink(s,rect(x-30,gy-94,60,10)+M(x-30,gy-94)+'q30,-8 60,0'+rect(x-8,gy-97,16,3)+circ(x-18,gy-2,6)+circ(x+18,gy-2,6),'thin',dl+.1);
  fillp(s,rect(x-30,gy-94,60,10),'f-t3');
  ink(s,M(x-12,gy-60)+'h24M'+pt(x-12,gy-54)+'h24','hair',dl+.12);
}
function buildBike(g,x,gy,dl){
  var s=sect(g,x-70,x+70),r=34,w1=x-44,w2=x+44,d='',sp='';
  [w1,w2].forEach(function(cx){d+=circ(cx,gy-r,r)+circ(cx,gy-r,r-4);for(var a=0;a<18;a++){var an=a*PI/9;sp+=line(cx+cos(an)*4,gy-r+sin(an)*4,cx+cos(an)*(r-5),gy-r+sin(an)*(r-5))}});
  var fr=M(w1,gy-r)+'L'+pt(x-14,gy-r-44)+L(x+26,gy-r-44)+L(w2,gy-r)+M(x-14,gy-r-44)+'L'+pt(x+6,gy-r)+L(w1,gy-r)+M(x+6,gy-r)+'L'+pt(x+26,gy-r-44)+M(x+26,gy-r-44)+'L'+pt(x+34,gy-r-60)+M(x+28,gy-r-62)+'h14M'+pt(x-18,gy-r-46)+'h-12'+M(x-14,gy-r-44)+'L'+pt(x-18,gy-r-58)+circ(x+6,gy-r,5);
  ink(s,d,'thin',dl);ink(s,sp,'hair faint',dl+.04);ink(s,fr,'thin',dl+.08);
  fillp(s,M(x-20,gy-r-50)+'q6,-6 18,0l-3,3h-12Z','f-t3');
  fillp(s,ST.ellipse(x,gy+3,76,3.5),'',{fill:'url(#hatch)',opacity:.55});
}
function buildPigeons(g,x,gy,dl,n2){
  var s=sect(g,x-60,x+60),d='',r=RNG(x|0);
  for(var i=0;i<n2;i++)d+=bird(x+i*20+r()*8,gy,1.25,r()<.5?1:-1);
  path(s,d,{'class':'ink thin',fill:'var(--bg)'});
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

/* ================= POPREDI (fore) ================= */
function buildFore(end,pl,AX,AY,xa,xb,o){
  var f=ST.plane('fore',1.4,AX,AY),W=xb-xa,s=sect(f,xa,xb),r=RNG(end?77:55),i,d;
  pl.push(f);
  var dl=0;
  /* vozovka s dlazebnimi kostkami (kocici hlavy) */
  fillp(s,rect(xa,768,W,700),'f-t1');
  fillp(s,rect(xa,768,W,700),'',{fill:'url(#st_settF)',opacity:.85});
  fillp(s,rect(xa,768,W,700),'',{fill:'url(#gShadeDown)',opacity:.55});
  fillp(s,rect(xa,768,W,36),'',{fill:'url(#hatchFine)',opacity:.7});
  /* odrazy lampy na mokre dlazbe */
  o.lamps.forEach(function(lx){
    var gl=fillp(s,ST.ellipse(lx,860,70,200),'',{fill:'url(#gGlow)',opacity:.38});appear(gl,.4,.38);
    d='';for(i=0;i<16;i++){var yy=784+i*i*1.3+i*8,ln=44-i*1.8;if(ln<6)break;d+=M(lx-ln/2+(r()-.5)*8,yy)+'h'+n(ln)}
    var rf=el('path',{d:d,'class':'ink thin goldl',opacity:.5},s);appear(rf,.4,.5);
  });
  /* struktura: spary, sneh nanosu, vyspravky asfaltu */
  d='';for(i=0;i<22;i++){var x=xa+r()*W,y=790+r()*480,w2=60+r()*130,h2=14+r()*30;d+=M(x,y)+'q'+n(w2*.3)+','+n(-h2)+' '+n(w2*.6)+','+n(-h2*.4)+'t'+n(w2*.4)+','+n(h2*.9)}
  ink(s,d,'hair faint',dl);
  /* poklopy kanalizace */
  d='';o.manholes.forEach(function(mx){d+=ST.ellipse(mx,940,58,20)+ST.ellipse(mx,940,46,15)+M(mx-44,940)+'h88M'+pt(mx-30,930)+'h60M'+pt(mx-30,950)+'h60M'+pt(mx,925)+'v30'});
  ink(s,d,'hair',dl);
  /* tram: vpust + obrubnik pred divakem */
  fillp(s,rect(xa,1050,W,30),'f-t3');
  fillp(s,rect(xa,1080,W,60),'f-t2');
  fillp(s,rect(xa,1080,W,60),'',{fill:'url(#hatchV)',opacity:.7});
  d=M(xa,1050)+'h'+W+M(xa,1080)+'h'+W+M(xa,1140)+'h'+W;
  for(i=xa+r()*60;i<xb;i+=120+r()*60)d+=M(i,1050)+'v90';
  ink(s,d,'thin',dl);
  /* chodnik u divaka: velka mozaika */
  fillp(s,rect(xa,1140,W,400),'f-t2');
  fillp(s,rect(xa,1140,W,400),'',{fill:'url(#st_mosB)',opacity:1});
  fillp(s,rect(xa,1140,W,400),'',{fill:'url(#gShadeDown)',opacity:.7});
  d=M(xa,1160)+'h'+W+M(xa,1190)+'h'+W;
  ink(s,d,'hair faint',dl);
  /* rozmazane silhouety v popredi */
  var fs=el('g',{filter:'url(#blurFore)'},s);
  o.poles.forEach(function(p){
    var px=p[0],tp=p[1];
    if(p[2]==='tree'){
      var tr=M(px-30,1500)+'C'+pt(px-26,1000)+' '+pt(px-40,600)+' '+pt(px-22,tp)+'L'+pt(px+22,tp)+'C'+pt(px+40,600)+' '+pt(px+28,1000)+' '+pt(px+36,1500)+'Z';
      ink(fs,tr,'dim solid',.2);
      var b='';for(i=0;i<9;i++){var bx=px-20+i*5;b+=M(bx,1400)+'q'+n((r()-.5)*14)+',-300 '+n((r()-.5)*10)+',-560'}
      ink(fs,b,'hair dim',.3);
      ink(fs,M(px+18,tp+10)+'q60,-30 120,-20M'+pt(px-18,tp+40)+'q-50,-26 -110,-30','thin dim',.3);
    }else{
      var tr2=M(px-13,1500)+'L'+pt(px-9,tp+70)+L(px+9,tp+70)+L(px+13,1500)+'Z';
      ink(fs,tr2,'dim solid',.2);
      ink(fs,rect(px-17,tp+60,34,14)+rect(px-15,tp+330,30,10)+rect(px-15,tp+700,30,10)+M(px-9,tp+74)+'q-24,-8 -30,-40M'+pt(px+9,tp+74)+'q24,-8 30,-40','thin dim',.3);
    }
  });
  return s;
}

/* ================= SESTAVENI STRANY ================= */
var planesI=[],planesE=[],trams=[],cars=[];
function side(end){
  CTX.end=end;
  var AX=end?3980:0,AY=end?360:470,pl=end?planesE:planesI,back=ST.L.back;
  var tx=end?4380:350,cx0=end?3500:-1500,cx1=end?5900:780;
  /* --- vzdalene panorama --- */
  buildFar([cx0,cx1],AX,AY,{end:end,planes:pl,seed:end?31:17,tower:tx,towerBase:640,towerH:600,church:end?4720:0,churchBase:640,cs:1.5,hill:end?5100:-780});
  /* --- stredni plan --- */
  var mB=ST.plane('mid',.5,AX,AY),mA=ST.plane('mid',.68,AX,AY);pl.push(mB,mA);
  var sB=sect(mB,cx0,cx1);
  var rowB=skylineRow(sB,cx0,cx1,646,250,420,end?47:41,{gaps:[[tx-88,tx+88,46]],cls:'ink dim t1'});
  drawRow(sB,rowB,{cls:'dim t1',winOp:.3},.1);
  /* strednim plan: cinzaky */
  var L0=end?[
    {x:3550,w:330,nF:3,roof:'mansard',shop:'grocery',wall:'t2',bal:[2],lit:.42,seed:201,pigeons:[40,54,200]},
    {x:3880,w:380,nF:4,roof:'gable',shop:'pub',wall:'t3',bal:[1,3],lit:.3,seed:202},
    {x:4500,w:290,nF:2,roof:'gable',shop:'kiosk',wall:'t1',lit:.3,seed:203,pigeons:[90,110]},
    {x:4790,w:300,nF:2,roof:'mansard',shop:'flowers',wall:'t2',lit:.3,seed:204},
    {x:5090,w:330,nF:4,roof:'attic',shop:'bakery',wall:'t3',bal:[2],lit:.3,seed:205},
    {x:5420,w:330,nF:3,roof:'mansard',shop:'passage',wall:'t2',bal:[1],lit:.3,seed:206}
  ]:[
    {x:-1560,w:330,nF:3,roof:'mansard',shop:'pub',wall:'t2',bal:[2],lit:.3,seed:101},
    {x:-1230,w:300,nF:4,roof:'gable',shop:'grocery',wall:'t3',lit:.3,seed:102},
    {x:-930,w:340,nF:3,roof:'mansard',shop:'passage',wall:'t1',bal:[1,2],lit:.3,seed:103},
    {x:-590,w:260,nF:3,roof:'attic',shop:'kiosk',wall:'t2',lit:.3,seed:104},
    {x:-330,w:300,nF:2,roof:'gable',shop:'passage',wall:'t3',bal:[1],lit:.34,seed:105,pigeons:[60,80,220]},
    {x:-30,w:280,nF:2,roof:'mansard',shop:'flowers',wall:'t2',lit:.34,seed:106},
    {x:450,w:320,nF:4,roof:'mansard',shop:'bakery',wall:'t2',bal:[2,3],lit:.4,seed:107,pigeons:[60,76,230]}
  ];
  L0.forEach(function(S){
    S.gy=660;
    S.dl=end?Math.min(.95,(S.x-3550)/2300*.9):Math.min(.95,Math.abs(S.x+150-100)/1500);
    facade(mA,S);
  });
  buildCourtyard(mA,end?4262:252,end?4498:448,660,end?.4:.1);
  /* --- hlavni rovina: chodnik, vozovka, rekvizity --- */
  var g0=end?3556:-1900,g1=end?5800:758,ch=end?[g0,4250,4950,g1]:[g0,-1200,-500,200,g1];
  for(var i=0;i<ch.length-1;i++)ground(back,ch[i],ch[i+1],end?(ch[i]-3550)/2300*.9:Math.abs(ch[i]+ch[i+1]-200)/4000,end?60+i:50+i);
  var wireY=304;
  buildWire(back,g0,g1,wireY,.2,end?[4020,4950]:[-820,230],684);
  /* tramvaj */
  var cg=el('g',{'clip-path':end?'url(#st_clipB)':'url(#st_clipA)'},back),tg=el('g',{},cg);
  var tr=buildTram(tg,1740,end?'9':'9',end?.8:.2,.6);
  trams.push({g:tg,cg:cg,end:end});
  /* auto */
  if(!end)cars.push(buildCar(back,-960,684,1,.25,5));
  /* rekvizity */
  if(!end){
    buildTree(back,-470,697,1.0,71,.3,{glow:[0,0]});
    buildTree(back,-1180,697,.85,72,.4,{n:26});
    streetDetail(sect(back,-300,0),-100,.3,RNG(3));
    buildBin(back,-250,697,.3);buildBin2(back,10,697,.3);
    buildBench(back,330,697,.2);
    buildBike(back,606,697,.3);
    buildPigeons(back,420,697,.4,3);buildPigeons(back,-130,697,.4,2);
    buildLamp(back,560,697,.1,true);
  }else{
    buildTree(back,4170,697,1.0,81,.4,{n:34});
    buildTree(back,5060,697,.92,82,.6,{n:30});
    buildBin(back,3670,697,.3);buildBin2(back,4075,697,.35);
    buildBench(back,4330,697,.4);
    buildBike(back,3805,697,.4);
    buildPigeons(back,4460,697,.5,3);
    streetDetail(sect(back,3600,3800),3690,.3,RNG(4));
    buildLamp(back,3760,697,.15,true);
  }
  /* --- popredi --- */
  if(end)buildFore(true,pl,AX,AY,3250,6000,{lamps:[3760],manholes:[4450],poles:[[3520,150,'tree']]});
  else buildFore(false,pl,AX,AY,-1900,1500,{lamps:[560],manholes:[-300],poles:[[-560,160,'lamp']]});
}

buildSky();
side(false);
side(true);
CTX.end=false;

/* plany mimo svou cast pribehu se skryji (vykon, zadne dvojite panorama) */
var stI=null,stE=null;
ST.on(function(T,time,cam){
  var hi=T>4.2,he=T<10.8,k;
  if(hi!==stI){stI=hi;for(k=0;k<planesI.length;k++)planesI[k].style.display=hi?'none':''}
  if(he!==stE){stE=he;for(k=0;k<planesE.length;k++)planesE[k].style.display=he?'none':''}
  /* tramvaje: poloha podle scrollu i casu */
  for(k=0;k<trams.length;k++){
    var tm=trams[k],vis=tm.end?(T>10.8):(T<4.2);
    if(tm.end){
      var u=(time*.02+(T-11)*70)%4800;
      tm.g.setAttribute('transform','translate('+n(4800-u)+',678)');
    }else{
      var u2=(2395+time*.02+T*160)%4000;
      tm.g.setAttribute('transform','translate('+n(745-u2)+',678)');
    }
  }
  /* mihotani lamp */
  if(!ST.reduce)for(k=0;k<glows.length;k++){
    var gw=glows[k];if(gw.s.style.display==='none')continue;
    var fv=1+.045*sin(time*.0037+gw.ph)+.03*sin(time*.0113+gw.ph*2);
    gw.c.setAttribute('opacity',(fv>1?1:fv).toFixed(3));
    gw.a.setAttribute('opacity',(.95*fv).toFixed(3));
  }
});
});
