const {chromium}=require('playwright');const step=+process.argv[2]||60,w=+process.argv[3]||1440,h=+process.argv[4]||900;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(async(step)=>{document.documentElement.style.scrollBehavior='auto';const st=document.getElementById('story'),sEnd=st.offsetTop+st.offsetHeight-innerHeight-(ST.tail||0);
const raf=()=>new Promise(r=>requestAnimationFrame(r));const sg=document.getElementById('stage'),fs=document.querySelector('#hero .sc-stage');
const si=[...document.querySelectorAll('#stage image')].find(i=>/hero/.test(i.getAttribute('href')||i.getAttribute('xlink:href')||''));const hi=document.querySelector('#hero .sc-hero-img');
scrollTo(0,sEnd+700);for(let i=0;i<150;i++)await raf();
const out=[];
for(let y=700;y>=-700;y-=step){scrollTo(0,sEnd+y);
 const a0=sg.getBoundingClientRect().top,c0=fs.getBoundingClientRect().top,op=+getComputedStyle(sg).opacity;
 await raf();await raf();
 out.push([y,+(ST.Ys-sEnd).toFixed(0),+op.toFixed(2),+a0.toFixed(1),+sg.getBoundingClientRect().top.toFixed(1),+c0.toFixed(1),+fs.getBoundingClientRect().top.toFixed(1),+si.getBoundingClientRect().top.toFixed(1),+hi.getBoundingClientRect().top.toFixed(1)])}
return out},step);
console.log('y | Ys | stageOp(pred) | story hned | story po | film hned | film po | storyImg | filmImg');
r.forEach(q=>console.log(q.join(' | ')));console.log('chyby',errs);await b.close()})();
