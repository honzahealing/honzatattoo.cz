# Měřicí skripty plynulosti

Spouštět z kořene repozitáře po sestavení mustru (`python3 pribeh/dev/build_site.py preview-pribeh.html`).
Potřebují Node s Playwrightem a Chromiem; některé i Python s Pillow a NumPy.
Konec příběhu je `story.offsetTop + story.offsetHeight - innerHeight - ST.tail`, místo přistání kontaktu `__tailY(contact)`.

| Skript | Co měří | Příklad |
|---|---|---|
| `spike.js` | čas každého snímku při plynulém scrollu přes hranu příběh/film (zaseknuté snímky) | `node pribeh/dev/mereni/spike.js 1440 900 -300 300 3` |
| `jump.js` | rozdíl obrazu mezi sousedními polohami scrollu po ustálení (poskočení, probliknutí) | `node pribeh/dev/mereni/jump.js 1440 900 -100 200 6 /tmp/j` |
| `lag2.js` | poloha scény příběhu hned po posunu a po snímku (ujetí o krok kolečka) | `node pribeh/dev/mereni/lag2.js 60` |
| `lagback.js` | totéž při scrollu zpět, film i scéna | `node pribeh/dev/mereni/lagback.js 60 390 844` |
| `lagc.js` | totéž u kontaktu (rám formuláře) tam i zpět | `node pribeh/dev/mereni/lagc.js 60 390 844` |
| `wheel.js` | skutečné kolečko myši přes hranu příběh/film | `node pribeh/dev/mereni/wheel.js 100 40` |
| `hand.js` | hrany letů po zdi (vjezd a výjezd) | `node pribeh/dev/mereni/hand.js /tmp/h` |
| `v15.js` | přistání letu v rámu kontaktu (poloha rámu) | `node pribeh/dev/mereni/v15.js /tmp/c 1440 900` |
| `cland.js` | rozdíl obrazu kolem přistání v kontaktu po 10 px | `node pribeh/dev/mereni/cland.js 1440 900 /tmp/l` |
| `wallcmp2.js` | zeď a rám před přistáním proti stavu po přistání (5. argument = hustota pixelů) | `node pribeh/dev/mereni/wallcmp2.js 390 844 /tmp/w 2` |
| `cfun.js` | funkce formuláře: patička, klikání, odkaz „Chci tetování“, Tab, prázdné odeslání | `node pribeh/dev/mereni/cfun.js 390 844` |
| `back.js` | cesta zpět z filmu do příběhu (stav scény) | `node pribeh/dev/mereni/back.js` |
| `zperf.js` | čas snímků při zoomu do anděla | `node pribeh/dev/mereni/zperf.js 1440 900` |
| `gr.js` | jas scény proti filmu se zrnem a bez něj | `node pribeh/dev/mereni/gr.js /tmp/g` |

Bezhlavý prohlížeč běží bez grafické karty: absolutní časy snímků jsou 2× až 3× horší než na skutečném zařízení, porovnávat jen relativně (před a po změně, nejlépe proti sestavení staré verze).
