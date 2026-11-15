/* stav tesne pred prolnutim (k .95, jen ram z pribehu) proti stavu po pristani (jen formular): zed + ram */
const {chromium}=require('playwright');const w=+process.argv[2]||1440,h=+process.argv[3]||900,dpr=+process.argv[5]||1;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr});const p=await ctx.newPage();
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const L=await p.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>setTimeout(r,2000));return __tailY(document.getElementById('contact'))});
await p.addStyleTag({content:'.contact.c-pic .rl,.contact.c-pic .rr{visibility:hidden!important}'});
await p.evaluate(y=>scrollTo(0,y),L);await p.waitForTimeout(3000);await p.screenshot({path:process.argv[4]+'-contact.png'});
/* ram z pribehu v konecne poloze: kamera stoji, formular skryty, linky a stin ramu plne */
await p.addStyleTag({content:'#contact{opacity:0!important}'});
await p.evaluate(()=>{const K=ST.gal[ST.gal.length-1];(function f(){K.sh.setAttribute('opacity',.38);K.fr.forEach(e=>e.setAttribute('stroke-opacity',1));K._so='x';requestAnimationFrame(f)})()});
await p.waitForTimeout(100);await p.screenshot({path:process.argv[4]+'-story.png'});await b.close()})();
