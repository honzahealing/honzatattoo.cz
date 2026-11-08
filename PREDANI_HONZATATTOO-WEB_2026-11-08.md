# PŘEDÁNÍ: honzatattoo.cz, web s příběhem na scroll / 2026-11-08

## Kanonické soubory

Repozitář `honzahealing/honzatattoo.cz`, větev **`pribeh-na-scroll`**. Pull request zatím není a `main` je beze změn. Velikosti platí pro stav k 8. 11. 2026 (verze 8).

| Bajty | Soubor | K čemu |
|---|---|---|
| 83597 | `preview-pribeh.html` | **Hlavní mustr:** `preview.html` s příběhem před filmem s andělem. Generuje ho build, ručně needitovat. |
| 7793 | `pribeh.html` | Samotný příběh (značkování, slouží k ladění a ke snímkům) |
| 13774 | `pribeh/style.css` | Styly příběhu, na konci podklady pro čitelnost písma a `.st-veil`, `.stage.gal` pro galerii |
| 41434 | `pribeh/core.js` | Jádro: kamera (`KEYS`, `ST.N = 14`), nájezd do detailu ruky, motiv papouška, bubliny (`BUB`), kroky (`STEPS`), **galerie na zdi** (`GAL`, `WI`, `WALLS`, `layoutWall`), nájezd do fotky anděla (`photoZoom`, T 13,15–14), let po zdi (`ST.gallery.fly`) |
| 118294 | `pribeh/street.js` | Ulice Žižkova: obloha, Žižkovský vysílač (`buildTower`), tramvaj T3 (`buildTram`), činžáky, příběhy v oknech (`SCENES`, `windowScene`, ambient `amb.scn`) |
| 107864 | `pribeh/studio.js` | Budova a interiér studia. `ST.galleryWall = true` vypíná staré kreslené rámečky, zrcadlo, klíče, polaroidy a závěsná světla na stěnách galerie |
| 7164 | `pribeh/doors.js` | Obě dveře: křídlo s panty vlevo a klikou vpravo, otevírá se dovnitř, osvětlený otvor, `ST.doorOpen(i,T)`, `ST.doorHandle(i,T)` |
| 38345 | `pribeh/close.js` | Detail předloktí: kůže, opěrka, **jediná ruka s Pen strojkem** (oddíl 4), život ruky (oddíl 5) |
| 49306 | `pribeh/chars.js` | Postavy Honza a klientka: kostra, chůze, oblečení, stíny na zemi, sáhnutí na kliku (`reachArm`) |
| 30465 | `pribeh/audio.js` | Generativní chill jazz a hlasy. Zvuk je výchozí zapnutý, spustí se při prvním doteku, kliknutí nebo klávese, v úvodu výzva „Klepněte kamkoli a hraje hudba“ |
| 14201 | `scrolly.js` | Film s andělem. S příběhem před sebou (`afterStory`, `gal`) dělá mezi záběry let po zdi studia (`XG`, `pose`, `shotRect`, `angelRect`) a texty úvodu anděla nabíhají až po nájezdu |
| 4639 | `scrolly.css` | Styly filmu (beze změny) |
| 61943 | `preview.html` | Náhled webu s filmem, načítá `scrolly.*?v=16`. Příběh do něj vkládá build |
| 69050 | `index.html` | Živý web. **Nesahat**, příběh na něm není |
| 7584 | `pribeh/dev/CONTRACT.md` | Smlouva modulů (souřadnice, API, časová osa). Dát každému pomocníkovi |
| 1612 | `pribeh/dev/shot.js` | Snímky příběhu: `node pribeh/dev/shot.js <prefix> 1440 900 "T" "T@x,y,w,h" [--q=nochars=1]` |
| 1156 | `pribeh/dev/siteshot.js` | Snímky složeného webu i s filmem: `node pribeh/dev/siteshot.js $PWD/preview-pribeh.html <prefix> 1440 900 13.97 h0 h5.6` (hN = N obrazovek za koncem příběhu) |
| 3668 | `pribeh/dev/build_site.py` | Složí web: `python3 pribeh/dev/build_site.py preview-pribeh.html`, s `--artifact` jeden soubor pro náhled |

**Náhled pro Honziho:** artefakt s ID `Ad3FTgi6YvGuDd8C9t3Z8q`, verze 4 (= verze 8 webu). Publikace:
1. `python3 pribeh/dev/build_site.py <scratchpad>/site/index.html --artifact`
2. v souboru nahradit `<title>` za „Honza Tattoo · Příběh“
3. publikovat na stejný odkaz se soubory `img/*.jpg` a `img/*.webp` (mapa `img/x` → `img/x`)

**Mrtvé:**
- `archiv/PREDANI_HONZATATTOO-WEB_2026-11-07.md` a předání z 6. 11. v historii gitu
- starší náhled s ID `Uh7SnyB1vDteRY2dQgzCDV` (verze 4 původního příběhu)
- pracovní větev předchozího vlákna (obsah je celý v `pribeh-na-scroll`)
- snímky ve scratchpadu (kontejner je dočasný)

## Kde jsme

Hotová je verze 8 a Honzi ji pochválil („Moc hezké“). Příběh končí nájezdem kamery do zarámované fotky anděla na zdi studia. Pak běží film s andělem a mezi jeho záběry kamera přeletí po zdi galerie z fotky do fotky.

## Technický stav

- **Prohlížeč:** Playwright přes `require('playwright')`, `chromium.launch()` bez cesty. Bez GPU, časy snímků jsou pesimistické. Na skutečném telefonu neměřeno.
- **Výkon:** svět má asi 6300 prvků, detail ruky asi 500. Pod detailem ruky musí být svět `display:none` (řeší jádro). Tmavý lem postav jen při `cam.s < 1.9`.
- **Galerie a film:**
  - Polohy obrazů počítá `layoutWall` v `core.js`.
  - Při letu se scéna příběhu přepne na `position:fixed` (`.stage.gal`) a překryje film. Postavy a popředí se schovají, na koncích letu fotka sedí na pixel.
  - Bez příběhu (samotný `preview.html`) zůstávají staré přechody filmu.
- **Konec příběhu:** scéna mizí podle skutečného scrollu (`Tt >= ST.N`), ne podle vyhlazeného času, jinak se předání do anděla rozjíždí.
- **Hudba:** prohlížeče nepustí zvuk bez gesta. Samotné kolečko myši se jako gesto nepočítá, na počítači je potřeba kliknout.
- **Pomocníci:** na kreslení kulis se osvědčil Sonnet se snímky. Pomocník ulice 8. 11. spadl na limitu, rozdělanou práci ve `street.js` dokončilo hlavní vlákno. Zamítnuté akce z dřívějška: `pip install edge-tts`. Neobcházet.

## Rozhodnuto

Jen Honziho slova z vláken 6. až 8. 11.:
- **Detail:** postavy, město a studio mají být detailnější, „promakané, precizní“.
- **Dveře:** průchod dveřmi musí být přirozený, ne jako duch.
- **Ruce:** proces tetování detailněji, hlavně ruce, které tetují.
  - Ruka s bílým hadříkem pryč, zůstane jen ruka, která tetuje.
  - Strojek typu Pen a jeho držení podle skutečnosti.
- **Hudba** musí hrát rovnou.
- **Písmo** musí být dobře vidět (podkreslit nebo podsvítit).
- **Konec:** přechod do anděla jako nájezd do fotky. „Působí to super, jak se najede do té fotky na zdi.“
- **Texty u anděla** vrátit.
- **Galerie:**
  - Všechny fotky jako obrázky na stěně, včetně Honzovy.
  - Mezi záběry přejet na jinou část stěny a vjet do další fotky.
  - Stěna uspořádaná výborně a bez překryvů, s různými velikostmi obrazů.
  - Na zdi všech 9 tetování a všechny karty z webu.
- **Ulice:**
  - Žižkovský vysílač přesně jako ve skutečnosti.
  - Tramvaj jako typická pražská klasická stará tramvaj.
  - Do oken domů víc dějů a easter eggů.
- **Vrstvy:** v každém momentu musí být vidět to, co má (dveře, cedule studia).
- **Předání:** bez jména nástroje v názvu větve a v textu, jen „předání“ (8. 11.).
- **Z dřívějška platí:**
  - Honza nemá culík. Klientka má delší vlasy.
  - Žádná kočka.
  - Motivem je papoušek, ne mandaly.
  - Návrh se dělá v počítači.
  - V klidu se má pořád něco hýbat.
  - Easter eggy „sem tam, ne moc“.
  - Noční Žižkov, barvy a hudba se líbí.

## Citlivé, dodržovat

- **Zvířata:** žádné kočky, psi ani jiná chlupatá zvířata v kresbě (alergie).
- **Motivy:** jen pozitivní motivy na zdech, v oknech a v tetování. Žádné mandaly, lebky, dýky ani násilí.
- **Jméno nástroje:** nepsat ho do názvů větví ani do předávacích dokumentů.

## Otevřené

- **Hlasy postav:** Honzi pořád nevybral cestu.
  1. Namluví repliky sám plus ženský hlas.
  2. ElevenLabs přes jeho klíč.
  3. Edge TTS, jen pro mustr.
- **Texty „O mně“:** otázka bez odpovědi, jestli u anděla myslel i je. Od 24. 9. jsou u fotky z práce.
- **Nájezdy kamery:** kamera vjíždí jen do 6 fotek filmu (anděl, já u práce, 4 styly). Ostatní obrazy jsou vidět při přeletech. Nabídnuto, Honzi neodpověděl.
- **Moje volby, které Honzi nekomentoval:**
  - **Galerie:** rozvěšení skupin; čtyři druhy rámů; karta „12+ let“ sloučená do karty Řemeslo; portrét `about.jpg` přidaný na zeď jako „chybějící obrázek“ (nepotvrdil, že to myslel tím).
  - **Ruka a strojek:** ruka kreslená z boku palce; tvar strojku včetně displeje baterie.
  - **Ulice:** seznam scén v oknech; podoba vysílače, miminek a T3.
  - **Konec:** výzva k hudbě v úvodu; Honza na konci stojí u dveří na x 3296.
- **Ověření:** plynulost na skutečném telefonu.
- **Nasazení:** příběh na živý web (`index.html`) ani pull request nejsou rozhodnuté.

## Zamítnuto a proč

- **První verze kresby:** panáčci z čar byli „extrémně málo detailní, odfláknuté“.
- **Ruce v detailu:** palčáky, obří bloky, svislé drápy (v1 až v3).
- **Levá ruka s ubrouskem a otírání:** „vypadá špatně“, odstraněno 8. 11.
- **Galerie z verze 6:** obrazy pověšené přes jiné obrazy a rámečky. Teď skupiny se stejnými mezerami a volným místem nad tetovacím křeslem kvůli rameni lampy.
- **Dveře:** zúžení křídla, kterým postava prošla „jako duch“. Teď skutečné otočení kolem pantu.
- **Postavy:** drdol a zástěra u Honzy. Vzhled je podle `img/ja-u-prace.webp` a `img/about.jpg`.
- **Motivy na zdech:** lotos, mandaly a liška odstraněny.
- **Přechody:** skokové skrývání plánů; nájezd do detailu prolínačkou bez návaznosti.
- **Otáčení postav:** převrácením siluety, bylo ploché.
- **Hlasy:** přes `speechSynthesis` jsou oba strojové a mužské.

## Stav kontrol

**8. 11. 2026**, snímky přes `shot.js` a `siteshot.js`, konzole bez chyb:
- desktop 1440×900: celá osa T 0 až 14, přechod do anděla (13.97, h0), všechny lety galerie (h5.6, h6.27, h14.5, h25.5)
- mobil 390×844: T 0 a 8.6
- obě stěny galerie: zvětšené výřezy s `--q=nochars=1`, bez překryvů
- průchod oběma dveřmi: T 1.9–2.6 a 12.05–12.25

## První krok

Přečti si Honziho nové zadání a před každou úpravou nafoť dotčené místo přes `shot.js`, ať víš, z čeho vycházíš.
