const {chromium}=require('playwright');const step=+process.argv[2]||60,W=+process.argv[3]||1440,Hh=+process.argv[4]||900;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:Hh}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(async(step)=>{document.documentElement.style.scrollBehavior='auto';const c=document.getElementById('contact'),g=c.querySelector('.contact-grid');
const raf=()=>new Promise(r=>requestAnimationFrame(r));scrollTo(0,document.documentElement.scrollHeight);for(let i=0;i<60;i++)await raf();const land=__tailY(c);
scrollTo(0,land-400);for(let i=0;i<200;i++)await raf();
const out=[];for(let y=-400;y<=700;y+=step){scrollTo(0,land+y);const a=g.getBoundingClientRect().top;await raf();await raf();const b=g.getBoundingClientRect().top;out.push([y,+(ST.Ys-land).toFixed(0),c.style.opacity,+a.toFixed(1),+b.toFixed(1)])}
for(let y=700;y>=-400;y-=step){scrollTo(0,land+y);const a=g.getBoundingClientRect().top;await raf();await raf();const b=g.getBoundingClientRect().top;out.push(['z'+y,+(ST.Ys-land).toFixed(0),c.style.opacity,+a.toFixed(1),+b.toFixed(1)])}
return out},step);
console.log('y | Ys | op | ram hned | ram po');r.forEach(q=>console.log(q.join(' | ')));console.log('chyby',errs);await b.close()})();
