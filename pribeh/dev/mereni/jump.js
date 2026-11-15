/* rozdil obrazu mezi sousednimi kroky scrollu (po ustaleni vyhlazeni) v okoli hrany pribeh/film; velky osamely rozdil = poskoceni */
const {chromium}=require('playwright');const {execFileSync}=require('child_process');
const w=+process.argv[2]||1440,h=+process.argv[3]||900,from=+process.argv[4]||-220,to=+process.argv[5]||80,step=+process.argv[6]||6,out=process.argv[7];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const sEnd=await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';const st=document.getElementById('story');return st.offsetTop+st.offsetHeight-innerHeight-(window.ST&&ST.tail||0)});
const fs=[],ys=[];
for(let y=from;y<=to;y+=step){await p.evaluate(v=>scrollTo(0,v),sEnd+y);
  /* cekej, az se vyhlazeny scroll ustali */
  for(let i=0;i<30;i++){await p.waitForTimeout(100);const d=await p.evaluate(()=>Math.abs(ST.Ys-scrollY));if(d<.4)break}
  await p.waitForTimeout(150);const f=out+'-'+fs.length+'.png';await p.screenshot({path:f});fs.push(f);ys.push(y)}
const r=execFileSync('python3',['-W','ignore','-c',`
from PIL import Image,ImageChops,ImageStat
fs=${JSON.stringify(fs)};ys=${JSON.stringify(ys)}
prev=None;o=[]
for f,y in zip(fs,ys):
    im=Image.open(f).convert('RGB').crop((0,70,${w},${h}-30)).resize((${w}//4,(${h}-100)//4))
    if prev is not None:
        d=sum(ImageStat.Stat(ImageChops.difference(prev,im)).mean)/3
        o.append('%d:%.1f'%(y,d))
    prev=im
print(' '.join(o))`]).toString().trim();
console.log('Ys:rozdil oproti predchozimu kroku ('+step+' px)');console.log(r);console.log('chyby:',errs.length?[...new Set(errs)].join(';'):'zadne');await b.close()})();
