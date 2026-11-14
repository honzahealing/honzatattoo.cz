# PŘEDÁNÍ: honzatattoo.cz, web s příběhem na scroll / 2026-11-14

## Kanonické soubory

Repozitář `honzahealing/honzatattoo.cz`. **Verze 24 je na pracovní větvi vlákna z 10. až 14. 11.** Je to jediná vzdálená větev, která obsahuje commit `b05be62` (`git branch -r --contains b05be62`); název jí přidělilo prostředí. Větev `pribeh-na-scroll` zůstává na verzi 8 a `main` je beze změn. Pull request není. Velikosti v bajtech platí pro verzi 24.

| Bajty | Soubor | K čemu |
|---|---|---|
| 81276 | `preview-pribeh.html` | **Hlavní mustr:** celý web (příběh, film s andělem, kontakt). Generuje ho build, ručně needitovat |
| 59303 | `preview.html` | Zdroj webu bez příběhu: horní lišta, film s andělem (`#hero`), kontakt (`#contact`), patička. Styl lišty a kontaktu je v bloku `<style>` s komentářem „v14“ na konci hlavičky. Sekce Portfolio, Proces a FAQ jsou smazané, jejich CSS a JS v souboru zůstaly nepoužité |
| 7834 | `pribeh.html` | Samotný příběh (ladění a snímky). Bez kontaktu, proto na zdi místo rámu s kontaktem visí osvědčení |
| 14054 | `pribeh/style.css` | Styly příběhu |
| 54542 | `pribeh/core.js` | Jádro: kamera (`KEYS`, `ST.N = 14`), jeden vyhlazený scroll `ST.Ys`, galerie na zdi (`GAL`, `WI`, `WALLS`, `card`, `panel`), let mezi fotkami (`flyLUT`, `gc` v `updateCam`), nájezd do anděla (`ez`, `ZE`), detail ruky, popisek fólie (`ST.filmT`), bubliny (`BUB`), kroky (`STEPS`) |
| 131237 | `pribeh/street.js` | Ulice: obloha, letadlo s plachtou (`amb.banner`), Žižkovský vysílač (`buildTower`), tramvaj (`buildTram`, kola `g._wheels`), činžáky, příběhy v oknech, kolo, koše, lavička (`big`) |
| 113638 | `pribeh/studio.js` | Budova a interiér studia, kalendář, poličky s tetovacími barvami (`bottles`), okno s vysílačem, easter eggy. Nic se při scrollu nedokresluje (`tt()` vrací `STAT`) |
| 12741 | `pribeh/facade.js` | Uliční fasáda studia, která po vstupu klientky zmizí |
| 7978 | `pribeh/doors.js` | Obě dveře. Postava jde před levým sloupkem a překladem a za pravým |
| 25224 | `pribeh/close.js` | Detail tetování: předloktí, ruka v rukavici, Pen strojek bez nápisu, kalíšky s barvami |
| 51774 | `pribeh/chars.js` | Postavy Honza a klientka |
| 30078 | `pribeh/audio.js` | Generativní hudba. Hlasy, šum vinylu, lupání, bzučení strojku a metličky jsou vypnuté |
| 19238 | `scrolly.js` | Film s andělem. S příběhem před sebou ho krokuje příběh (`window.__film`), mezi záběry let po zdi (`XG`, `warp`, `warpEnd`), na konci let do rámu s kontaktem (`hasC`, `cRect`, `cBgSet`) |
| 4639 | `scrolly.css` | Styly filmu |
| 69050 | `index.html` | Živý web. **Nesahat**, příběh na něm není |
| 3676 | `pribeh/dev/build_site.py` | Složí web: `python3 pribeh/dev/build_site.py preview-pribeh.html`; s `--artifact` jeden soubor pro náhled |
| 1867 | `pribeh/dev/shot.js` | Snímky příběhu: `node pribeh/dev/shot.js <prefix> 1440 900 "T" "T@x,y,w,h" [--q=nochars=1]`. Ambientní pohyb je při snímání zmrazený |
| 1156 | `pribeh/dev/siteshot.js` | Snímky složeného webu: `node pribeh/dev/siteshot.js $PWD/preview-pribeh.html <prefix> 1440 900 13.97 h0 h5.6` (hN = N obrazovek za koncem příběhu) |
| 7584 | `pribeh/dev/CONTRACT.md` | Původní smlouva modulů (souřadnice, API). Časová osa a pravidlo „každý modul jen svůj soubor“ v ní už neplatí přesně |

**Náhled pro Honziho:** artefakt https://claude.ai/artifact/3xqedLNY3xePQ9RkMdV38D (verze 24). Publikace:
1. `python3 pribeh/dev/build_site.py <scratchpad>/site/index.html --artifact`
2. v souboru nahradit `<title>` za „Honza Tattoo · Příběh“
3. publikovat. Obrázky `img/*.jpg` a `img/*.webp` (mapa `img/x` → `img/x`) jsou u artefaktu už nahrané.
4. Z jiného vlákna jde na stejný odkaz publikovat jen po přečtení celého živého souboru (asi 6800 řádků, drahé). Levnější je nový artefakt s obrázky a nový odkaz zapsat sem.

**Mrtvé:**
- `archiv/PREDANI_HONZATATTOO-WEB_2026-11-12.md` (verze 9 až 18 po vrstvách; verze 17 a 18 jsou v něm chybně datované 13. 11.), `archiv/PREDANI_HONZATATTOO-WEB_2026-11-08.md`, `archiv/PREDANI_HONZATATTOO-WEB_2026-11-07.md`
- starší náhledy `Ad3FTgi6YvGuDd8C9t3Z8q` (verze 8) a `Uh7SnyB1vDteRY2dQgzCDV`
- větev `claude/beautiful-volta-qqu59n` (starší historie, obsah je v `pribeh-na-scroll`)
- měřicí skripty a snímky ve scratchpadu (kontejner je dočasný)

## Kde jsme

Hotová a publikovaná je verze 24 (14. 11.). Web je jeden souvislý scroll: příběh (ulice, fasáda, studio, detail tetování, odchod), nájezd do fotky anděla, film s lety po zdi studia mezi fotkami, let do rámu s kontaktním formulářem, patička. Poslední Honziho pokyny (zánik fasády začít dřív, okno s milenci vrátit dolů) jsou provedené; Honzi verzi 22 ještě neviděl. Zánik zkracováním linií zleva doprava Honzi pochválil.

## Technický stav

- **Jeden vyhlazený scroll.** `frame()` v `core.js` počítá `ST.Ys` a z něj čas příběhu `T`; film se s příběhem neřídí vlastní smyčkou, krokuje ho `window.__film`. Bez toho se příběh a film na hraně rozcházely.
- **Nájezd do anděla = jeden zoom (verze 23).** Dřív byly dva: příběh přiblížil do fotky (celá fotka na obrazovce) a pak ve filmu přibližoval další zoom do hlavy (pomalu rozjetý podle časové osy `LUT`), takže to „sekalo“; sladění rychlosti v jednom bodě (`__filmRate`) nestačilo. Teď: příběh přibližuje od `T = ZS = 12,6` konstantním ln-tempem `m = ln(sP/s0)/((N-ZS)*unit)` (`updateCam` v `core.js`, kubická křivka s koncovou rychlostí `zm = 1`, poloha hlavy smoothstepem, kotva je hlava anděla `.44, .29`), film (`filmSt` ve `scrolly.js`, jen s příběhem před sebou) v něm pokračuje stejným tempem (zoom do hlavy uvnitř fotky `b = r*s - r²s²/4`, doběhne na nulovou rychlost za `sz = 2/r` px, kde `r = m/ln Z`) a sjezd po těle se rozjede uprostřed dobíhajícího zoomu (`sd = sz/2`, ease-in `warpIn`, konec `warpEnd`). Konstanty obou stran musí zůstat shodné: konec dráhy kamery 1700×1050 a `ZS = 12,6` jsou v `core.js` (`KEYS`, `ZS`) i ve `scrolly.js` (`layout`). Bez příběhu (`gal` nepravda) zůstává stará časová osa filmu se zoomem (`zoomAt`, `descAt`, `LUT`). Změřeno vůči vyhlazenému scrollu `Ys`: d ln(šířka fotky) / d `Ys` roste na 3,6 ‰, na hraně klesá 2,74 → 2,48 ‰ a uvnitř fotky doběhne na 0 po asi 440 px (1440×900); stejný průběh na 390×844. Prolnutí scény s filmem je posledních 12 px, když scroll přeběhne konec dřív než `T`, scéna zůstane připnutá (`.stage.fix`), cestou zpět je připnutý film (`.sc-fix`). Texty u anděla nabíhají px-časově až po dozoomování (`tA = .75*sz`).
- **Zoom do anděla se sekal i po sjednocení na jeden zoom (verze 24): příčina byla výkon, ne dráha kamery.** Při letech po zdi se obloha, domy, postavy a popředí nekreslí, při zoomu se kreslilo všechno a snímek ve středu zoomu trval 2 až 3× déle (bezhlavý prohlížeč: 119 ms oproti 32 ms u letů). Opraveno: od `zs > .55` se obloha, vzdálená města a domy nekreslí (`ins` v `updateCam`), postavy a popředí se plynule rozplynou mezi `zs .3 a .55` a pak mají `display:none` (`lf`), Mléčná dráha je rozdělená na 6 sekcí (`mC` ve `street.js`), které se mimo záběr vyřazují. Změřeno `zperf.js`: střed zoomu 119 → 47 ms, poslední třetina 62 → 34 ms, začátek zoomu 107 → 89 ms (vzdálená města a obloha tam jsou ještě vidět). Při dalším ladění plynulosti měřit čas snímků, ne jen dráhu kamery.
- **Let mezi fotkami.** Jedna křivka: šířka záběru je oblouk v logaritmu, posun úměrný šířce, tabulka `U` vyrovnává tempo. Na koncích letu krátké usazení (`FH = .03`), ve kterém se fotka na zdi prolne s fotkou filmu; film ve fotce měkce dojíždí (`warp`). Při letu se nekreslí obloha, domy, postavy a popředí. Pohupování kamery je při letu vypnuté (dřív dělalo u fotky posun o desítky pixelů).
- **Kontakt.** Rám na zdi (`WI.kontakt`, `panel()`) má poměr stran rámu formuláře. Sekce `#contact` má `margin-top:-100vh`, při přistání je připnutá na rám a prolne se; její pozadí je kopie tapety studia v místě a měřítku přistání (`cBgSet`). Bez příběhu nebo při omezeném pohybu je kontakt obyčejná sekce.
- **Fasáda.** `facade.js`, vrstva `front`, x 903 až 2016. Plochy jsou ve skupině `c.g`, linky zvlášť v `c.gl`. Zánik od `T0 = 1.98` (klientka právě otevírá dveře) běží zleva doprava (`tAt(x)`, `SPAN = .42`): plochy pole zprůhlední, když k němu vlna dorazí, a každá linka se zkrátí od svého konce k začátku (`strokeDashoffset` 0 až 1, `DUR = .14`), tedy obrácené rýsování. Hlavní linky jsou rozdělené na jednotlivé tahy, drobná kresba (`hair`) zůstává po skupinách. Hotovo kolem T 2,6. Linka na x je pryč asi o 0,07 T dřív, než tam klientka dojde (chodí 582 jednotek na 1 T od T 2,06 z x 812). Do T 1,97 se interiér (`ST.studioIn`) a obrazy (`ST.galL`) nekreslí.
- **Časování studia.** Po změně velikosti okna se časy ulice za studiem (`ES`, `ST.seenAt`) nepřepočítají, jen po novém načtení.
- **Horní lišta** webu je vidět už během příběhu; z hlavičky příběhu zůstalo jen tlačítko zvuku vpravo dole (`build_site.py`).
- **Formulář** odesílá na zástupnou adresu `https://formspree.io/f/NOVY_ENDPOINT`. Na ostrý web doplnit skutečnou.
- **Snímky klamou dvakrát.** Zmenšený snímek celé obrazovky vypadá, jako by přes postavy prosvítaly obrazy; vrstvy kontrolovat jen na výřezech 1:1. Bezhlavý prohlížeč kreslí pomalu: po skoku scrollu čekat asi 2 s, jinak snímek zachytí pohyb v půli.
- **Výkon:** svět má asi 6900 prvků. Čas snímku bez grafické karty: film 25 ms, let 32 ms. Na skutečném zařízení neměřeno.
- **Hudba:** prohlížeč nepustí zvuk bez gesta, samotné kolečko myši se nepočítá.
- **Commity:** autor `honzahealing <jankoblertattoo@gmail.com>`, bez podpisových řádků.

## Rozhodnuto

Jen Honziho slova z vláken 6. až 12. 11.

**Celek**
- Detail: postavy, město a studio „promakané, precizní“. Každá vrstva tam, kde má být, vrstva za ní nesmí být vidět.
- Všechno „dokonale plynulé“, nic se nesmí „stavit, zaseknout“.
- Easter eggy: chtěl jich víc (10. 11.).
- V klidu se má pořád něco hýbat. Noční Žižkov, barvy a hudba se líbí.

**Ulice**
- Žižkovský vysílač přesně jako ve skutečnosti. Tramvaj klasická pražská, kola se při jízdě otáčejí. Na tabuli devítka a „Lipanská“ (14. 11.: „vrať tam zpět spojovací místo lipanská, anebo ne, nech tam lipanská“).
- Venku jen cedule HONZA TATTOO; cedule s adresou a s čísly pryč, nahradit dekorací.
- Letadlo táhne plachtu s nápisem „ahoj, vítej a scrolluj“, plachta má trochu červené.
- Kolo, koš a lavička nesmí být proti postavě ženy malé.
- Fasáda: interiér se odhalí, až dívka vejde. Do té doby zeď s dekoracemi a okny, skrz okna rozmazaně vidět dovnitř. Fasáda „mnohem dekorativnější“.
- Zánik fasády (14. 11.): Honzi „super, jak ty linie mizí, přesně tak jsem to chtěl“, ale proces má začít dřív, ať tam, kde postava už stojí, je čisto a vidět dovnitř. Princip jako rýsování linií města při vstupu na web, jen obráceně. Linie se nemají rozpojovat, mají se zmenšovat „jako z jednoho bodu linie do druhého“, až zaniknou. Zánik běží zleva doprava, protože dívka vchází zleva doprava; zeď se nesmí aktivovat celá zároveň. Ne příliš rychle a ne jednolitě.
- Easter egg (14. 11.): některé okno s lidmi v domech na pozadí svítí červeným světlem („intimní atmosféra“). Honzi nejdřív: „super“, má být přesně o patro výš; hned potom: „vrať okno s milenci dolů“. Platí poloha dole, jak bylo původně.
- Spodní okraj obrazu nesmí být ostře oddělený.

**Dveře**
- Otočení křídla kolem pantu, ne průchod „jako duch“. Postava jde zleva doprava před levým a horním rámem a za pravým rámem, u předních i zadních dveří. Za otevřenými dveřmi je vidět studio ve stejné barvě jako zbytek.

**Studio**
- Uvnitř se při scrollu nic nedokresluje.
- Všechny fotky jako obrazy na zdi (9 tetování, obě fotky u práce, portrét, karty webu), bez překryvů, různé velikosti. Nápisy na cedulích vycentrované.
- Za oknem žižkovská věž. Kalendář: datum 2. 11. Na poličkách tetovací barvy různých barev, ne lahve s alkoholem.

**Postavy**
- Honza podle fotek, bez culíku, bez zástěry. Klientka má delší vlasy. Postavy „trochu lepší“ než ve verzi 8.

**Detail tetování**
- Jen ruka, která tetuje; žádná ruka s hadříkem. Strojek typu Pen, bez nápisu a displeje. Prsty, které strojek nesvírají, se ohýbají do dlaně.
- Motiv papoušek, vystředěný, nesmí se dotýkat ruky. Návrh se dělá v počítači.
- Po tetování popisek, že čtverec přes papouška je ochranná fólie.
- Při nájezdu do detailu se v pozadí nesmí objevit pohybující se ruka.

**Zvuk a text**
- Hudba hraje rovnou. Žádný hlas Honzy ani klientky, repliky jen psané. Žádný šum mimo hudbu.
- Písmo v bublinách hezké, podobné vizuálu webu. Písmo všude dobře čitelné.

**Film a lety**
- Konec příběhu je nájezd do fotky anděla; texty u anděla zůstávají. Přechod do anděla musí být dokonale plynulý. 14. 11.: skákání je tím, že jsou dva zoomy (z prostoru do fotky a pak ještě zoom uvnitř fotky); „musí to být jeden zoom, pak to bude plynulé“.
- Mezi záběry oblouk nad studiem a vjezd do další fotky. Nájezdy do fotek „výborné“. Oblouky hodně vzdálené, ale plynulé; při vjezdu do fotky a výjezdu z ní nesmí nic probliknout ani poskočit.

**Web kolem**
- Horní lišta krásná a nenápadná jako lišta kroků v animaci.
- Sekce Portfolio, „Od nápadu k realitě“ a FAQ pryč.
- Kontakt: z posledního tetování obloukem do dalšího obrazu, ve kterém je formulář. Při vjezdu se nesmí změnit pozadí mimo rám a nic nesmí poskočit. Vzhled sekce s formulářem je „super“.

## Citlivé, dodržovat

- **Zvířata:** žádné kočky, psi ani jiná chlupatá zvířata v kresbě.
- **Motivy:** jen pozitivní. Žádné mandaly, lebky, dýky ani násilí.
- **Jméno nástroje:** nepsat ho do předávacích dokumentů ani do commitů a nezakládat větve s ním v názvu. Commity bez podpisových řádků.

## Otevřené

- **Přesun do `pribeh-na-scroll`:** nabídnuto několikrát, Honzi neodpověděl. Bez jeho ano tam nepushovat.
- **Nasazení** na živý web (`index.html`) a pull request nejsou rozhodnuté.
- **Fasáda verze 22:** časování po posunu začátku na T 1,98 Honzi ještě neviděl; délka vlny (`SPAN`) a rychlost jedné linky jsou moje volba. Výzdobu z verze 18 nekomentoval. Mobil od verze 18 neověřen. Rozmazaný vnitřek v oknech jsou kreslené siluety, ne skutečné rozostření. Na konci příběhu fasáda není (řez jako dřív).
- **Druhé červené okno** na konci ulice (`red2` ve `street.js`): moje volba, Honzi mluvil o jednom okně.
- **Lety po změně z 12. 11.** (menší oddálení, delší let): Honzi je výslovně nekomentoval.
- **Dojezd kamery uvnitř fotek** (`warp`): přidal jsem ho kvůli předání, Honzi o něj nežádal.
- **Při letu je nad střechou tma bez hvězd** (kvůli výkonu).
- **Moje volby bez komentáře:**
  - easter eggy: plakát „Ztratil se ara“ a „Nalezen“, papoušek na drátě, balon se srdcem, srdce na měsíci, souhvězdí srdce, klapka, tibetská miska, kamínky, akvárko s rybkou, krystal, gumová kachnička, kudlanka na fikusu, lodička v louži, šipka křídou, tenisky na drátě, náramek s pírkem, pihy do srdce, srdíčko na utěrce
  - barvy postav (zelená bunda, hořčicová šála), hodinky a přívěsek
  - vysílač v trikolóře a větší
  - rám kontaktu visí místo osvědčení; medailon a kachle místo cedulí
  - metličky v hudbě vypnuté spolu se šumem
  - nápis „Přijímám nové rezervace“ jako drobný text v liště
- **Úklid:** nepoužité CSS a JS smazaných sekcí v `preview.html`.
- **Texty „O mně“:** stará otázka bez odpovědi, jestli je chce u anděla; jsou u fotky z práce.

## Zamítnuto a proč

- **Detail ruky z verze 8:** „opravdu špatně udělaný“ (malá ruka, šedá kůže, displej na strojku).
- **Levá ruka s ubrouskem:** „vypadá špatně“.
- **Hlasy** přes `speechSynthesis` i jakékoli jiné: zrušeno. **Šum** vinylu, lupání, bzučení: zrušeno.
- **Kurzíva Cormorant v bublinách:** „ošklivý font“.
- **Dokreslování studia při scrollu** (i varianta podle polohy kamery): nechce žádné.
- **Zlatý průhled do dveří; věž s kuličkami za oknem** (vypadala jako z jiného města).
- **Postava za oběma sloupky dveří** (verze 12) i **postava před celým rámem** (dřív): obojí špatně.
- **Let s prodlevou uprostřed** (oddálit, podržet, přiblížit): působil jako zastavení. **Krátké oddálení** (verze 9): studio jen probliklo. **Oddálení z verze 11:** „možná moc vzdálené“.
- **Nájezd do anděla se zastavením před fotkou**, **dva oddělené dojezdy scrollu** a **dva zoomy (do fotky a pak uvnitř fotky)** i s ručně sladěnou rychlostí v jednom bodě: skákalo to (opravováno čtyřikrát, viz Technický stav).
- **Kontakt jako obyčejná sekce pod filmem** a **kontakt s vlastním tečkovaným pozadím:** chtěl let do rámu a nezměněné pozadí.
- **Fasáda s postupným rozplýváním zleva doprava a jednoduchou výzdobou** (verze 17): málo zdobná a pomalá. **Fasáda, která zmizí celá naráz** (verze 18): „až moc rychle“ a „úplně jednolitě“. **Linky rozpadlé na kousky, celá zeď najednou** (verze 20): linie se nemají rozpojovat a zánik má jít zleva doprava.
- **Nápis na plachtě „Usměj se, Žižkove“; „Spojovací“ na tramvaji; devítka sama uprostřed tabule.**
- **Béžový pruh „Přijímám nové rezervace“ a tmavá plná horní lišta.**
- **Ostrá linie pod chodníkem.**
- **Lahve na poličkách** (vypadaly jako alkohol). **Malé kolo, koš a lavička.**
- **Z dřívějška:** panáčci z čar, drdol a zástěra u Honzy, lotos, mandaly, liška, kočka, prolínačky mezi plány, otáčení postav převrácením siluety.

## Stav kontrol

Bezhlavý prohlížeč, konzole bez chyb:
- verze 24 (14. 11.): čas snímků při zoomu do anděla před a po úpravě vrstev (viz Technický stav); tempo přiblížení přes hranu beze změny; hrany prvních čtyř letů (rozdíl do 4 z 255); přistání v kontaktu; úvod T 0 s rozdělenou Mléčnou dráhou
- verze 23 (14. 11.): jeden zoom do anděla: tempo přiblížení vůči vyhlazenému scrollu na 1440×900 a 390×844 (plynulé, bez skoku na hraně), sekvence snímků od T 13.0 po 3,8 obrazovky filmu, hrany všech čtyř prvních letů (rozdíl sousedních snímků do 4 z 255), přistání v kontaktu
- verze 22 (14. 11.): zánik fasády na 1440×900, T 1.96, 2.02, 2.1, 2.18, 2.26, 2.4 (vlna je před dívkou, kde stojí, je čisto); červené okno dole ve výřezu úvodu
- verze 21 (14. 11.): zánik fasády T 2.19 až 2.8 (zkracování linií zleva doprava)
- verze 20 (14. 11.): úvod T 0 (plachta „AHOJ, VÍTEJ A SCROLLUJ“)
- verze 18 (12. 11.): výzdoba fasády T 1.5, 1.95
- verze 17 (12. 11.): nájezd do anděla při plynulém scrollu po 14 px na snímek (šířka fotky roste bez zastavení: 1388, 1424, film 1445, 1482); přistání v kontaktu na 1440×900 a 390×844 (rám stojí na místě)
- verze 16 (12. 11.): předání film a let, rozdíl sousedních snímků do 2 z 255
- neověřeno: plynulost na skutečném počítači a telefonu, zvuk poslechem, mobil od verze 18

## První krok

Přečti si Honziho nové zadání a před každou úpravou nafoť dotčené místo přes `shot.js` (příběh) nebo `siteshot.js` (film a kontakt), výřez 1:1.
