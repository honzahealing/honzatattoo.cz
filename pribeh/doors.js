/* pribeh/doors.js - dvere studia: kridlo s panty, klikou a sklem, otvirani natocenim kolem pantu,
   osvetleny otvor za kridlem, svetlo na chodnik a zarubeň v popredi (postava jí pri pruchodu zajde).
   Dvere 1 (vstup z ulice) x 800-890, dvere 2 (odchod) x 3420-3510. Pant je vlevo (x 803 + dx), klika vpravo; kridlo se otevira dovnitr, pryc od divaka, takze postava jde pred nim.
   ST.doorOpen(i,T) = 0..1 (jak moc jsou dvere otevrene), ST.doorHandle(i,T) = [x,y] kliky ve svete. */
ST.module('doors',function(ST){
'use strict';
var el=ST.el,R=ST.rect,ss=ST.ss,GY=ST.GY;
var DOORS=[
  {dx:0,open:function(T){return ss(1.94,2.14,T)*(1-ss(2.56,2.88,T))},show:[.9,1.5],inside:true,sign:true},
  {dx:2620,open:function(T){return ss(11.96,12.14,T)},show:[10.5,10.9],inside:false,sign:false}
];
var X0=803,W=84,Y0=362,Y1=700,HY=521,ANG=74*Math.PI/180;
function fx(d,x){return x+d.dx}
ST.doorOpen=function(i,T){return DOORS[i].open(T)};
ST.doorHandle=function(i,T){var d=DOORS[i],o=d.open(T),c=Math.cos(o*ANG),hx=X0+d.dx;return [hx+(W-12)*c,HY+2]};

if(!document.getElementById('gDoorIn')){
  var gi=el('linearGradient',{id:'gDoorIn',x1:0,y1:0,x2:0,y2:1},ST.defs);
  el('stop',{offset:0,'stop-color':'#E8C77F','stop-opacity':.34},gi);el('stop',{offset:.6,'stop-color':'#C8A45C','stop-opacity':.2},gi);el('stop',{offset:1,'stop-color':'#9A7B3A','stop-opacity':.42},gi);
  var go=el('linearGradient',{id:'gDoorOut',x1:0,y1:0,x2:0,y2:1},ST.defs);
  el('stop',{offset:0,'stop-color':'#0B0D12','stop-opacity':1},go);el('stop',{offset:.7,'stop-color':'#151821','stop-opacity':1},go);el('stop',{offset:1,'stop-color':'#2a2619','stop-opacity':1},go);
  var sp=el('radialGradient',{id:'gDoorSpill'},ST.defs);
  el('stop',{offset:0,'stop-color':'#E8C77F','stop-opacity':.5},sp);el('stop',{offset:1,'stop-color':'#C8A45C','stop-opacity':0},sp);
}

DOORS.forEach(function(d,i){
  var x=fx(d,X0),x1=x+W,hx=x;
  var sec=function(layer){return ST.section(ST.L[layer],x-60,x1+60)};
  var gRoom=sec('room'),gFront=sec('back'),gLight=sec('light');
  var all=el('g',{},gRoom);ST.fade(all,d.show[0],d.show[1],1);
  /* otvor za kridlem: dvere 1 = teply interier, dvere 2 = nocni ulice */
  el('path',{d:R(x,Y0,W,Y1-Y0),fill:d.inside?'url(#gDoorIn)':'url(#gDoorOut)'},all);
  if(d.inside){
    /* pohled dovnitr: kus podlahy, lampa, ram na zdi */
    ST.D(all,'M'+x+',668 H'+x1+' M'+x+',684 L'+(x+20)+',668 M'+(x+40)+',700 L'+(x+48)+',668 M'+(x1-6)+',700 L'+(x1-14)+',668','hair dim',null);
    ST.D(all,R(x+30,420,28,36),'hair dim',null);ST.D(all,'M'+(x+20)+',362 V384 M'+(x+12)+',384 h16 l-4,8 h-8Z','hair dim',null);
  }else{
    /* pohled ven: obrubnik, lampa a hvezdy */
    ST.D(all,'M'+x+',672 H'+x1+' M'+x+',690 H'+x1,'hair dim',null);
    ST.D(all,'M'+(x+56)+',700 V430 M'+(x+46)+',430 h20 l-4,-14 h-12Z','hair dim',null);
    el('path',{d:ST.circ(x+56,424,22),fill:'url(#gGlow)'},all);
    [[x+16,390],[x+30,410],[x+70,380],[x+12,440]].forEach(function(p){el('path',{d:ST.circ(p[0],p[1],.9),'class':'f-goldl',opacity:.7},all)});
  }
  /* --- kridlo --- */
  var leaf=el('g',{},all),dk;
  ST.D(leaf,R(x,Y0,W,Y1-Y0),'ink t3',null);
  ST.D(leaf,R(x+6,Y0+6,W-12,Y1-Y0-12),'thin',null);
  /* sklo s pricky a odlesky */
  ST.D(leaf,R(x+12,376,W-24,112),'thin solid',null);
  var gl=el('path',{d:R(x+12,376,W-24,112),fill:d.inside?'url(#gWin)':'url(#gDoorOut)',opacity:d.inside?.55:.9},leaf);
  ST.D(leaf,'M'+(x+32)+',376 V488 M'+(x+52)+',376 V488 M'+(x+12)+',413 H'+(x1-12)+' M'+(x+12)+',451 H'+(x1-12),'thin',null);
  ST.D(leaf,'M'+(x+16)+',484 L'+(x+30)+',400 M'+(x+22)+',486 L'+(x+40)+',394 M'+(x+56)+',486 L'+(x+66)+',444','hair faint',null);
  ST.D(leaf,'M'+(x+10)+',372 H'+(x1-10)+' M'+(x+10)+',492 H'+(x1-10),'hair',null);
  if(d.sign){
    /* cedulka OTEVRENO na snurce */
    ST.D(leaf,'M'+(x+30)+',378 L'+(x+42)+',368 L'+(x+54)+',378','hair goldl',null);
    ST.D(leaf,R(x+22,378,40,22,3),'thin solid',null);ST.D(leaf,R(x+25,381,34,16,2),'hair gold',null);
    var t=el('text',{x:x+42,y:392,'class':'label','font-size':6.4,'text-anchor':'middle'},leaf);t.textContent='OTEVŘENO';
  }
  /* stredni pricle s posty (mosaz) */
  ST.D(leaf,R(x+6,494,W-12,16),'thin t2',null);ST.D(leaf,R(x+24,498,36,7,2),'thin gold',null);ST.D(leaf,'M'+(x+27)+',501.5 H'+(x+57),'hair goldl',null);
  /* spodni kazetove vyplne */
  [[516,80],[604,76]].forEach(function(p){
    ST.D(leaf,R(x+14,p[0],W-28,p[1],2),'thin',null);
    ST.D(leaf,'M'+(x+14)+','+p[0]+' L'+(x+22)+','+(p[0]+8)+' M'+(x1-14)+','+p[0]+' L'+(x1-22)+','+(p[0]+8)+' M'+(x+14)+','+(p[0]+p[1])+' L'+(x+22)+','+(p[0]+p[1]-8)+' M'+(x1-14)+','+(p[0]+p[1])+' L'+(x1-22)+','+(p[0]+p[1]-8),'hair',null);
    ST.D(leaf,R(x+22,p[0]+8,W-44,p[1]-16,1),'hair',null,null,{fill:'url(#hatchV)'});
  });
  /* klika s rozetou a klicova dirka (vyska kliky asi 105 cm) */
  ST.D(leaf,R(x1-17,HY-14,12,34,5),'thin solid gold',null);
  ST.D(leaf,'M'+(x1-11)+','+HY+' H'+(x1-34)+' q-4,0 -4,4','thin gold',null);
  ST.D(leaf,ST.circ(x1-11,HY,3),'hair goldl',null,null,{fill:'var(--t1)'});
  ST.D(leaf,ST.circ(x1-11,HY+12,1.6)+' M'+(x1-11)+','+(HY+13)+' v3','hair gold',null);
  /* kopaci plech a panty */
  ST.D(leaf,R(x+8,684,W-16,12,1),'thin gold',null,null,{fill:'rgba(200,164,92,.12)'});
  [386,521,650].forEach(function(py){ST.D(leaf,R(x-1,py-10,7,20,2),'thin gold',null);ST.D(leaf,'M'+(x-1)+','+py+' h7','hair goldl',null)});
  /* stin, jak se kridlo nataci od svetla */
  dk=el('path',{d:R(x,Y0,W,Y1-Y0),fill:'#000',opacity:0},leaf);
  /* hrana kridla (tloustka), viditelna pri otevreni */
  var edge=el('path',{d:'','class':'ink thin t2'},all);
  /* --- obklad zarubne na strane ulice --- */
  var cx=d.inside?x-13:x1+4,fr=el('g',{},gFront);ST.fade(fr,d.show[0],d.show[1],1);
  ST.D(fr,R(cx,348,13,Y1-348),'ink t2',null);ST.D(fr,'M'+(cx+4)+',354 V'+(Y1-4)+' M'+(cx+9)+',354 V'+(Y1-4),'hair',null);
  ST.D(fr,R(d.inside?x-17:x-6,338,W+29,14,2),'ink t3',null);ST.D(fr,'M'+(d.inside?x-12:x-1)+',345 H'+(d.inside?x1+6:x1+18),'hair',null);
  ST.D(fr,R(cx-2,Y1-18,17,18),'thin t3',null);
  /* svetlo z otevrenych dveri na chodniku */
  var spill=el('path',{d:ST.ellipse(d.inside?x-10:x1+20,Y1+2,110,16),fill:'url(#gDoorSpill)',opacity:0},gLight);
  var beam=el('path',{d:d.inside?'M'+x+','+Y0+' L'+x+','+Y1+' L'+(x-120)+','+(Y1+18)+' Z':'M'+x1+','+Y0+' L'+x1+','+Y1+' L'+(x1+110)+','+(Y1+18)+' Z',fill:'url(#gCone)',opacity:0},gLight);
  var last=-1;
  ST.on(function(T,time,cam){
    if(cam.x0>x1+80||cam.x1<x-80)return;
    var o=d.open(T);if(Math.abs(o-last)<1e-4)return;last=o;
    var a=o*ANG,c=Math.cos(a),s=Math.sin(a);
    leaf.setAttribute('transform',o>0?'translate('+hx+','+HY+') scale('+c.toFixed(4)+','+(1-.06*s).toFixed(4)+') translate('+(-hx)+','+(-HY)+')':'');
    dk.setAttribute('opacity',(s*.5).toFixed(3));
    var fe=hx+W*c,t=-9*s,h0=HY-(HY-Y0)*(1-.06*s),h1=HY+(Y1-HY)*(1-.06*s);
    edge.setAttribute('d',o>.01?'M'+(fe-t).toFixed(1)+','+(h0+2).toFixed(1)+' L'+fe.toFixed(1)+','+h0.toFixed(1)+' L'+fe.toFixed(1)+','+h1.toFixed(1)+' L'+(fe-t).toFixed(1)+','+(h1-2).toFixed(1)+' Z':'');
    spill.setAttribute('opacity',(o*(d.inside?.9:.4)).toFixed(3));beam.setAttribute('opacity',(o*(d.inside?.45:.15)).toFixed(3));
  });
});
});
