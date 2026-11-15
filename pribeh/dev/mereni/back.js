const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const sEnd=await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';const st=document.getElementById('story');return st.offsetTop+st.offsetHeight-innerHeight-(window.ST&&ST.tail||0)});
for(const y of [sEnd+600,sEnd+60,sEnd-120,sEnd-400]){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(2200);
 const r=await p.evaluate(()=>{const s=document.getElementById('stage');const cs=getComputedStyle(s);return 'op='+cs.opacity+' tr='+s.style.transform+' vis='+cs.visibility+' pe='+cs.pointerEvents+' gal='+s.classList.contains('gal')+' btt.nx='+document.getElementById('btt').classList.contains('nx')+' T='+ST.debug.T});
 console.log(Math.round(y-sEnd),r);await p.screenshot({path:require('os').tmpdir()+'/mereni-back-'+Math.round(y-sEnd)+'.png'})}
console.log('chyby',errs);await b.close()})();
