/* Snimky slozeneho webu (pribeh + film s andelem): node pribeh/dev/siteshot.js <soubor.html> <prefix> <sirka> <vyska> <T|hN> ...
   T = cas pribehu 0..14, hN = N obrazovek scrollu za koncem pribehu (film s andelem a galerie na zdi). */
const {chromium}=require('playwright');
const [,,file,out,w,h,...ts]=process.argv;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:+w,height:+h}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+file);await p.waitForTimeout(1500);
let i=0;for(const t of ts){
  await p.evaluate(t=>{const st=document.getElementById('story');const vh=innerHeight;const span=st.offsetHeight-vh;let y;
    if(t.startsWith('h')){y=st.offsetTop+span+parseFloat(t.slice(1))*vh}else y=st.offsetTop+(+t)/ST.N*span;document.documentElement.style.scrollBehavior='auto';window.scrollTo({top:y,behavior:'instant'})},t);
  await p.waitForTimeout(1600);await p.screenshot({path:`${out}-${i}.png`});console.log(out+'-'+i+'.png <- '+t);i++}
console.log('chyby:',errs.length?errs.join('\n'):'zadne');await b.close()})();
