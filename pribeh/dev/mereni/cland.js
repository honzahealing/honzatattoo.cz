const {chromium}=require('playwright');const {execFileSync}=require('child_process');const w=+process.argv[2]||1440,h=+process.argv[3]||900,out=process.argv[4];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const L=await p.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>setTimeout(r,2000));return __tailY(document.getElementById('contact'))});
/* text skryty (casovy prechod), at se meri jen obraz a zed */
await p.addStyleTag({content:'.contact.c-pic .rl,.contact.c-pic .rr{visibility:hidden!important}'});
const ys=[];for(let d=-200;d<=300;d+=10)ys.push(d);const fs=[];
for(const d of ys){await p.evaluate(v=>scrollTo(0,v),L+d);for(let i=0;i<30;i++){await p.waitForTimeout(100);if(await p.evaluate(()=>Math.abs(ST.Ys-scrollY)<.3))break}await p.waitForTimeout(150);const f=out+'-'+fs.length+'.png';await p.screenshot({path:f});fs.push(f)}
const r=execFileSync('python3',['-W','ignore','-c',`
import sys,numpy as np
from PIL import Image
fs=sys.argv[1:];prev=None;o=[]
for f in fs:
  a=np.asarray(Image.open(f).convert('RGB')).astype(float)
  if prev is not None:o.append(round(float(np.abs(a-prev).mean()),2))
  prev=a
print(' '.join(map(str,o)))`,...fs]).toString();
console.log('d (px od pristani): rozdil oproti predchozimu kroku 10 px');const v=r.trim().split(' ');console.log(ys.slice(1).map((d,i)=>d+':'+v[i]).join(' '));
console.log('chyby',errs);await b.close()})();
