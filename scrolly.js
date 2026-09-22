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
    works=[].slice.call(root.querySelectorAll('.sc-work')),
    figs=works.map(function(w){return w.querySelector('figure')}),
    end=root.querySelector('.sc-end'),
    bar=root.querySelector('.sc-bar i');

/* bod v hero fotce, kam kamera najizdi (tvar andela), v podilu sirky/vysky */
var FX=.44,FY=.29,W=0,H=0,iw=1333,ih=2000,rw=0,rh=0,ox=0,oy=0,Z=1.8;

function clamp(v){return v<0?0:v>1?1:v}
function ss(a,b,v){var t=clamp((v-a)/(b-a));return t*t*(3-2*t)}
function lerp(a,b,t){return a+(b-a)*t}
function easeIO(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}

function layout(){
  W=stage.clientWidth;H=stage.clientHeight;
  if(img.naturalWidth){iw=img.naturalWidth;ih=img.naturalHeight}
  var s=Math.max(W/iw,H/ih);
  rw=iw*s;rh=ih*s;
  ox=(W-rw)/2;
  oy=Math.min(0,Math.max(H-rh,(H*.42)-FY*rh*1.35));
  img.style.width=rw+'px';img.style.height=rh+'px';
  Z=W>H?1.8:2.4;
}

var target=0,cur=0,raf=0;

function progress(){
  var r=root.getBoundingClientRect(),dist=root.offsetHeight-H;
  return dist>0?clamp(-r.top/dist):0;
}

function render(p){
  /* 1) najeti do tvare */
  var e=easeIO(clamp(p/.2));
  var z=lerp(1,Z,e),
      px=FX*rw,py=FY*rh,
      tx=lerp(ox,W*.5-px*Z,e),
      ty=lerp(oy,H*.46-py*Z,e);
  img.style.transform='translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0) scale('+z.toFixed(4)+')';
  var out=ss(.19,.28,p),
      br=lerp(1.08,.35,out),bl=out*8;
  img.style.filter='brightness('+br.toFixed(3)+') contrast(1.06) blur('+bl.toFixed(2)+'px)';
  shade.style.opacity=lerp(1,.4,ss(.02,.12,p)).toFixed(3);
  heroLayer.style.opacity=(1-ss(.22,.3,p)).toFixed(3);

  var io=1-ss(.004,.055,p);
  intro.style.opacity=io.toFixed(3);
  intro.style.transform='translate3d(0,'+(-70*ss(.004,.055,p)).toFixed(1)+'px,0)';
  intro.classList.toggle('on',io>.5);
  if(hint)hint.style.opacity=(1-ss(0,.03,p)).toFixed(3);

  /* 2) prace jedna po druhe v prostoru */
  var n=works.length;
  for(var i=0;i<n;i++){
    var s0=.25+i*.145,L=.185,t=(p-s0)/L,
        o=ss(0,.22,t)*(1-ss(.78,1,t)),
        w=works[i];
    if(o<=.001){w.style.opacity=0;w.style.visibility='hidden';continue}
    w.style.visibility='visible';
    w.style.opacity=o.toFixed(3);
    var tc=clamp(t),
        sc=lerp(.86,1.06,tc),
        rx=lerp(10,-6,tc),
        ry=lerp(i%2?-8:8,i%2?4:-4,tc),
        yy=lerp(60,-40,tc);
    figs[i].style.transform='perspective(1400px) translate3d(0,'+yy.toFixed(1)+'px,0) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) scale('+sc.toFixed(4)+')';
  }

  /* 3) zaver s vyzvou */
  var eo=ss(.84,.92,p);
  end.style.opacity=eo.toFixed(3);
  end.style.transform='translate3d(0,'+lerp(40,0,eo).toFixed(1)+'px,0)';
  end.classList.toggle('on',eo>.5);

  if(bar)bar.style.width=(p*100).toFixed(2)+'%';
}

function tick(){
  cur+=(target-cur)*.14;
  if(Math.abs(target-cur)<.0004)cur=target;
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
