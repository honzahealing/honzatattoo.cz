/* cas kazdeho snimku pri plynulem scrollu pres hranu pribeh/film: hleda zaseknute snimky */
const {chromium}=require('playwright');const w=+process.argv[2]||1440,h=+process.argv[3]||900,from=+process.argv[4]||-300,to=+process.argv[5]||300,step=+process.argv[6]||3;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const r=await p.evaluate(async([from,to,step])=>{document.documentElement.style.scrollBehavior='auto';const st=document.getElementById('story'),sEnd=st.offsetTop+st.offsetHeight-innerHeight-(window.ST&&ST.tail||0);
  const raf=()=>new Promise(r=>requestAnimationFrame(r));
  scrollTo(0,sEnd+from-400);for(let i=0;i<150;i++)await raf();
  const out=[];let y=from,last=performance.now();
  for(;y<=to;y+=step){scrollTo(0,sEnd+y);await raf();const t=performance.now();out.push([y,+(t-last).toFixed(1),+(ST.Ys-sEnd).toFixed(0),document.getElementById('stage').className.includes('fix')?1:0,document.getElementById('btt').classList.contains('nx')?1:0]);last=t}
  return out},[from,to,step]);
const med=r.map(q=>q[1]).sort((a,b)=>a-b)[r.length>>1];
console.log('median ms/snimek:',med);
console.log('snimky delsi nez 1,8x median (y | ms | Ys | fix | in-story):');
r.forEach((q,i)=>{if(q[1]>med*1.8&&i>3)console.log(q.join(' | '))});
const ev=[];for(let i=1;i<r.length;i++){if(r[i][3]!==r[i-1][3])ev.push('fix '+r[i-1][3]+'>'+r[i][3]+' pri y='+r[i][0]+' ('+r[i][1]+' ms)');if(r[i][4]!==r[i-1][4])ev.push('in-story '+r[i-1][4]+'>'+r[i][4]+' pri y='+r[i][0]+' ('+r[i][1]+' ms)')}
console.log(ev.join('\n'));await b.close()})();
