/* pribeh/facade.js - ulicni fasada studia.
   Dokud klientka nevejde, je misto rezu budovou videt zed s okny a ozdobami; skrz okna je rozmazane videt dovnitr.
   Kdyz vejde (T 2,2), zed zanika zleva doprava: plochy zpruhledni a kazda linka se zkrati od konce k zacatku, az zanikne (do T asi 2,85).
   Fasada je ve vrstve 'front' (pred postavami). Dokud je cela, interier a obrazy za ni se nekresli (vykon). */
ST.module('facade',function(ST){
'use strict';
var el=ST.el,R=ST.rect,ss=ST.ss,X0=903,X1=2016,Y0=240,Y1=700,N=9,BW=(X1-X0)/N,cols=[],uid=0;
var root=ST.section(ST.L.front,X0-12,X1+12);
function f1(v){return Math.round(v*10)/10}
function fill(c,d,f,a){var at={d:d,fill:f};if(a)for(var k in a)at[k]=a[k];return el('path',at,c.g)}
/* Zanik fasady = obracene rysovani: kazda linka se zkracuje od sveho konce k zacatku, az zanikne.
   Vlna bezi zleva doprava (za klientkou): linka na x zacne v case T0+(x-X0)/(X1-X0)*SPAN a zanikne za DUR.
   Hlavni linky jsou rozdelene na jednotlive tahy (kazdy se zkracuje sam), drobna kresba (hair) zustava po skupinach. */
var T0=2.2,SPAN=.46,DUR=.15,rnd=ST.rng(7);
function tAt(x){return T0+Math.max(0,Math.min(1,(x-X0)/(X1-X0)))*SPAN}
function line(c,d,cls){cls=cls||'thin';
  var parts=/hair/.test(cls)?[d]:(d.match(/M[^M]*/g)||[d]),first=null;
  parts.forEach(function(q){var p=el('path',{d:q,'class':'ink '+cls,pathLength:1},c.gl),m=/M\s*(-?[\d.]+)/.exec(q);
    p.style.strokeDasharray='1 1';p.style.strokeDashoffset=0;
    c.lines.push({e:p,t:tAt(m?+m[1]:c.x0)+rnd()*.03,k:0});first=first||p});
  return first}
/* rozmazane siluety toho, co je za oknem */
var SIL=[
  function(g,cx,by){/* vesak s kabatem a kloboukem */el('path',{d:'M'+(cx-6)+','+by+' V'+(by-190)+' h12 V'+by+'Z M'+(cx-34)+','+(by-176)+' q34,-26 68,0 l-8,120 h-52Z M'+(cx-26)+','+(by-196)+' h52 v8 h-52Z'},g)},
  function(g,cx,by){/* monstera */var d='M'+(cx-3)+','+by+' V'+(by-150)+' h6 V'+by+'Z';[[-26,-96,24],[20,-126,26],[-8,-170,24],[28,-70,20],[-30,-40,18]].forEach(function(q){d+=ST.ellipse(cx+q[0],by+q[1],q[2],q[2]*.72)});el('path',{d:d},g)},
  function(g,cx,by){/* stolni lampa a displej */el('path',{d:'M'+(cx-40)+','+(by-40)+' h80 v40 h-80Z M'+(cx-30)+','+(by-150)+' h64 v96 h-64Z M'+(cx-38)+','+(by-40)+' l12,-70 l22,-14 l6,10 l-18,12 l-10,62Z'},g);el('rect',{x:cx-24,y:by-144,width:52,height:84,fill:'#E8C77F',opacity:.5},g)},
  function(g,cx,by){/* Honza u stolu */el('path',{d:ST.circ(cx+6,by-150,20)+'M'+(cx-30)+','+by+' C'+(cx-34)+','+(by-90)+' '+(cx-16)+','+(by-128)+' '+(cx+6)+','+(by-128)+' C'+(cx+30)+','+(by-128)+' '+(cx+40)+','+(by-90)+' '+(cx+38)+','+by+'Z M'+(cx-46)+','+(by-52)+' h-20 v52 h20Z'},g)},
  function(g,cx,by){/* knihovna */var d='';for(var i=0;i<4;i++)d+='M'+(cx-40)+','+(by-40-i*52)+' h80 v6 h-80Z M'+(cx-34+i*6)+','+(by-40-i*52)+' v-34 h10 v34Z M'+(cx-14)+','+(by-40-i*52)+' v-28 h8 v28Z M'+(cx+6+i*4)+','+(by-40-i*52)+' v-38 h12 v38Z';el('path',{d:d},g)}
];
/* ozdobna cinzovni fasada: rimsa se zubořezem a vejcovcem, vlys s rozvilinami, kanelovane pilastry s hlavicemi,
   obloukova okna s klenakem, archivoltou a konzolami, pod okny festony, bosovany sokl; v polich mezi okny stukove ramy s ozdobou */
function rosette(cx,cy,r){var d=ST.circ(f1(cx),f1(cy),f1(r*.34));for(var a=0;a<8;a++){var an=a*Math.PI/4,x=cx+Math.cos(an)*r*.66,y=cy+Math.sin(an)*r*.66;d+=ST.circ(f1(x),f1(y),f1(r*.3))}return d}
function swag(x0,x1,y,dp){var m=(x0+x1)/2,d='M'+f1(x0)+','+y+' Q'+f1(m)+','+(y+dp*2)+' '+f1(x1)+','+y+' M'+f1(x0)+','+(y+3)+' Q'+f1(m)+','+(y+dp*2+7)+' '+f1(x1)+','+(y+3);
  for(var i=1;i<6;i++){var t=i/6,xx=x0+(x1-x0)*t,yy=y+1.5+dp*4*t*(1-t)+2;d+=' M'+f1(xx-3)+','+f1(yy)+' q3,5 6,0'}
  return d+' M'+f1(x0)+','+y+' v9 l-3,5 M'+f1(x1)+','+y+' v9 l3,5'}
for(var b=0;b<N;b++){(function(b){
  var x0=X0+b*BW,x1=x0+BW,cx=(x0+x1)/2,c={g:el('g',{},root),lines:[],x0:x0,t0:tAt(x0),t1:tAt(x1)+DUR+.06,k:-1,o:-1,done:false};c.gl=el('g',{},root);cols.push(c);
  var d,k,q;
  /* omitka, rimsa, vlys, sokl */
  fill(c,R(f1(x0-.6),Y0,f1(BW+1.2),Y1-Y0),'#1D1E23');fill(c,R(f1(x0),Y0,f1(BW),Y1-Y0),'url(#hatchFine)',{opacity:.45});
  fill(c,R(f1(x0-.6),Y0,f1(BW+1.2),24),'#272830');fill(c,R(f1(x0-.6),264,f1(BW+1.2),28),'#15161A');
  fill(c,R(f1(x0-.6),632,f1(BW+1.2),68),'#272830');fill(c,R(f1(x0),632,f1(BW),68),'url(#hatchV)',{opacity:.55});
  line(c,'M'+f1(x0)+','+(Y0+24)+' H'+f1(x1)+' M'+f1(x0)+',264 H'+f1(x1)+' M'+f1(x0)+',292 H'+f1(x1)+' M'+f1(x0)+',297 H'+f1(x1)+' M'+f1(x0)+',632 H'+f1(x1)+' M'+f1(x0)+',640 H'+f1(x1),'thin');
  /* zuborez, vejcovec, bosaz soklu */
  d='';for(k=0;k<9;k++)d+='M'+f1(x0+4+k*BW/9)+','+(Y0+7)+' v10 h7 v-10 ';
  for(k=0;k<12;k++)d+='M'+f1(x0+2+k*BW/12)+',257 a'+f1(BW/24-.6)+',5.4 0 0 0 '+f1(BW/12-1.2)+',0 ';
  d+='M'+f1(x0)+',656 H'+f1(x1)+' M'+f1(x0)+',678 H'+f1(x1)+' M'+f1(cx)+',640 V656 M'+f1(x0+BW*.25)+',656 V678 M'+f1(x0+BW*.75)+',656 V678 M'+f1(cx)+',678 V700';
  line(c,d,'hair dim');
  /* vlys: rozviliny a ruzice */
  d='';for(k=0;k<5;k++){var fx=x0+16+k*(BW-32)/4.6;d+='M'+f1(fx)+',284 q5,-15 13,-7 q4,6 -3,9 q-6,1 -5,-6 M'+f1(fx+13)+',277 q4,-4 8,0 '}
  line(c,d,'hair goldl');
  /* pilastr na leve hrane pole (posledni pole i na prave) */
  [b?x0:x0+7].concat(b===N-1?[x1-7]:[]).forEach(function(px){
    fill(c,R(f1(px-6),297,12,335),'#272830');fill(c,R(f1(px-9),297,18,9),'#15161A');fill(c,R(f1(px-9),622,18,10),'#15161A');
    line(c,R(f1(px-6),306,12,316)+R(f1(px-9),297,18,9)+R(f1(px-9),622,18,10)+' M'+f1(px-10)+',301 a3,3 0 1 1 0,.1 M'+f1(px+10)+',301 a3,3 0 1 0 0,.1','thin');
    line(c,'M'+f1(px-3)+',312 V616 M'+f1(px)+',312 V616 M'+f1(px+3)+',312 V616','hair dim')});
  if(b%2===0){
    /* obloukove okno */
    var ww=78,rr=ww/2,wx=cx-rr,wy=345,top=wy-rr,by=560,id='fcw'+(uid++),cp=el('clipPath',{id:id},ST.defs);
    var pane='M'+f1(wx)+','+by+' V'+wy+' a'+rr+','+rr+' 0 0 1 '+ww+',0 V'+by+'Z',outer='M'+f1(wx-10)+','+(by+1)+' V'+wy+' a'+(rr+10)+','+(rr+10)+' 0 0 1 '+(ww+20)+',0 V'+(by+1)+'Z';
    el('path',{d:pane},cp);
    fill(c,outer,'#272830');fill(c,pane,'#0D0E11');el('path',{d:pane,fill:'url(#gWin)',opacity:.62},c.g);
    var sg=el('g',{'clip-path':'url(#'+id+')'},c.g),bl=el('g',{filter:'url(#blurFore)',fill:'#0b0c10',opacity:.82},sg);SIL[(b/2)%SIL.length](bl,cx,by);
    el('path',{d:'M'+f1(wx)+','+top+' h14 q-5,'+((by-top)/2)+' 3,'+(by-top)+' h-17Z M'+f1(wx+ww)+','+top+' h-14 q5,'+((by-top)/2)+' -3,'+(by-top)+' h17Z',fill:'#272830',opacity:.78},sg);
    el('path',{d:pane,fill:'#E7DDC7',opacity:.05},c.g);
    line(c,outer+' '+pane,'');
    /* archivolta, klenak, patky oblouku, vejir nadsvetliku, pricky */
    line(c,'M'+f1(wx-15)+','+wy+' a'+(rr+15)+','+(rr+15)+' 0 0 1 '+(ww+30)+',0 M'+f1(wx-17)+','+wy+' h12 v7 h-12Z M'+f1(wx+ww+5)+','+wy+' h12 v7 h-12Z','thin');
    fill(c,'M'+f1(cx-6)+','+(top-17)+' h12 l-3,20 h-6Z','#C8A45C',{opacity:.85});line(c,'M'+f1(cx-6)+','+(top-17)+' h12 l-3,20 h-6Z','thin');
    d='M'+f1(wx)+','+wy+' H'+f1(wx+ww)+' M'+f1(cx)+','+wy+' V'+by+' M'+f1(wx)+','+(wy+78)+' H'+f1(wx+ww)+' M'+f1(wx)+','+(wy+150)+' H'+f1(wx+ww);
    for(k=1;k<5;k++){var an=Math.PI*k/5;d+=' M'+f1(cx)+','+wy+' L'+f1(cx-Math.cos(an)*rr)+','+f1(wy-Math.sin(an)*rr)}
    d+=' M'+f1(cx-12)+','+wy+' a12,12 0 0 1 24,0';line(c,d,'thin');
    line(c,'M'+f1(wx+8)+','+(wy+62)+' l22,-44 M'+f1(wx+18)+','+(wy+70)+' l14,-28 M'+f1(cx+10)+','+(by-26)+' l20,-40','hair faint');
    /* ruzice ve cviklech */
    el('path',{d:rosette(wx-13,top-4,7)+rosette(wx+ww+13,top-4,7),'class':'f-goldl',opacity:.8},c.g);
    /* parapet s konzolami a feston pod oknem */
    fill(c,R(f1(wx-16),by+2,ww+32,9),'#272830');
    line(c,R(f1(wx-16),by+2,ww+32,9)+' M'+f1(wx-10)+','+(by+11)+' q-2,12 6,14 q5,-1 3,-7 M'+f1(wx+ww+10)+','+(by+11)+' q2,12 -6,14 q-5,-1 -3,-7','thin');
    line(c,swag(wx+2,wx+ww-2,by+22,7),'hair goldl');
    if(b%4===0){/* truhlik s kytkami na parapetu */
      var fd='M'+f1(wx-4)+','+(by-12)+' h'+(ww+8)+' l-4,14 h'+(-ww)+'Z',fl='';fill(c,fd,'#15161A');
      for(q=0;q<7;q++){var fxx=wx+4+q*(ww-8)/6,fh=14+((q*7)%5)*4;fd+=' M'+f1(fxx)+','+(by-12)+' q'+(q%2?4:-4)+','+(-fh/2)+' 0,'+(-fh);fl+=rosette(fxx,by-12-fh-2,3.4)}
      line(c,fd,'thin');el('path',{d:fl,'class':'f-gold'},c.g)}
  }else{
    /* stukovy ram s vykrojenymi rohy a ruzicemi, v nem ozdoba */
    var px0=cx-42,px1=cx+42,py0=312,py1=566,cr=9,v=((b-1)/2)%3;
    var fr='M'+f1(px0+cr)+','+py0+' H'+f1(px1-cr)+' a'+cr+','+cr+' 0 0 0 '+cr+','+cr+' V'+(py1-cr)+' a'+cr+','+cr+' 0 0 0 '+(-cr)+','+cr+' H'+f1(px0+cr)+' a'+cr+','+cr+' 0 0 0 '+(-cr)+','+(-cr)+' V'+(py0+cr)+' a'+cr+','+cr+' 0 0 0 '+cr+','+(-cr)+'Z';
    fill(c,fr,'#15161A',{opacity:.7});line(c,fr+' '+R(f1(px0+7),py0+7,70,py1-py0-14),'thin');
    el('path',{d:rosette(px0+1,py0+1,5)+rosette(px1-1,py0+1,5)+rosette(px0+1,py1-1,5)+rosette(px1-1,py1-1,5),'class':'f-goldl',opacity:.85},c.g);
    line(c,swag(px0+6,px1-6,py1+14,6),'hair goldl');
    if(v===0){/* medailon: slunce ve vavrinovem venci se stuhou */
      var my=430,md=ST.ellipse(cx,my,20,27)+ST.circ(cx,my,7),wr='';
      for(k=0;k<12;k++){var an2=k*Math.PI/6;md+='M'+f1(cx+Math.cos(an2)*10)+','+f1(my+Math.sin(an2)*10)+' L'+f1(cx+Math.cos(an2)*(k%2?13:16))+','+f1(my+Math.sin(an2)*(k%2?13:16))}
      for(k=0;k<18;k++){var a3=(k/18)*Math.PI*2+.17,ex=cx+Math.cos(a3)*27,ey=my+Math.sin(a3)*35,tx=-Math.sin(a3),ty=Math.cos(a3),nx=Math.cos(a3),ny=Math.sin(a3);
        wr+='M'+f1(ex)+','+f1(ey)+' q'+f1(tx*5+nx*5)+','+f1(ty*5+ny*5)+' '+f1(tx*10)+','+f1(ty*10)+' q'+f1(-tx*5+nx*2)+','+f1(-ty*5+ny*2)+' '+f1(-tx*10)+','+f1(-ty*10)+' '}
      fill(c,ST.ellipse(cx,my,20,27),'#0D0E11');line(c,md,'thin goldl');line(c,wr,'hair goldl');
      line(c,'M'+f1(cx)+','+(my+35)+' q-12,6 -16,18 l6,-3 l2,7 q4,-12 8,-22 q4,10 8,22 l2,-7 l6,3 q-4,-12 -16,-18','hair goldl');
      line(c,'M'+f1(cx-22)+','+(my-58)+' q22,-16 44,0 M'+f1(cx-14)+','+(my-66)+' q14,-10 28,0 M'+f1(cx-26)+','+(my+84)+' h52 M'+f1(cx-18)+','+(my+92)+' h36','hair dim')}
    else if(v===1){/* lucerna na kovane konzole s volutami */var ly=404;el('circle',{cx:cx,cy:ly+18,r:66,fill:'url(#gGlow)',opacity:.78},c.g);
      fill(c,'M'+(cx-11)+','+ly+' h22 l4,32 h-30Z','#15161A');el('path',{d:'M'+(cx-8)+','+(ly+3)+' h16 l3,26 h-22Z','class':'f-goldl',opacity:.6},c.g);
      line(c,'M'+(cx-11)+','+ly+' h22 l4,32 h-30Z M'+(cx-15)+','+ly+' h30 l-7,-10 h-16Z M'+cx+','+(ly-10)+' v-8 M'+cx+','+ly+' V'+(ly+32)+' M'+(cx-15)+','+(ly+32)+' q15,11 30,0 M'+cx+','+(ly+38)+' v6','thin');
      line(c,'M'+cx+','+(ly-18)+' C'+(cx-30)+','+(ly-22)+' '+(cx-34)+','+(ly-58)+' '+(cx-10)+','+(ly-60)+' q10,2 8,10 q-4,6 -10,2 M'+cx+','+(ly-18)+' C'+(cx+18)+','+(ly-30)+' '+(cx+20)+','+(ly-52)+' '+(cx+4)+','+(ly-70)+' M'+(cx-10)+','+(ly-60)+' L'+(cx+4)+','+(ly-70)+' M'+(cx-4)+','+(ly-74)+' h16','thin gold');
      line(c,'M'+(cx-24)+',500 q24,-14 48,0 q-24,14 -48,0 M'+(cx-14)+',500 h28 M'+cx+',488 v24 M'+(cx-20)+',530 h40 M'+(cx-12)+',538 h24','hair dim')}
    else{/* popinava ruze na treláži */var vd='M'+cx+','+(py1-8)+' C'+(cx-18)+',500 '+(cx+20)+',450 '+(cx-4)+',400 C'+(cx-22)+',360 '+(cx+14)+',340 '+cx+','+(py0+12),lf='',fl2='';
      [[-4,536,-1],[8,506,1],[-2,474,-1],[10,444,1],[-8,414,-1],[4,384,1],[-10,356,-1],[6,334,1]].forEach(function(z,i){var lx=cx+z[0],sd=z[2];lf+='M'+lx+','+z[1]+' q'+(sd*18)+',-13 '+(sd*25)+',2 q'+(-sd*14)+',11 '+(-sd*25)+',-2Z ';if(i%2)fl2+=rosette(lx+sd*27,z[1]-4,5.4)});
      line(c,'M'+(cx-28)+','+(py0+12)+' V'+(py1-10)+' M'+(cx+28)+','+(py0+12)+' V'+(py1-10)+' M'+cx+','+(py0+12)+' V'+(py1-10)+' M'+(cx-28)+',370 H'+(cx+28)+' M'+(cx-28)+',440 H'+(cx+28)+' M'+(cx-28)+',510 H'+(cx+28),'hair faint');
      fill(c,lf,'#15161A');line(c,vd,'thin');line(c,lf,'thin');el('path',{d:fl2,'class':'f-gold',opacity:.9},c.g);line(c,fl2,'hair')}
  }
})(b)}
var hid=null,ins=null;
ST.on(function(T){
  /* plochy pole zpruhledni, kdyz k nemu vlna dorazi; linky se zkracuji jedna po druhe zleva doprava */
  for(var i=0;i<cols.length;i++){var c=cols[i],o=1-ss(c.t0-.02,c.t0+.12,T),dn=T>c.t1;
    if(Math.abs(o-c.o)>1e-4){c.o=o;c.g.style.opacity=o;c.g.style.display=o<=0?'none':''}
    if(dn!==c.done){c.done=dn;c.gl.style.display=dn?'none':''}
    if(dn||T<c.t0-.01&&c.k===0)continue;
    c.k=T<c.t0-.01?0:1;
    for(var j=0;j<c.lines.length;j++){var l=c.lines[j],k=ss(l.t,l.t+DUR,T);if(Math.abs(k-l.k)<1e-4)continue;l.k=k;
      l.e.style.strokeDashoffset=k.toFixed(4);l.e.style.visibility=k>=1?'hidden':''}}
  /* dokud je fasada cela, interier a obrazy za ni se nekresli */
  var h=T<2.17;if(h!==hid){hid=h;ins=ins||(ST.studioIn||[]).concat(ST.galL?[ST.galL]:[]);ins.forEach(function(g){g.style.visibility=h?'hidden':''})}
});
});
