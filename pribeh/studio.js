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

var SW=[];
function sway(g,px,py,amp,sp,ph){SW.push({g:g,px:px,py:py,amp:amp,sp:sp,ph:ph||0});return g}
var ART={
 ara:{a:'M38,12 C48,9 57,16 56,27 C56,35 50,40 44,42 C36,40 31,31 34,22 C34,16 36,13 38,12Z M34,20 C24,17 17,26 22,35 C24,39 29,37 29,32 C31,30 33,28 34,26 M44,42 C58,45 68,58 66,76 C64,87 60,93 55,97 C46,92 38,78 40,60 C40,52 41,46 44,42Z M47,50 C58,54 62,68 58,82 C50,76 44,64 47,50Z M55,96 L52,100 L58,99 L60,100 L62,92 M10,86 C30,84 60,82 92,76',
       b:cir(42,22,2.2)+' '+cir(42,22,.8)+' M36,27 C40,31 47,31 51,27 M51,56 C54,62 55,70 53,76 M55,54 C58,62 59,70 57,78 M62,80 L70,98 M60,84 L64,100 M66,78 L76,94 M46,86 L42,90 M50,88 L47,93 M70,82 C76,86 84,84 88,78 C82,76 76,78 70,82'},
 kakadu:{a:'M42,26 C42,16 50,14 56,18 C62,22 62,30 58,36 C54,40 48,40 44,36 C42,32 42,28 42,26Z M46,18 L38,4 L48,14 L50,0 L54,14 L62,4 L58,18 M42,32 C34,32 30,38 34,44 C38,46 42,42 44,38 M44,38 C38,46 36,62 42,78 L52,88 L60,84 C66,70 64,50 58,38 M48,50 C54,56 56,70 52,82 M52,88 L48,100 L56,98 L60,100 L60,86',
       b:cir(52,26,1.8)+' M46,22 L56,22 M52,38 L50,46 M60,48 C62,56 62,66 60,74 M8,90 L92,84 M54,86 L52,92 M58,86 L58,92 M44,10 L46,16 M52,6 L52,13'},
 archangel:{a:'M50,5 C46,5 43,8 43,12 C43,16 46,19 50,19 C54,19 57,16 57,12 C57,8 54,5 50,5Z M44,24 C40,40 38,70 34,92 L66,92 C62,70 60,40 56,24 C54,22 46,22 44,24Z M44,30 C28,14 10,16 4,34 C8,52 20,66 30,76 C34,60 38,44 44,30Z',
       b:'M44,34 C48,44 52,44 56,34 M44,50 C46,70 44,84 40,92 M56,50 C54,70 56,84 60,92 M50,46 V92 M10,30 C20,34 28,44 32,60 M8,40 C16,46 24,56 28,68 M18,22 C24,30 30,40 36,52 M14,26 C20,30 24,36 28,44 M47,14 C45,18 46,22 48,24 M52,8 C56,10 57,14 55,17'},
 rose:{a:'M50,28 C36,28 28,40 32,52 C36,64 52,66 62,58 C72,48 68,32 56,28 C50,26 44,32 44,40 C44,46 50,48 54,44 C58,40 54,36 50,38 M32,52 C22,50 20,38 28,32 M62,58 C74,60 80,48 74,38 M38,62 C40,70 50,72 58,66 M50,66 C48,80 50,90 50,98 M50,82 C38,80 28,84 22,92 C34,94 46,90 50,82Z M50,76 C60,72 72,74 78,82 C68,86 56,84 50,76Z',
       b:'M34,44 C38,40 42,40 46,44 M56,40 C62,40 66,44 66,50 M40,56 C46,60 54,60 58,56 M30,36 C26,30 26,24 30,20 M50,90 L46,87 M50,86 L54,83 M30,88 C38,86 44,84 48,82'},
 lotus:{a:'M50,78 C62,66 62,40 50,24 C38,40 38,66 50,78Z M50,78 C68,76 84,62 86,40 C70,42 58,56 50,78Z M50,78 C32,76 16,62 14,40 C30,42 42,56 50,78Z M50,80 C70,86 92,78 98,60 C80,60 62,68 50,80Z M50,80 C30,86 8,78 2,60 C20,60 38,68 50,80Z',
        b:'M50,72 L50,38 M52,74 C60,64 72,54 78,48 M48,74 C40,64 28,54 22,48 M54,80 C66,76 82,70 90,64 M46,80 C34,76 18,70 10,64 M10,90 Q30,84 50,90 Q70,96 90,90 M26,97 Q50,92 74,97'},
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
ART.archangel.a+=' '+X('M44,30 C28,14 10,16 4,34 C8,52 20,66 30,76 C34,60 38,44 44,30Z',50,50,1,0,-1);ART.archangel.b+=' '+X('M10,30 C20,34 28,44 32,60 M8,40 C16,46 24,56 28,68 M18,22 C24,30 30,40 36,52 M14,26 C20,30 24,36 28,44',50,50,1,0,-1);ART.feather=featherArt();ART.daisy=daisyArt();
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
  var d=[],kn=[],gr=[],nl=[],r,x;
  d.push('M'+fa+',707 H'+fb+' M'+fa+',714 H'+fb);
  for(r=0;r<3;r++){var rg=rng(31+r*7),yy=[700,707,714,722][r],yh=[700,707,714,722][r+1];
    for(x=800+rg()*160;x<3520;x+=140+rg()*110){if(x>fa&&x<fb){d.push('M'+n1(x)+','+yy+' V'+yh);nl.push(cir(x-2.5,yy+2,.55),cir(x+2.5,yh-2,.55))}}
    var rk=rng(77+r);for(x=820+rk()*260;x<3520;x+=300+rk()*380){if(x>fa&&x<fb){var ky=(yy+yh)/2;kn.push(ell(x,ky,3.4,1.7),ell(x,ky,1.7,.8))}}
    var rw=rng(5+r*3+Math.floor(fa));gr.push(ST.wline(fa,fb,(yy+yh)/2,.5,22,rw))}
  D(g,d.join(' '),'hair dim',a,b);D(g,kn.join(' '),'hair dim',a,b);D(g,gr.join(' '),'hair faint',a,b);D(g,nl.join(' '),'hair dim',a,b);
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
  var vg=sway(G(g),2133,146,5,.0006,3);art(vg,'swallow',2133,106,.3,0,1,A,B,'thin','hair');
}

/* ---------- stena interieru, strop, podlaha ---------- */
function shellPart(i,a,b,z0,z1){
  zone(z0,z1);var g=sec('back',i),wa=Math.max(a,890),wb=Math.min(b,3420),x,d,e;
  if(wb>wa){
    FILL(g,R(wa,240,wb-wa,460),'t1',0,.8);
    FILL(g,R(wa,252,wb-wa,448),'hair',0,.8,{fill:STIP});
    FILL(g,R(wa,252,wb-wa,22),'hair',.1,.9,{fill:HF});
    /* obklad (wainscot), sokl, lista */
    d=[];e=[];var dmn=[],bd=[];for(x=Math.ceil(wa/62)*62;x<wb-50;x+=62){d.push(rr(x+3,611,48,58));e.push(rr(x+8,616,38,48));dmn.push('M'+(x+27)+',631 l5,7 l-5,7 l-5,-7Z M'+(x+27)+',633 v10')}
    for(x=Math.ceil(wa/9)*9;x<wb;x+=9)bd.push(cir(x,681,.7));
    D(g,'M'+wa+',603 H'+wb+' M'+wa+',609 H'+wb,'thin',.1,.9);D(g,d.join(''),'hair',.1,.9);D(g,e.join(''),'hair faint',.1,.9);D(g,dmn.join(' '),'hair dim',.1,.9);D(g,bd.join(' '),'hair dim',.1,.9);
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

/* ---------- rostliny a susene kvetiny ---------- */
function lf(px,py,ux,uy,len,w){var nx=-uy,ny=ux;return 'M'+n1(px)+','+n1(py)+' Q'+n1(px+ux*len*.5+nx*w)+','+n1(py+uy*len*.5+ny*w)+' '+n1(px+ux*len)+','+n1(py+uy*len)+' Q'+n1(px+ux*len*.5-nx*w)+','+n1(py+uy*len*.5-ny*w)+' '+n1(px)+','+n1(py)+'Z'}
function monsteraLeaf(x,y,L,W,ang,seed){
  var a=ang*PI/180,ca=cos(a),sa=sin(a),pts=[],i,sl=[.2,.36,.52,.68,.82],vn=[];
  var sx=W/16,sy=L/29;
  function P(lx,ly){var X=lx*sx,Y=(ly-5)*sy;return [x+X*ca-Y*sa,y+X*sa+Y*ca]}
  function S(p){return n1(p[0])+','+n1(p[1])}
  for(i=0;i<=140;i++){var t=i/140*2*PI,hx=16*Math.pow(sin(t),3),hy=13*cos(t)-5*cos(2*t)-2*cos(3*t)-cos(4*t),h=(hy+17)/29;
    for(var k=0;k<sl.length;k++){var dd=Math.abs(h-sl[k]);if(dd<.035&&Math.abs(hx)>2)hx*=.1+.9*dd/.035}
    pts.push(S(P(hx,hy)))}
  vn.push('M'+S(P(0,5))+' L'+S(P(0,-16)));
  for(k=0;k<sl.length;k++){var hy2=-17+sl[k]*29;vn.push('M'+S(P(0,hy2+4))+' L'+S(P(11*(1-Math.abs(sl[k]-.4)*.6),hy2))+' M'+S(P(0,hy2+4))+' L'+S(P(-11*(1-Math.abs(sl[k]-.4)*.6),hy2)))}
  return {a:'M'+pts.join(' L')+'Z',b:vn.join(' ')}}
function monstera(g,cx,A,B,pot0){
  var pot=sway(G(pot0),cx,646,1.1,.0007,1);
  var lv=[[-34,-96,52,28,-35],[-8,-136,56,30,8],[26,-114,50,27,38],[-20,-58,40,22,-62],[14,-64,40,22,58],[-2,-186,44,24,-12]],S=[];
  lv.forEach(function(l){var bx=cx+l[0],by=646+l[1];S.push('M'+n1(cx+(l[0]>0?3:-3))+',648 C'+n1(cx+l[0]*.1)+','+n1(by+60)+' '+n1(bx-l[0]*.1)+','+n1(by+40)+' '+n1(bx)+','+n1(by))});
  D(pot,S.join(' '),'thin',A,B);
  lv.forEach(function(l,k){var m=monsteraLeaf(cx+l[0],646+l[1],l[2],l[3],l[4],k+5);D(pot,m.a,'thin t2',A+.05*k,B);FILL(pot,m.a,'hair',A+.05*k,B,{fill:HF});D(pot,m.b,'hair',A+.05*k,B)});
}
function dried(g,x,y,n,seed,len,dir,A,B){
  var r=rng(seed),st=[],hd=[],dt=[],i,hs=[];
  var hmark=0;
  for(i=0;i<n;i++){var sp=(i/(n-1)-.5)*1.5+(r()-.5)*.25,L=len*(.7+r()*.3),ex=x+sin(sp)*L,ey=y+dir*cos(sp)*L,ux=sin(sp),uy=dir*cos(sp),ty=r(),
      cx2=x+sin(sp)*L*.4+(r()-.5)*6;
    var h0=hd.length;st.push('M'+n1(x)+','+n1(y)+' Q'+n1(cx2)+','+n1(y+dir*L*.55)+' '+n1(ex)+','+n1(ey));
    if(ty<.3){for(var k=0;k<6;k++){var px=ex+ux*k*4.5,py=ey+uy*k*4.5;hd.push(lf(px,py,ux,uy,7,2.4));dt.push('M'+n1(px)+','+n1(py)+' L'+n1(px+ux*9+uy*(-4))+','+n1(py+uy*9+ux*4))}}
    else if(ty<.55){for(var k2=0;k2<7;k2++){var px2=ex-ux*k2*3.4,py2=ey-uy*k2*3.4;hd.push(cir(px2+(k2%2?2.2:-2.2),py2,1.5))}}
    else if(ty<.8){hd.push(cir(ex,ey,3.4));dt.push('M'+n1(ex-3)+','+n1(ey-1)+' H'+n1(ex+3)+' M'+n1(ex)+','+n1(ey-3)+' V'+n1(ey+1))}
    else{hd.push(lf(ex-ux*8,ey-uy*8,ux,uy,24,5.5));dt.push('M'+n1(ex-ux*4)+','+n1(ey-uy*4)+' L'+n1(ex+ux*14)+','+n1(ey+uy*14)+' M'+n1(ex+ux*2+uy*2)+','+n1(ey+uy*2-ux*2)+' L'+n1(ex+ux*12+uy*4)+','+n1(ey+uy*12-ux*4))}
    hs.push(hd.slice(hmark).join(' '));hmark=hd.length}
  var gg=sway(G(g),x,y,1.6,.0011,seed);D(gg,st.join(' '),'thin',A,B);hs.forEach(function(h){D(gg,h,'hair t3',A,B)});D(gg,dt.join(' '),'hair',A,B);
}
function vase(g,x,y,w,h,A,B,kind){
  var d;if(kind===1)d='M'+(x-w*.3)+','+y+' C'+(x-w*.6)+','+(y-h*.3)+' '+(x-w*.5)+','+(y-h*.7)+' '+(x-w*.18)+','+(y-h*.86)+' L'+(x-w*.16)+','+(y-h)+' H'+(x+w*.16)+' L'+(x+w*.18)+','+(y-h*.86)+' C'+(x+w*.5)+','+(y-h*.7)+' '+(x+w*.6)+','+(y-h*.3)+' '+(x+w*.3)+','+y+'Z';
  else d='M'+(x-w*.4)+','+y+' L'+(x-w*.5)+','+(y-h*.7)+' Q'+(x-w*.5)+','+(y-h)+' '+(x-w*.3)+','+(y-h)+' H'+(x+w*.3)+' Q'+(x+w*.5)+','+(y-h)+' '+(x+w*.5)+','+(y-h*.7)+' L'+(x+w*.4)+','+y+'Z';
  D(g,d,'thin t3',A,B);D(g,'M'+(x-w*.44)+','+(y-h*.5)+' H'+(x+w*.46)+' M'+(x-w*.42)+','+(y-h*.4)+' H'+(x+w*.44),'hair gold',A,B);
}
function potos(g,x,y,A,B,id){
  var r=rng(id),st=[],hl=[],k,gp=sway(G(g),x,y-14,1.5,.0009,id);
  D(gp,'M'+(x-14)+','+y+' L'+(x-11)+','+(y-18)+' H'+(x+11)+' L'+(x+14)+','+y+'Z','ink t3',A,B);D(gp,'M'+(x-13)+','+(y-12)+' H'+(x+13),'hair gold',A,B);
  for(k=0;k<7;k++){var sx=x-12+k*4,len=40+r()*70,sw=(r()-.5)*24,p='M'+sx+','+(y-16)+' C'+(sx-4)+','+(y-4)+' '+(sx+sw)+','+(y+8)+' '+(sx+sw*.6)+','+(y+len*.5);
    p+=' S'+(sx+sw*1.1)+','+(y+len*.9)+' '+(sx+sw*.8)+','+(y+len);st.push(p);
    for(var j=0;j<4+Math.floor(r()*3);j++){var ty=y+8+j*len/5+r()*6,tx=sx+sw*(ty-y)/len*.9,sd=(j%2?1:-1);
      hl.push('M'+n1(tx)+','+n1(ty)+' C'+n1(tx+sd*9)+','+n1(ty-3)+' '+n1(tx+sd*10)+','+n1(ty+10)+' '+n1(tx+sd*1)+','+n1(ty+13)+' C'+n1(tx-sd*1)+','+n1(ty+9)+' '+n1(tx-sd*1)+','+n1(ty+3)+' '+n1(tx)+','+n1(ty)+'Z')}}
  D(gp,st.join(' '),'thin',A,B);hl.forEach(function(h){D(gp,h,'hair t2',A,B)});
  return {g:gp,x:x,y:y-14};
}

/* ---------- lustr, zavesna svetla ---------- */
function pendant(x,yb,A,B){
  var g0=secAt('room',x),gl=secAt('light',x),g=sway(G(g0),x,240,1.1,.0008,x);zx(x);
  D(g,'M'+x+',240 V'+(yb-26),'thin',A,B);D(g,R(x-3.5,yb-28,7,6,1),'thin gold',A,B);D(g,R(x-12,238,24,4,1),'thin t3',A,B);
  D(g,'M'+(x-20)+','+yb+' C'+(x-20)+','+(yb-12)+' '+(x-10)+','+(yb-22)+' '+x+','+(yb-24)+' C'+(x+10)+','+(yb-22)+' '+(x+20)+','+(yb-12)+' '+(x+20)+','+yb+'Z','ink t3',A,B);
  D(g,'M'+(x-8)+','+(yb-22)+' Q'+(x-12)+','+(yb-8)+' '+(x-13)+','+yb+' M'+x+','+(yb-24)+' V'+yb+' M'+(x+8)+','+(yb-22)+' Q'+(x+12)+','+(yb-8)+' '+(x+13)+','+yb,'hair',A,B);
  D(g,ell(x,yb,20,3.2),'thin',A,B);
  FO(g,cir(x,yb+4,4),'f-goldl',.95,A,B);
  var gw=sway(el('path',{d:cir(x,yb+6,76),fill:'url(#gGlow)'},gl),x,240,1.1,.0008,x),t=tt(A,B);ST.fade(gw,t[0],t[1],.6);
  return gw;
}

/* ---------- vstup: veshak, rohozka, pohovka, kocka, zrcadlo, obrazy ---------- */
function entryZone(){
  zone(1.9,3.0);var g=sec('room',0),k,d;
  /* rohozka */
  D(g,'M898,704 H984 L990,720 H892Z','thin t3',0,.2);FILL(g,'M898,704 H984 L990,720 H892Z','hair',0,.2,{fill:HV});D(g,'M902,708 H980 L984,716 H896Z','hair',0,.2);
  /* pohovka chesterfield */
  var x0=975,x1=1275;
  d=[];[985,1008,1242,1262].forEach(function(f){d.push(R(f,672,12,28,4))});
  D(g,d.join(''),'thin t3',.05,.25);D(g,'M985,682 h12 M1008,682 h12 M1242,682 h12 M1262,682 h12 M985,692 h12 M1262,692 h12','hair',.05,.25);
  D(g,R(1013,634,224,40,4),'ink t3',.05,.3);
  d=[];for(k=1019;k<1232;k+=14)d.push('M'+k+',640 Q'+(k+3)+',656 '+k+',672');D(g,d.join(' '),'hair',.1,.3);
  d=[];for(k=1020;k<1232;k+=9){d.push(cir(k,638,1),cir(k,670,1))}D(g,d.join(' '),'hair gold',.1,.3);
  D(g,R(1001,544,248,66,16),'ink t3',.1,.4);
  /* prosiv zad */
  var bt=[],ln=[],c0=[],c1=[];for(k=0;k<8;k++)c0.push(1019+30*k);for(k=0;k<7;k++)c1.push(1034+30*k);
  c0.forEach(function(x,i){bt.push(cir(x,562,1.8));ln.push('M'+x+',562 Q'+(x+8)+',576 '+(x+15)+',586');if(i>0)ln.push('M'+x+',562 Q'+(x-8)+',576 '+(x-15)+',586');
    ln.push('M'+x+',562 L'+(x+(i<7?15:-15))+',548 M'+x+',562 L'+(x-(i>0?15:-15))+',548')});
  c1.forEach(function(x){bt.push(cir(x,586,1.8));ln.push('M'+x+',586 L'+(x+15)+',604 M'+x+',586 L'+(x-15)+',604')});
  D(g,ln.join(' '),'hair',.15,.45);D(g,bt.join(' '),'thin t1',.2,.45);
  D(g,'M1017,548 Q1125,543 1233,548','hair',.15,.4);
  /* sedak */
  D(g,R(1013,606,112,30,8),'ink t3',.15,.45);D(g,R(1125,606,112,30,8),'ink t3',.15,.45);
  D(g,'M1019,611 H1119 M1131,611 H1231','hair',.2,.45);
  FILL(g,R(1013,628,224,8),'hair',.2,.45,{fill:HF});
  /* operky */
  [[x0,0],[x1-38,1]].forEach(function(a){var ax=a[0];
    D(g,R(ax,566,38,106,13),'ink t3',.2,.5);D(g,cir(ax+19,580,11),'thin t2',.25,.5);D(g,cir(ax+19,580,6),'hair',.25,.5);
    D(g,'M'+(ax+8)+',598 Q'+(ax+19)+',604 '+(ax+30)+',598','hair',.25,.5);
    var bb=[],ll=[];for(var j=0;j<3;j++){bb.push(cir(ax+19,616+j*22,1.8));ll.push('M'+(ax+19)+','+(616+j*22)+' L'+(ax+8)+','+(606+j*22)+' M'+(ax+19)+','+(616+j*22)+' L'+(ax+30)+','+(606+j*22))}
    D(g,ll.join(' '),'hair',.25,.5);D(g,bb.join(' '),'thin t1',.25,.5);
    FILL(g,R(ax+(a[1]?0:22),568,16,104),'hair',.3,.5,{fill:HF});
  });
  /* polstare */
  var pl=G(g,'translate(1050,584) rotate(-14)');
  D(pl,'M-22,-24 Q0,-29 22,-24 Q27,0 22,22 Q0,27 -22,22 Q-27,0 -22,-24Z','ink t2',.3,.55);
  D(pl,'M-24,-8 Q0,-3 24,-8 M-25,6 Q0,11 25,6','thin gold',.35,.55);D(pl,'M-18,-20 Q-10,-8 -18,2 M18,-18 Q10,-6 18,6','hair',.35,.55);
  D(pl,'M-22,-24 L-26,-30 M22,-24 L27,-30 M-22,22 L-27,28 M22,22 L28,28','hair',.35,.55);
  var pr=G(g,'translate(1213,588) rotate(11)');
  D(pr,'M-21,-22 Q0,-27 21,-22 Q26,0 21,21 Q0,26 -21,21 Q-26,0 -21,-22Z','ink t2',.3,.55);
  art(pr,'daisy',0,-1,.3,0,1,.35,.55,'thin','hair');D(pr,'M-16,-16 L-8,-8 M16,-16 L8,-8 M-16,16 L-8,8 M16,16 L8,8','hair',.35,.55);
  /* ponozka za gaucem (velikonocni vajicko) */
  D(g,'M1100,700 V690 C1100,686 1108,686 1108,690 V694 C1114,694 1122,696 1122,700Z','thin t2',.5,.7);D(g,'M1100,692 H1108 M1100,696 H1108','hair gold',.55,.7);
  /* zrcadlo */
  D(g,ell(1125,452,42,68),'ink t3',.4,.7);D(g,ell(1125,452,36,62),'thin solid',.45,.7);
  D(g,'M1108,420 L1130,392 M1104,432 L1138,396 M1100,444 L1112,432 M1136,500 L1146,488','hair faint',.5,.8);
  FO(g,ell(1125,452,36,62),'f-gold',.07,.5,.8);
  D(g,'M1103,386 Q1113,372 1125,382 Q1137,372 1147,386 M1125,382 V372 M1120,372 Q1125,362 1130,372','thin',.45,.75);D(g,cir(1125,368,2.6),'thin gold',.5,.75);
  D(g,'M1125,520 Q1118,528 1125,538 Q1132,528 1125,520Z','thin t3',.5,.75);
  /* obrazy */
  frame(g,995,404,60,80,'peony',.5,.85);frame(g,1190,392,56,70,'swallow',.55,.9);frame(g,1192,472,52,44,'wave',.6,.95);
  frame(g,990,282,44,56,'moon',.55,.9);frame(g,1140,292,50,58,'rose',.6,.95);
  /* flash listy na snure */
  D(g,'M1232,272 Q1285,284 1338,272','thin',.5,.75);D(g,cir(1232,272,1.8)+cir(1338,272,1.8),'hair gold',.5,.75);
  [[1238,'sprig'],[1276,'swallow'],[1314,'daisy']].forEach(function(f,i){var sx=f[0];
    D(g,R(sx,280,28,40),'thin t2',.6+i*.05,.95);art(g,f[1],sx+14,300,.26,i===1?-8:0,1,.65+i*.05,.95,'hair','hair');D(g,R(sx+11,276,6,10,1),'thin t3',.6,.9)});
  /* susene kvetiny na zdi */
  D(g,'M956,270 V282','thin',.6,.9);dried(g,956,282,9,17,60,1,.6,1);
  /* veshak */
  var rk=G(g,'translate(10,0)');
  D(rk,'M930,672 Q914,690 902,700 M930,672 Q946,690 958,700 M930,672 V700','thin',.4,.7);D(rk,ell(930,672,7,2.6),'thin t3',.4,.7);D(rk,cir(902,699,1.8)+cir(958,699,1.8),'hair',.4,.7);
  D(rk,R(928,382,4,294),'thin t3',.4,.8);D(rk,'M928,540 h4 M928,520 h4 M928,600 h4','hair',.5,.8);
  D(rk,'M930,392 Q918,392 914,382 M930,392 Q942,392 946,382 M930,420 Q914,420 910,408 M930,420 Q946,420 950,408','thin',.5,.85);
  D(rk,cir(914,381,2.2)+cir(946,381,2.2)+cir(910,407,2.2)+cir(950,407,2.2),'thin gold t1',.55,.85);
  /* kabat */
  D(rk,'M914,388 C906,389 898,394 894,404 L889,548 C902,555 926,555 939,548 L934,404 C930,394 922,389 914,388Z','ink t2',.55,.9);
  FILL(rk,'M914,392 L934,404 L939,548 L920,552Z','hair',.6,.9,{fill:HF});
  D(rk,'M914,376 V386 M914,376 Q914,372 918,372','thin',.55,.9);D(rk,'M893,405 L914,392 L935,405','hair',.6,.9);
  D(rk,'M904,392 L914,410 L924,392 M914,410 V552 M890,468 Q914,474 938,468 M898,490 h14 M918,490 h14 M896,404 L891,524','hair',.6,.95);
  D(rk,cir(909,430,1.4)+cir(909,448,1.4)+cir(909,508,1.4)+cir(919,430,1.4),'hair',.65,.95);
  /* klobouk */
  D(rk,'M916,372 C915,352 945,352 944,372','ink t2',.6,.95);D(rk,ell(930,372,24,5),'thin t3',.6,.95);D(rk,'M916,367 Q930,372 944,367','thin',.65,.95);D(rk,'M941,362 C950,358 954,350 952,344','hair gold',.7,.95);
  /* satka */
  D(rk,'M946,384 C954,392 954,420 950,452 L942,452 C945,420 944,396 942,388Z','thin t3',.65,.95);D(rk,'M944,402 h8 M943,414 h8 M943,426 h8 M942,438 h8','hair gold',.7,.95);D(rk,'M944,452 v6 M947,452 v7 M950,452 v6','hair',.7,.95);
  /* destnik */
  D(rk,'M960,430 V418 Q960,408 952,408 Q948,408 948,412','thin',.65,.95);D(rk,'M956,456 C954,500 956,560 958,596 L962,596 C964,560 966,500 964,456Z','thin t2',.65,.95);D(rk,'M959,460 L958,590 M962,460 L963,590','hair',.7,.95);
  /* monstera */
  var mp=G(g);
  D(mp,'M1282,650 L1288,700 H1326 L1332,650Z','ink t3',.5,.8);D(mp,R(1278,642,58,10,3),'thin t3',.5,.8);D(mp,'M1284,664 H1330 M1286,680 H1328','hair gold',.55,.85);FILL(mp,'M1284,652 L1288,700 H1326 L1330,652Z','hair',.55,.85,{fill:HV});
  monstera(g,1307,.55,.95,mp);
  D(mp,'M1284,646 Q1307,640 1330,646','hair',.5,.8);
  pendant(1085,330,.7,1);zone(1.9,3.0);
}
entryZone();

/* ---------- knihy, lahvicky ---------- */
function books(g,x0,x1,yb,seed,hmin,hmax,A,B){
  var r=rng(seed),x=x0,b=[[],[],[]],bands=[],gold=[];
  while(x<x1-5){var w=5+r()*8,h=hmin+r()*(hmax-hmin);if(x+w>x1)w=x1-x;
    b[Math.floor(r()*3)].push(rr(n1(x),n1(yb-h),n1(w),n1(h)));
    if(r()<.5)bands.push('M'+n1(x)+','+n1(yb-h+4)+' h'+n1(w)+' M'+n1(x)+','+n1(yb-4-r()*4)+' h'+n1(w));
    if(r()<.3)gold.push('M'+n1(x+1.5)+','+n1(yb-h*.55)+' h'+n1(w-3));
    x+=w+(r()<.1?3+r()*9:0)}
  D(g,b[0].join(''),'hair t1',A,B);D(g,b[1].join(''),'hair t2',A,B);D(g,b[2].join(''),'hair t3',A,B);D(g,bands.join(' '),'hair',A,B);D(g,gold.join(' '),'hair gold',A,B);
}
function bottles(g,x0,x1,yb,seed,A,B){
  var r=rng(seed),x=x0,pl=[],gd=[],lb=[],cap=[],lq=[];
  while(x<x1-6){var w=8+r()*8,h=18+r()*22;if(x+w>x1)break;
    var d='M'+n1(x)+','+yb+' V'+n1(yb-h*.62)+' Q'+n1(x)+','+n1(yb-h*.7)+' '+n1(x+w*.32)+','+n1(yb-h*.76)+' V'+n1(yb-h)+' H'+n1(x+w*.68)+' V'+n1(yb-h*.76)+' Q'+n1(x+w)+','+n1(yb-h*.7)+' '+n1(x+w)+','+n1(yb-h*.62)+' V'+yb+'Z';
    (r()<.4?gd:pl).push(d);cap.push('M'+n1(x+w*.28)+','+n1(yb-h-3)+' h'+n1(w*.44)+' v3');
    lb.push('M'+n1(x+1)+','+n1(yb-h*.5)+' h'+n1(w-2)+' v'+n1(h*.2)+' h'+n1(2-w)+'Z');lq.push('M'+n1(x+1.2)+','+n1(yb-h*.58)+' H'+n1(x+w-1.2));
    x+=w+1.5+r()*5}
  D(g,pl.join(''),'thin t2',A,B);D(g,gd.join(''),'thin gold t1',A,B);D(g,cap.join(' '),'thin',A,B);D(g,lb.join(''),'hair',A,B);D(g,lq.join(' '),'hair dim',A,B);
}

/* ---------- zidle (Thonet) ---------- */
function chair(g){
  D(g,'M1356,700 L1358,640 C1356,600 1348,540 1345,468 L1352,468 C1354,540 1360,600 1364,640 L1362,700Z','ink t3',.2,.5);
  D(g,'M1345,468 C1343,458 1352,455 1358,461 C1362,465 1360,470 1352,468','thin t3',.25,.5);D(g,'M1346,486 C1347,474 1352,470 1358,470','hair',.3,.5);
  D(g,'M1349,520 L1351,540 M1351,580 L1354,600','hair',.3,.5);
  D(g,'M1414,619 H1421 L1427,700 H1421Z','ink t3',.2,.5);D(g,'M1416,640 h8 M1417,652 h8 M1418,664 h8','hair',.3,.5);
  D(g,'M1363,664 H1418 M1361,684 H1421','thin',.3,.5);D(g,'M1364,676 C1380,682 1400,682 1418,676','hair',.3,.5);
  D(g,R(1352,606,74,8,3),'ink t3',.25,.55);D(g,R(1356,614,66,5,2),'thin t3',.3,.55);
  var cn=[];for(var x=1358;x<1424;x+=6)cn.push('M'+x+',607.5 l4,5');D(g,cn.join(' '),'hair faint',.3,.55);
}

/* ---------- stul, deska, drobnosti ---------- */
function deskZone(){
  zone(1.9,3.0);var gr=sec('room',1),gf=sec('front',1),gl=sec('light',1),gd=sec('room',1),k,d,x;
  /* koberec */
  D(gr,'M1372,704 H1808 L1826,720 H1354Z','ink t3',.1,.4);FILL(gr,'M1372,704 H1808 L1826,720 H1354Z','hair',.1,.4,{fill:STIP});
  D(gr,'M1384,707 H1796 L1810,717 H1370Z','hair',.15,.45);d=[];for(k=0;k<9;k++){var cx=1430+k*54;d.push('M'+(cx-20)+',712 L'+cx+',707.8 L'+(cx+20)+',712 L'+cx+',716.2Z')}
  D(gr,d.join(' '),'hair',.15,.45);D(gr,d.map(function(s,i){return cir(1430+i*54,712,1.3)}).join(' '),'hair gold',.2,.45);
  d=[];for(k=0;k<8;k++)d.push('M'+(1372-k*2.3)+','+(704+k*2)+' l-6,.6 M'+(1808+k*2.3)+','+(704+k*2)+' l6,.6');D(gr,d.join(' '),'hair',.2,.45);
  /* zidle */
  chair(G(gr));var ch2=G(gr,'translate(3150,0) scale(-1,1)');chair(ch2);
  /* galerie na zdi */
  frame(gr,1345,270,62,80,'ara',.5,.8);frame(gr,1418,262,84,60,'wave',.55,.85);art(gr,'ara',1490,277,.17,0,1,.6,.9,'hair','hair');frame(gr,1418,332,52,72,'fox',.6,.9);frame(gr,1482,332,56,60,'colibri',.65,.95);
  frame(gr,1618,266,74,92,'moon',.5,.8);frame(gr,1704,284,56,74,'peony',.55,.85);frame(gr,1770,262,40,56,'feather',.6,.9);
  frame(gr,1636,372,46,54,'kakadu',.65,.95);frame(gr,1700,368,52,56,'swallow',.7,1);
  /* lustr */
  pendant(1577,336,.7,1);zone(1.9,3.0);

  /* ===== stul (vrstva front) ===== */
  D(gf,'M1484,605 H1490 L1482,700 H1476Z M1506,605 H1512 L1520,700 H1514Z M1642,605 H1648 L1640,700 H1634Z M1664,605 H1670 L1678,700 H1672Z','ink t1',.1,.4);
  D(gf,'M1480,664 H1517 M1638,664 H1675 M1479,682 L1517,646 M1517,682 L1479,646','hair',.15,.4);
  D(gf,R(1478,600,42,5,1)+R(1634,600,42,5,1),'thin t3',.1,.4);D(gf,R(1473,698,12,3,1)+R(1511,698,12,3,1)+R(1631,698,12,3,1)+R(1669,698,12,3,1),'hair',.15,.4);
  D(gf,R(1446,588,258,12,2),'ink t3',0,.35);
  D(gf,ST.wline(1450,1700,594,.8,16,rng(3)),'hair',.05,.4);D(gf,'M1450,590 H1700','hair faint',.05,.4);
  FILL(gf,R(1446,600,258,12),'hair',.1,.4,{fill:HF});
  /* pen display (Cintiq) na nastavitelnem stojanu */
  D(gd,R(1500,466,154,120,5),'ink solid',.3,.6);D(gd,R(1504,470,146,112,3),'hair',.35,.6);
  D(gd,R(1508,474,138,110),'thin t1',.3,.6);
  D(gd,R(1510,586,22,3,1)+R(1622,586,22,3,1),'thin t3',.4,.6);D(gd,cir(1500,530,3.4)+cir(1654,530,3.4),'thin gold t1',.4,.65);D(gd,'M1500,530 H1496 M1654,530 H1658','hair',.4,.65);
  D(gd,R(1501,490,4,7,1)+R(1501,500,4,7,1)+R(1501,510,4,7,1)+R(1501,520,4,7,1),'hair',.4,.65);FO(gd,cir(1650,471,1.5),'f-goldl',.9,.5,.8);
  var ui=[],ui2=[],ui3=[],q;ui.push('M1508,481 H1646 M1508,577 H1646');
  for(q=0;q<7;q++){ui2.push(R(1512,486+q*11,9,9,2));ui3.push('M1514,'+(490+q*11)+' l5,0')}
  for(q=0;q<5;q++){ui2.push(R(1624,486+q*13,18,10,1));ui3.push('M1626,'+(493+q*13)+' h8')}
  ui.push('M1622,484 V560 M1511,570 H1560 M1584,570 H1616');ui3.push(cir(1560,570,2)+cir(1600,570,2));
  d=[];for(q=0;q<8;q++)d.push('M'+(1512+q*10)+',477.6 h6');
  [ui.join(' '),ui2.join(''),ui3.join(' '),d.join(' ')].forEach(function(s){FO(gd,s,'ink hair',.5,.4,.7)});
  ST.uiHl=FO(gd,R(1623,485,20,12,1),'f-goldl',.18,.5,.7);
  var tw0=tt(.4,.8),dg=el('path',{d:ell(1577,529,92,74),fill:'url(#gGlow)'},gl);ST.fade(dg,tw0[0],tw0[1],.28);
  var dg2=el('path',{d:ell(1577,588,78,5),fill:'url(#gGlow)'},gf);ST.fade(dg2,tw0[0],tw0[1],.5);
  ST.slot('board',el('g',{transform:'translate(1577,557) scale(.33)'},gd));
  ST.cur=FO(gd,'M-3,0 H3 M0,-3 V3 '+cir(0,0,2.4),'ink hair goldl',.8,.7,.9);
  /* lampicka vlevo */
  D(gf,R(1448,583,22,5,2),'thin t3',.4,.7);D(gf,'M1458,583 L1454,530 L1458,530 L1462,583Z','thin t3',.45,.7);D(gf,'M1455,531 L1472,500 L1475,502 L1458,533Z','thin t3',.45,.7);
  D(gf,cir(1456,531,3.2),'thin gold t1',.5,.75);D(gf,cir(1473,501,2.6),'thin gold t1',.5,.75);
  var lh=G(gf,'translate(1476,498) rotate(-42)');D(lh,'M-13,10 C-14,-9 14,-9 13,10Z','ink t3',.5,.8);D(lh,'M-8,6 Q0,-6 8,6','hair',.5,.8);D(lh,ell(0,10,13,2.4),'thin',.5,.8);FO(lh,cir(0,10,3.4),'f-goldl',.9,.55,.8);
  var lg=el('path',{d:cir(1496,514,48),fill:'url(#gGlow)'},gl),tw=tt(.6,.9);ST.fade(lg,tw[0],tw[1],.4);
  /* kelimek na tuzky a hrnek */
  D(gf,'M1471,588 L1470,566 H1482 L1481,588Z','ink t3',.55,.8);D(gf,'M1471,576 H1481','hair gold',.6,.8);
  d=[];[[1473,540],[1475,534],[1478,544],[1480,538]].forEach(function(p2,i){d.push('M'+(1472+i*3)+',566 L'+p2[0]+','+p2[1])});D(gf,d.join(' '),'thin',.6,.85);D(gf,'M1473,540 l-1,-5 M1478,544 l1,-4','hair gold',.65,.85);
  D(gf,'M1485,588 V568 H1499 V588Z','ink t3',.55,.85);D(gf,'M1485,574 Q1480,574 1480,579 Q1480,584 1485,583','thin',.55,.85);D(gf,ell(1492,568,7,1.8),'thin t1',.6,.85);D(gf,'M1485,578 H1499','hair gold',.6,.85);
  ST.steamMug=[];for(k=0;k<3;k++)ST.steamMug.push(FO(gf,'M0,0 C-4,-7 4,-12 0,-19 C-3,-24 3,-28 0,-34','ink hair',.7,.8,1));
  D(gf,'M1612,586 L1644,585.5','thin',.65,.85);D(gf,'M1642,584.8 L1650,585.5','hair gold',.65,.85);
  /* pocitac (vrstva room, za postavami) */
  D(gr,R(1660,538,44,32,2),'ink solid',.5,.8);D(gr,R(1663,541,38,25),'thin t1',.5,.8);
  art(gr,'ara',1674,553,.13,0,1,.6,.9,'hair','hair');D(gr,'M1684,545 h14 M1684,549 h11 M1684,553 h14 M1684,557 h9 M1684,561 h13','hair dim',.6,.9);
  FO(gr,R(1692,543,8,8,1),'f-gold',.85,.7,.95);TX(gr,'ara!',1696,549,2.8,'f-bg',.75,1,1);
  D(gr,R(1679,570,4,10),'thin t3',.55,.8);D(gr,R(1668,579,26,3,1),'thin t3',.55,.8);
  D(gr,R(1662,583,30,4,1),'thin t3',.6,.85);D(gr,'M1664,585 h26','hair',.65,.85);D(gr,ell(1699,585,4,2.4),'thin t3',.6,.85);
  var mg=el('path',{d:cir(1682,554,46),fill:'url(#gGlow)'},gl);ST.fade(mg,tw0[0],tw0[1],.3);
}
deskZone();

/* ---------- knihovna a kalendar (zona vstup+stul) ---------- */
var d;
function bookcase(){
  zone(1.9,3.0);var g=sec('room',1);
  FILL(g,R(1822,330,88,370),'solid',.3,.6);FILL(g,R(1822,330,88,370),'hair',.3,.6,{fill:HV});
  D(g,R(1810,319,112,11,1),'ink t3',.3,.6);D(g,'M1810,325 H1922','hair',.35,.6);
  D(g,R(1816,330,7,370),'thin t3',.3,.6);D(g,R(1909,330,7,370),'thin t3',.3,.6);
  [404,480,556,632].forEach(function(y){D(g,R(1823,y,86,5),'thin t3',.35,.65)});
  books(g,1826,1878,404,11,26,56,.4,.8);D(g,R(1880,386,22,18,1),'thin t2',.5,.8);D(g,'M1884,392 H1898','hair gold',.5,.8);
  bottles(g,1826,1906,480,12,.45,.85);
  books(g,1826,1872,556,13,30,60,.5,.85);D(g,R(1876,528,30,28,1),'thin t2',.5,.85);D(g,R(1878,508,26,20,1),'thin t3',.5,.85);D(g,'M1880,540 H1904 M1882,518 H1902','hair gold',.55,.85);
  books(g,1826,1850,632,14,40,70,.5,.85);D(g,R(1854,578,52,54,1),'thin t2',.5,.85);D(g,'M1858,584 H1902 M1858,590 H1902','hair',.55,.85);D(g,R(1874,606,12,8,1),'hair gold',.55,.85);
  D(g,R(1816,637,100,59),'ink t3',.4,.8);D(g,R(1823,643,41,46),'thin',.45,.8);D(g,R(1868,643,41,46),'thin',.45,.8);D(g,R(1830,650,27,32),'hair',.5,.8);D(g,R(1875,650,27,32),'hair',.5,.8);
  D(g,cir(1860,666,2)+cir(1872,666,2),'thin gold',.5,.85);D(g,R(1812,696,108,4),'thin t3',.4,.8);
  vase(g,1836,319,16,26,.5,.85,1);dried(g,1836,293,7,23,30,-1,.55,.9);D(g,R(1860,303,44,16,1),'thin t2',.5,.85);D(g,R(1866,294,32,9,1),'thin t3',.5,.85);D(g,'M1862,311 H1902 M1868,298 H1894','hair gold',.55,.85);
}
function calendar(){
  zone(1.9,3.0);var g=sec('room',1),k,i;
  D(g,'M1980,352 V362 M1976,352 H1984','thin gold',.5,.8);
  D(g,R(1930,360,100,112,2),'ink t2',.4,.8);D(g,R(1930,360,100,10,1),'thin t3',.4,.8);
  d=[];for(k=0;k<6;k++)d.push(cir(1950+k*6.4,365,1.5));D(g,d.join(' '),'hair',.5,.8);
  D(g,R(1938,374,84,34,1),'thin t1',.5,.85);art(g,'lotus',1980,391,.3,0,1,.55,.9,'hair','hair');art(g,'rose',1950,391,.3,0,1,.6,.9,'hair','hair');art(g,'moon',2010,391,.17,0,1,.6,.9,'hair','hair');
  TX(g,'LISTOPAD',1980,419,8.6,'label',.6,1,1,{'letter-spacing':1.6});
  var wd=['P','Ú','S','Č','P','S','N'],ln=['M1938,422 H2022'];
  for(i=0;i<7;i++)TX(g,wd[i],1938+(i+.5)*12,427.4,3.8,'f-goldl',.65,1,.9);
  for(i=0;i<7;i++)ln.push('M'+(1938+i*12)+',429 V469.6');for(i=0;i<=6;i++)ln.push('M1938,'+n1(429+i*6.76)+' H2022');
  D(g,ln.join(' '),'hair faint',.6,1);
  var cr=[];
  for(var dd=1;dd<=30;dd++){var col=(dd+5)%7,row=Math.floor((dd+5)/7),cx=1938+(col+.5)*12,cy=429+row*6.76+4.9;
    TX(g,String(dd),cx,cy,4.4,col>=5?'f-gold':'f-line',.65,1,col>=5?.95:.8);
    if(dd>=2&&dd<=5)cr.push('M'+n1(cx-3.6)+','+n1(cy-4.6)+' L'+n1(cx+3.6)+','+n1(cy+.4))}
  D(g,cr.join(' '),'hair gold',.7,1);
  var pc=[],cx0=1980,cy0=429+3*6.76+3.4;for(i=0;i<=30;i++){var a=(-110+i*12.6)*PI/180,m=1+.1*i/30;pc.push(n1(cx0+cos(a)*7.4*m)+','+n1(cy0+sin(a)*4.4*m))}
  ST.D(g,'M'+pc.join(' L'),'thin gold',6.12,6.42);
  D(g,R(1992,476,30,26,1),'thin t3',.7,1);D(g,'M1996,484 h20 M1996,490 h15 M1996,496 h21','hair',.75,1);D(g,R(2002,472,10,6,1),'hair gold',.75,1);
}
bookcase();calendar();

/* ---------- okno s vyhledem, komoda, police (zona mezi stolem a kreslem) ---------- */
var WGL='M2106,496 V364 Q2106,334 2136,334 H2224 Q2254,334 2254,364 V496Z',winFar,winNear,winBlink,winStars;
function windowZ(){
  zone(4.8,6.0);var g=sec('room',2),k,i;
  D(g,'M2092,522 V362 Q2092,320 2134,320 H2226 Q2268,320 2268,362 V522Z','ink t3',.1,.5);
  var cp=el('clipPath',{id:'stWinClip'},ST.defs);el('path',{d:WGL},cp);
  var vg=el('g',{'clip-path':'url(#stWinClip)'},g),t=tt(.1,.4);
  var sk=el('path',{d:WGL,'class':'f-bg'},vg);ST.fade(sk,t[0],t[1],1);
  var gs=el('path',{d:WGL,fill:'url(#gWin)'},vg);ST.fade(gs,t[0],t[1],.1);
  var rs=rng(5),st=[];for(i=0;i<46;i++)st.push(cir(2110+rs()*142,338+rs()*90,.5+rs()*.5));
  var sf=winStars=el('path',{d:st.join(' '),'class':'f-line'},vg);ST.fade(sf,t[0],t[1]+.1,.7);
  winFar=G(vg);winNear=G(vg);
  FO(winFar,X(ART.moon.a,2230,356,.2,0,1),'f-goldl',.8,.3,.6);
  D(winFar,'M2186,500 L2189,350 H2191 L2194,500Z','thin t2',.3,.7);D(winFar,'M2190,350 V318 M2186,330 H2194 M2188,342 H2192','hair',.3,.7);
  [[432,8,13],[404,7,10.5],[381,5.5,8]].forEach(function(p){D(winFar,ell(2190,p[0],p[1],p[2]),'thin t2',.3,.7);D(winFar,'M'+(2190-p[1]+2)+','+p[0]+' H'+(2190+p[1]-2),'hair',.3,.7)});
  d=[];for(k=0;k<9;k++)d.push('M'+(2186+(k%3)*3.6)+','+(425+Math.floor(k/3)*5.5)+' h1.6v2.4h-1.6Z');
  FO(winFar,d.join(''),'f-gold',.85,.4,.8);
  winBlink=el('path',{d:cir(2190,320,1.8),'class':'f-goldl',opacity:0},winFar);
  var rf=rng(9),sx=2060,sky=['M2060,500 V480'];
  while(sx<2310){var w=10+rf()*16,h=476+rf()*16;sky.push(' H'+n1(sx)+' V'+n1(h)+' H'+n1(sx+w));sx+=w;if(rf()<.3)sky.push(' l3,-5 l3,5')}
  D(winFar,sky.join('')+' V500Z','thin t1 dim',.35,.75);
  var rn=rng(14),nx=2056,np=['M2056,500 V470'],wl=[],ch=[],an=[];
  while(nx<2310){var w2=22+rn()*20,h2=448+rn()*30,ty=h2;np.push(' H'+n1(nx)+' V'+n1(ty+8)+' L'+n1(nx+w2/2)+','+n1(ty)+' L'+n1(nx+w2)+','+n1(ty+8));
    for(var wy=ty+16;wy<496;wy+=11)for(var wx=nx+4;wx<nx+w2-6;wx+=9)if(rn()<.34)wl.push('M'+n1(wx)+','+n1(wy)+' h4.4v5.5h-4.4Z');
    if(rn()<.45){ch.push(rr(n1(nx+w2*.7),n1(ty-4),4,10))}
    if(rn()<.2){an.push('M'+n1(nx+w2*.3)+','+n1(ty+2)+' V'+n1(ty-12)+' M'+n1(nx+w2*.3-4)+','+n1(ty-8)+' h8 M'+n1(nx+w2*.3-3)+','+n1(ty-4)+' h6')}
    nx+=w2}
  D(winNear,np.join('')+' V500Z','ink t2',.4,.8);D(winNear,ch.join(''),'thin t2',.4,.8);D(winNear,an.join(' '),'hair',.4,.8);
  FO(winNear,wl.join(''),'f-gold',.8,.55,.95);
  D(g,'M2118,488 L2146,402 M2126,490 L2156,408 M2210,344 L2240,424 M2216,342 L2246,420','hair faint',.5,.9);
  D(g,WGL,'ink',.15,.5);D(g,'M2180,334 V496 M2106,415 H2254 M2116,364 Q2116,344 2136,344 H2224 Q2244,344 2244,364 V486 H2116Z','thin',.2,.6);
  D(g,R(2176,404,8,22,3),'thin gold t1',.4,.7);D(g,cir(2180,415,2),'hair gold',.4,.7);
  D(g,R(2082,512,196,11,2),'ink t3',.1,.5);D(g,'M2086,518 H2274','hair',.2,.6);D(g,'M2092,523 V536 Q2092,542 2098,542 M2268,523 V536 Q2268,542 2262,542','thin',.3,.6);
  D(g,'M2070,316 H2290','ink',.3,.7);D(g,cir(2068,316,4)+cir(2292,316,4),'thin gold t1',.3,.7);
  d=[];for(k=0;k<14;k++)d.push(ell(2080+k*6.2,316,1.8,3.2),ell(2282-k*6.2,316,1.8,3.2));D(g,d.join(' '),'hair',.3,.7);
  var CUR='M2078,320 H2118 C2118,380 2112,420 2112,440 C2112,470 2122,500 2124,528 H2074 C2078,500 2072,460 2076,440 C2078,400 2074,360 2078,320Z';
  [G(g),G(g,'translate(4360,0) scale(-1,1)')].forEach(function(cg0,ci){var cg=sway(G(cg0),2098,320,.9,.0006,ci*2+1);
    D(cg,CUR,'ink t3',.4+ci*.05,.85+ci*.05);
    var dd=[];for(var q=0;q<6;q++){var fx=2082+q*6.4;dd.push('M'+fx+',322 C'+(fx+3)+',380 '+(fx-2)+',440 '+(fx+(q>2?3:-2))+',526')}
    D(cg,dd.join(' '),'hair',.45,.9);FILL(cg,'M2100,322 H2118 C2118,380 2112,420 2112,440 C2112,470 2122,500 2124,528 H2108Z','hair',.5,.9,{fill:HF});
    D(cg,'M2072,442 Q2096,450 2118,440','thin gold',.5,.9)});
  D(g,'M2124,512 L2127,498 H2141 L2144,512Z','ink t3',.6,.95);d=[];for(k=-3;k<=3;k++)d.push(lf(2134,498,sin(k*.28),-cos(k*.28),26-Math.abs(k)*2,3.6));
  D(g,d.join(' '),'thin t2',.65,1);D(g,R(2226,494,14,18,2),'thin t3',.65,1);FO(g,'M2233,487 Q2230,492 2233,494 Q2236,492 2233,487Z','f-goldl',.9,.7,1);D(g,'M2233,494 V489','hair',.7,1);
  /* komoda na plany */
  D(g,R(2062,596,236,8,2),'ink t3',.1,.4);D(g,R(2068,604,224,88),'ink t3',.1,.5);D(g,R(2064,692,232,8,1),'thin t3',.15,.5);
  d=[];for(k=0;k<4;k++){d.push(rr(2072,607+k*21.4,102,19),rr(2186,607+k*21.4,102,19))}D(g,d.join(''),'thin',.2,.6);
  d=[];for(k=0;k<4;k++)d.push(R(2112,614+k*21.4,24,5,2),R(2226,614+k*21.4,24,5,2));D(g,d.join(''),'thin gold',.25,.65);
  d=[];for(k=0;k<4;k++)d.push(R(2118,609+k*21.4,12,3,1),R(2232,609+k*21.4,12,3,1));D(g,d.join(''),'hair',.25,.65);
  d=[];for(k=0;k<4;k++)d.push(ST.wline(2076,2170,613+k*21.4+8,.7,22,rng(k+30)),ST.wline(2190,2284,613+k*21.4+8,.7,22,rng(k+40)));D(g,d.join(' '),'hair faint',.3,.7);
  FILL(g,R(2068,664,224,28),'hair',.3,.7,{fill:HF});
  vase(g,2092,596,36,58,.4,.8,1);dried(g,2092,538,13,31,82,-1,.45,.9);
  D(g,R(2150,578,62,18,1),'thin t2',.5,.85);D(g,R(2156,566,52,12,1),'thin t3',.5,.85);D(g,'M2154,586 H2208 M2160,572 H2204','hair gold',.55,.85);
  D(g,'M2172,566 L2174,556 H2190 L2192,566Z','thin t3',.55,.9);D(g,ell(2182,540,7,12)+ell(2171,548,4,8)+ell(2193,548,4,8),'thin t2',.6,.95);D(g,'M2182,530 V550 M2171,543 V553 M2193,543 V553','hair',.65,.95);
  frame(g,2254,550,38,46,'sprig',.6,.95);
  /* police */
  [360,440,520].forEach(function(y,i){D(g,R(2338,y,224,6,1),'ink t3',.4+i*.05,.8);D(g,'M2352,'+(y+6)+' V'+(y+22)+' L2364,'+(y+6)+' M2536,'+(y+6)+' V'+(y+22)+' L2548,'+(y+6),'thin',.45+i*.05,.8)});
  books(g,2342,2392,360,41,28,50,.5,.85);bottles(g,2400,2470,360,42,.5,.9);
  books(g,2342,2372,440,43,26,42,.55,.9);bottles(g,2380,2440,440,44,.55,.9);
  frame(g,2448,392,40,48,'peony',.6,.95);vase(g,2512,440,28,34,.55,.9,0);dried(g,2512,406,8,45,40,-1,.6,.95);
  D(g,'M2352,520 L2350,490 H2376 L2374,520Z','thin t3',.6,.95);d=[];for(k=0;k<7;k++)d.push('M'+(2354+k*3.4)+',490 L'+(2350+k*5)+','+(458+(k%3)*8));D(g,d.join(' '),'thin',.65,.95);D(g,'M2352,504 H2374','hair gold',.65,.95);
  D(g,R(2390,504,56,16,1)+R(2394,492,48,12,1),'thin t2',.65,.95);D(g,'M2392,512 H2444 M2396,498 H2440','hair',.7,.95);
  d=[];[2470,2488,2506,2524].forEach(function(bx){d.push('M'+bx+',520 V506 Q'+(bx+6)+',500 '+(bx+12)+',506 V520Z')});D(g,d.join(' '),'thin t3',.65,.95);
  var pt=potos(g,2530,360,.6,1,3);ST.potos=pt;
  /* podlaha: velka vaza, kos */
  vase(g,2368,700,58,118,.5,.9,1);dried(g,2368,584,17,52,130,-1,.55,1);D(g,'M2352,640 H2386 M2350,668 H2386','hair gold',.6,.95);
  D(g,'M2480,700 L2472,646 H2546 L2540,700Z','ink t3',.6,.95);
  d=[];for(k=0;k<5;k++)d.push('M'+n1(2473.2+k*1.3)+','+(654+k*9)+' H'+n1(2545-k*1.3));D(g,d.join(' '),'hair',.65,.95);
  d=[];for(k=0;k<9;k++)d.push('M'+(2478+k*8)+',646 L'+(2480+k*7.4)+',700');D(g,d.join(' '),'hair faint',.65,.95);
  D(g,'M2474,646 C2480,626 2500,620 2512,628 C2524,618 2540,626 2544,646','thin t3',.7,1);D(g,'M2486,634 C2496,630 2506,632 2514,636 M2518,634 C2526,628 2536,632 2540,640','hair',.7,1);
  frame(g,2040,404,40,50,'rose',.5,.9);
  pendant(2010,318,.7,1);
}
windowZ();

/* ---------- tetovaci kout (zona 6.3 - 7.3) ---------- */
function ficus(g,cx,A,B){
  var st=[],lv=[],vn=[],k,i,r=rng(77);
  [[0,-1],[1,1],[-1,.4]].forEach(function(s,si){
    var x0=cx+s[0]*3,pts=[];for(i=0;i<=8;i++){var t=i/8;pts.push([x0+s[1]*10*sin(t*2.2)*t*3+s[0]*t*8,652-t*(190+si*30)])}
    st.push('M'+n1(x0)+',652 '+pts.map(function(p,j){return j?'L'+n1(p[0])+','+n1(p[1]):''}).join(' '));
    pts.forEach(function(p,j){if(j<2)return;for(var sd=-1;sd<=1;sd+=2){var a=(-90+sd*(35+r()*30))*PI/180,len=24+r()*8,ux=cos(a),uy=sin(a);lv.push(lf(p[0],p[1],ux,uy,len,11));vn.push('M'+n1(p[0])+','+n1(p[1])+' L'+n1(p[0]+ux*len*.9)+','+n1(p[1]+uy*len*.9))}});
    var tp=pts[8],a2=-90*PI/180;lv.push(lf(tp[0],tp[1],0,-1,30,12));vn.push('M'+n1(tp[0])+','+n1(tp[1])+' V'+n1(tp[1]-26));
  });
  D(g,'M'+(cx-24)+',650 L'+(cx-18)+',700 H'+(cx+18)+' L'+(cx+24)+',650Z','ink t3',A,B);D(g,R(cx-27,642,54,10,3),'thin t3',A,B);D(g,'M'+(cx-22)+',670 H'+(cx+22),'hair gold',A,B);
  var fg=sway(G(g),cx,650,1.0,.0008,cx);D(fg,st.join(' '),'thin',A,B);lv.forEach(function(l,i){D(fg,l,'thin t2',A+.0004*i,B);D(fg,vn[i],'hair',A+.0004*i,B)});
}
function tattooZone(){
  zone(6.3,7.3);var g=sec('room',3),gl=sec('light',3),k,d;
  /* koberec */
  D(g,'M2706,704 H3052 L3068,720 H2690Z','ink t3',.05,.3);FILL(g,'M2706,704 H3052 L3068,720 H2690Z','hair',.05,.3,{fill:STIP});
  D(g,'M2718,707 H3040 L3054,717 H2704Z','hair',.1,.35);d=[];for(k=0;k<7;k++){var cx=2740+k*46;d.push('M'+(cx-17)+',712 L'+cx+',707.8 L'+(cx+17)+',712 L'+cx+',716.2Z')}
  D(g,d.join(' '),'hair',.1,.35);D(g,d.map(function(s,i){return cir(2740+i*46,712,1.3)}).join(' '),'hair gold',.15,.35);
  d=[];for(k=0;k<8;k++)d.push('M'+(2706-k*2.2)+','+(704+k*2)+' l-6,.6 M'+(3052+k*2.2)+','+(704+k*2)+' l6,.6');D(g,d.join(' '),'hair',.15,.35);
  /* obrazy */
  frame(g,2606,318,84,92,'ara',.1,.4);frame(g,2706,266,76,98,'archangel',.15,.45);frame(g,3104,262,40,52,'kakadu',.2,.5);frame(g,2796,268,50,66,'rose',.25,.55);frame(g,2868,262,52,64,'colibri',.3,.6);frame(g,3022,346,46,56,'feather',.25,.55);
  /* polica s barvami nad vozikem */
  D(g,R(2602,470,92,5,1),'ink t3',.15,.4);D(g,'M2614,475 V488 L2624,475 M2682,475 V488 L2672,475','thin',.15,.4);bottles(g,2608,2690,470,71,.2,.5);
  /* vozik */
  D(g,R(2590,596,110,6,1),'ink t3',.2,.5);D(g,'M2594,602 V692 M2598,602 V692 M2688,602 V692 M2692,602 V692','thin',.2,.5);
  D(g,R(2594,650,98,4,1),'thin t3',.25,.5);D(g,R(2594,684,98,4,1),'thin t3',.25,.5);D(g,cir(2602,696,4)+cir(2682,696,4),'thin t1',.25,.5);D(g,cir(2602,696,1.2)+cir(2682,696,1.2),'hair',.25,.5);
  D(g,'M2692,596 V574 Q2692,568 2698,568 H2708','thin',.3,.55);
  /* zdroj */
  D(g,R(2596,570,40,26,3),'ink t3',.3,.6);D(g,R(2601,574,30,13,1),'thin t1',.3,.6);ST.disp=TX(g,'12.5',2616,584,8,'f-gold',.4,.65,1);
  D(g,cir(2604,592,2.2)+cir(2612,592,2.2)+cir(2628,592,2.2),'thin gold t1',.3,.6);D(g,'M2606,574 V570 H2626 V574','hair',.35,.6);
  D(g,'M2636,588 C2650,586 2652,602 2664,606 C2676,610 2676,628 2672,640','thin',.4,.7);D(g,'M2672,640 L2668,646','hair',.5,.7);
  /* kalisky s barvami */
  D(g,R(2640,590,34,6,1),'thin t3',.35,.6);d=[];var d2=[];for(k=0;k<6;k++){(k%3===1?d2:d).push('M'+(2643+k*5.2)+',590 v-6 h4 v6')}D(g,d.join(' '),'thin t1',.4,.65);D(g,d2.join(' '),'thin gold t1',.4,.65);
  D(g,R(2674,578,26,18,2),'ink t3',.35,.65);D(g,'M2682,578 Q2683,568 2689,566 Q2694,570 2691,578','hair',.4,.65);D(g,R(2678,584,18,6,1),'hair gold',.4,.65);
  /* spray, stroj, role */
  D(g,'M2606,650 V626 Q2606,622 2610,622 H2620 Q2624,622 2624,626 V650Z','thin t3',.4,.7);D(g,R(2612,612,6,10),'hair',.4,.7);D(g,'M2610,610 H2624 L2628,614 H2618Z','thin',.4,.7);D(g,'M2606,638 H2624','hair gold',.45,.7);
  D(g,R(2634,641,44,9,3),'ink t3',.4,.7);D(g,R(2644,643,14,5,1),'hair gold',.45,.7);D(g,'M2678,645 H2692 M2692,645 H2696','thin',.45,.7);D(g,'M2634,646 Q2626,650 2628,650','hair',.45,.7);
  D(g,R(2606,658,24,26,2),'thin t3',.45,.75);D(g,ell(2618,658,12,3),'thin t2',.45,.75);D(g,cir(2618,658,3),'hair',.5,.75);D(g,'M2608,668 H2628 M2608,675 H2628','hair',.5,.75);D(g,'M2630,664 q6,4 4,20','hair',.5,.75);
  D(g,R(2646,660,40,24,2),'thin t2',.45,.75);D(g,'M2650,668 H2682 M2650,674 H2674','hair gold',.5,.75);
  /* tetovaci kreslo */
  D(g,R(2758,690,84,8,4),'ink t3',.3,.6);D(g,'M2772,692 Q2782,680 2788,677 H2802 Q2808,680 2818,692Z','thin t3',.3,.6);
  D(g,R(2786,672,18,5,1),'thin t3',.3,.6);D(g,R(2788,640,14,18,1),'thin t3',.3,.6);D(g,R(2791,658,8,15),'thin',.3,.6);D(g,'M2793,659 V672 M2789,645 h12 M2789,650 h12 M2789,655 h12','hair',.35,.6);
  D(g,cir(2766,697,3.4)+cir(2834,697,3.4),'thin t1',.3,.6);D(g,'M2822,688 L2848,695 M2848,695 l3,1','thin gold',.35,.6);
  D(g,R(2756,632,78,8,3),'thin t3',.3,.6);
  D(g,R(2750,606,90,26,9),'ink t3',.35,.7);d=[];for(k=2764;k<2836;k+=14)d.push('M'+k+',609 V629');D(g,d.join(' '),'hair',.4,.7);D(g,'M2756,611 H2834 M2756,628 H2834','hair',.4,.7);
  FILL(g,R(2750,622,90,10),'hair',.4,.7,{fill:HF});
  D(g,'M2756,612 L2784,606 L2758,438 Q2744,430 2730,444 Z','ink t3',.35,.7);
  var ch=[];for(k=.12;k<.9;k+=.152){var lx=2756-26*k,ly=612-168*k,rx=2784-26*k,ry=606-168*k;ch.push('M'+n1(lx)+','+n1(ly)+' Q'+n1((lx+rx)/2)+','+n1((ly+ry)/2-4)+' '+n1(rx)+','+n1(ry))}
  D(g,ch.join(' '),'thin',.45,.75);D(g,'M2758,612 L2733,448 M2776,609 L2751,444','hair',.45,.75);
  FILL(g,'M2756,612 L2770,609 L2744,441 Q2737,438 2730,444Z','hair',.45,.75,{fill:HF});
  D(g,cir(2770,618,6),'thin gold t1',.5,.75);D(g,'M2766,618 h8 M2770,614 v8','hair',.5,.75);
  var hr=G(g,'rotate(-9 2744 426)');D(hr,'M2740,434 V444 M2748,434 V444','thin',.5,.75);D(hr,R(2726,412,36,22,10),'ink t3',.5,.75);D(hr,'M2732,419 H2756 M2732,427 H2756','hair',.55,.75);
  /* opeka ruky */
  D(g,R(2903,574,10,116),'thin t3',.4,.7);D(g,'M2903,600 h10 M2903,640 h10 M2903,666 h10','hair',.45,.7);D(g,'M2884,700 V693 Q2908,686 2932,693 V700Z','ink t3',.4,.7);
  D(g,R(2896,547,24,6,2),'thin t3',.45,.7);D(g,R(2902,553,12,12),'thin t3',.45,.7);D(g,cir(2908,568,6),'thin gold t1',.5,.75);D(g,'M2904,568 h8','hair',.5,.75);
  D(g,R(2824,531,94,16,8),'ink t3',.45,.8);D(g,'M2834,538 H2908 M2834,542.5 H2908','hair',.5,.8);D(g,'M2832,534 H2900','hair faint',.5,.8);
  /* stolicka */
  D(g,'M2985,666 L2958,690 L2955,698 M2985,666 L3012,690 L3015,698 M2985,666 V697','thin',.4,.75);D(g,cir(2955,697,3)+cir(3015,697,3)+cir(2985,697,3),'thin t1',.4,.75);
  D(g,R(2980,620,10,42),'thin t3',.4,.75);D(g,'M2980,630 h10 M2980,640 h10 M2980,650 h10','hair',.45,.75);D(g,R(2975,660,20,5,2),'thin t3',.4,.75);
  D(g,R(2956,606,58,14,7),'ink t3',.4,.8);D(g,'M2962,611 H3008','hair',.45,.8);FILL(g,R(2956,614,58,6),'hair',.45,.8,{fill:HF});
  /* lampa */
  D(g,R(3064,692,60,8,4),'ink t3',.5,.8);D(g,R(3093,340,4,352),'thin t3',.5,.85);D(g,cir(3095,338,5),'thin gold t1',.55,.85);D(g,'M3093,660 h4 M3093,540 h4','hair',.55,.85);
  D(g,'M3095,334 L2990,292 L2992,301 L3095,343Z','thin t3',.55,.9);
  d=['M3088,339'];for(k=0;k<9;k++){var u=k/8;d.push('L'+n1(3088-86*u+(k%2?-3:3)*.5)+','+n1(338-37*u+(k%2?3:-3)))}D(g,d.join(' '),'hair',.6,.9);
  D(g,cir(2988,296,5),'thin gold t1',.6,.9);D(g,'M2988,292 L2868,364 L2872,372 L2990,300Z','thin t3',.6,.95);D(g,cir(2866,368,3.4),'thin gold t1',.65,.95);
  D(g,'M2836,400 C2836,382 2850,370 2866,370 C2882,370 2896,382 2896,400Z','ink t3',.65,1);D(g,'M2846,396 Q2850,380 2866,374 M2886,396 Q2882,380 2866,374 M2866,372 V398','hair',.7,1);D(g,ell(2866,400,30,4),'thin',.7,1);
  FO(g,cir(2866,404,6),'f-goldl',.95,.7,1);
  /* svetlo lampy: kuzel, halo, skvrna (nastavuje se v ST.on) */
  ST.cone=el('path',{d:'M2846,412 L2886,412 L2950,540 L2786,540Z',fill:'url(#gCone)',opacity:0},gl);
  ST.lampHalo=el('path',{d:cir(2866,404,44),fill:'url(#gGlow)',opacity:0},gl);
  ST.spot=el('path',{d:ell(2871,533,70,9),fill:'url(#gGlow)',opacity:0},gl);
  ST.bulb=el('path',{d:cir(2866,404,6),'class':'f-goldl',opacity:0},gl);
  /* pult s autoklavem a umyvadlem */
  D(g,R(3130,600,202,6,1),'ink t3',.55,.85);D(g,R(3134,606,194,86),'ink t3',.55,.9);D(g,R(3130,692,202,8,1),'thin t3',.55,.9);
  d=[];for(k=0;k<3;k++)d.push(R(3140+k*63,612,58,74,2),R(3146+k*63,618,46,62,1));D(g,d.join(' '),'thin',.6,.95);
  D(g,cir(3192,650,2)+cir(3255,650,2)+cir(3318,650,2),'thin gold',.6,.95);FILL(g,R(3134,660,194,32),'hair',.6,.95,{fill:HF});
  D(g,R(3144,552,64,48,3),'ink t3',.6,.95);D(g,cir(3168,576,14),'thin t1',.65,.95);D(g,cir(3168,576,9),'hair',.65,.95);D(g,R(3188,560,16,9,1),'thin t1',.65,.95);D(g,'M3191,566 h10','hair gold',.65,.95);D(g,cir(3196,584,2.4)+cir(3196,592,2.4),'hair gold',.65,.95);ST.led=FO(g,cir(3196,584,1.5),'f-goldl',.9,.7,.95);D(g,'M3150,600 v4 M3202,600 v4','hair',.65,.95);
  D(g,R(3214,578,18,22,2),'thin t3',.65,.95);D(g,R(3212,574,22,5,1),'thin gold',.65,.95);d=[];for(k=0;k<4;k++)d.push(cir(3223,588+k*3,4.5));D(g,d.join(' '),'hair',.7,.95);
  D(g,'M3240,600 V584 Q3240,580 3244,580 H3250 Q3254,580 3254,584 V600Z','thin t3',.7,.95);D(g,R(3244,570,6,10),'hair',.7,.95);D(g,'M3242,568 H3254 L3258,572 H3250Z','thin',.7,.95);
  D(g,'M3268,600 V592 H3326 V600','thin',.65,.95);D(g,'M3318,592 V566 Q3318,558 3308,558 H3298 V565','thin gold',.65,.95);D(g,'M3296,566 h6','thin gold',.7,.95);D(g,'M3322,578 h6','thin gold',.7,.95);
  /* police a osvedceni */
  D(g,R(3140,440,164,6,1),'ink t3',.6,.95);D(g,'M3152,446 V460 L3162,446 M3292,446 V460 L3282,446','thin',.6,.95);
  var pt=potos(g,3176,440,.65,1,8);ST.potos2=pt;bottles(g,3220,3296,440,81,.65,.95);
  D(g,R(3196,296,74,98),'ink t3',.6,.95);D(g,R(3202,302,62,86),'thin t2',.65,.95);TX(g,'OSVĚDČENÍ',3233,318,6.4,'label',.7,1,1,{'letter-spacing':.6});
  D(g,'M3210,326 H3256 M3210,332 H3250 M3210,338 H3256 M3210,344 H3244 M3210,350 H3252','hair',.7,1);D(g,cir(3233,370,9),'thin gold t1',.7,1);D(g,star4(3233,370,5.5),'hair gold',.75,1);D(g,'M3228,378 L3226,390 L3233,385 L3240,390 L3238,378','hair gold',.75,1);D(g,'M3212,380 q5,-6 9,0 t9,0','hair',.75,1);
  frame(g,3152,296,40,52,'rose',.6,.95);frame(g,3338,256,50,64,'swallow',.65,1);
  /* ficus */
  ficus(g,3380,.65,1);
  pendant(3312,332,.7,1);
}
tattooZone();

/* ---------- detaily navic: hodiny, zasuvky, vypinac, nastenky ---------- */
function extras(){
  var k,d,g;
  zone(1.9,3.0);g=sec('room',1);
  /* nastenne hodiny */
  D(g,cir(2058,350,22),'ink t3',.6,1);D(g,cir(2058,350,18),'thin t1',.6,1);d=[];for(k=0;k<12;k++){var a=k*PI/6;d.push('M'+n1(2058+cos(a)*15)+','+n1(350+sin(a)*15)+' L'+n1(2058+cos(a)*(k%3?17:13.5))+','+n1(350+sin(a)*(k%3?17:13.5)))}
  D(g,d.join(' '),'hair',.65,1);var hg=G(g);ST.clkH=el('path',{d:'M0,0 V-8','class':'ink thin'},hg);ST.clkM=el('path',{d:'M0,0 V-13','class':'ink thin'},hg);ST.clkS=el('path',{d:'M0,0 V-14','class':'ink hair gold'},hg);ST.fade(hg,tt(.7)[0],tt(1)[1],1);D(g,cir(2058,350,1.8),'thin gold t1',.7,1);D(g,'M2040,370 L2036,378 M2076,370 L2080,378','hair',.7,1);
  /* zasuvky a vypinac */
  g=sec('room',0);
  D(g,R(1296,652,22,14,2),'thin t3',.7,1);D(g,cir(1303,659,2)+cir(1311,659,2),'hair',.7,1);D(g,'M1303,656 v6 M1311,656 v6','hair dim',.7,1);
  D(g,R(960,520,14,22,2),'thin t3',.7,1);D(g,R(963,524,8,14,1),'hair',.7,1);D(g,'M963,531 H971','hair dim',.7,1);
  g=sec('room',1);
  D(g,R(1440,652,22,14,2),'thin t3',.7,1);D(g,cir(1447,659,2)+cir(1455,659,2),'hair',.7,1);
  /* tabulka s cenikem - tabule u vstupu */
  g=sec('room',0);
  D(g,R(1100,282,2,2),'hair',.7,1);
}
extras();


/* ---------- dalsi detail: stiny na podlaze, svetylka, stojaci lampa, holubi, okapy ---------- */
var FL=[];
function more(){
  var k,d,g,t;
  /* stiny na podlaze (hatch) */
  [[1,1112,150,1.9,3.0],[1,1308,36,1.9,3.0],[1,1389,52,1.9,3.0],[1,1761,52,1.9,3.0],[1,1576,150,1.9,3.0],[1,1866,64,1.9,3.0],[2,2180,130,4.8,6.0],[2,2368,34,4.8,6.0],[2,2510,38,4.8,6.0],
   [3,2645,66,6.3,7.3],[3,2796,66,6.3,7.3],[3,2910,50,6.3,7.3],[3,2985,40,6.3,7.3],[3,3095,46,6.3,7.3],[3,3230,102,6.3,7.3],[3,3380,34,6.3,7.3],[0,940,40,1.9,3.0]].forEach(function(s){
    zone(s[3],s[4]);var gg=sec('back',s[0]);FILL(gg,ell(s[1],713,s[2],6.5),'hair',.3,.9,{fill:HF})});
  /* kouty - ztmaveni rohu */
  zone(.9,1.8);g=sec('back',0);FILL(g,R(890,252,34,448),'hair',.3,.9,{fill:HV});
  zone(10.6,11.0);g=sec('back',3);FILL(g,R(3388,252,32,448),'hair',.3,.9,{fill:HV});
  /* vlhke skvrny a stiny na omitce */
  [[0,1010,300,70,18,1.9,3.0],[1,1620,290,90,20,1.9,3.0],[2,2400,430,80,16,4.8,6.0],[3,2860,300,100,18,6.3,7.3],[3,3200,330,70,16,6.3,7.3]].forEach(function(b){
    zone(b[5],b[6]);var gg=sec('back',b[0]);FILL(gg,'M'+(b[1]-b[3])+','+b[2]+' Q'+b[1]+','+(b[2]-b[4]*1.4)+' '+(b[1]+b[3])+','+b[2]+' Q'+(b[1]+b[3]*.5)+','+(b[2]+b[4])+' '+b[1]+','+(b[2]+b[4]*.5)+' Q'+(b[1]-b[3]*.6)+','+(b[2]+b[4]*1.2)+' '+(b[1]-b[3])+','+b[2]+'Z','hair',.3,.9,{fill:HF})});
  /* svetylka (fairy lights) */
  [[2330,2575,296,28,4.8,6.0,13],[3108,3412,268,22,6.3,7.3,15]].forEach(function(s){
    zone(s[4],s[5]);var gg=secAt('room',s[0]),n=s[6],pts=[],bl=[];
    for(var i=0;i<=n;i++){var u=i/n,x=s[0]+(s[1]-s[0])*u,y=s[2]+s[3]*4*u*(1-u);pts.push(n1(x)+','+n1(y));if(i>0&&i<n){bl.push(cir(x,y+5,2.6));}}
    D(gg,'M'+pts[0]+' '+pts.slice(1).map(function(p,i){return 'L'+p}).join(' '),'hair',.2,.7);
    D(gg,bl.join(' '),'hair gold t1',.3,.9);
    [0,1].forEach(function(par){var e=el('path',{d:bl.filter(function(q,i){return i%2===par}).join(' '),'class':'f-goldl',filter:'url(#glowW)',opacity:0},gg);FL.push({e:e,par:par,x:s[0],x1:s[1],t0:s[4]+.5*(s[5]-s[4]),t1:s[5]})})});
  /* stojaci lampa u kalendare */
  zone(1.9,3.0);g=sec('room',1);
  var fx=2054;
  D(g,'M'+fx+',560 L'+(fx-22)+',700 M'+fx+',560 L'+(fx+22)+',700 M'+fx+',560 L'+fx+',700','thin',.7,1);D(g,cir(fx-22,698,2)+cir(fx+22,698,2)+cir(fx,698,2),'hair',.7,1);
  D(g,'M'+fx+',560 V496','ink',.7,1);D(g,R(fx-4,548,8,5,1),'thin gold',.7,1);
  D(g,'M'+(fx-20)+',500 L'+(fx-14)+',462 H'+(fx+14)+' L'+(fx+20)+',500Z','ink t3',.75,1);D(g,'M'+(fx-8)+',462 L'+(fx-12)+',500 M'+fx+',462 V500 M'+(fx+8)+',462 L'+(fx+12)+',500','hair',.75,1);D(g,ell(fx,500,20,3),'thin',.75,1);
  FO(g,cir(fx,503,3.4),'f-goldl',.9,.8,1);
  var gl=sec('light',1),gw=el('path',{d:cir(fx,505,64),fill:'url(#gGlow)'},gl);ST.fade(gw,tt(.7)[0],tt(1)[1],.5);
  /* vydlazdeny stolek s knihami */
  g=G(g,'translate(-88,0)');D(g,R(2020,640,36,5,1),'thin t3',.75,1);D(g,'M2024,645 L2022,700 M2052,645 L2054,700 M2024,672 H2052','thin',.75,1);D(g,R(2024,628,28,12,1)+R(2028,620,20,8,1),'thin t2',.8,1);D(g,'M2026,634 h24 M2030,624 h16','hair gold',.8,1);
  /* holubi na strese a okapy */
  zone(1.9,3.0);g=sec('back',1);
  [[1440,0],[1470,1]].forEach(function(b,i){var x=b[0],y=rY(x)-1;
    D(g,'M'+x+','+(y-1)+' C'+(x-2)+','+(y-10)+' '+(x+8)+','+(y-14)+' '+(x+13)+','+(y-8)+' C'+(x+16)+','+(y-4)+' '+(x+14)+','+(y-1)+' '+(x+10)+','+y+'Z M'+(x+11)+','+(y-12)+' C'+(x+14)+','+(y-18)+' '+(x+20)+','+(y-16)+' '+(x+20)+','+(y-11)+' L'+(x+25)+','+(y-10)+' L'+(x+20)+','+(y-8)+' C'+(x+17)+','+(y-7)+' '+(x+12)+','+(y-8)+' '+(x+11)+','+(y-12)+'Z M'+(x+1)+','+(y-6)+' L'+(x-9)+','+(y-3)+' L'+(x+2)+','+(y-2),'thin t2',.8,1);
    D(g,cir(x+17,y-13,.9)+' M'+(x+4)+','+(y-8)+' Q'+(x+9)+','+(y-12)+' '+(x+13)+','+(y-6),'hair',.8,1)});
  zone(10.8,11.5);g=sec('back',3);
  D(g,'M3552,246 V692 M3557,246 V692 M3548,300 h13 M3548,420 h13 M3548,540 h13 M3548,650 h13','thin',.4,1);D(g,'M3552,692 Q3552,700 3546,700','thin',.5,1);
  zone(.9,1.8);g=sec('back',0);D(g,'M722,246 V692 M727,246 V692 M718,300 h13 M718,560 h13 M718,650 h13','thin',.4,1);

  /* velikonocni vajicka: andilek na police, origami papousek na parapetu, srdicko z kabelu */
  zone(4.8,6.0);g=sec('room',2);
  D(g,R(2543,517,12,3,1),'hair t3',.7,1);D(g,'M2546,517 L2549,504 H2552 L2555,517Z','hair t2',.7,1);D(g,cir(2549.5,501,2),'hair',.7,1);D(g,'M2549,508 C2543,502 2541,506 2545,512 M2550,508 C2556,502 2558,506 2554,512 M2547,498 Q2549.5,496 2552,498','hair',.75,1);
  D(g,'M2160,511 L2168,499 L2172,505 L2179,501 L2175,511Z M2168,499 L2166,511 M2172,505 L2175,511','hair',.7,1);
  zone(6.3,7.3);g=sec('room',3);
  D(g,'M2664,717 C2655,711 2656,705 2660,705 C2662,705 2664,707 2664,708 C2664,707 2666,705 2668,705 C2672,705 2673,711 2664,717Z M2664,717 C2668,719 2676,716 2684,718','hair gold',.8,1);
  zone(6.3,7.3);
}
more();
/* ---------- ambientni animace ---------- */
var smoke=[],dust=[];
(function(){var gs=sec('back',3);zone(6.1,6.7);for(var i=0;i<4;i++)smoke.push(FO(gs,'M0,0 C-8,-10 8,-18 0,-30 C-6,-40 8,-46 2,-58','ink thin faint',.9,.9,1));
  var gl=sec('light',3);for(i=0;i<16;i++)dust.push(el('path',{d:cir(0,0,.9),'class':'f-goldl',opacity:0},gl))})();
function tf(e,s){e.setAttribute('transform',s)}
ST.on(function(T,time,cam){
  var ph=ST.reduce?0:time,i,lamp=ST.lamp(T);
  /* houpani rostlin, lustru, zaclon, korouhvicky */
  for(i=0;i<SW.length;i++){var s=SW[i];if(s.px<cam.x0-260||s.px>cam.x1+260)continue;
    tf(s.g,'rotate('+(Math.sin(ph*s.sp+s.ph)*s.amp).toFixed(2)+' '+s.px+' '+s.py+')')}
  /* para z kavy */
  if(cam.x0<1700&&cam.x1>1300&&ST.steamMug){
    for(i=0;i<3;i++){var u=((ph*.00045+i/3)%1),op=Math.sin(u*PI)*.75*ss(2.6,3.0,T);
      tf(ST.steamMug[i],'translate('+(1491+Math.sin(u*6+i*2)*2.4).toFixed(1)+','+(562-u*20).toFixed(1)+')');ST.steamMug[i].setAttribute('opacity',op.toFixed(2))}
    /* pen display: kurzor a UI */
    var uo=ss(2.6,3.0,T);
    tf(ST.cur,'translate('+(1577+Math.sin(ph*.0013)*46).toFixed(1)+','+(548+Math.sin(ph*.0021)*20).toFixed(1)+')');ST.cur.setAttribute('opacity',(.75*uo).toFixed(2));
    tf(ST.uiHl,'translate(0,'+((.5+.5*Math.sin(ph*.0007))*52).toFixed(1)+')');ST.uiHl.setAttribute('opacity',(.18*uo).toFixed(2));
  }
  /* hodiny podle skutecneho casu */
  if(ST.clkH&&cam.x0<2300&&cam.x1>1800){var d=new Date(),sec=d.getSeconds()+d.getMilliseconds()/1000,mn=d.getMinutes()+sec/60,hr=(d.getHours()%12)+mn/60;
    if(ST.reduce)sec=0;
    tf(ST.clkH,'translate(2058,350) rotate('+(hr*30)+')');tf(ST.clkM,'translate(2058,350) rotate('+(mn*6)+')');tf(ST.clkS,'translate(2058,350) rotate('+(sec*6)+')')}
  /* okno: hvezdy a svetlo na vezi */
  if(winFar&&cam.x1>2000&&cam.x0<2300){
    var dx=Math.max(-24,Math.min(24,(cam.x-2180)*.2)),dy=Math.max(-12,Math.min(12,(cam.y-470)*.2));
    tf(winFar,'translate('+(dx*.9).toFixed(1)+','+(dy*.9).toFixed(1)+')');tf(winNear,'translate('+(dx*.45).toFixed(1)+','+(dy*.45).toFixed(1)+')');
    winBlink.setAttribute('opacity',(ss(5.2,5.6,T)*(.2+.8*(.5+.5*Math.sin(ph*.003)))).toFixed(2));
    winStars.setAttribute('opacity',(ss(5.0,5.5,T)*(.55+.2*Math.sin(ph*.0017))).toFixed(2));
  }
  /* svetylka */
  for(i=0;i<FL.length;i++){var f=FL[i];if(f.x>cam.x1+300||f.x1<cam.x0-300)continue;
    f.e.setAttribute('opacity',(ss(f.t0,f.t1,T)*(.62+.3*Math.sin(ph*.0031+f.par*PI+f.x*.01))).toFixed(2))}
  /* komin */
  if(cam.x1>3000&&cam.x0<3500){for(i=0;i<smoke.length;i++){var v=((ph*.00018+i/4)%1);
    tf(smoke[i],'translate('+(3214+v*34+Math.sin(v*5+i)*4).toFixed(1)+','+(74-v*50).toFixed(1)+') scale('+(.7+v*1.1).toFixed(2)+')');
    smoke[i].setAttribute('opacity',(Math.sin(v*PI)*.55*ss(6.4,6.9,T)).toFixed(2))}}
  /* tetovaci kout: lampa, prach v kuzelu, kontrolka, displej */
  if(cam.x1>2500&&cam.x0<3250){
    if(ST.cone){ST.cone.setAttribute('opacity',lamp.toFixed(3));ST.lampHalo.setAttribute('opacity',(lamp*(.78+.05*Math.sin(ph*.002))).toFixed(3));ST.spot.setAttribute('opacity',lamp.toFixed(3));ST.bulb.setAttribute('opacity',(.3+.7*lamp).toFixed(3))}
    for(i=0;i<dust.length;i++){var fr=((ph*.00006*(1+(i%3)*.4)+i*.173)%1),y=418+fr*118,hw=18+(y-412)*.47,xx=2866+Math.sin(i*2.3)*hw*.85+Math.sin(ph*.0009+i)*5;
      tf(dust[i],'translate('+xx.toFixed(1)+','+y.toFixed(1)+')');dust[i].setAttribute('opacity',(lamp*Math.sin(fr*PI)*.8).toFixed(2))}
    if(ST.led)ST.led.setAttribute('opacity',(ss(6.6,7.2,T)*(.15+.85*Math.max(0,Math.sin(ph*.0035)))).toFixed(2));
    if(ST.disp){var vs=['12.5','12.6','12.5','12.4'],vv=vs[Math.floor(ph/1300)%4];if(ST.disp.textContent!==vv)ST.disp.textContent=vv}
  }
});
});
