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

/* cesta kamery v hero fotce (podil sirky/vysky): hlava andela -> spodek draperie */
var HEAD={x:.44,y:.29},FOOT={x:.49,y:.74},
    W=0,H=0,iw=1333,ih=2000,rw=0,rh=0,ox=0,oy=0,Z=1.8,A=.2,mobile=false;

/* rozdeleni scrollu: najeti na hlavu, vlna po tele, doznani */
var ZOOM_END=.14,TRAVEL_END=.9;

function clamp(v){return v<0?0:v>1?1:v}
function ss(a,b,v){var t=clamp((v-a)/(b-a));return t*t*(3-2*t)}
function lerp(a,b,t){return a+(b-a)*t}
function easeIO(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function easeSine(t){return -(Math.cos(Math.PI*t)-1)/2}

function layout(){
  W=stage.clientWidth;H=stage.clientHeight;
  if(img.naturalWidth){iw=img.naturalWidth;ih=img.naturalHeight}
  var s=Math.max(W/iw,H/ih);
  rw=iw*s;rh=ih*s;
  ox=(W-rw)/2;
  oy=Math.min(0,Math.max(H-rh,(H*.42)-HEAD.y*rh*1.35));
  img.style.width=rw+'px';img.style.height=rh+'px';
  mobile=W<769;
  Z=W>H?1.8:2.4;
  A=mobile?.1:.2;
}

var target=0,cur=0,raf=0;

function progress(){
  var r=root.getBoundingClientRect(),dist=root.offsetHeight-H;
  return dist>0?clamp(-r.top/dist):0;
}

function render(p){
  var e=easeIO(clamp(p/ZOOM_END)),
      u=easeSine(clamp((p-ZOOM_END)/(TRAVEL_END-ZOOM_END))),
      wave=Math.sin(u*3*Math.PI);

  /* bod na tele, na ktery se prave diva kamera */
  var fx=lerp(HEAD.x,FOOT.x,u)*rw,
      fy=lerp(HEAD.y,FOOT.y,u)*rh;

  /* kam na obrazovce ten bod patri: pred najetim puvodni kompozice, pak stred s vlnou */
  var sx0=ox+HEAD.x*rw,sy0=oy+HEAD.y*rh,
      sx=lerp(sx0,W*(.5+A*wave),e),
      sy=lerp(sy0,H*(mobile?.4:.46),e),
      z=lerp(1,Z,e),
      rot=-wave*1.4*e;

  img.style.transform='translate3d('+sx.toFixed(1)+'px,'+sy.toFixed(1)+'px,0) rotate('+rot.toFixed(3)+'deg) scale('+z.toFixed(4)+') translate3d('+(-fx).toFixed(1)+'px,'+(-fy).toFixed(1)+'px,0)';

  var out=ss(TRAVEL_END,.99,p);
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
    var c=(2*i+1)/(2*notes.length),
        o=ss(c-.13,c-.04,u)*(1-ss(c+.06,c+.15,u)),
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
