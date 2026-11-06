/* Snimky obrazovky pribehu.
   node pribeh/dev/shot.js <vystup-prefix> <sirka> <vyska> <spec> [<spec> ...] [--q=extra]
   spec = "T" (cas pribehu 0..13, kamera podle casove osy)
       nebo "T@x,y,w,h" (pevna kamera: stred x,y ve svete, sirka a vyska zaberu)
   --q=nochars=1&only=street   ... dalsi parametry URL
   Vypise chyby z konzole. Snimek: <prefix>-<index>.png */
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const args = process.argv.slice(2);
const extra = (args.find(a => a.startsWith('--q=')) || '--q=').slice(4);
const [out, w, h, ...specs] = args.filter(a => !a.startsWith('--q='));
const file = path.resolve(__dirname, '../../pribeh.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  let i = 0;
  for (const s of specs) {
    const [t, c] = s.split('@');
    const q = 'T=' + t + (c ? '&cam=' + c : '') + (extra ? '&' + extra : '');
    await p.goto('file://' + file + '?' + q);
    await p.waitForTimeout(3300);
    await p.screenshot({ path: `${out}-${i}.png` });
    const n = await p.evaluate(() => ({svet: document.querySelectorAll('#world *').length, detail: document.querySelectorAll('#closeScene *').length}));
    console.log(`${out}-${i}.png  <- ${s}   prvku: svet ${n.svet}, detail ${n.detail}`);
    i++;
  }
  console.log('chyby:', errs.length ? [...new Set(errs)].join('\n') : 'zadne');
  await b.close();
})();
