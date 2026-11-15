const {chromium}=require('playwright');const [,,out,w,h]=process.argv;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:+w,height:+h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+require('path').resolve(__dirname,'../../../preview-pribeh.html'));await p.waitForTimeout(1500);
const I=await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';const st=document.getElementById('story'),he=document.getElementById('hero'),c=document.getElementById('contact');return {sEnd:st.offsetTop+st.offsetHeight-innerHeight-(window.ST&&ST.tail||0),span:st.offsetHeight-innerHeight-(window.ST&&ST.tail||0),heroTop:he.offsetTop,heroH:he.offsetHeight,cTop:__tailY(c),doc:document.documentElement.scrollHeight,gal:ST.gal.length}});
const dist=I.heroH-(+h);console.log(JSON.stringify(I),'dist',dist,'kontakt offsetTop - (heroTop+dist) =',I.cTop-(I.heroTop+dist));
// 1) predani pribeh -> film pri rychlem scrollu
await p.evaluate(y=>scrollTo(0,y),I.sEnd-I.span*(0.8/14));await p.waitForTimeout(2500);
await p.evaluate(y=>scrollTo(0,y),I.sEnd+0.25*h);
for(let i=0;i<9;i++){await p.waitForTimeout(i<5?130:400);console.log('t'+i,await p.evaluate(()=>{const sg=document.getElementById('stage');return 'T='+ST.T.toFixed(3)+' filmS='+(ST.filmS||0).toFixed(1)+' stage: op='+sg.style.opacity+' fix='+sg.classList.contains('fix')+' vis='+(sg.style.visibility||'visible')}))}
// 2) let do kontaktu
const go=async(y,n,ms)=>{await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(ms||2000);await p.screenshot({path:out+'-'+n+'.png'});return p.evaluate(()=>{const c=document.getElementById('contact'),g=c.querySelector('.contact-grid').getBoundingClientRect();return 'galCam='+(ST.galCam?ST.galCam.a+'>'+ST.galCam.b+' k='+ST.galCam.k.toFixed(3):null)+' kontakt op='+c.style.opacity+' tr='+c.style.transform+' ram L='+g.left.toFixed(0)+' T='+g.top.toFixed(0)+' W='+g.width.toFixed(0)})};
const xg=(I.cTop-I.heroTop)- (dist-0); // 0
const XG=2.1*h*(w<769?1.6/2.1:1);
const yD=I.heroTop+dist;
for(const [k,n] of [[.02,'c0'],[.3,'c1'],[.5,'c2'],[.75,'c3'],[.93,'c4'],[.975,'c5'],[.995,'c6']])console.log(n,await go(yD-XG*(1-k),n,2300));
console.log('land',await go(yD,'c7',2500));console.log('dal',await go(yD+h*.6,'c8',1500));
console.log('chyby:',errs.length?[...new Set(errs)].join(';'):'zadne');await b.close()})();
