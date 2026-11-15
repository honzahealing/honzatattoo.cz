/* cas snimku behem zoomu do andela (Ys od -1100 do +100 px od hrany pribeh/film), volitelne se schovanymi vrstvami */
const {chromium}=require('playwright');const w=+process.argv[2]||1440,h=+process.argv[3]||900,hide=(process.argv[4]||'').split(',').filter(Boolean);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(async(hide0)=>{let hide=hide0.slice();document.documentElement.style.scrollBehavior='auto';const st=document.getElementById('story'),sEnd=st.offsetTop+st.offsetHeight-innerHeight-(window.ST&&ST.tail||0);
  const raf=()=>new Promise(r=>requestAnimationFrame(r));
  if(hide.includes('NOSEP')){ST.on(function(){document.querySelectorAll('.fig-honza,.fig-client').forEach(e=>e.removeAttribute('filter'))});hide=hide.filter(q=>q!=='NOSEP')}
  if(hide.length){const st2=document.createElement('style');st2.textContent=hide.map(q=>q+'{display:none!important}').join('');document.head.appendChild(st2)}
  scrollTo(0,sEnd-1300);for(let i=0;i<150;i++)await raf();
  const out=[];let y=sEnd-1300,last=performance.now();
  for(let i=0;i<200;i++){y+=6;scrollTo(0,y);await raf();await raf();const t=performance.now();out.push([Math.round(ST.Ys-sEnd),+((t-last)/2).toFixed(1)]);last=t}
  return out},hide);
const bins={};for(const [y,t] of r){const k=Math.floor(y/100)*100;(bins[k]=bins[k]||[]).push(t)}

const all=r.map(q=>q[1]),pas=(lo,hi)=>{const a=r.filter(q=>q[0]>=lo&&q[0]<hi).map(q=>q[1]).sort((x,y)=>x-y);return a.length?a[a.length>>1].toFixed(0):'-'};console.log(('skryto: '+(hide.join(' ')||'nic')).padEnd(52),'| -1300..-1000:',pas(-1300,-1000),'| -1000..-600:',pas(-1000,-600),'| -600..-300:',pas(-600,-300),'| -300..0:',pas(-300,0));
console.log('chyby:',errs.length?[...new Set(errs)].join(';'):'zadne');await b.close()})();
