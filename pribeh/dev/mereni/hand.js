/* predani film <-> let po zdi: rozdil obrazu mezi sousednimi polohami scrollu (velky rozdil = probliknuti/poskoceni) */
const {chromium}=require('playwright');const {execFileSync}=require('child_process');const out=process.argv[2],w=+process.argv[3]||1440,h=+process.argv[4]||900;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const base=await p.evaluate(()=>{const st=document.getElementById('story');document.documentElement.style.scrollBehavior='auto';return st.offsetTop+st.offsetHeight-innerHeight-(window.ST&&ST.tail||0)});
const at=async y=>{await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(1900);return p.evaluate(()=>ST.galCam?ST.galCam.k:null)};
const D=await p.evaluate(()=>window.__filmDbg);const edges=[[D.ANGEL/h+.001,'vjezd do letu 1'],[(D.ANGEL+D.XG)/h-.001,'vyjezd z letu 1'],[(D.shots[1][0])/h+.001,'vjezd do letu 2'],[(D.shots[1][0]+D.XG)/h-.001,'vyjezd z letu 2']];await at(base+(D.ANGEL/h-.1)*h);await p.waitForTimeout(2500);
let n=0;
for(const [e,name] of edges){const ys=[-.03,-.012,-.004,.004,.012,.03,.06,.1].map(d=>base+(e+d)*h);const fs=[];
  for(const y of ys){await at(y);const f=out+'-'+(n++)+'.png';await p.screenshot({path:f});fs.push(f)}
  const r=execFileSync('python3',['-W','ignore','-c',`
from PIL import Image,ImageChops,ImageStat
import sys
fs=${JSON.stringify(fs)}
o=[]
for a,b in zip(fs,fs[1:]):
    d=ImageChops.difference(Image.open(a).convert('RGB').crop((0,60,${w},${h})),Image.open(b).convert('RGB').crop((0,60,${w},${h})))
    o.append('%.2f'%(sum(ImageStat.Stat(d).mean)/3))
print(' '.join(o))`]).toString().trim();
  console.log(name.padEnd(16),'hrana h'+e.toFixed(3),'| rozdily sousednich snimku:',r)}
console.log('chyby:',errs.length?errs.join(';'):'zadne');await b.close()})();
