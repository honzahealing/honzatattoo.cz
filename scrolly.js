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
    notes=[].slice.call(root.querySelectorAll('.sc-note')),
    sideL=root.querySelector('.sc-side-l'),
    sideR=root.querySelector('.sc-side-r'),
    bar=root.querySelector('.sc-bar i');

/* draha kamery v hero fotce (podil sirky/vysky): obloukem kolem hlavy andela, pak dolu po tele */
var HEAD_PATH=[[.34,.23],[.45,.17],[.56,.26],[.47,.37]],
    BODY_PATH=[[.47,.5],[.48,.62],[.49,.74]],
    W=0,H=0,iw=1333,ih=2000,rw=0,rh=0,ox=0,oy=0,Z=1.8,A=.2,mobile=false,
    KP=[],T_HEAD=0,LUT=null,LN=600;

var FADE_START=.9;

function clamp(v){return v<0?0:v>1?1:v}
function ss(a,b,v){var t=clamp((v-a)/(b-a));return t*t*(3-2*t)}
function lerp(a,b,t){return a+(b-a)*t}

function cr(a,b,c,d,t){var t2=t*t,t3=t2*t;return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3)}
function spline(t){
  var n=KP.length-1,x=clamp(t)*n,i=Math.min(n-1,Math.floor(x)),f=x-i,
      p0=KP[Math.max(i-1,0)],p1=KP[i],p2=KP[i+1],p3=KP[Math.min(i+2,n)];
  return [cr(p0[0],p1[0],p2[0],p3[0],f),cr(p0[1],p1[1],p2[1],p3[1],f)];
}

/* stav kamery pro parametr drahy t (0..1) */
function state(t){
  var b=ss(0,T_HEAD,t),
      v=(t-T_HEAD)/(1-T_HEAD),
      wave=v>0?Math.sin(v*3*Math.PI)*ss(0,.12,v):0,
      f=spline(t),fx=f[0]*rw,fy=f[1]*rh;
  return {
    v:v,wave:wave,fx:fx,fy:fy,
    z:lerp(1,Z,b),
    sx:lerp(ox+fx,W*(.5+A*wave),b),
    sy:lerp(oy+fy,H*(mobile?.4:.46),b),
    rot:-wave*1.4*b
  };
}

/* prepocet: rovnomerna rychlost - meri se posun viditelne plochy (mrizka 3x3) mezi sousednimi stavy */
function buildLUT(){
  var L=new Float64Array(LN+1),prev=state(0),D=Math.PI/180,gx,gy,k;
  for(var i=1;i<=LN;i++){
    var st=state(i/LN),sum=0,
        c0=Math.cos(-prev.rot*D),s0=Math.sin(-prev.rot*D),
        c1=Math.cos(st.rot*D),s1=Math.sin(st.rot*D);
    for(gx=0;gx<3;gx++)for(gy=0;gy<3;gy++){
      var px=W*(.2+.3*gx),py=H*(.2+.3*gy),
          dx=(px-prev.sx)/prev.z,dy=(py-prev.sy)/prev.z,
          ix=prev.fx+dx*c0-dy*s0,iy=prev.fy+dx*s0+dy*c0,
          ex=(ix-st.fx)*st.z,ey=(iy-st.fy)*st.z,
          nx=st.sx+ex*c1-ey*s1,ny=st.sy+ex*s1+ey*c1;
      sum+=Math.hypot(nx-px,ny-py);
    }
    L[i]=L[i-1]+sum/9;
    prev=st;
  }
  for(k=0;k<=LN;k++)L[k]/=L[LN]||1;
  LUT=L;
}
function tAt(s){
  s=clamp(s);var lo=0,hi=LN;
  while(hi-lo>1){var m=(lo+hi)>>1;if(LUT[m]<s)lo=m;else hi=m}
  var d=LUT[hi]-LUT[lo];
  return (lo+(d>0?(s-LUT[lo])/d:0))/LN;
}

function layout(){
  W=stage.clientWidth;H=stage.clientHeight;
  if(img.naturalWidth){iw=img.naturalWidth;ih=img.naturalHeight}
  var s=Math.max(W/iw,H/ih);
  rw=iw*s;rh=ih*s;
  ox=(W-rw)/2;
  oy=Math.min(0,Math.max(H-rh,(H*.42)-.29*rh*1.35));
  img.style.width=rw+'px';img.style.height=rh+'px';
  mobile=W<769;
  Z=W>H?1.8:2.4;
  A=mobile?.1:.2;
  KP=[[(W*.5-ox)/rw,(H*.5-oy)/rh]].concat(HEAD_PATH,BODY_PATH);
  T_HEAD=HEAD_PATH.length/(KP.length-1);
  buildLUT();
}

var target=0,cur=0,raf=0;

function progress(){
  var r=root.getBoundingClientRect(),dist=root.offsetHeight-H;
  return dist>0?clamp(-r.top/dist):0;
}

function render(p){
  var st=state(tAt(p));

  img.style.transform='translate3d('+st.sx.toFixed(1)+'px,'+st.sy.toFixed(1)+'px,0) rotate('+st.rot.toFixed(3)+'deg) scale('+st.z.toFixed(4)+') translate3d('+(-st.fx).toFixed(1)+'px,'+(-st.fy).toFixed(1)+'px,0)';

  var out=ss(FADE_START,.99,p);
  img.style.filter='brightness('+lerp(1.08,.2,out).toFixed(3)+') contrast(1.06)';
  shade.style.opacity=lerp(1,.35,ss(.02,.1,p)).toFixed(3);

  var io=1-ss(.004,.055,p);
  intro.style.opacity=io.toFixed(3);
  intro.style.transform='translate3d(0,'+(-70*ss(.004,.055,p)).toFixed(1)+'px,0)';
  intro.classList.toggle('on',io>.5);
  if(hint)hint.style.opacity=(1-ss(0,.03,p)).toFixed(3);

  /* texty: vrchol kazde vlny = jeden text na volne strane */
  var l=0,r=0;
  for(var i=0;i<notes.length;i++){
    var c=(2*i+1)/(2*notes.length),v=st.v,
        o=ss(c-.13,c-.04,v)*(1-ss(c+.06,c+.15,v)),
        n=notes[i],left=n.getAttribute('data-side')==='left',
        dx=(1-o)*(left?-50:50);
    n.style.opacity=o.toFixed(3);
    n.style.visibility=o>.001?'visible':'hidden';
    n.style.transform=mobile?'translate3d(0,'+((1-o)*30).toFixed(1)+'px,0)':'translate3d('+dx.toFixed(1)+'px,-50%,0)';
    if(left)l=Math.max(l,o);else r=Math.max(r,o);
  }
  sideL.style.opacity=l.toFixed(3);
  sideR.style.opacity=r.toFixed(3);

  if(bar)bar.style.width=(p*100).toFixed(2)+'%';
}

function tick(){
  cur+=(target-cur)*.12;
  if(Math.abs(target-cur)<.0003)cur=target;
  render(cur);
  raf=cur!==target?requestAnimationFrame(tick):0;
}

function onScroll(){
  target=progress();
  if(!raf)raf=requestAnimationFrame(tick);
}

function init(){
  layout();
  if(reduce){render(0);return}
  target=cur=progress();
  render(cur);
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){layout();target=cur=progress();render(cur)});
}

if(img.complete)init();else{img.addEventListener('load',init);layout();render(0)}
})();
