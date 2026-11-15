const {chromium}=require('playwright');const {execFileSync}=require('child_process');const d=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2000,height:919}});
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const sEnd=await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';const st=document.getElementById('story');return st.offsetTop+st.offsetHeight-innerHeight-(window.ST&&ST.tail||0)});
await p.evaluate(v=>scrollTo(0,v),sEnd);for(let k=0;k<30;k++){await p.waitForTimeout(100);if(await p.evaluate(()=>Math.abs(ST.Ys-scrollY)<.4))break}await p.waitForTimeout(500);
const css=t=>p.addStyleTag({content:t});
const shot=async n=>{await p.waitForTimeout(250);const f=d+'/g-'+n+'.png';await p.screenshot({path:f});return f};
const F={};
F.scene=await shot('scene');
await css('.stage .grain{visibility:hidden!important}');F.sceneNoGrain=await shot('sng');
await css('.stage{display:none!important}');F.film=await shot('film');
await css('#hero .sc-grain{visibility:hidden!important}');F.filmNoGrain=await shot('fng');
console.log(execFileSync('python3',['-W','ignore','-c',`
from PIL import Image,ImageStat
F=${JSON.stringify(F)}
m=lambda f:sum(ImageStat.Stat(Image.open(f).convert('RGB').crop((300,150,1700,700))).mean)/3
s,sn,f,fn=m(F['scene']),m(F['sceneNoGrain']),m(F['film']),m(F['filmNoGrain'])
print('scena s zrnem %.2f, bez zrna %.2f (zrno pridava %.2f)'%(s,sn,s-sn))
print('film  s zrnem %.2f, bez zrna %.2f (zrno pridava %.2f)'%(f,fn,f-fn))
print('rozdil bez zrna (film - scena): %.2f'%(fn-sn))`]).toString());
console.log(await p.evaluate(()=>{const g=e=>{const c=getComputedStyle(document.querySelector(e));return e+' blend='+c.mixBlendMode+' op='+c.opacity+' bg='+c.backgroundImage.slice(0,40)};return [g('.stage .grain'),g('#hero .sc-grain')].join('\n')}));
await b.close()})();
