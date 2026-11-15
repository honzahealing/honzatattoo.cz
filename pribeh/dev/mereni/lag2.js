const {chromium}=require('playwright');const step=+process.argv[2]||40;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(async(step)=>{document.documentElement.style.scrollBehavior='auto';const st=document.getElementById('story'),sEnd=st.offsetTop+st.offsetHeight-innerHeight-(window.ST&&ST.tail||0);
const raf=()=>new Promise(r=>requestAnimationFrame(r));
const si=[...document.querySelectorAll('#stage image')].find(i=>/hero/.test(i.getAttribute('href')||i.getAttribute('xlink:href')||''));const hi=document.querySelector('#hero .sc-hero-img');
scrollTo(0,sEnd-300);for(let i=0;i<150;i++)await raf();
const out=[];
for(let y=-300;y<=500;y+=step){scrollTo(0,sEnd+y);
 /* hned po posunu (stav, ktery by kompozitor ukazal, nez hlavni vlakno stihne opravit transformy) */
 const a0=document.getElementById('stage').getBoundingClientRect().top,c0=document.querySelector('#hero .sc-stage').getBoundingClientRect().top,op=+getComputedStyle(document.getElementById('stage')).opacity;
 await raf();await raf();
 const a1=document.getElementById('stage').getBoundingClientRect().top,c1=document.querySelector('#hero .sc-stage').getBoundingClientRect().top;
 out.push([y,+(ST.Ys-sEnd).toFixed(0),+op.toFixed(2),+a0.toFixed(1),+a1.toFixed(1),+c0.toFixed(1),+c1.toFixed(1)])}
return out},step);
console.log('y | Ys | stageOp | storyTop(hned) | storyTop(po snimku) | filmTop(hned) | filmTop(po)');
r.forEach(q=>console.log(q.join(' | ')));await b.close()})();
