/* pribeh/chars.js - postavy: Honza (tater) a klient ("Vy").
   Kostra s klouby (panev, trup, krk, hlava, paze, nohy), inverzni kinematika pro nohy a ruce,
   chuze s dosedem chodidla, sekundarni pohyb vlasu, saly a tasky, mrkani a mluveni.
   Lokalni souradnice: postava kouka doprava (+x), y dolu, koren = bod na zemi pod panvi. */
ST.module('chars',function(ST){
'use strict';
var el=ST.el,R=ST.R,GY=ST.GY,ss=ST.ss,lin=ST.lin,lerp=ST.lerp,defs=ST.defs,uid=0;
var LINE='rgba(231,221,199,.88)',LD='rgba(231,221,199,.5)',LF='rgba(231,221,199,.26)';

/* objem: tmavsi zadni strana, svetlejsi predni (prechod se otaci s dilem) */
(function(){var g=el('linearGradient',{id:'chVol',x1:0,y1:0,x2:1,y2:0},defs);
  el('stop',{offset:0,'stop-color':'#000','stop-opacity':.42},g);el('stop',{offset:.55,'stop-color':'#000','stop-opacity':0},g);el('stop',{offset:1,'stop-color':'#E8D5A3','stop-opacity':.07},g)})();
/* tmavy lem kolem postavy, aby se oddelila od kresby pozadi */
(function(){var f=el('filter',{id:'chSep',x:'-15%',y:'-8%',width:'130%',height:'116%'},defs);
  el('feMorphology',{operator:'dilate',radius:2.2,'in':'SourceAlpha',result:'d'},f);el('feGaussianBlur',{'in':'d',stdDeviation:2.6,result:'b'},f);
  el('feFlood',{'flood-color':'#07080b','flood-opacity':.9},f);el('feComposite',{in2:'b',operator:'in',result:'s'},f);
  var m=el('feMerge',{},f);el('feMergeNode',{'in':'s'},m);el('feMergeNode',{'in':'SourceGraphic'},m)})();
/* ---------- kresleni dilu ---------- */
function P(par,d,a){var o={d:d};for(var k in a)o[k]=a[k];return el('path',o,par)}
function ln(par,d,w,c,op){return P(par,d,{fill:'none',stroke:c||LD,'stroke-width':w||.8,'stroke-linecap':'round','stroke-linejoin':'round',opacity:op})}
/* dil: vypln + vnitrni kresba orezana tvarem + obrys navrchu */
function part(par,d,fill,o){
  o=o||{};var g=el('g',{},par),id='chcp'+(uid++);
  var cp=el('clipPath',{id:id},defs);el('path',{d:d},cp);
  var f=P(g,d,{fill:fill});
  var inner=el('g',{'clip-path':'url(#'+id+')'},g);
  if(o.shade){P(inner,o.shade,{fill:'rgba(0,0,0,.34)'});P(inner,o.shade,{fill:'url(#hatchFine)',opacity:.9})}
  P(inner,d,{fill:'url(#chVol)'});
  if(o.rim)ln(inner,o.rim,1,'var(--gold-light)',.32);
  var dark=null;if(o.dark)dark=P(g,d,{fill:'rgba(4,5,7,.42)'});
  var out=P(g,o.open||d,{fill:'none',stroke:o.stroke||(o.dark?'rgba(231,221,199,.6)':LINE),'stroke-width':o.w||1.45,'stroke-linejoin':'round','stroke-linecap':'round'});
  if(dark)g.insertBefore(dark,out);
  return {g:g,inner:inner,fill:f,out:out};
}
function T(g,x,y,a,s){g.setAttribute('transform','translate('+x.toFixed(2)+','+y.toFixed(2)+') rotate('+a.toFixed(2)+')'+(s?' scale('+s+')':''))}

/* ---------- tvary (profil doprava) ---------- */
var SH={
  thigh:'M -16,-12 C -21,6 -18,40 -12,72 C -11,78 -9,84 -4,85 L 9,85 C 12,83 13,77 13,70 C 15,46 19,18 16,-12 C 8,-18 -8,-18 -16,-12 Z',
  thighShade:'M -24,-16 C -24,20 -18,52 -13,90 L -5,90 C -9,52 -11,18 -8,-16 Z',
  thighRim:'M 15,-6 C 17,20 14,50 12,72',
  shin:'M -11,-6 C -14,14 -13,36 -10,58 C -9,68 -9,76 -9.5,86 L 9.5,86 C 9,76 8.5,64 8.5,54 C 9.5,34 11,14 11,-6 C 4,-10 -5,-10 -11,-6 Z',
  shinShade:'M -15,-8 C -16,20 -12,50 -11,90 L -4,90 C -6,56 -7,24 -5,-10 Z',
  upper:'M -10,-8 C -12,12 -10,36 -7.5,56 C -7,60 -4,62 0,62 C 4,62 7,60 7.5,56 C 9,38 11,16 10,-8 C 6,-13 -6,-13 -10,-8 Z',
  upperShade:'M -14,-14 C -14,16 -11,40 -9,66 L -3,66 C -4,40 -5,14 -4,-14 Z',
  fore:'M -7.5,-4 C -8.5,14 -7,36 -5,54 C -4.5,57.5 4.5,57.5 5,54 C 6,38 8.5,16 7.5,-4 C 4,-8 -4,-8 -7.5,-4 Z',
  foreShade:'M -10,-8 C -10,16 -8,40 -6,60 L -1.5,60 C -2.5,38 -3,16 -2,-8 Z',
  neck:'M -6.5,-102 C -6.5,-110 -7,-117 -5.5,-124 L 7.5,-124 C 8,-117 8.4,-110 9.5,-102 Z',
  torsoM:'M -6,-110 C -12,-106 -16,-101 -17,-94 C -20,-80 -20,-62 -18,-46 C -17,-36 -18,-28 -20,-18 C -24,-6 -24,6 -16,11 C -8,15 6,14 14,8 C 16,0 16,-10 15,-18 C 17,-30 18,-42 18,-56 C 20,-70 20,-86 15,-98 C 12,-104 9,-108 7,-110 Z',
  torsoF:'M -5,-110 C -11,-106 -14.5,-101 -15.5,-94 C -18,-80 -17,-66 -15,-52 C -14,-42 -15.5,-30 -18.5,-18 C -23,-6 -22,7 -14,11.5 C -7,15 6,14 13,8 C 15,0 14.5,-10 13.5,-18 C 13,-28 13,-38 14,-50 C 18,-58 19,-72 16,-86 C 14,-96 10,-104 6.5,-110 Z',
  torsoShade:'M -30,-124 L -9,-124 C -13,-84 -12,-44 -13,-4 L -13,24 L -30,24 Z',
  torsoRim:'M 15,-96 C 19,-84 19,-66 17,-50',
  thighO:'M -16,-12 C -21,6 -18,40 -12,72 C -11,78 -9,84 -4,85 L 9,85 C 12,83 13,77 13,70 C 15,46 19,18 16,-12',
  shinO:'M -11,-6 C -14,14 -13,36 -10,58 C -9,68 -9,76 -9.5,86 L 9.5,86 C 9,76 8.5,64 8.5,54 C 9.5,34 11,14 11,-6',
  upperO:'M -10,-8 C -12,12 -10,36 -7.5,56 C -7,60 -4,62 0,62 C 4,62 7,60 7.5,56 C 9,38 11,16 10,-8',
  foreO:'M -7.5,-4 C -8.5,14 -7,36 -5,54 C -4.5,57.5 4.5,57.5 5,54 C 6,38 8.5,16 7.5,-4',
  neckO:'M -6.5,-102 C -6.5,-110 -7,-117 -5.5,-124 M 7.5,-124 C 8,-117 8.4,-110 9.5,-102'
};
var HAND={
  relax:{d:'M -5,0 C -6,4 -6.5,9 -6,13 C -5.8,16 -4.5,19.5 -2,21.5 C 0,22.8 2.5,22.6 3.6,21 C 4.4,19.6 3.4,18.2 2.2,17.6 C 3.6,15 5,12 5.6,8 C 6,5 6,2 5,0 Z',
    l:['M -4.8,13.5 C -3.6,16.5 -1.2,19 1.6,20.2','M -5.6,10.5 C -4.6,14 -2.6,16.8 0,18.2'],
    th:'M 4.8,4.5 C 8.2,6.5 9.6,10 8.6,13.2 C 8,14.6 6.4,14.4 6,13 C 6.4,10.8 5.8,8.6 4.4,7.4 Z'},
  hold:{d:'M -5,0 C -6.2,4 -6.6,9 -5.6,13 C -4.8,16.2 -2,18 1.2,17.8 C 4.6,17.6 6.6,15.4 6.6,12.2 C 6.6,8.8 6.2,4 5,0 Z',
    l:['M -5.2,13 C -2,13.6 2,13.6 6.4,12.6','M -4.6,15.8 C -1.5,16.4 2,16.2 5.6,14.8','M -5.8,10 C -3,10.6 1,10.4 6.4,9.4'],
    th:'M 5,5 C 8.4,6.6 9.4,9.6 8.2,11.6 C 7,13 4.6,12.8 3.2,12 Z'},
  flat:{d:'M -4.6,0 C -5,6 -5,12 -4.2,18 C -3.8,22 -3,25 -1.6,26.6 C -.4,27.6 1.4,27.4 2,26 C 2.6,22 3.4,17 4.6,12 C 5.4,8 5.6,3 4.8,0 Z',
    l:['M -3.6,15 C -2,15.6 0,15.6 3.6,14.4','M -1,17 C -.6,20 -.2,23 .4,26'],
    th:'M 4.6,5 C 7.4,8 8.2,12 7.2,15.6 C 6.6,17 5,16.6 4.8,15.2 Z'},
  open:{d:'M -5,0 C -6,5 -6,9 -5.5,12 L -8.5,21 C -9,22.6 -7.4,23.4 -6.6,22.2 L -3.6,14.6 L -4.4,24.6 C -4.4,26.2 -2.6,26.4 -2.3,25 L -1,15 L .4,25 C .6,26.6 2.4,26.4 2.4,24.8 L 2.2,14.6 L 4.6,22.6 C 5.1,24 6.8,23.6 6.6,22 L 5,12.4 C 5.6,8 5.8,3 5,0 Z',
    l:['M -4,9 C -1,10 2,10 4.6,9'],
    th:'M 5,4.6 C 8.6,5.4 11.6,7.8 12.4,10.6 C 12.8,12.2 11.2,12.8 10.4,11.6 C 9,9.8 7,9 5.4,9 Z'},
  point:{d:'M -5,0 C -6.2,4 -6.6,9 -5.6,13 C -4.8,16 -2.2,17.6 .6,17.4 L 1,26 C 1.1,27.6 3.2,27.6 3.2,26 L 3.6,16.4 C 5.6,15 6.6,12.4 6.4,9 C 6.2,5.6 6,2.6 5,0 Z',
    l:['M -5.2,12.6 C -3,13.4 -1,13.4 .8,13','M -4.4,15.4 C -2.6,16 -1,16 .6,15.6'],
    th:'M 5,5 C 8.2,6.6 9,9.4 7.8,11.4 C 6.8,12.6 4.8,12.2 3.6,11.4 Z'}
};
var SHOE={
  sneaker:{d:'M -9,-6 C -11,-2 -12.5,3 -11.5,7 L -11,9.5 L 30,9.5 C 33,9.5 34.5,7.5 33.5,5 C 32,2 27,0 21,-1.5 C 15,-3 10,-6 7,-9 C 3,-11 -6,-10.5 -9,-6 Z',
    sole:'M -11.5,5.6 L 33.8,5.2 L 33.5,6.5 C 33.6,8.6 32.4,9.5 30,9.5 L -11,9.5 Z',
    l:['M -10.6,1 C -6,2 0,1.6 6,-2','M 18,-1.2 C 22,3 27,4 33,4.2','M 8,-6.6 l3,2.4 M 11,-5.2 l3,2.4 M 14,-3.8 l3,2.4','M -9,-5 C -7,-8 -3,-9.4 1,-9.6',
       'M 20,-.6 C 24,1.6 28,2.6 32.4,3 M 21,4.6 C 25,5.4 29,5.4 33,5','M -8,2.4 C -2,4.2 6,4 12,1.6 C 16,0 20,1 24,3.4','M 5.6,-8.2 l1,1 M 8.6,-6.6 l1,1 M 11.6,-5.2 l1,1 M 14.6,-3.8 l1,1','M -11,7.6 h3 M -6,7.6 h3 M -1,7.6 h3 M 4,7.6 h3 M 9,7.6 h3 M 14,7.6 h3 M 19,7.6 h3 M 24,7.6 h3']},
  boot:{d:'M -9,-21 C -10.5,-10 -12,2 -11.5,7 L -11,10 L 29,10 C 32.5,10 34,7.5 33,5 C 31.5,1.5 25,-.5 18,-2.5 C 12,-4 8.5,-8 8,-21 Z',
    sole:'M -11.6,6 L 33.4,5.4 C 33.6,8 32.6,10 29,10 L -11,10 Z',
    l:['M 8,-18 l-4,1.6 M 8.2,-13 l-4,1.6 M 8.8,-8 l-4,1.6','M -11,3.6 L 33,3.2','M 12,-3.6 C 18,1.6 26,2 32,3','M -10,-12 C -6,-11 -2,-11.4 2,-12.8',
       'M 4,-19.4 l 4.6,3 M 4.2,-14.4 l 4.6,3 M 4.6,-9.4 l 4.6,3','M -10.6,1.6 h2.6 M -5.6,1.6 h2.6 M -.6,1.6 h2.6 M 4.4,1.4 h2.6 M 9.4,1.4 h2.6 M 14.4,1.2 h2.6 M 19.4,1.2 h2.6 M 24.4,1.6 h2.6','M -11.4,6.4 L -2,6.2 L -2,10','M -7,-21 C -7.4,-14 -8.4,-6 -9,0']}
};

/* ---------- stavba postavy ---------- */
function build(kind){
  var H=kind==='honza';
  var C=H?{skin:'#2E2B2B',shirt:'#16171C',pants:'#1A1F2C',shoe:'#261E17',hair:'#0F0E0E',glove:'#0A0A0C'}
         :{skin:'#302C2C',shirt:'#2A2822',pants:'#1C2130',shoe:'#26262B',hair:'#2B2019',scarf:'#56462B',bag:'#2C2118',glove:'#0A0A0C'};
  var root=el('g',{'class':'fig-'+kind,filter:'url(#chSep)'},ST.L.fig),body=el('g',{},root);
  var F={kind:kind,root:root,body:body,C:C,spring:{a:0,v:0,lx:null},hand:{}};

  function limbArm(side){
    var dark=side==='b',g=el('g',{},body),A={};
    A.upper=part(g,SH.upper,C.skin,{shade:SH.upperShade,dark:dark,open:SH.upperO,rim:dark?null:'M 9.6,-4 C 10.6,16 9,38 7.2,56'});
    A.fore=part(g,SH.fore,C.skin,{shade:SH.foreShade,dark:dark,open:SH.foreO,rim:dark?null:'M 7,0 C 8,16 6.4,36 4.6,52'});
    A.handG=el('g',{},g);
    A.hands={};
    Object.keys(HAND).forEach(function(k){var hg=el('g',{},A.handG),h=HAND[k];
      var hp=part(hg,h.d,C.skin,{dark:dark,w:1.2,open:h.d.replace(/\s*Z\s*$/,'')});h.l.forEach(function(l){ln(hp.inner,l,.7,LD)});
      var tp=part(hg,h.th,C.skin,{dark:dark,w:1.2});
      A.hands[k]={g:hg,fills:[hp.fill,tp.fill]};hg.style.display='none'});
    A.tool=el('g',{},A.handG);

    if(H){
      /* rukav tricka */
      var sl=P(A.upper.inner,'M -14,-16 L 14,-16 L 12.4,25 C 6,28 -6,28 -12.4,25 Z',{fill:C.shirt});
      ln(A.upper.inner,'M -12,24 C -6,27 6,27 12,24',.9,LD);ln(A.upper.inner,'M -11,20 C -5,22.6 4,22.6 11,20',.6,LF);
      ln(A.upper.inner,'M -4,6 q4,6 9,4',.6,LF);
      /* tetovani rukavu: slunce s paprsky na bicepsu, vinna reva a lotosove listy na predlokti, teckovany naramek */
      var tg=el('g',{opacity:dark?.45:.9},A.upper.inner);
      ln(tg,'M 0,42 c 2,-2 4,0 3,2 c -1,3 -6,3 -7,-1 c -1,-5 5,-8 9,-5 c 4,3 3,10 -3,12 c -6,2 -11,-3 -10,-8',.7,'var(--gold)');
      ln(tg,'M -6,48 q -6,4 -9,-1 q 5,-3 9,1 M 6,47 q 6,3 9,-2 q -5,-2 -9,2',.55,'var(--gold)');
      ln(tg,'M -8,30 C -4,32 4,32 8,30',.5,'var(--gold)');
      ln(tg,'M -7,26 C -2,18 4,14 8,4 M -4,22 l -4,-1 M -1,18 l -4,-2 M 2,14 l -4,-2 M -2,24 l 3,2 M 1,20 l 3,1 M 4,16 l 3,1',.5,'var(--gold)');
      for(var dd=0;dd<14;dd++)P(tg,ST.circ(-6+((dd*37)%13),34+((dd*17)%10),.35),{fill:'var(--gold-light)',opacity:.7});
      var fg=el('g',{opacity:dark?.45:.9},A.fore.inner);
      ln(fg,'M .5,2 C 5,10 -4,18 .5,26 C 5,34 -3.5,42 .5,49',.75,'var(--gold)');
      [[1.6,8,1],[-1.5,16,-1],[2,24,1],[-1.6,32,-1],[1.6,40,1]].forEach(function(q){
        ln(fg,'M '+q[0]+','+q[1]+' q'+(q[2]*5)+',-3.5 '+(q[2]*6.5)+',1.5 q'+(-q[2]*4.5)+',2 '+(-q[2]*6.5)+',-1.5 Z',.55,'var(--gold)')});
      for(var j=-4;j<=4;j++)P(fg,ST.circ(j*1.15,50.5+Math.abs(j)*.12,.42),{fill:'var(--gold)'});
      ln(fg,'M -5,46.5 C -2,47.6 2,47.6 5,46.5',.45,'var(--gold)');
      /* kvet pivonky na vnitrni strane predlokti a jemne stinovani teckami */
      ln(fg,'M -4,20 c -3,-3 -1,-7 3,-6 c 1,-4 6,-4 7,0 c 4,-1 5,4 2,6 c 2,3 -1,6 -4,5 c -2,3 -6,2 -6,-1 c -3,0 -4,-3 -2,-4 Z',.5,'var(--gold)');
      ln(fg,'M -1,18 c 1,-2 3,-2 4,0 c -1,2 -3,2 -4,0',.4,'var(--gold-light)');
      for(var de=0;de<18;de++)P(fg,ST.circ(-5+((de*29)%11),4+((de*23)%40),.3),{fill:'var(--gold-light)',opacity:.55});
    }else{
      /* bunda klienta: rukav pres celou paži, manzeta; u predni ruky vyhrnuty variant */
      A.sleeveU=el('g',{},A.upper.inner);
      P(A.sleeveU,'M -15,-16 L 15,-16 L 12,66 L -12,66 Z',{fill:C.shirt});
      ln(A.sleeveU,'M 1,-12 C 2,14 1,40 0,62',.6,LF);ln(A.sleeveU,'M -8,40 q6,4 14,0',.7,LD);ln(A.sleeveU,'M -7,50 q5,3 12,-1',.6,LF);
      A.sleeveF=el('g',{},A.fore.inner);
      P(A.sleeveF,'M -12,-10 L 12,-10 L 9,47 L -9,47 Z',{fill:C.shirt});
      P(A.sleeveF,'M -9,44 L 9,44 L 8,52 L -8,52 Z',{fill:C.shirt,stroke:LD,'stroke-width':.7});
      ln(A.sleeveF,'M -6,14 q5,3 12,0',.6,LF);ln(A.sleeveF,'M -5,30 q4,3 10,-1',.6,LF);
      A.rolled=el('g',{},A.fore.inner);
      P(A.rolled,'M -12,-10 L 12,-10 L 10.5,11 C 5,14 -5,14 -10.5,11 Z',{fill:C.shirt});
      ln(A.rolled,'M -10,4 C -4,7 4,7 10,4',.8,LD);ln(A.rolled,'M -9.6,9 C -4,12 4,12 9.6,9',.7,LD);
      A.rolled.style.display='none';
      if(!dark){A.mark=el('g',{transform:'translate(2.6,30) scale(.36)',opacity:0},A.fore.inner);
        P(A.mark,'M 2,-12 C 6,-13 8,-10 7,-7 C 9,-6 8,-4 6,-4 C 5,0 3,5 1,9 L -1,16 L -2,9 C -4,4 -4,-2 -2,-7 C -2,-10 0,-12 2,-12 Z',{fill:'#C8664F'});
        P(A.mark,'M -2,-4 C -4,0 -4,5 -2,9 L 1,2 Z',{fill:'#5E8DAE'});P(A.mark,'M -7,4 L 9,2',{fill:'none',stroke:'var(--gold-light)','stroke-width':1.2});
        A.mark.setAttribute('filter','url(#glowW)');}
    }
    return A;
  }
  function limbLeg(side){
    var dark=side==='b',g=el('g',{},body),L={};
    var sh=SHOE[H?'boot':'sneaker'];
    L.foot=el('g',{},g);
    var fp=part(L.foot,sh.d,C.shoe,{dark:dark,w:1.5});
    P(fp.inner,sh.sole,{fill:H?'#120F0C':'#B9B09C',opacity:H?1:.55});
    sh.l.forEach(function(l){ln(fp.inner,l,.7,LD)});
    L.thigh=part(g,SH.thigh,C.pants,{shade:SH.thighShade,dark:dark,open:SH.thighO,rim:dark?null:SH.thighRim});
    ln(L.thigh.inner,'M 1.5,-6 C 2.5,30 1.5,60 .5,82',.55,LF);
    ln(L.thigh.inner,'M -9,70 q6,3 15,0',.7,LD);ln(L.thigh.inner,'M -7,77 q5,2 12,-1',.6,LF);
    if(!dark)ln(L.thigh.inner,'M 5,-8 q6,6 9,15',.7,LD);
    /* zadni kapsa s prosivanim, nyt u predni kapsy, dvojity bocni sev */
    ln(L.thigh.inner,'M -19,-4 L -6,-6 L -5,14 L -12,19 L -19,14 Z',.75,dark?LF:LD);
    ln(L.thigh.inner,'M -17.4,-2 L -7.6,-3.6 L -7,12.6 L -12,16.4 L -17.2,12.6',.45,LF);
    ln(L.thigh.inner,'M -17,5 L -12,8.6 L -7.4,4',.45,LF);
    P(L.thigh.inner,ST.circ(12.4,-4,1),{fill:'var(--gold)',opacity:dark?.3:.75});
    ln(L.thigh.inner,'M 3,-6 C 4,30 3,60 2,82',.4,'rgba(200,164,92,.35)');
    ln(L.thigh.inner,'M -8,32 q 8,4 18,1 M -9,46 q 9,3 19,0',.5,LF);
    L.shin=part(g,SH.shin,C.pants,{shade:SH.shinShade,dark:dark,open:SH.shinO});
    ln(L.shin.inner,'M -9.6,79 L 9.4,79',.8,LD);ln(L.shin.inner,'M -9.6,82.4 L 9.4,82.4',.5,LF);
    ln(L.shin.inner,'M -7,68 q4,2.4 9,-1',.6,LF);ln(L.shin.inner,'M -8,60 q5,3 11,0',.6,LF);ln(L.shin.inner,'M 2,-4 C 3,26 2,56 1,78',.5,LF);
    return L;
  }
  F.aB=limbArm('b');F.lB=limbLeg('b');
  /* vlasy vzadu (klient) */
  if(!H){F.hairBackG=el('g',{},body);F.lockG=null;F.hairBack=P(F.hairBackG,'',{fill:C.hair,stroke:'rgba(231,221,199,.5)','stroke-width':1.1,'stroke-linejoin':'round'});F.hairStr=el('g',{},F.hairBackG)}
  /* krk a trup */
  F.torsoG=el('g',{},body);
  part(F.torsoG,SH.neck,C.skin,{w:1.4,open:SH.neckO,shade:'M -10,-130 L -2,-130 L -2,-100 L -10,-100 Z'});
  var tp=part(F.torsoG,H?SH.torsoM:SH.torsoF,C.pants,{shade:SH.torsoShade,rim:SH.torsoRim});
  if(H){
    P(tp.inner,'M -30,-130 L 30,-130 L 30,-11 C 18,-8 6,-12 -6,-9 C -14,-7 -22,-10 -30,-9 Z',{fill:C.shirt});
    P(tp.inner,SH.torsoShade,{fill:'rgba(0,0,0,.3)'});P(tp.inner,SH.torsoShade,{fill:'url(#hatchFine)',opacity:.9});
    ln(tp.inner,'M -30,-9 C -22,-10 -14,-7 -6,-9 C 6,-12 18,-8 30,-11',.9,LD);
    ln(tp.inner,'M -6,-108 C -2,-103 4,-102 8,-106',.9,LD);ln(tp.inner,'M -4,-104 C 0,-100 5,-100 8.6,-103',.6,LF);
    ln(tp.inner,'M 14,-40 q-7,-3 -14,1',.6,LF);ln(tp.inner,'M 15,-26 q-8,-2 -17,3',.6,LF);ln(tp.inner,'M -14,-60 q4,10 2,22',.6,LF);
    ln(tp.inner,'M 4,-4 C 6,2 10,6 14,7',.7,LD);ln(tp.inner,'M -2,-9 L -2,4',.6,LF);
    /* opasek: kuze, prosiveni, spona a poutka */
    P(tp.inner,'M -30,-10 C -18,-11 -6,-9 6,-11 C 16,-12.6 24,-11.4 30,-12.4 L 30,-4 C 24,-3 16,-4.4 6,-3 C -6,-1.4 -18,-3.6 -30,-2.6 Z',{fill:'#0d0c0b',stroke:LD,'stroke-width':.7});
    ln(tp.inner,'M -30,-8.4 C -18,-9.4 -6,-7.4 6,-9.4 C 16,-11 24,-9.8 30,-10.8 M -30,-4.2 C -18,-5.2 -6,-3 6,-4.6 C 16,-6 24,-4.6 30,-5.6',.35,'rgba(231,221,199,.3)');
    P(tp.inner,ST.rect(9,-11.6,7.4,8.4,1.4),{fill:'none',stroke:'var(--gold)','stroke-width':1});ln(tp.inner,'M 12.6,-11 V -3.6',.7,'var(--gold-light)');
    ln(tp.inner,'M -12,-11 V -2 M -11,-11 V -2 M 1,-11 V -2.4 M 2,-11 V -2.4',.5,LD);
    /* golier (zebrovany), bocni sev a prosiveni lemu */
    ln(tp.inner,'M -6.5,-110 C -2,-104 5,-103 9,-107.6',1.6,'rgba(0,0,0,.6)');ln(tp.inner,'M -5.6,-106.6 C -1.6,-101.8 4.6,-101 8.4,-104.4',.45,LF);
    ln(tp.inner,'M -1,-100 C 0,-70 -1,-40 -1,-14',.45,'rgba(231,221,199,.16)');
    ln(tp.inner,'M -30,-14.4 C -22,-15.4 -14,-12.4 -6,-14.4 C 6,-17.4 18,-13.4 30,-16.4',.4,'rgba(231,221,199,.22)');
    ln(tp.inner,'M 4,-30 q 6,-2 10,2 M -10,-50 q 6,4 4,12 M 8,-78 q 4,4 8,4',.5,LF);
  }else{
    P(tp.inner,'M -32,-130 L 32,-130 L 32,3 C 14,6 -10,6 -32,2 Z',{fill:C.shirt});
    P(tp.inner,SH.torsoShade,{fill:'rgba(0,0,0,.3)'});P(tp.inner,SH.torsoShade,{fill:'url(#hatchFine)',opacity:.9});
    P(tp.inner,'M -32,-3 C -10,1 14,1 32,-2 L 32,4 C 14,7 -10,7 -32,3 Z',{fill:'rgba(0,0,0,.25)',stroke:LD,'stroke-width':.7});
    ln(tp.inner,'M 12.6,-104 C 14,-70 13.6,-30 12.6,0',.7,LD);
    ln(tp.inner,'M 2,-40 L 10,-40 L 10,-26 L 2,-26',.6,LD);ln(tp.inner,'M -10,-80 q4,14 2,30',.6,LF);ln(tp.inner,'M 8,-60 q-5,6 -12,6',.6,LF);
    ln(tp.inner,'M -24,-28 L 24,-28',.4,LF);
    /* zip bundy s jezdcem, stojaci limec, nprsni kapsa, prosiveni */
    ln(tp.inner,'M 12.2,-104 C 13.6,-70 13.2,-30 12.2,0',1.4,'rgba(0,0,0,.45)');
    P(tp.inner,'M 12.2,-104 C 13.6,-70 13.2,-30 12.2,0',{fill:'none',stroke:'rgba(231,221,199,.4)','stroke-width':1.6,'stroke-dasharray':'.6 1.6'});
    P(tp.inner,ST.rect(10.6,-97,3.4,6,1),{fill:'var(--gold)',opacity:.8});ln(tp.inner,'M 12.3,-91 v 4',.6,'var(--gold-light)');
    ln(tp.inner,'M 6,-112 C 9,-106 12,-102 14.6,-100 M -6,-112 C -9,-106 -12,-103 -15,-101',.8,LD);
    ln(tp.inner,'M -4,-74 L 9,-74 L 9,-64 L -4,-64 Z',.6,LD);ln(tp.inner,'M -4,-74 L 9,-74 L 8,-69 L -3,-69 Z',.5,LF);P(tp.inner,ST.circ(2.6,-70.6,.9),{fill:'var(--gold)',opacity:.7});
    ln(tp.inner,'M -30,-6 C -10,-2 14,-2 32,-5',.4,'rgba(231,221,199,.22)');ln(tp.inner,'M -18,-100 C -20,-70 -19,-40 -17,-8',.4,'rgba(231,221,199,.14)');
    ln(tp.inner,'M -14,-46 q 6,3 12,0 M -10,-20 q 6,3 14,-1',.5,LF);
    /* popruh tasky pres hrud */
    ln(tp.inner,'M 12,-102 C 4,-76 -8,-40 -18,-8',2.2,'#3a2c1f');ln(tp.inner,'M 12,-102 C 4,-76 -8,-40 -18,-8',.6,LD);
  }
  /* pravá noha (bliz k divakovi) */
  F.lF=limbLeg('f');
  /* taska klienta */
  if(!H){F.bagG=el('g',{},body);var bg=part(F.bagG,'M -14,-2 L 14,-2 C 16,-2 17,0 17,3 L 16,26 C 16,29 14,31 11,31 L -11,31 C -14,31 -16,29 -16,26 L -17,3 C -17,0 -16,-2 -14,-2 Z',C.bag,{w:1.4,shade:'M -20,14 L 20,14 L 20,34 L -20,34 Z'});
    ln(bg.inner,'M -16,8 C -6,11 6,11 16,8',.7,LD);P(bg.inner,ST.rect(-2.5,6,5,6,1),{fill:'var(--gold)',opacity:.8});ln(bg.inner,'M -14,2 L 14,2',.4,LF);
    P(bg.inner,'M -17,-2 L 17,-2 L 16,13 C 6,16 -6,16 -16,13 Z',{fill:'rgba(0,0,0,.25)',stroke:LD,'stroke-width':.6});
    P(bg.inner,'M -14,0 L 14,0 L 13.4,11 C 5,13.6 -5,13.6 -13.4,11 Z',{fill:'none',stroke:'rgba(231,221,199,.3)','stroke-width':.6,'stroke-dasharray':'1.4 1.4'});
    P(bg.inner,'M -14,18 L 14,18 M -15,24 L 15,24',{fill:'none',stroke:'rgba(231,221,199,.18)','stroke-width':.5,'stroke-dasharray':'1.4 1.4'});}
  /* hlava */
  F.headG=el('g',{},body);F.head=el('g',{},F.headG);
  buildHead(F,H);
  /* pramen vlasu pred ramenem (v hlave) */
  if(!H){F.lock=P(F.head,'',{fill:C.hair,stroke:'rgba(231,221,199,.45)','stroke-width':.9,'stroke-linejoin':'round'})}
  /* sala */
  if(!H){F.scarfG=el('g',{},body);
    F.scarfWrap=part(F.scarfG,'M -9,-116 C -4,-108 6,-106 13,-111 L 14,-100 C 7,-95 -4,-96 -11,-104 Z',C.scarf,{w:1.3});
    P(F.scarfWrap.inner,'M -20,-120 L 20,-120 L 20,-94 L -20,-94 Z',{fill:'url(#hatchX)',opacity:.8});
    F.scarfEnd=P(F.scarfG,'',{fill:C.scarf,stroke:LINE,'stroke-width':1.2,'stroke-linejoin':'round'});
    F.scarfFr=P(F.scarfG,'',{fill:'none',stroke:LD,'stroke-width':.7});}
  /* predni ruka */
  F.aF=limbArm('f');
  return F;
}

function buildHead(F,H){
  var g=F.head,C=F.C;
  var face=H?'M -8,4 C -13,-4 -23,-14 -23,-30 C -23,-46 -10,-56 4,-56 C 13,-56 18,-48 18.5,-40 C 18.8,-37 19.6,-35.4 19,-34 C 18.4,-32.4 19.6,-30.4 21.2,-28.2 L 24.6,-24.4 C 25,-23.2 23.4,-22.4 21.2,-22.6 L 19.4,-22 C 19.8,-20.8 20.6,-19.8 20.4,-19.2 C 19.6,-18.6 18.8,-18.2 19.4,-17.6 C 20.2,-16.8 20,-15.6 18.6,-14.6 C 18,-13.8 18.4,-12.6 19,-11.5 C 19.4,-9 18,-7 14.5,-6 C 11,-5 9,-2 9,2 Z'
             :'M -8,4 C -13,-4 -22,-14 -22,-30 C -22,-46 -10,-55 4,-55 C 12.6,-55 17.4,-48 17.8,-40 C 18.2,-37 18.8,-35.4 18.4,-34 C 18,-32.4 19.2,-30.6 20.4,-28.6 L 22.6,-25.2 C 22.8,-24 21.6,-23.2 20,-23.4 L 18.8,-22.8 C 19.2,-21.6 20.4,-20.6 20.8,-19.8 C 20.2,-18.9 19,-18.5 19.8,-17.6 C 20.8,-16.6 20.4,-15.1 18.6,-14.3 C 18,-13.5 18.2,-12.6 18.4,-11.6 C 18.4,-9.4 16.8,-7.6 14,-6.8 C 11,-6 9,-3 9,2 Z';
  var hp=part(g,face,C.skin,{w:1.6,shade:'M -30,-62 L -6,-62 C -10,-40 -8,-20 -2,6 L -30,6 Z',rim:H?'M 18.4,-44 C 19,-38 19.4,-35 18.8,-33':'M 17.6,-44 C 18,-38 18.6,-35 18.2,-33'});
  ln(hp.inner,'M -1,-20 Q 6,-8 14,-6',.6,LF);
  ln(hp.inner,'M 6,-24 q3,-3 7,-2.6',.5,LF);
  ln(hp.inner,'M 19.2,-27.4 C 18,-26.6 17.4,-25.2 17.8,-24',.55,LD);
  if(H){
    /* vous a knir */
    var bd=part(g,'M -1,-33 C 2,-30 4,-26 6,-22.6 C 9,-20 13,-20.4 16.6,-20.8 C 18.6,-20 19.8,-19.2 19.6,-17.8 C 20.6,-16.6 20.8,-15 19.8,-13.6 C 20.8,-11 21,-7.6 18.6,-4.4 C 15.8,-1.2 11,-.4 7,-1.2 C 2,-2.4 -2,-6 -4,-10 C -5.4,-14 -4.6,-20 -3.6,-26 Z',C.hair,{w:1.2});
    var rb=ST.rng(5);for(var i=0;i<26;i++){var x=-3+rb()*21,y=-28+rb()*25;ln(bd.inner,'M '+x.toFixed(1)+','+y.toFixed(1)+' l '+(1+rb()*1.6).toFixed(1)+','+(2.4+rb()*2).toFixed(1),.5,LF)}
    F.mouth=P(g,'M 16.8,-17.9 Q 18.6,-17.4 19.8,-17.8',{fill:'none',stroke:LINE,'stroke-width':.8});
    F.lip=P(g,'M 18.4,-17.2 C 19.6,-17 20.4,-16.4 20,-15.6 C 19.2,-15.2 18.2,-15.6 17.8,-16.4 Z',{fill:C.skin,stroke:LD,'stroke-width':.5});
    P(g,'M 15.6,-21 C 17.6,-21.9 19.8,-21.4 21,-20 C 20.2,-19 18.4,-18.8 16.2,-19.6 Z',{fill:C.hair,stroke:LD,'stroke-width':.5});
    /* kratke zastrizene boky (fade) */
    var fd=P(g,'M -5,-45 C -2,-40 0,-36 -1,-32 C -6,-31 -12,-28 -18,-22 C -22,-26 -23.5,-33 -22.5,-39 C -17,-43 -11,-45.5 -5,-45 Z',{fill:C.hair,opacity:.55});
    P(g,'M -5,-45 C -2,-40 0,-36 -1,-32 C -6,-31 -12,-28 -18,-22 C -22,-26 -23.5,-33 -22.5,-39 C -17,-43 -11,-45.5 -5,-45 Z',{fill:'url(#stipple)',opacity:.9});
    /* vrsek: texturovany, vycesany nahoru a dozadu */
    var hr=part(g,'M 18,-44.5 C 19.5,-47 21.5,-51 20.5,-55 C 22,-58 20,-63 16,-64.5 C 14,-68.5 8,-70 3,-68.5 C -2,-71 -9,-69.5 -13,-66 C -18,-65 -22,-60.5 -23,-55 C -25,-51 -24.6,-44 -23.5,-39 C -18,-43 -11.5,-45.5 -5.5,-45.2 C 1,-47.5 10,-47 18,-44.5 Z',C.hair,{w:1.1,stroke:'rgba(231,221,199,.5)'});
    var rh=ST.rng(21);for(var s3=0;s3<12;s3++){var hx0=16-s3*3.3+rh()*2,hy0=-46-rh()*2,cx1=hx0-2+rh()*3,cy1=-55-rh()*6,ex1=hx0-8-rh()*6,ey1=-64-rh()*5+s3*.5;
      ln(hr.inner,'M '+hx0.toFixed(1)+','+hy0.toFixed(1)+' Q '+cx1.toFixed(1)+','+cy1.toFixed(1)+' '+ex1.toFixed(1)+','+ey1.toFixed(1),.5,rh()<.3?'rgba(232,213,163,.3)':'rgba(231,221,199,.14)')}
    ln(hr.inner,'M 17,-49 C 16,-56 12,-61 6,-63.5',.9,'rgba(232,213,163,.22)');
    /* sediny ve vousech */
    var rg=ST.rng(9);for(var i2=0;i2<16;i2++){var gx2=-2+rg()*20,gy2=-24+rg()*20;ln(bd.inner,'M '+gx2.toFixed(1)+','+gy2.toFixed(1)+' l '+(.8+rg()*1.4).toFixed(1)+','+(2+rg()*2).toFixed(1),.55,'rgba(231,221,199,.4)')}
    /* tenke kovove bryle (z profilu): obruba cocky, nosnik, straznice k uchu */
    F.glasses=el('g',{},g);
    P(F.glasses,'M 16.4,-38.6 C 19.8,-37.4 20.6,-31 18.2,-27.6 C 15.8,-27.8 14.8,-30 15,-33 C 15.2,-36 15.6,-38 16.4,-38.6 Z',{fill:'rgba(232,213,163,.1)',stroke:'rgba(231,221,199,.85)','stroke-width':.7});
    ln(F.glasses,'M 15.4,-36.6 C 9,-36 3,-35.4 -1.6,-34.6 C -3,-34.2 -3.8,-32.8 -3.4,-31',.7,'rgba(231,221,199,.85)');
    ln(F.glasses,'M 19.6,-36.8 C 20.6,-37 21,-36.4 21.2,-35.6',.6,'rgba(231,221,199,.7)');
    ln(F.glasses,'M 17.4,-37 C 18.4,-35.6 18.6,-33 18,-30.6',.5,'rgba(255,246,223,.5)');
  }else{
    F.mouth=P(g,'M 17,-17.8 Q 18.8,-17.3 20,-17.8',{fill:'none',stroke:LINE,'stroke-width':.8});
    F.lip=P(g,'M 18.6,-17.2 C 20,-17 20.8,-16.2 20.2,-15.4 C 19.2,-15 18.2,-15.6 17.8,-16.4 Z',{fill:C.skin,stroke:LD,'stroke-width':.5});
    P(g,'M 19,-19.6 C 19.8,-20.2 20.6,-20.2 20.9,-19.7 C 20.4,-19.2 19.6,-19 19,-19.6 Z',{fill:'rgba(231,221,199,.25)'});
    /* vlasy: objem pres temeno, ofina na stranu */
    var hc=part(g,'M 17.4,-44.6 C 16,-52 9,-58 0,-59 C -12,-60 -22,-53 -25,-42 C -27,-34 -25.5,-26 -22,-19 C -19,-24 -16,-30 -12,-34 C -8,-38 -3,-41 2,-43 C 7,-44.6 12.4,-45 17.4,-44.6 Z',C.hair,{w:1.1,stroke:'rgba(231,221,199,.5)'});
    var rc=ST.rng(33);for(var s2=0;s2<10;s2++){var q0=15-s2*3.6+rc()*2,q1=-46-rc()*2;ln(hc.inner,'M '+q0.toFixed(1)+','+q1.toFixed(1)+' C '+(q0-4).toFixed(1)+','+(-55+rc()*3).toFixed(1)+' '+(q0-14-rc()*4).toFixed(1)+','+(-54+rc()*4).toFixed(1)+' '+(q0-20-rc()*6).toFixed(1)+','+(-40+rc()*8).toFixed(1),.45,rc()<.35?'rgba(232,213,163,.24)':'rgba(231,221,199,.1)')}
    P(g,'M 17.6,-45 C 15,-43 12,-40.5 9,-39.6 C 6,-38.8 3,-39.4 1,-40.6 C 5,-41.6 10,-43.4 13,-45.6 Z',{fill:C.hair,stroke:'rgba(231,221,199,.35)','stroke-width':.5});
    P(g,'M 4,-49 C 9,-52 13,-51 16,-48',{fill:'none',stroke:'var(--gold-light)','stroke-width':.7,opacity:.3});
  }
  /* ucho */
  var ear=part(g,'M -2.5,-36 C 1,-37.5 2.8,-34 2.6,-30.5 C 2.4,-27 .6,-24 -2,-23.6 C -3.8,-23.4 -4.6,-25 -3.4,-26.4 C -4.6,-29 -4.4,-33 -2.5,-36 Z',C.skin,{w:1.2});
  ln(ear.inner,'M -1.4,-33 C .8,-33 1.2,-30 .4,-28 C -.4,-26.6 -1.6,-27 -1.6,-28',.6,LD);
  if(!H)P(g,ST.circ(-1.6,-21.8,1),{fill:'var(--gold)'});
  /* oko a obocí */
  var ex=H?12:11.6;
  F.eye=el('g',{transform:'translate('+(ex+.6)+',-33) scale(.74) translate('+(-ex-.6)+',33)'},g);
  P(F.eye,'M '+(ex-2.6)+',-32.5 Q '+(ex+.6)+',-35.2 '+(ex+3.6)+',-32.8 Q '+(ex+.6)+',-31 '+(ex-2.6)+',-32.5 Z',{fill:'#0c0c0e',stroke:LINE,'stroke-width':.8});
  P(F.eye,ST.circ(ex+1.9,-32.8,1.15),{fill:'var(--line)'});
  P(F.eye,'M '+(ex-2.8)+',-33 Q '+(ex+.6)+',-35.8 '+(ex+3.8)+',-33.2',{fill:'none',stroke:LINE,'stroke-width':H?1:1.2});
  if(!H)ln(F.eye,'M '+(ex+3.6)+',-33.4 l 1.4,-1.2 M '+(ex+2.6)+',-34.2 l 1,-1.4',.6,LINE);
  F.lid=P(F.eye,'M '+(ex-2.8)+',-32.6 Q '+(ex+.6)+',-34.8 '+(ex+3.8)+',-32.8 Q '+(ex+.6)+',-31.4 '+(ex-2.8)+',-32.6 Z',{fill:C.skin,stroke:LINE,'stroke-width':.8,opacity:0});
  P(g,H?'M 8,-37.2 C 11,-39.6 15,-39.6 18.2,-37.6 C 15,-37.8 11.6,-37.4 8.6,-36.2 Z':'M 8.4,-37.6 C 11.4,-39.8 15,-39.8 17.6,-38.2 C 15,-38.2 11.8,-37.8 8.8,-36.8 Z',{fill:H?C.hair:'#2a2018',stroke:LD,'stroke-width':.5});
}

/* ---------- kinematika ---------- */
function dir(a){return [Math.sin(a*R),Math.cos(a*R)]}
function ik(jx,jy,tx,ty,a,b,s){
  var dx=tx-jx,dy=ty-jy,d=Math.sqrt(dx*dx+dy*dy);d=Math.max(Math.abs(a-b)+.5,Math.min(a+b-.05,d));
  var th=Math.atan2(dx,dy)/R,al=Math.acos(Math.max(-1,Math.min(1,(a*a+d*d-b*b)/(2*a*d))))/R,u=th+s*al;
  var kx=jx+Math.sin(u*R)*a,ky=jy+Math.cos(u*R)*a;
  return {u:u,l:Math.atan2(tx-kx,ty-ky)/R,kx:kx,ky:ky};
}
function crc(pts){var n=pts.length,d='M '+pts[0][0].toFixed(1)+','+pts[0][1].toFixed(1);
  for(var i=0;i<n;i++){var p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
    d+=' C '+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+','+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+' '+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+','+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1)}
  return d+' Z'}
function rot(x,y,a){var c=Math.cos(a*R),s=Math.sin(a*R);return [x*c-y*s,x*s+y*c]}
var L1=80,L2=82,U1=58,U2=54,SHF=[2,-98],SHB=[-3,-99],NECK=[2,-115];

/* poza: panev (py), naklon trupu, hlava, kotniky (x,y,naklon spicky), paze (fk: a1,el | ik: tx,ty), ruka */
function base(){return {py:-168,lean:1,headT:0,fFx:5,fFy:-8,fFa:0,fBx:-7,fBy:-8,fBa:0,
  aF:{fk:1,a1:5,el:10,wr:0},aB:{fk:1,a1:-4,el:12,wr:0},hF:'relax',hB:'relax'}}
function cp(p){var o={};for(var k in p)o[k]=(typeof p[k]==='object')?Object.assign({},p[k]):p[k];return o}
function ext(p,o){var r=cp(p);for(var k in o)r[k]=(typeof o[k]==='object'&&o[k]&&!Array.isArray(o[k]))?Object.assign({},r[k]&&r[k].fk===o[k].fk?r[k]:{},o[k]):o[k];return r}
var STAND=base();
var SIT=ext(STAND,{py:-106,lean:-2,fFx:80,fFy:-8,fBx:68,fBy:-8,aF:{fk:1,a1:24,el:62,wr:-10},aB:{fk:1,a1:16,el:58,wr:-10}});

/* vyreseni paze na uhly (pro michani) */
function armAngles(p,which,face,rootX){
  var a=p[which],sh=which==='aF'?SHF:SHB,s=rot(sh[0],sh[1],p.lean),Sx=s[0],Sy=p.py+s[1];
  if(a.fk)return {a1:a.a1,a2:a.a1+a.el,wr:a.wr||0};
  var tx=a.wx!=null?(a.wx-rootX)*face:a.tx,ty=a.wy!=null?a.wy-GY:a.ty;
  var r=ik(Sx,Sy,tx,ty,U1,U2,-1),wr=a.abs!=null?a.abs-r.l:(a.wr||0);
  return {a1:r.u,a2:r.l,wr:wr};
}
function resolve(p,face,rootX){var r=cp(p);r.AF=armAngles(p,'aF',face,rootX);r.AB=armAngles(p,'aB',face,rootX);return r}
function mixR(a,b,t){
  if(t<=0)return a;if(t>=1)return b;
  var r={};for(var k in a){if(typeof a[k]==='number')r[k]=a[k]+(b[k]-a[k])*t;else if(typeof a[k]==='string')r[k]=t<.5?a[k]:b[k]}
  ['AF','AB'].forEach(function(k){r[k]={a1:lerp(a[k].a1,b[k].a1,t),a2:lerp(a[k].a2,b[k].a2,t),wr:lerp(a[k].wr,b[k].wr,t)}});
  return r;
}

/* chuze: chodidla stoji na zemi, svihova noha v oblouku, panev se houpe podle delky nohou */
var STRIDE=206,STANCE=.62;
function gaitLeg(ps){
  var rel,y=-8,a=0;
  if(ps<STANCE){rel=STRIDE*(.31-ps);var u=ps/STANCE;
    if(u<.16)a=14*(1-u/.16);
    if(u>.64){a=-30*ss(.64,1,u);y=-8-ss(.64,1,u)*9}}
  else{var v=(ps-STANCE)/(1-STANCE),e=v*v*(3-2*v);
    rel=-STRIDE*.31+STRIDE*.62*e;y=-8-Math.pow(Math.sin(Math.PI*v),.85)*15;a=lerp(-30,12,ss(0,.85,v))}
  return {x:rel,y:y,a:a,st:ps<STANCE};
}
function walkPose(dist){
  var ph=dist/STRIDE,pF=((ph%1)+1)%1,pB=(pF+.5)%1,f=gaitLeg(pF),b=gaitLeg(pB),Lm=158;
  var hy=-168;
  [f,b].forEach(function(q){if(q.st){var h=q.y-Math.sqrt(Math.max(0,Lm*Lm-q.x*q.x));if(h>hy)hy=h}});
  hy=lerp(hy,-164,.3);
  var sw=f.x/(STRIDE*.31);
  return ext(STAND,{py:hy,lean:4.5,headT:-1.5,fFx:f.x,fFy:f.y,fFa:f.a,fBx:b.x,fBy:b.y,fBa:b.a,
    aF:{fk:1,a1:3-17*sw,el:14+8*Math.max(0,-sw),wr:-4},aB:{fk:1,a1:3+17*sw,el:14+8*Math.max(0,sw),wr:-4}});
}

/* ---------- vykresleni pozy ---------- */
function apply(F,st,time){
  var p=st.p,face=st.face;
  var af=Math.abs(face),sg=face<0?-1:1,op0=st.op==null?1:st.op,po=ss(.22,.58,af),fo=1-ss(.3,.66,af);
  F.root.setAttribute('transform','translate('+st.x.toFixed(2)+','+GY+') scale('+(sg*lerp(.4,1,ss(.1,1,af))).toFixed(3)+',1)');
  F.root.style.opacity=op0*po;
  if(F.front){F.front.setAttribute('opacity',(op0*fo).toFixed(3));if(fo>0)F.front.setAttribute('transform','translate('+st.x.toFixed(2)+','+GY+') scale('+lerp(1,.72,ss(.3,.8,af)).toFixed(3)+',1)');
    if(F.fMouth&&fo>0){var tk=ST.talk[F.kind==='honza'?'h':'c'];F.fMouth.setAttribute('transform',tk?'translate(0,'+(Math.abs(Math.sin(time*.024))*1.2).toFixed(2)+')':'')}}
  /* nohy */
  [['lF','fF',2],['lB','fB',-2]].forEach(function(q){
    var Lg=F[q[0]],hx=q[2],hy=p.py,tx=p[q[1]+'x'],ty=p[q[1]+'y'],r=ik(hx,hy,tx,ty,L1,L2,1);
    var ax=r.kx+Math.sin(r.l*R)*L2,ay=r.ky+Math.cos(r.l*R)*L2;
    T(Lg.thigh.g,hx,hy,-r.u);T(Lg.shin.g,r.kx,r.ky,-r.l);T(Lg.foot,ax,ay,-p[q[1]+'a']);
  });
  /* trup */
  T(F.torsoG,0,p.py,p.lean);
  if(F.bagG){var sp=F.spring.a;F.bagG.setAttribute('transform','translate('+(-9+sp*3).toFixed(2)+','+(p.py+2).toFixed(2)+') rotate('+(p.lean*.4+sp*7).toFixed(2)+') scale(.72)')}
  /* hlava */
  var nk=rot(NECK[0],NECK[1],p.lean),hx2=nk[0],hy2=p.py+nk[1],ha=p.lean+p.headT;
  T(F.headG,hx2,hy2,ha,.86);
  F.headTop=rot(0,-58*.86,ha);F.headTop=[hx2+F.headTop[0],hy2+F.headTop[1]];
  /* vlasy vzadu: visi po vahou a houpou se */
  if(F.hairBack){
    var sw=F.spring.a,gv=rot(0,1,-ha),nv=[-gv[1],gv[0]],bx=-17,by=-30,wind=ST.reduce?0:Math.sin(time*.0013)*.5+Math.sin(time*.0031)*.3;
    function A(g,n){var k=Math.max(0,g)/100;n+=k*(sw*-26+wind*6)+Math.sin(g*.09+time*.002)*(.8+k*3);return [bx+gv[0]*g+nv[0]*n,by+gv[1]*g+nv[1]*n]}
    var outer=[A(-14,4),A(-4,11),A(12,14),A(32,15),A(55,15),A(78,13),A(98,10),A(112,4)],inner=[A(108,-4),A(92,-6),A(70,-8),A(45,-9),A(22,-9),A(6,-7),A(-6,-2)];
    F.hairBack.setAttribute('d',crc(outer.concat(inner)));
    var st2='';for(var i=0;i<6;i++){var nn=-6+i*3.6,a1=A(5,nn+1),a2=A(50,nn+.6),a3=A(100-i*3,nn*.6);st2+='M '+a1[0].toFixed(1)+','+a1[1].toFixed(1)+' Q '+a2[0].toFixed(1)+','+a2[1].toFixed(1)+' '+a3[0].toFixed(1)+','+a3[1].toFixed(1)+' '}
    F.hairStr.innerHTML='';ln(F.hairStr,st2,.55,'rgba(232,213,163,.2)');
    /* pramen pres rameno dopredu */
    var f0=[-3,-26],fg=rot(0,1,-ha),fe=[f0[0]+fg[0]*44+wind*2+8,f0[1]+fg[1]*44];
    F.lock.setAttribute('d','M '+(f0[0]-3)+','+f0[1]+' C '+(f0[0]+2)+','+(f0[1]+16)+' '+(fe[0]-4).toFixed(1)+','+(fe[1]-14).toFixed(1)+' '+fe[0].toFixed(1)+','+fe[1].toFixed(1)+' C '+(fe[0]-1).toFixed(1)+','+(fe[1]-16).toFixed(1)+' '+(f0[0]+6)+','+(f0[1]+12)+' '+(f0[0]+3)+','+f0[1]+' Z');
    T(F.hairBackG,hx2,hy2,ha,.86);
  }
  /* sala */
  if(F.scarfG){T(F.scarfG,0,p.py,p.lean);
    var sw2=F.spring.a,g2=rot(0,1,-p.lean),ex=11+g2[0]*40-sw2*9,ey=-100+g2[1]*40;
    F.scarfEnd.setAttribute('d','M 9,-104 C 14,-96 '+(ex+3).toFixed(1)+','+(ey-18).toFixed(1)+' '+(ex+5).toFixed(1)+','+ey.toFixed(1)+' L '+(ex-4).toFixed(1)+','+(ey+1).toFixed(1)+' C '+(ex-4).toFixed(1)+','+(ey-16).toFixed(1)+' 6,-92 4,-101 Z');
    var fr='';for(var j=0;j<5;j++){var fx=ex-4+j*2.2,fy=ey+.8-j*.2;fr+='M '+fx.toFixed(1)+','+fy.toFixed(1)+' l '+(-sw2*1.5).toFixed(1)+',5 '}
    F.scarfFr.setAttribute('d',fr);}
  /* paze */
  [['aF','AF',SHF,'hF'],['aB','AB',SHB,'hB']].forEach(function(q){
    var A=F[q[0]],an=p[q[1]],s=rot(q[2][0],q[2][1],p.lean),Sx=s[0],Sy=p.py+s[1];
    var Ex=Sx+Math.sin(an.a1*R)*U1,Ey=Sy+Math.cos(an.a1*R)*U1,Wx=Ex+Math.sin(an.a2*R)*U2,Wy=Ey+Math.cos(an.a2*R)*U2;
    T(A.upper.g,Sx,Sy,-an.a1);T(A.fore.g,Ex,Ey,-an.a2);T(A.handG,Wx,Wy,-(an.a2+an.wr),1.05);
    A.W=[Wx,Wy];A.handAng=an.a2+an.wr;
    var ht=p[q[3]];if(A.cur!==ht){if(A.cur)A.hands[A.cur].g.style.display='none';A.hands[ht].g.style.display='';A.cur=ht}
  });
  /* rukavice */
  var gl=st.glove?F.C.glove:F.C.skin;if(F.gl!==gl){F.gl=gl;['aF','aB'].forEach(function(k){for(var h in F[k].hands)F[k].hands[h].fills.forEach(function(f){f.setAttribute('fill',gl)})})}
  /* mrkani a mluveni */
  var bl=((time+(F.kind==='honza'?1700:0))%4300)<120;F.lid.setAttribute('opacity',bl?1:0);
  var talk=ST.talk[F.kind==='honza'?'h':'c'],open=talk?(.5+.5*Math.sin(time*.024))*(.6+.4*Math.sin(time*.011)):0;
  F.lip.setAttribute('transform','translate(0,'+(open*1.8).toFixed(2)+')');
  /* hlava nahoru do sveta (pro bubliny) */
  return [st.x+face*F.headTop[0],GY+F.headTop[1]];
}

/* ---------- casova osa postav ---------- */
function walkSeg(T,t0,t1,x0,x1,from,to,face,rootX){
  var u=lin(t0,t1,T),x=lerp(x0,x1,u),d=Math.abs(x-x0),f=face||(x1>x0?1:-1);
  var w=resolve(walkPose(d),f,x),a=resolve(from||STAND,f,x),b=resolve(to||STAND,f,x);
  var r=mixR(a,w,ss(0,.1,u));r=mixR(r,b,ss(.9,1,u));
  return {x:x,face:f,p:r};
}
function idle(p,time,amt){var q=cp(p);q.lean+=Math.sin(time*.0017)*.7*amt;q.headT+=(Math.sin(time*.0011+1)*1.2+Math.sin(time*.00043+2)*3.5)*amt;q.py+=Math.sin(time*.0017+.6)*.5*amt;return q}
/* sednuti: panev dolu a nazad s predklonem, chodidla dopredu */
function sitMix(T,t0,t1,from,to){
  var u=lin(t0,t1,T),r=mixR(from,to,ss(0,1,u));
  r.lean+=Math.sin(Math.PI*u)*22;r.headT-=Math.sin(Math.PI*u)*8;
  return r;
}

var tatSpot=[2881,521];
function clientAt(T,time){
  var R0=function(p,x){return resolve(p,1,x)},st;
  if(T<2.06)st=walkSeg(T,.3,1.9,-1000,812);
  else if(T<2.95)st=walkSeg(T,2.06,2.95,812,1330);
  else if(T<4.35){
    var p=idle(STAND,time,1),r=R0(p,1330);
    var g1=ext(STAND,{aF:{fk:1,a1:34,el:52,wr:-20},hF:'open'}),g2=ext(STAND,{aF:{fk:0,tx:12,ty:-238,abs:150},hF:'flat',headT:-4});
    r=mixR(r,R0(g1,1330),ss(3.15,3.3,T)*(1-ss(3.6,3.78,T)));
    r=mixR(r,R0(g2,1330),ss(4.0,4.15,T)*(1-ss(4.42,4.6,T)));
    st={x:1330,face:1,p:r};
  }
  else if(T<4.55)st=walkSeg(T,4.35,4.55,1330,1390);
  else if(T<6.45){
    var lean=ext(SIT,{lean:11,headT:13,aF:{fk:0,wx:1476,wy:583,abs:96},hF:'flat',aB:{fk:0,wx:1460,wy:585,abs:96},hB:'flat'});
    var r2=sitMix(T,4.55,4.9,R0(STAND,1390),R0(SIT,1390));
    if(T>4.9)r2=mixR(R0(idle(SIT,time,.6),1390),R0(lean,1390),ss(4.95,5.2,T)*(1-ss(5.9,6.15,T)));
    st={x:1390,face:1,p:r2};
  }
  else if(T<6.68)st={x:1390,face:1,p:sitMix(T,6.45,6.68,R0(SIT,1390),R0(STAND,1390))};
  else if(T<7.3)st=walkSeg(T,6.68,7.3,1390,2790);
  else if(T<10.65){
    var arm=ext(SIT,{lean:1,headT:14,aF:{fk:0,wx:2897,wy:526,abs:92},hF:'flat',aB:{fk:1,a1:20,el:66,wr:-10}});
    var r3=sitMix(T,7.3,7.52,R0(STAND,2790),R0(SIT,2790));
    if(T>7.52)r3=R0(SIT,2790);
    r3=mixR(r3,R0(idle(arm,time,.4),2790),ss(7.48,7.74,T));
    st={x:2790,face:1,p:r3};
  }
  else if(T<11.5){
    var arm2=ext(SIT,{lean:1,headT:14,aF:{fk:0,wx:2897,wy:526,abs:92},hF:'flat'});
    var look=ext(STAND,{headT:20,aF:{fk:1,a1:58,el:84,wr:-16},hF:'relax',aB:{fk:1,a1:10,el:30,wr:0}});
    var r4=sitMix(T,10.65,10.92,R0(arm2,2790),R0(STAND,2790));
    if(T>10.92)r4=mixR(R0(idle(STAND,time,1),2790),R0(look,2790),ss(10.95,11.2,T)*(1-ss(11.32,11.5,T)));
    st={x:2790,face:1,p:r4};
  }
  else if(T<12.12)st=walkSeg(T,11.5,11.96,2790,3436);
  else if(T<12.55)st=walkSeg(T,12.12,12.55,3436,3900);
  else{var up=ext(STAND,{headT:-15,lean:-1});st={x:3900,face:1,p:mixR(R0(idle(STAND,time,1),3900),R0(idle(up,time,1),3900),ss(12.5,12.8,T))}}
  /* ruka na klice dveri */
  if(ST.doorHandle){
    if(T>1.7&&T<2.3){var hd=ST.doorHandle(0,T);st.p=reachArm(st.p,st.x,hd[0],hd[1],ss(1.78,1.9,T)*(1-ss(2.06,2.16,T)))}
    if(T>11.75&&T<12.3){var hd2=ST.doorHandle(1,T);st.p=reachArm(st.p,st.x,hd2[0],hd2[1],ss(11.84,11.95,T)*(1-ss(12.08,12.16,T)))}
  }
  st.rolled=T>7.35&&T<10.95;
  st.mark=ss(10.55,10.9,T);
  return st;
}
function reachArm(r,x,wx,wy,k){if(k<=0)return r;
  var p=ext(STAND,{lean:r.lean,py:r.py,aF:{fk:0,wx:wx,wy:wy,abs:96}}),a=armAngles(p,'aF',1,x),o=cp(r);
  o.AF={a1:lerp(r.AF.a1,a.a1,k),a2:lerp(r.AF.a2,a.a2,k),wr:lerp(r.AF.wr,a.wr,k)};if(k>.5)o.hF='hold';o.lean=r.lean+2*k;return o}
function honzaAt(T,time){
  var st,R0=function(p,x,f){return resolve(p,f,x)};
  var drawP=function(t,x){var tm=time*.001,o=Math.sin(tm*5.3)*4+Math.sin(tm*2.1)*3,o2=Math.sin(tm*4.1+1)*3.5+Math.sin(tm*1.3)*2;
    return ext(SIT,{lean:13,headT:12,aF:{fk:0,wx:1624+o,wy:540+o2,abs:75},hF:'hold',aB:{fk:1,a1:36,el:64,wr:-6}})};
  if(T<2.85)st={x:1760,face:-1,p:R0(idle(drawP(T*.7),time,.5),1760,-1)};
  else if(T<4.5){
    var r=sitMix(T,2.85,3.12,R0(drawP(T),1760,-1),R0(STAND,1760,-1));
    if(T>3.12){r=R0(idle(STAND,time,1),1760,-1);
      var g=ext(STAND,{aF:{fk:1,a1:38,el:60,wr:-24},hF:'open',headT:-2});
      r=mixR(r,R0(g,1760,-1),ss(3.5,3.68,T)*(1-ss(4.12,4.32,T)));}
    st={x:1760,face:-1,p:r};
  }
  else if(T<6.4){
    var r2=sitMix(T,4.5,4.8,R0(STAND,1760,-1),R0(SIT,1760,-1));
    if(T>4.8){r2=R0(idle(SIT,time,.6),1760,-1);r2=mixR(r2,R0(drawP(T),1760,-1),ss(4.85,5.05,T)*(1-ss(5.85,6.02,T)));
      var cal=ext(SIT,{headT:-6,lean:-4,aF:{fk:1,a1:40,el:70,wr:-30},hF:'open'});
      r2=mixR(r2,R0(cal,1760,-1),ss(6.05,6.2,T)*(1-ss(6.3,6.4,T)));}
    st={x:1760,face:-1,p:r2};
  }
  else if(T<6.62)st={x:1760,face:-1,p:sitMix(T,6.4,6.62,R0(SIT,1760,-1),R0(STAND,1760,-1))};
  else if(T<7.35){st=walkSeg(T,6.62,7.35,1760,2985,null,null,1);st.face=lerp(-1,1,ss(6.6,6.72,T))}
  else if(T<10.65){
    var tat=function(t){var j=Math.sin(time*.03)*.8;t=time*.0012;return ext(SIT,{py:-106,lean:24,headT:16,fFx:52,fBx:36,fBy:-14,
      aF:{fk:0,wx:tatSpot[0]+12+Math.cos(t*13)*4,wy:tatSpot[1]-34+j,abs:20},hF:'hold',
      aB:{fk:0,wx:2846,wy:522,abs:70},hB:'flat'})};
    var r3=sitMix(T,7.35,7.56,R0(STAND,2985,-1),R0(SIT,2985,-1));
    if(T>7.56)r3=R0(SIT,2985,-1);
    r3=mixR(r3,R0(tat(T),2985,-1),ss(7.54,7.8,T));
    st={x:2985,face:lerp(1,-1,ss(7.33,7.43,T)),p:r3};
  }
  else if(T<11.72){
    var r4=sitMix(T,10.65,10.9,R0(SIT,2985,-1),R0(STAND,2985,-1));
    if(T>10.9){r4=R0(idle(STAND,time,1),2985,-1);var g4=ext(STAND,{aF:{fk:1,a1:30,el:56,wr:-22},hF:'open'});r4=mixR(r4,R0(g4,2985,-1),ss(11.3,11.45,T)*(1-ss(11.7,11.9,T)))}
    st={x:2985,face:-1,p:r4};
  }
  else if(T<12.15){st=walkSeg(T,11.72,12.15,2985,3296,null,null,1);st.face=lerp(-1,1,ss(11.68,11.82,T))}
  else{var wave=function(t){return ext(STAND,{headT:-3,aF:{fk:1,a1:158,el:18+16*Math.sin(time*.006),wr:-10},hF:'open'})};
    st={x:3296,face:1,p:mixR(R0(idle(STAND,time,1),3296,1),R0(wave(T),3296,1),ss(12.2,12.45,T))}}
  st.op=ss(1.9,2.4,T);
  st.glove=T>7.62&&T<10.72;
  st.pencil=(T<2.95?1-ss(2.86,2.95,T):0)+ss(4.86,5.0,T)*(1-ss(5.86,6.0,T));
  st.machine=ss(7.62,7.75,T)*(1-ss(10.6,10.72,T));
  return st;
}


/* ---------- celni pohled (pouziva se pri otaceni) ---------- */
function mirror(d){return d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g,function(m,x,y){return (-parseFloat(x))+','+y})}
function buildFront(F,H){
  var C=F.C,g=el('g',{opacity:0},ST.L.fig),S={fill:'none',stroke:LINE,'stroke-width':1.4,'stroke-linejoin':'round','stroke-linecap':'round'};
  function sh(d,fill,w){return P(g,d,{fill:fill,stroke:LINE,'stroke-width':w||1.4,'stroke-linejoin':'round'})}
  function both(d,fill,w){sh(d,fill,w);sh(mirror(d),fill,w)}
  if(!H)sh('M -19,-318 C -24,-296 -26,-262 -24,-228 C -12,-222 12,-222 24,-228 C 26,-262 24,-296 19,-318 C 14,-338 -14,-338 -19,-318 Z',C.hair,1.2);
  /* boty a nohy */
  both(H?'M -20,-12 C -22,-5 -23,0 -19,1.5 L -3,1.5 C -1,0 -1,-6 -3,-14 Z':'M -19,-9 C -21,-4 -22,0 -18,1.5 L -4,1.5 C -2,0 -2,-5 -4,-10 Z',C.shoe,1.3);
  both('M -20,-170 C -21,-120 -19,-60 -18,-10 L -3.5,-10 C -3.5,-60 -3,-120 -1,-158 Z',C.pants);
  ln(g,'M -11,-96 q 4,3 8,0 M 11,-96 q -4,3 -8,0 M -12,-20 L -10,-12 M 12,-20 L 10,-12',.6,LF);
  /* paze */
  both('M -35,-240 C -36,-222 -36,-208 -35,-196 C -35,-180 -34,-166 -33,-156 L -25,-156 C -25,-168 -25,-182 -25,-196 C -25,-210 -24.5,-226 -24,-240 Z',H?C.skin:C.shirt);
  both('M -33.5,-158 C -36,-150 -35,-140 -31,-136 C -27,-134 -24,-137 -24.5,-146 L -25.5,-158 Z',C.skin,1.2);
  if(H){var tg=el('g',{opacity:.85},g);[1,-1].forEach(function(k){ln(tg,'M '+(k*-30)+',-228 C '+(k*-32)+',-214 '+(k*-28)+',-200 '+(k*-30)+',-186 C '+(k*-32)+',-174 '+(k*-28)+',-166 '+(k*-29.5)+',-160',.6,'var(--gold)');
    ln(tg,ST.circ(k*-30,-222,3.4),.5,'var(--gold)')})}
  /* trup */
  var tor=H?'M -26,-272 C -29,-250 -24,-215 -21,-195 C -21,-185 -22,-175 -22,-164 L 22,-164 C 22,-175 21,-185 21,-195 C 24,-215 29,-250 26,-272 C 18,-280 8,-283 0,-283 C -8,-283 -18,-280 -26,-272 Z'
           :'M -24,-272 C -27,-252 -23,-222 -20,-200 C -20,-188 -22,-176 -23,-164 L 23,-164 C 22,-176 20,-188 20,-200 C 23,-222 27,-252 24,-272 C 17,-280 8,-283 0,-283 C -8,-283 -17,-280 -24,-272 Z';
  sh(tor,C.shirt);P(g,tor,{fill:'url(#chVolF)'});
  if(H){both('M -26,-272 C -33,-266 -36,-252 -35,-238 L -24,-236 C -24,-250 -23,-262 -20,-268 Z',C.shirt,1.3);ln(g,'M -7,-282 C -4,-276 4,-276 7,-282',.8,LD);ln(g,'M -14,-210 q 6,-3 12,1 M 4,-226 q 7,-3 13,1 M -6,-172 q 6,-2 12,0',.6,LF)}
  else{ln(g,'M 0,-280 L 0,-166',.8,LD);ln(g,'M -9,-262 L 3,-236 L 9,-262',.8,LD);both('M -24,-272 C -31,-262 -35,-252 -35,-240 L -24,-238 C -24,-250 -23,-262 -21,-268 Z',C.shirt,1.3);
    ln(g,'M 18,-270 C 8,-240 -6,-205 -18,-176',2,'#3a2c1f');P(g,ST.rect(-26,-182,16,13,2),{fill:C.bag,stroke:LINE,'stroke-width':1});
    sh('M -12,-286 C -6,-278 6,-278 12,-286 L 13,-276 C 6,-270 -6,-270 -13,-276 Z',C.scarf,1.1);sh('M 5,-276 C 8,-262 9,-250 10,-238 L 3,-238 C 2,-250 2,-262 1,-274 Z',C.scarf,1)}
  /* krk a hlava */
  sh('M -6.5,-280 L -6.5,-293 L 6.5,-293 L 6.5,-280 Z',C.skin,1.2);
  both('M -16.5,-314 C -20,-315 -21,-309 -19.5,-305 C -18.5,-302 -17,-302 -16,-303.5',C.skin,1.1);
  sh('M 0,-334 C 12,-334 17,-322 17,-309 C 17,-296 10,-286 0,-286 C -10,-286 -17,-296 -17,-309 C -17,-322 -12,-334 0,-334 Z',C.skin,1.4);
  P(g,'M -17,-316 C -17,-300 -10,-287 0,-286 C -8,-292 -12,-302 -12,-316 Z',{fill:'rgba(0,0,0,.25)'});
  both('M -10,-311 Q -6.5,-313.6 -3,-311 Q -6.5,-309.4 -10,-311 Z','#0c0c0e',.7);
  P(g,ST.circ(-6.4,-311.2,1.1),{fill:'var(--line)'});P(g,ST.circ(6.6,-311.2,1.1),{fill:'var(--line)'});
  both(H?'M -11,-316 C -8,-318.4 -4,-318.4 -2,-316.6':'M -10.5,-316.4 C -8,-318.6 -4.4,-318.6 -2.4,-317',H?1.3:1,LINE);
  ln(g,'M 0,-311 C -1,-305 -2.4,-301 -.6,-299.4 C .8,-298.8 2.4,-299.2 3,-300',.8,LD);
  F.fMouth=ln(g,'M -4,-293.4 Q 0,-292.4 4,-293.4',.9,LINE);
  if(H){
    sh('M -17,-309 C -17,-296 -11,-284 0,-283 C 11,-284 17,-296 17,-309 C 14,-302 11,-297 6,-295.4 C 3,-296.4 -3,-296.4 -6,-295.4 C -11,-297 -14,-302 -17,-309 Z',C.hair,1.1);
    sh('M -6,-296.6 C -3,-298.4 3,-298.4 6,-296.6 C 4,-295.6 2,-295.8 0,-296 C -2,-295.8 -4,-295.6 -6,-296.6 Z',C.hair,.6);
    ln(g,'M -4,-292.8 Q 0,-291.6 4,-292.8',.9,LINE);
    var rb=ST.rng(14),bs='';for(var i=0;i<24;i++){var x=-15+rb()*30,y=-304+rb()*16;if(Math.abs(x)<6&&y<-293)continue;bs+='M '+x.toFixed(1)+','+y.toFixed(1)+' l '+((rb()-.5)*1.4).toFixed(1)+','+(2+rb()*1.8).toFixed(1)+' '}
    ln(g,bs,.5,'rgba(231,221,199,.32)');
    sh('M -16.5,-316 C -18.5,-330 -12,-343 0,-345 C 12,-346 19.5,-336 17,-316 C 15,-325 9,-331 1,-331.5 C -7,-331.5 -13,-326 -16.5,-316 Z',C.hair,1.3);
    ln(g,'M -10,-334 C -6,-340 2,-343 9,-340 M -6,-331 C -2,-337 5,-339 12,-335',.6,'rgba(232,213,163,.25)');
    var gl={fill:'rgba(232,213,163,.08)',stroke:'rgba(231,221,199,.85)','stroke-width':.7};
    P(g,ST.rect(-13.6,-315.6,11,8.4,3),gl);P(g,ST.rect(2.6,-315.6,11,8.4,3),gl);ln(g,'M -2.6,-313 Q 0,-314.6 2.6,-313 M -13.6,-313 L -17,-313.6 M 13.6,-313 L 17,-313.6',.7,'rgba(231,221,199,.85)');
  }else{
    P(g,'M -4.6,-293.4 Q 0,-291 4.6,-293.4 Q 0,-290.6 -4.6,-293.4 Z',{fill:'#3a2a27'});
    sh('M -17.5,-308 C -19,-326 -12,-339 0,-339 C 12,-339 19,-326 17.5,-308 C 16,-318 12,-326 4,-328 C -2,-325 -9,-320 -13,-312 C -14,-310 -16,-309 -17.5,-308 Z',C.hair,1.2);
    both('M -17.5,-308 C -19,-292 -19,-276 -21,-258 C -18,-262 -15,-276 -14.5,-292 C -14,-300 -15.5,-306 -17.5,-308 Z',C.hair,1);
    ln(g,'M -9,-332 C -4,-336 4,-336 10,-332 M -14,-320 C -10,-328 0,-332 8,-330',.55,'rgba(232,213,163,.2)');
    P(g,ST.circ(-18.6,-302,.9),{fill:'var(--gold)'});P(g,ST.circ(18.6,-302,.9),{fill:'var(--gold)'});
  }
  F.front=g;
}
/* ---------- start ---------- */
var shadowG=el('g',{},ST.L.fig);ST.L.fig.insertBefore(shadowG,ST.L.fig.firstChild);
(function(){var g=el('radialGradient',{id:'chShadow'},defs);el('stop',{offset:0,'stop-color':'#000','stop-opacity':.62},g);el('stop',{offset:.7,'stop-color':'#000','stop-opacity':.22},g);el('stop',{offset:1,'stop-color':'#000','stop-opacity':0},g)})();
var hz=build('honza'),cl=build('client');
hz.shadow=el('ellipse',{cx:0,cy:GY+2,rx:44,ry:6,fill:'url(#chShadow)'},shadowG);cl.shadow=el('ellipse',{cx:0,cy:GY+2,rx:44,ry:6,fill:'url(#chShadow)'},shadowG);buildFront(hz,true);buildFront(cl,false);
(function(){var g=el('linearGradient',{id:'chVolF',x1:0,y1:0,x2:1,y2:0},defs);el('stop',{offset:0,'stop-color':'#000','stop-opacity':.3},g);el('stop',{offset:.5,'stop-color':'#000','stop-opacity':0},g);el('stop',{offset:1,'stop-color':'#000','stop-opacity':.3},g)})();
/* tuzka a strojek v ruce Honzy (souradnice ruky: zapesti 0,0, prsty +y) */
var pen=el('g',{},hz.aF.tool);
P(pen,'M 1.4,4 L 4.6,4.2 L 8.2,29 L 7.6,32.4 L 6.4,32.6 L 5,29.4 Z',{fill:'#141418',stroke:LINE,'stroke-width':.6});
ln(pen,'M 2.6,12 L 5.8,11.8',.9,'var(--gold)');ln(pen,'M 6.8,32.4 L 7.2,34.2',1,'var(--gold-light)');
var mach=el('g',{},hz.aF.tool);
P(mach,'M -1,-4 L 5,-4.6 L 7.6,24 L 5.6,25 L 2.4,25.2 Z',{fill:'#1b1c21',stroke:LINE,'stroke-width':.8});
P(mach,'M 2.4,25 L 6,24.6 L 6.6,32 L 4.4,36 L 3.2,32 Z',{fill:'rgba(231,221,199,.12)',stroke:LD,'stroke-width':.6});
ln(mach,'M 4.4,36 L 4.6,39',.7,'var(--gold-light)');ln(mach,'M 1.4,10 L 6.2,9.6 M 1.8,14 L 6.6,13.6',.5,LD);
P(mach,ST.circ(2,-1,.9),{fill:'var(--gold)'});
var cable=P(ST.L.fig,'',{fill:'none',stroke:'rgba(231,221,199,.55)','stroke-width':1.2});
ST.L.fig.insertBefore(cable,ST.L.fig.firstChild);

var lastTime=0;
ST.on(function(T,time,cam){
  var sepOn=cam.s<1.9;if(sepOn!==ST._sep){ST._sep=sepOn;[cl,hz].forEach(function(F){if(sepOn)F.root.setAttribute('filter','url(#chSep)');else F.root.removeAttribute('filter')})}
  var dt=Math.min(50,Math.max(1,time-lastTime));lastTime=time;
  [[cl,clientAt(T,time),'c'],[hz,honzaAt(T,time),'h']].forEach(function(q){
    var F=q[0],st=q[1];
    /* pruzina pro vlasy, salu, tasku (podle rychlosti v x) */
    var s=F.spring;if(s.lx==null)s.lx=st.x;var vx=(st.x-s.lx)/dt*st.face;s.lx=st.x;
    var tgt=Math.max(-1,Math.min(1,vx*2.2)),k=dt/1000;
    s.v+=((tgt-s.a)*60-s.v*9)*k;s.a+=s.v*k;s.a=Math.max(-1.4,Math.min(1.4,s.a));
    if(F.aF.rolled){var rr=!!st.rolled;if(F.rr!==rr){F.rr=rr;F.aF.rolled.style.display=rr?'':'none';F.aF.sleeveF.style.display=rr?'none':''}}
    if(F.aF.mark)F.aF.mark.setAttribute('opacity',(st.mark||0).toFixed(3));
    if(F===hz){pen.style.opacity=st.pencil;mach.style.opacity=st.machine}
    ST.heads[q[2]]={x:0,y:0};
    var h=apply(F,st,time);ST.heads[q[2]]={x:h[0],y:h[1]-10};
    if(F.shadow){var p0=st.p,sp0=Math.abs((p0.fFx||0)-(p0.fBx||0)),sit=p0.py>-140;F.shadow.setAttribute('cx',(st.x+st.face*((p0.fFx+p0.fBx)/2+(sit?-10:0))).toFixed(1));
      F.shadow.setAttribute('rx',(30+sp0*.5+(sit?20:0)).toFixed(1));F.shadow.setAttribute('opacity',((st.op==null?1:st.op)*.9).toFixed(3))}
    if(F===hz){
      if(st.machine>0){var A=hz.aF,a=A.handAng*R,bx=A.W[0]+Math.sin(a)*1.5-Math.cos(a)*0,by=A.W[1]+Math.cos(a)*1.5;
        var wx=st.x+st.face*bx,wy=GY+by;cable.setAttribute('d','M '+wx.toFixed(1)+','+wy.toFixed(1)+' C '+(wx+30).toFixed(1)+','+(wy-40).toFixed(1)+' 2720,560 2668,586');cable.style.opacity=st.machine}
      else cable.style.opacity=0;
    }
  });
});
});
