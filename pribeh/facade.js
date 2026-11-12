/* pribeh/facade.js - ulicni fasada studia.
   Dokud klientka nevejde, je misto rezu budovou videt zed s okny a ozdobami; skrz okna je rozmazane videt dovnitr.
   Kdyz vejde, zed se zleva doprava rozplyne (linky se odkresli, plocha zmizi) a je videt interier.
   Fasada je ve vrstve 'front' (pred postavami). Dokud je cela, interier a obrazy za ni se nekresli (vykon). */
ST.module('facade',function(ST){
'use strict';
var el=ST.el,R=ST.rect,ss=ST.ss,X0=903,X1=2016,Y0=240,Y1=700,N=9,BW=(X1-X0)/N,cols=[],uid=0;
var root=ST.section(ST.L.front,X0-12,X1+12);
function f1(v){return Math.round(v*10)/10}
function fill(c,d,f,a){var at={d:d,fill:f};if(a)for(var k in a)at[k]=a[k];return el('path',at,c.g)}
function line(c,d,cls){var p=el('path',{d:d,'class':'ink '+(cls||'thin'),pathLength:1},c.g);p.style.strokeDasharray='1 1';p.style.strokeDashoffset=0;c.lines.push(p);return p}
/* rozmazane siluety toho, co je za oknem */
var SIL=[
  function(g,cx,by){/* vesak s kabatem a kloboukem */el('path',{d:'M'+(cx-6)+','+by+' V'+(by-190)+' h12 V'+by+'Z M'+(cx-34)+','+(by-176)+' q34,-26 68,0 l-8,120 h-52Z M'+(cx-26)+','+(by-196)+' h52 v8 h-52Z'},g)},
  function(g,cx,by){/* monstera */var d='M'+(cx-3)+','+by+' V'+(by-150)+' h6 V'+by+'Z';[[-26,-96,24],[20,-126,26],[-8,-170,24],[28,-70,20],[-30,-40,18]].forEach(function(q){d+=ST.ellipse(cx+q[0],by+q[1],q[2],q[2]*.72)});el('path',{d:d},g)},
  function(g,cx,by){/* stolni lampa a displej */el('path',{d:'M'+(cx-40)+','+(by-40)+' h80 v40 h-80Z M'+(cx-30)+','+(by-150)+' h64 v96 h-64Z M'+(cx-38)+','+(by-40)+' l12,-70 l22,-14 l6,10 l-18,12 l-10,62Z'},g);el('rect',{x:cx-24,y:by-144,width:52,height:84,fill:'#E8C77F',opacity:.5},g)},
  function(g,cx,by){/* Honza u stolu */el('path',{d:ST.circ(cx+6,by-150,20)+'M'+(cx-30)+','+by+' C'+(cx-34)+','+(by-90)+' '+(cx-16)+','+(by-128)+' '+(cx+6)+','+(by-128)+' C'+(cx+30)+','+(by-128)+' '+(cx+40)+','+(by-90)+' '+(cx+38)+','+by+'Z M'+(cx-46)+','+(by-52)+' h-20 v52 h20Z'},g)},
  function(g,cx,by){/* knihovna */var d='';for(var i=0;i<4;i++)d+='M'+(cx-40)+','+(by-40-i*52)+' h80 v6 h-80Z M'+(cx-34+i*6)+','+(by-40-i*52)+' v-34 h10 v34Z M'+(cx-14)+','+(by-40-i*52)+' v-28 h8 v28Z M'+(cx+6+i*4)+','+(by-40-i*52)+' v-38 h12 v38Z';el('path',{d:d},g)}
];
for(var b=0;b<N;b++){(function(b){
  var x0=X0+b*BW,x1=x0+BW,cx=(x0+x1)/2,c={g:el('g',{},root),lines:[],t0:2.1+b/(N-1)*.36,k:-1,o:-1};cols.push(c);
  /* omitka, rimsa, sokl */
  fill(c,R(f1(x0-.6),Y0,f1(BW+1.2),Y1-Y0),'#1D1E23');fill(c,R(f1(x0),Y0,f1(BW),Y1-Y0),'url(#hatchFine)',{opacity:.5});
  fill(c,R(f1(x0-.6),Y0,f1(BW+1.2),22),'#272830');fill(c,R(f1(x0-.6),632,f1(BW+1.2),68),'#272830');fill(c,R(f1(x0),632,f1(BW),68),'url(#hatchV)',{opacity:.6});
  var d='M'+f1(x0)+','+(Y0+22)+' H'+f1(x1)+' M'+f1(x0)+','+(Y0+29)+' H'+f1(x1)+' M'+f1(x0)+',632 H'+f1(x1)+' M'+f1(x0)+',644 H'+f1(x1)+' M'+f1(x0)+',606 H'+f1(x1);
  line(c,d,'thin');
  d='';for(var k=0;k<8;k++)d+='M'+f1(x0+6+k*BW/8)+','+(Y0+6)+' v10 h7 v-10 ';
  d+='M'+f1(cx)+',644 V700 M'+f1(x0)+',672 H'+f1(x1)+' M'+f1(x0+BW*.25)+',672 V700 M'+f1(x0+BW*.75)+',672 V700';line(c,d,'hair dim');
  if(b%2===0){
    /* okno: sambrana, nadokenni rimsa, parapet s truhlikem, sklo s rozmazanym vnitrkem */
    var ww=92,wh=258,wx=cx-ww/2,wy=318,by=wy+wh,id='fcw'+(uid++),cp=el('clipPath',{id:id},ST.defs);el('rect',{x:wx,y:wy,width:ww,height:wh},cp);
    fill(c,R(wx-10,wy-10,ww+20,wh+20),'#272830');
    fill(c,R(wx,wy,ww,wh),'#0D0E11');el('rect',{x:wx,y:wy,width:ww,height:wh,fill:'url(#gWin)',opacity:.62},c.g);
    var sg=el('g',{'clip-path':'url(#'+id+')'},c.g),bl=el('g',{filter:'url(#blurFore)',fill:'#0b0c10',opacity:.82},sg);SIL[(b/2)%SIL.length](bl,cx,by);
    el('path',{d:'M'+wx+','+wy+' h15 q-5,'+(wh/2)+' 3,'+wh+' h-18Z M'+(wx+ww)+','+wy+' h-15 q5,'+(wh/2)+' -3,'+wh+' h18Z',fill:'#272830',opacity:.78},sg);
    el('rect',{x:wx,y:wy,width:ww,height:wh,fill:'#E7DDC7',opacity:.05},c.g);
    line(c,R(wx-10,wy-10,ww+20,wh+20)+' '+R(wx,wy,ww,wh),'');
    line(c,'M'+cx+','+wy+' V'+by+' M'+wx+','+(wy+86)+' H'+(wx+ww)+' M'+(wx+4)+','+(wy+4)+' h'+(ww-8)+' v'+(wh-8)+' h'+(8-ww)+'Z','thin');
    line(c,'M'+(wx-18)+','+(wy-14)+' H'+(wx+ww+18)+' M'+(wx-14)+','+(wy-14)+' L'+cx+','+(wy-38)+' L'+(wx+ww+14)+','+(wy-14)+' M'+(cx-6)+','+(wy-10)+' l2,-12 h8 l2,12','thin');
    line(c,'M'+(wx+10)+','+(wy+70)+' l26,-52 M'+(wx+22)+','+(wy+78)+' l16,-32 M'+(cx+12)+','+(by-30)+' l22,-44','hair faint');
    fill(c,R(wx-16,by+10,ww+32,9),'#272830');line(c,R(wx-16,by+10,ww+32,9),'thin');
    if(b%4===0){/* truhlik s kytkami */fill(c,'M'+(wx-6)+','+(by-10)+' h'+(ww+12)+' l-4,20 h'+(4-ww)+'Z','#15161A');
      var fd='M'+(wx-6)+','+(by-10)+' h'+(ww+12)+' l-4,20 h'+(4-ww)+'Z';for(var q=0;q<7;q++){var fx=wx+4+q*(ww-8)/6,fh=14+((q*7)%5)*4;fd+=' M'+f1(fx)+','+(by-10)+' q'+(q%2?4:-4)+','+(-fh/2)+' 0,'+(-fh)+' '+ST.circ(f1(fx),by-10-fh-2.4,2.4)}line(c,fd,'thin');
      el('path',{d:(function(){var s='';for(var q=0;q<7;q++){var fx=wx+4+q*(ww-8)/6,fh=14+((q*7)%5)*4;s+=ST.circ(f1(fx),by-10-fh-2.4,1.2)}return s})(),'class':'f-gold'},c.g)}
  }else{
    var v=((b-1)/2)%3;
    if(v===0){/* stukovy medailon se sluncem */var my=430;fill(c,ST.ellipse(cx,my,27,36),'#15161A');var md=ST.ellipse(cx,my,27,36)+ST.ellipse(cx,my,21,30)+ST.circ(cx,my,7);
      for(var a=0;a<12;a++){var an=a*Math.PI/6;md+='M'+f1(cx+Math.cos(an)*10)+','+f1(my+Math.sin(an)*10)+' L'+f1(cx+Math.cos(an)*(a%2?14:17))+','+f1(my+Math.sin(an)*(a%2?14:17))}
      line(c,md,'thin goldl');line(c,'M'+(cx-27)+','+(my+46)+' q27,14 54,0 M'+(cx-20)+','+(my-46)+' q20,-12 40,0','hair goldl')}
    else if(v===1){/* nastenna lucerna */var ly=392;el('circle',{cx:cx,cy:ly+16,r:64,fill:'url(#gGlow)',opacity:.75},c.g);
      fill(c,'M'+(cx-11)+','+ly+' h22 l4,30 h-30Z','#15161A');el('path',{d:'M'+(cx-8)+','+(ly+3)+' h16 l3,24 h-22Z','class':'f-goldl',opacity:.55},c.g);
      line(c,'M'+(cx-11)+','+ly+' h22 l4,30 h-30Z M'+(cx-14)+','+ly+' h28 l-6,-9 h-16Z M'+cx+','+(ly-9)+' v-10 M'+(cx-15)+','+(ly+30)+' q15,10 30,0 M'+cx+','+(ly-19)+' q-22,2 -22,-20','thin')}
    else{/* popinava rostlina na treláži */var vd='M'+cx+',632 C'+(cx-16)+',560 '+(cx+18)+',500 '+(cx-4)+',440 C'+(cx-20)+',390 '+(cx+14)+',350 '+cx+',300',lf='';
      [[-4,600,-1],[8,566,1],[-2,528,-1],[10,492,1],[-8,456,-1],[4,420,1],[-10,384,-1],[6,350,1],[-2,318,-1]].forEach(function(q){var lx=cx+q[0],s=q[2];lf+='M'+lx+','+q[1]+' q'+(s*20)+',-14 '+(s*28)+',2 q'+(-s*16)+',12 '+(-s*28)+',-2Z '});
      fill(c,lf,'#15161A');line(c,vd,'thin');line(c,lf,'thin');
      line(c,'M'+(cx-30)+',300 V632 M'+(cx+30)+',300 V632 M'+(cx-30)+',380 H'+(cx+30)+' M'+(cx-30)+',470 H'+(cx+30)+' M'+(cx-30)+',560 H'+(cx+30),'hair faint')}
  }
})(b)}
var hid=null,ins=null;
ST.on(function(T){
  for(var i=0;i<cols.length;i++){var c=cols[i],k=ss(c.t0,c.t0+.34,T),o=1-ss(c.t0+.05,c.t0+.42,T);
    if(Math.abs(k-c.k)>1e-4){c.k=k;for(var j=0;j<c.lines.length;j++)c.lines[j].style.strokeDashoffset=k}
    if(Math.abs(o-c.o)>1e-4){c.o=o;c.g.style.opacity=o;c.g.style.display=o<=0?'none':''}}
  /* dokud je fasada cela, interier a obrazy za ni se nekresli */
  var h=T<2.07;if(h!==hid){hid=h;ins=ins||(ST.studioIn||[]).concat(ST.galL?[ST.galL]:[]);ins.forEach(function(g){g.style.visibility=h?'hidden':''})}
});
});
