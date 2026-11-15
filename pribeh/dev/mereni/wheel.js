const {chromium}=require('playwright');const tick=+process.argv[2]||100,gap=+process.argv[3]||40;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const sEnd=await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';const st=document.getElementById('story');return st.offsetTop+st.offsetHeight-innerHeight-ST.tail});
await p.evaluate(v=>scrollTo(0,v),sEnd-500);await p.waitForTimeout(2500);
await p.evaluate(()=>{window.__rec=[];const hi=document.querySelector('#hero .sc-hero-img'),si=[...document.querySelectorAll('#stage image')].find(i=>/hero/.test(i.getAttribute('href')||i.getAttribute('xlink:href')||''));
const sg=document.getElementById('stage');(function f(){const c=hi.getBoundingClientRect(),a=si.getBoundingClientRect();__rec.push([+(ST.Ys).toFixed(1),+scrollY.toFixed(0),+a.top.toFixed(2),+c.top.toFixed(2),+(+getComputedStyle(sg).opacity).toFixed(2)]);requestAnimationFrame(f)})()});
p.mouse.move(700,450);
for(let i=0;i<14;i++){await p.mouse.wheel(0,tick);await p.waitForTimeout(gap)}
await p.waitForTimeout(1500);
const r=await p.evaluate(()=>__rec);
const s0=sEnd;let prev=null;
console.log('Ys-sEnd | scroll-sEnd | storyTop | filmTop | stageOp  (jen kde Ys in -80..120)');
r.forEach(q=>{const y=q[0]-s0;if(y>-80&&y<120)console.log([+y.toFixed(0),q[1]-s0,q[2],q[3],q[4]].join(' | '))});await b.close()})();
