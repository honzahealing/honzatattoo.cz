(function(){
var root=document.getElementById('hero');
if(!root||!root.classList.contains('scrolly'))return;
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var stage=root.querySelector('.sc-stage'),
    heroLayer=root.querySelector('.sc-hero'),
    img=root.querySelector('.sc-hero-img'),
    shade=root.querySelector('.sc-shade'),
    intro=root.querySelector('.sc-intro'),
    hint=root.querySelector('.sc-hint'),
    notes=[].slice.call(root.querySelectorAll('.sc-note:not([data-shot])')),
    fade=root.querySelector('.sc-fade'),
    anchors={about:0,styles:1},
    sideL=root.querySelector('.sc-side-l'),
    sideR=root.querySelector('.sc-side-r'),
    bar=root.querySelector('.sc-bar i');

/* draha kamery v hero fotce (podil sirky/vysky): zoom na hlavu andela, pak esicko dolu po tele */
var HEAD={x:.44,y:.29},FOOT={x:.49,y:.74},footY=.74,HEAD_SCREEN=.28,anchorY=.28,
    W=0,H=0,iw=1333,ih=2000,rw=0,rh=0,ox=0,oy=0,Z=1.8,A=.2,mobile=false;

/* casova osa: zoom a sjezd se prolinaji v CROSS (zoom plynule dobiha, sjezd se plynule rozjizdi) */
var CROSS=.16,P_D=.2,P_Z=.36,wZ=1,vD=1,K2=2/Math.PI;

function clamp(v){return v<0?0:v>1?1:v}
function ss(a,b,v){var t=clamp((v-a)/(b-a));return t*t*(3-2*t)}
function lerp(a,b,t){return a+(b-a)*t}

/* stav kamery: b = kolik je hotovo zoomu (0..1), d = kolik je hotovo sjezdu (0..1) */
function state(b,d){
  var wave=Math.sin(d*3*Math.PI)*ss(0,.12,d),
      fx=lerp(HEAD.x,FOOT.x,d)*rw,fy=lerp(HEAD.y,footY,d)*rh;
  return {
    v:d,wave:wave,fx:fx,fy:fy,
    z:Math.pow(Z,b),
    sx:lerp(ox+fx,W*(.5+A*wave),b),
    sy:lerp(oy+fy,H*anchorY,b),
    rot:-wave*1.4*b
  };
}

/* posun viditelne plochy (mrizka 3x3) mezi dvema stavy kamery */
function flow(a,c){
  var D=Math.PI/180,sum=0,
      c0=Math.cos(-a.rot*D),s0=Math.sin(-a.rot*D),
      c1=Math.cos(c.rot*D),s1=Math.sin(c.rot*D);
  for(var gx=0;gx<3;gx++)for(var gy=0;gy<3;gy++){
    var px=W*(.2+.3*gx),py=H*(.2+.3*gy),
        dx=(px-a.sx)/a.z,dy=(py-a.sy)/a.z,
        ix=a.fx+dx*c0-dy*s0,iy=a.fy+dx*s0+dy*c0,
        ex=(ix-c.fx)*c.z,ey=(iy-c.fy)*c.z;
    sum+=Math.hypot(c.sx+ex*c1-ey*s1-px,c.sy+ex*s1+ey*c1-py);
  }
  return sum/9;
}

/* delky casti podle toho, kolik pohybu na obrazovce udela zoom a kolik sjezd -> stejna rychlost */
function timeline(){
  var N=200,Fz=0,Fd=0,i,c=CROSS;
  for(i=0;i<N;i++){Fz+=flow(state(i/N,0),state((i+1)/N,0));Fd+=flow(state(1,i/N),state(1,(i+1)/N))}
  P_D=Math.min(.5,Math.max(.05,(Fz*(1-c+K2*c)-Fd*K2*c)/(Fz+Fd)));
  P_Z=P_D+c;
  wZ=1/(P_D+K2*c);
  vD=1/(K2*c+1-P_Z);
}
function zoomAt(p){
  if(p<P_D)return wZ*p;
  if(p<P_Z)return wZ*(P_D+K2*CROSS*Math.sin(Math.PI/2*(p-P_D)/CROSS));
  return 1;
}
function descAt(p){
  if(p<P_D)return 0;
  if(p<P_Z)return vD*K2*CROSS*(1-Math.cos(Math.PI/2*(p-P_D)/CROSS));
  return Math.min(1,vD*(K2*CROSS+p-P_Z));
}

/* stejna rychlost po cele draze: preparametrizace podle posunu viditelne plochy.
   Tvar drahy (plynule prolnuti zoomu a sjezdu) zustava, meni se jen tempo. */
var LUT=null,LN=500;
function buildLUT(){
  var L=new Float64Array(LN+1),prev=state(zoomAt(0),descAt(0)),i;
  for(i=1;i<=LN;i++){var st=state(zoomAt(i/LN),descAt(i/LN));L[i]=L[i-1]+flow(prev,st);prev=st}
  for(i=0;i<=LN;i++)L[i]/=L[LN]||1;
  LUT=L;
}
function qAt(s){
  s=clamp(s);var lo=0,hi=LN;
  while(hi-lo>1){var m=(lo+hi)>>1;if(LUT[m]<s)lo=m;else hi=m}
  var d=LUT[hi]-LUT[lo];
  return (lo+(d>0?(s-LUT[lo])/d:0))/LN;
}

/* zabery za andelem: kazdy se prolne pres predchozi a kamera po nem plynule jede z data-from do data-to */
var shots=[].slice.call(root.querySelectorAll('.sc-shot')).map(function(el,i){
  var im=el.querySelector('img');
  function pt(a){var v=(el.getAttribute(a)||'.5,.5,1').split(',').map(Number);return {x:v[0],y:v[1],z:v[2]||1}}
  var mz=(el.getAttribute('data-mzoom')||'').split(',').map(Number);
  return {el:el,img:im,from:pt('data-from'),to:pt('data-to'),side:el.getAttribute('data-side'),
    /* data-wave: kamera jede esickem (jako u andela), texty na vrcholech vln; data-len = delka zaberu v obrazovkach */
    wave:el.hasAttribute('data-wave'),len:+el.getAttribute('data-len')||0,mz:mz.length===2?mz:null,
    notes:[].slice.call(root.querySelectorAll('.sc-note[data-shot="'+i+'"]')),
    iw:+im.getAttribute('width')||1,ih:+im.getAttribute('height')||1,b:0,L:0,vis:false};
});

/* casova osa v px scrollu: ANGEL = cela scena s andelem, X = prolnuti, L = odstup zaberu */
var ANGEL=0,X=0,L=0,dist=0;

function layout(){
  W=stage.clientWidth;H=stage.clientHeight;
  if(img.naturalWidth){iw=img.naturalWidth;ih=img.naturalHeight}
  var s=Math.max(W/iw,H/ih);
  rw=iw*s;rh=ih*s;
  ox=(W-rw)/2;
  /* vychozi zaber: hlava v horni tretine; pri zoomu zustane na stejne vysce, aby se obraz neotacel nahoru/dolu */
  oy=Math.min(0,Math.max(H-rh,H*HEAD_SCREEN-HEAD.y*rh));
  anchorY=(oy+HEAD.y*rh)/H;
  img.style.width=rw+'px';img.style.height=rh+'px';
  mobile=W<769;
  Z=W>H?1.8:2.4;
  A=mobile?.1:.2;
  /* konec drahy tak, aby spodni okraj fotky zustal vzdy pod obrazovkou (+rezerva na naklon) */
  footY=Math.min(FOOT.y,1-(H*(1-anchorY)+40)/(rh*Z));
  timeline();
  buildLUT();

  ANGEL=(mobile?4.2:5)*H;X=.8*H;L=(mobile?2.1:2.4)*H;
  for(var i=0;i<shots.length;i++){
    var sh=shots[i];
    if(sh.img.naturalWidth){sh.iw=sh.img.naturalWidth;sh.ih=sh.img.naturalHeight}
    sh.img.style.width=sh.iw+'px';sh.img.style.height=sh.ih+'px';
    sh.L=sh.len?sh.len*H:L;
    sh.b=i?shots[i-1].b+shots[i-1].L:ANGEL-X;
  }
  dist=shots.length?shots[shots.length-1].b+shots[shots.length-1].L+X:ANGEL;
  root.style.height=(dist+H)+'px';
  /* kotvy menu (O mne, Styl) = misto, kde je zaber uz cely prolnuty */
  for(var id in anchors){var a=document.getElementById(id),sh2=shots[anchors[id]];if(a&&sh2)a.style.top=(sh2.b+X)+'px'}
}

var target=0,cur=0,raf=0;

function progress(){
  var r=root.getBoundingClientRect();
  return Math.min(dist,Math.max(0,-r.top));
}

function noteStyle(n,o){
  var left=n.getAttribute('data-side')==='left',dx=(1-o)*(left?-50:50);
  n.style.opacity=o.toFixed(3);
  n.style.visibility=o>.001?'visible':'hidden';
  n.style.transform=mobile?'translate3d(0,'+((1-o)*30).toFixed(1)+'px,0)':'translate3d('+dx.toFixed(1)+'px,-50%,0)';
  return left;
}

function renderShot(sh,s,side){
  var life=sh.L+X,u=(s-sh.b)/life,last=sh===shots[shots.length-1],
      vis=u>0&&(u<1||last),k=clamp(u),n=sh.notes.length,o,j,
      /* vlny a texty jen v case, kdy je zaber cely (po prolnuti, pred dalsim) */
      kn=clamp((s-sh.b-X)/(sh.L-X));
  if(vis!==sh.vis){sh.vis=vis;sh.el.style.visibility=vis?'visible':'hidden'}
  for(j=0;j<n;j++){
    if(sh.wave){
      /* vrchol j-te vlny; text na opacne strane, nez kam uhne ohnisko */
      var w=1/n,c=(2*j+1)*w/2;
      o=ss(c-.4*w,c-.12*w,kn)*(1-ss(c+.18*w,c+.45*w,kn));
    }else o=ss(sh.b+.8*X,sh.b+.8*X+.4*H,s)*(1-ss(sh.b+sh.L-.3*H,sh.b+sh.L+.15*H,s));
    if(noteStyle(sh.notes[j],o))side.l=Math.max(side.l,o);else side.r=Math.max(side.r,o);
  }
  if(!vis)return;
  sh.el.style.opacity=ss(sh.b,sh.b+X,s).toFixed(3);
  if(reduce)k=.3;
  var z0=sh.from.z,z1=sh.to.z;
  if(mobile&&sh.mz){z0=sh.mz[0];z1=sh.mz[1]}
  var fx=lerp(sh.from.x,sh.to.x,k),fy=lerp(sh.from.y,sh.to.y,k),
      S=Math.max(W/sh.iw,H/sh.ih)*lerp(z0,z1,k)*(sh.wave?1.04:1),
      wave=sh.wave&&n&&!reduce?Math.sin(kn*n*Math.PI):0,rot=0,px,py;
  if(sh.wave){
    px=W*(.5+(mobile?.1:.2)*wave);py=mobile?H*.36:H*.5;rot=-wave*(mobile?.6:1);
  }else{
    /* ohnisko na volnou stranu od textu; na mobilu nad text dole */
    px=mobile?W*.5:W*(sh.side==='left'?.64:.36);py=mobile?H*.36:H*.5;
  }
  /* fotka nesmi odjet z obrazovky: ohnisko se posune jen tak daleko, kam fotka staci */
  var ix=fx*sh.iw*S,iy=fy*sh.ih*S;
  px=Math.min(ix,Math.max(W-(sh.iw*S-ix),px));
  py=Math.min(iy,Math.max(H-(sh.ih*S-iy),py));
  sh.img.style.transform='translate3d('+px.toFixed(1)+'px,'+py.toFixed(1)+'px,0) rotate('+rot.toFixed(3)+'deg) scale('+S.toFixed(4)+') translate3d('+(-fx*sh.iw).toFixed(1)+'px,'+(-fy*sh.ih).toFixed(1)+'px,0)';
}

function render(s){
  var p=clamp(s/ANGEL),q=qAt(p),st=state(zoomAt(q),descAt(q)),
      cam=reduce?state(0,0):st;

  if(s<=ANGEL+2){
    heroLayer.style.visibility='visible';
    img.style.transform='translate3d('+cam.sx.toFixed(1)+'px,'+cam.sy.toFixed(1)+'px,0) rotate('+cam.rot.toFixed(3)+'deg) scale('+cam.z.toFixed(4)+') translate3d('+(-cam.fx).toFixed(1)+'px,'+(-cam.fy).toFixed(1)+'px,0)';
    shade.style.opacity=lerp(1,.35,ss(.02,.1,p)).toFixed(3);
  }else heroLayer.style.visibility='hidden';

  var io=1-ss(.004,.055,p);
  intro.style.opacity=io.toFixed(3);
  intro.style.transform='translate3d(0,'+(-70*ss(.004,.055,p)).toFixed(1)+'px,0)';
  intro.classList.toggle('on',io>.5);
  if(hint)hint.style.opacity=(1-ss(0,.03,p)).toFixed(3);

  /* texty andela: vrchol kazde vlny = jeden text na volne strane */
  var side={l:0,r:0};
  for(var i=0;i<notes.length;i++){
    var c=(2*i+1)/(2*notes.length)*.9,v=st.v,
        o=ss(c-.13,c-.04,v)*(1-ss(c+.06,c+.15,v));
    if(noteStyle(notes[i],o))side.l=Math.max(side.l,o);else side.r=Math.max(side.r,o);
  }
  for(i=0;i<shots.length;i++)renderShot(shots[i],s,side);
  sideL.style.opacity=side.l.toFixed(3);
  sideR.style.opacity=side.r.toFixed(3);

  /* na konci filmu dotmava, at dalsi sekce navaze */
  if(fade)fade.style.opacity=ss(dist-.6*H,dist,s).toFixed(3);

  if(bar)bar.style.width=(dist?s/dist*100:0).toFixed(2)+'%';
}

function tick(){
  cur+=(target-cur)*.12;
  if(Math.abs(target-cur)<.5)cur=target;
  render(cur);
  raf=cur!==target?requestAnimationFrame(tick):0;
}

function onScroll(){
  target=progress();
  if(reduce){cur=target;render(cur);return}
  if(!raf)raf=requestAnimationFrame(tick);
}

var ready=false;
function refresh(){layout();target=cur=progress();render(cur)}
function init(){
  if(ready)return;ready=true;
  refresh();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){refresh()});
  shots.forEach(function(sh){if(!sh.img.complete)sh.img.addEventListener('load',refresh)});
}

if(img.complete)init();else{img.addEventListener('load',init);layout();render(0)}
})();
