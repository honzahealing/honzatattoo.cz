# Příběh na scroll: společná smlouva modulů

Web `pribeh.html` je jedna dlouhá ilustrace tuší. Kamera po ní jede podle scrollu. Příběh: klient přijde nočním Žižkovem do tetovacího studia, mluví s tatérem Honzou u stolu, vznikne návrh, pak se tetuje u křesla, detail ruky, hojení, odchod ven a kontakt.

Hotové části: `core.js` (jádro: kamera, paralaxa, časová osa, bubliny), `chars.js` (postavy). Moduly ke kreslení: `street.js`, `studio.js`, `close.js`. **Každý modul edituje jen svůj soubor.** Nic jiného neměň (ani core.js, style.css, pribeh.html). Když něco v jádru chybí, napiš to do závěrečné zprávy.

## Cíl kvality

Špičková redakční ilustrace tuší, ne klipart. Představ si leptanou a rytinovou ilustraci, čistotu Moebia a detail architektonické kresby. Hodně detailu, který dává smysl a odpovídá skutečnosti: konkrétní předměty, materiály, textury, stíny šrafováním, hloubka prostoru v plánech. Zaplněný prostor, ale s hierarchií: hlavní tvary čitelné, textura tichá.

Styl:
- Tmavá noc, krémová linka tuše. Barvy jen přes CSS třídy a připravené vzory a přechody, žádné vlastní barvy mimo uvedenou paletu. Výjimkou jsou drobné průhlednosti stejných odstínů přes atribut `opacity`.
- Hierarchie tloušťky: obrysy hlavních tvarů `ink` (2.4), detaily `ink thin` (1.5), textura `ink hair` (0.9). Vzdálené plány tlumeně (`dim`, `faint`): vzdušná perspektiva.
- Plochy: tónové výplně `t1` (tmavá), `t2` (střední), `t3` (světlejší, dřevo, látka), `solid` (barva noci, zakrývá, co je za tím).
- Zlatá (`gold`, `goldl`, `f-gold`) jen pro světlo a akcenty: rozsvícená okna, lampy, mosaz, malé ozdoby. Šetrně.
- Stíny šrafováním: vyplň plochu vzorem `url(#hatchFine)`, `url(#hatchX)`, `url(#hatch)`, `url(#hatchV)` nebo `url(#stipple)` (přes `ST.D(...,{fill:'url(#hatchFine)'})` nebo `ST.el('path',{d:..,fill:'url(#hatchX)'})`).
- Opakovaný detail (cihly, okna, listy, kostky dlažby, knihy) generuj procedurálně smyčkami se seeded náhodou `ST.rng(seed)` (deterministické). Klíčové předměty kresli ručně promyšlenými křivkami.
- Tetování ve studiu: na zdech jen pozitivní motivy (květiny, ptáci, zvířata, mandaly, lotos, slunce, měsíc, vlny, peří). Žádné lebky, dýky, hady ani agresivní motivy.

## Souřadnice a měřítko

- Svět v jednotkách, 1 jednotka ≈ 0,5 cm. Země (chodník, podlaha) `ST.GY = 700`. Osa y roste dolů.
- Postava je vysoká asi 330 jednotek (temeno hlavy y ≈ 372 ve stoje). Sedák židle je 88 nad zemí (y = 606), deska stolu y = 588, dveře jsou 338 vysoké (y 362 až 700).
- Úseky světa podle x:
  - **Ulice na začátku:** x −1900 až 760 (modul street)
  - **Budova studia:** x 760 až 3550 (modul studio). Řez budovou: vidíme dovnitř.
  - **Ulice na konci:** x 3550 až 5800 (modul street)

## API jádra (`window.ST`)

```js
ST.module('street', function(ST){ ...stavba... });   // registrace modulu (už je v souboru)
ST.el(tag, attrs, parent)        // SVG prvek
ST.D(parent, d, cls, t0, t1, o)  // path s třídou 'ink '+cls, dokresluje se tahem pera mezi časy t0..t1
                                 //  t0='load' => dokreslí se hned po načtení stránky (t1 = zpoždění v s)
                                 //  t0=null  => nakreslí se hned, bez animace
                                 //  o.fill   => výplň (např. 'url(#hatchFine)'); výplň se objeví spolu s tahem
ST.fade(el, t0, t1, max, t2, t3) // průhlednost: náběh t0..t1 na max, volitelně zmizení t2..t3
ST.on(function(T, time, cam){})  // každý snímek: T = čas příběhu 0..13, time = ms (pro ambientní pohyb), cam = kamera
ST.L.back / room / light / fig / front   // hlavní rovina (paralaxa 1). Pořadí odzadu dopředu. Postavy jsou ve 'fig'.
ST.plane(layer, f, ax, ay)       // nový plán s paralaxou: layer 'sky'|'far'|'mid'|'back'|'fore', f < 1 dál, f > 1 popředí.
                                 //  Obsah kresli ve světových souřadnicích. Sedí přesně, když kamera stojí v kotvě (ax, ay),
                                 //  při pohybu kamery od kotvy se plán posouvá jen o f-násobek.
ST.section(parent, x0, x1)       // skupina, která se skryje, když je mimo záběr (výkon!). Všechno dávej do sekcí.
ST.slot(name, g)                 // sdílená skupina pro jádro (deska s návrhem: 'board')
ST.lamp(T)                       // 0..1, jak moc svítí lampa u tetovacího křesla
ST.rng(seed), ST.circ(cx,cy,r), ST.ellipse(cx,cy,rx,ry), ST.rect(x,y,w,h,r), ST.wline(x0,x1,y,amp,step,rnd)
ST.ss(a,b,v) smoothstep, ST.lin(a,b,v), ST.lerp(a,b,t), ST.clamp(v)
ST.defs, ST.closeDefs            // <defs> světa a detailu, sem můžeš přidat vlastní vzory/přechody s prefixem id podle modulu
ST.reduce                        // uživatel chce omezit pohyb: ambientní animace vypni
```

Vzory a přechody v `<defs>` světa: `hatch`, `hatchFine`, `hatchX`, `hatchV`, `stipple`, `gGlow` (zlatá záře, radiální), `gCone` (kužel světla), `gWin` (teplé okno), `gShadeDown` (stín dolů), filtry `glowW`, `blurFore`. V `<defs>` detailu: `gPetalF`, `gPetalB`, `gHalo`, `gRed`, `gNeedle`, `gFilm`.

## Časová osa (T = 0 až 13)

| T | Co se děje | Kamera (střed x, y, šířka záběru) |
|---|---|---|
| 0 | Úvodní obraz, nadpis vlevo nahoře. Musí být hotový hned po načtení (`'load'`). | 0, 470, šířka 1500 |
| 0,3 až 2,95 | Klient jde z x −1000 do x 1330, dveřmi 800 až 890 projde kolem T 2,3. | jede z 0 na 1350 |
| 1,95 až 2,2 / 2,5 až 2,8 | Dveře 1 se otevřou / zavřou | |
| 2 až 3 | Kamera vjíždí do studia, interiér se dokresluje (tahy t0..t1 v tomto rozmezí) | 820 až 1350, šířka 1100 |
| 3,1 až 4,6 | Rozhovor u stolu (klient stojí x 1330, Honza za stolem x 1760) | 1560, 480, šířka 900 |
| 4,6 až 6,4 | Oba sedí u stolu, na desce vzniká návrh (T 5,05 až 5,85) | zoom na desku 1577, 525, šířka 520 |
| 6,12 až 6,42 | V kalendáři na zdi se zlatě zakroužkuje datum | 1830, 470, šířka 760 |
| 6,6 až 7,4 | Přesun k tetovacímu křeslu | 2300, šířka 1150 |
| 7,3 až 7,6 | Rozsvítí se lampa nad křeslem (`ST.lamp`) | 2900, 500, šířka 820 |
| 7,8 až 10,85 | Detail ruky přes celou obrazovku (svět je zakrytý) | |
| 11 až 11,6 | Klient vstane a prohlíží si tetování | 2950, šířka 950 |
| 11,75 až 11,95 | Dveře 2 (x 3420 až 3510) se otevřou, klient odchází ven | 3330, šířka 1100 |
| 12,3 až 13 | Závěr venku: klient stojí na ulici x 3900, Honza mává ode dveří, nahoře text Kontakt | 3980, 360, šířka 1700 (vidět x 3130 až 4830, y −165 až 885) |

Na mobilu na výšku je záběr užší (asi 0,6 šířky) a vyšší: kresli i nad a pod hlavní akcí (obloha, dlažba pod zemí), ať tam není prázdno.

## Výkon

Hodně detailu, ale rozumně: street do ~4000 prvků, studio do ~4500, close do ~1200. Všechno dávej do `ST.section`. Textury ze vzorů (`pattern`) jsou levnější než tisíce čar. Ambientní animace (`ST.on`) jen na pár prvků a jen když je jejich sekce vidět (`cam.x0..cam.x1`).

## Kontrola snímky

```
node pribeh/dev/shot.js <prefix> 1440 900 "0" "2.7" "5.4@1577,525,520,380"
node pribeh/dev/shot.js <prefix> 390 844 "0"
```
Spec `T` použije kameru z časové osy, `T@x,y,w,h` pevnou kameru. Volitelně `--q=nochars=1` (bez postav) nebo `--q=only=street` (jen tvůj modul). Snímky ukládej do `/tmp/claude-0/-home-user-honzatattoo-cz/4574e607-dfe7-5e3b-9cfd-c50732b1b27c/scratchpad/shots/<modul>/` a prohlédni je nástrojem Read. Skript vypíše chyby konzole: musí být „zadne“.
