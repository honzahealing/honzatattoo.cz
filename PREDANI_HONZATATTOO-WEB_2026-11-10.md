# PŘEDÁNÍ: honzatattoo.cz, web s příběhem na scroll / 2026-11-10

## Kanonické soubory

Repozitář `honzahealing/honzatattoo.cz`, větev **`pribeh-na-scroll`** obsahuje verzi 8. **Verze 9 (10. 11. 2026) je na pracovní větvi vlákna z 10. 11.** (jediná větev se sedmi commity nad `pribeh-na-scroll`, název jí přidělilo prostředí); do `pribeh-na-scroll` ji přesunout až s Honziho souhlasem. Pull request není a `main` je beze změn. Velikosti platí pro verzi 9.

| Bajty | Soubor | K čemu |
|---|---|---|
| 83597 | `preview-pribeh.html` | **Hlavní mustr:** `preview.html` s příběhem před filmem s andělem. Generuje ho build, ručně needitovat. |
| 7793 | `pribeh.html` | Samotný příběh (značkování, slouží k ladění a ke snímkům) |
| 13774 | `pribeh/style.css` | Styly příběhu, na konci podklady pro čitelnost písma a `.st-veil`, `.stage.gal` pro galerii |
| 43238 | `pribeh/core.js` | Jádro: kamera (`KEYS`, `ST.N = 14`), nájezd do detailu ruky, motiv papouška, bubliny (`BUB`), kroky (`STEPS`), **galerie na zdi** (`GAL`, `WI`, `WALLS`, `layoutWall`), nájezd do fotky anděla (`photoZoom`, T 13,15–14), let po zdi (`ST.gallery.fly`) |
| 123349 | `pribeh/street.js` | Ulice Žižkova: obloha, Žižkovský vysílač (`buildTower`), tramvaj T3 (`buildTram`), činžáky, příběhy v oknech (`SCENES`, `windowScene`, ambient `amb.scn`) |
| 109409 | `pribeh/studio.js` | Budova a interiér studia. `ST.galleryWall = true` vypíná staré kreslené rámečky, zrcadlo, klíče, polaroidy a závěsná světla na stěnách galerie |
| 7164 | `pribeh/doors.js` | Obě dveře: křídlo s panty vlevo a klikou vpravo, otevírá se dovnitř, osvětlený otvor, `ST.doorOpen(i,T)`, `ST.doorHandle(i,T)` |
| 24640 | `pribeh/close.js` | Detail předloktí, **10. 11. celý přepsaný**: kůže se světlem lampy, opěrka, kalíšky s barvami, jediná ruka v rukavici s Pen strojkem (oddíl 4, měřítko podle `img/ja-u-prace.webp`, grip asi pětina šířky předloktí), život ruky (oddíl 5). Strojek bez displeje a bez nápisu |
| 51774 | `pribeh/chars.js` | Postavy Honza a klientka: kostra, chůze, oblečení, stíny na zemi, sáhnutí na kliku (`reachArm`) |
| 30465 | `pribeh/audio.js` | Generativní chill jazz a hlasy. Zvuk je výchozí zapnutý, spustí se při prvním doteku, kliknutí nebo klávese, v úvodu výzva „Klepněte kamkoli a hraje hudba“ |
| 14200 | `scrolly.js` | Film s andělem. S příběhem před sebou (`afterStory`, `gal`) dělá mezi záběry let po zdi studia (`XG`, `pose`, `shotRect`, `angelRect`) a texty úvodu anděla nabíhají až po nájezdu |
| 4639 | `scrolly.css` | Styly filmu (beze změny) |
| 61943 | `preview.html` | Náhled webu s filmem, načítá `scrolly.*?v=16`. Příběh do něj vkládá build |
| 69050 | `index.html` | Živý web. **Nesahat**, příběh na něm není |
| 7584 | `pribeh/dev/CONTRACT.md` | Smlouva modulů (souřadnice, API, časová osa). Dát každému pomocníkovi |
| 1867 | `pribeh/dev/shot.js` | Snímky příběhu: `node pribeh/dev/shot.js <prefix> 1440 900 "T" "T@x,y,w,h" [--q=nochars=1]`. Ambientní pohyb je při snímání zmrazený (stejný snímek pokaždé) |
| 1156 | `pribeh/dev/siteshot.js` | Snímky složeného webu i s filmem: `node pribeh/dev/siteshot.js $PWD/preview-pribeh.html <prefix> 1440 900 13.97 h0 h5.6` (hN = N obrazovek za koncem příběhu) |
| 3668 | `pribeh/dev/build_site.py` | Složí web: `python3 pribeh/dev/build_site.py preview-pribeh.html`, s `--artifact` jeden soubor pro náhled |

**Náhled pro Honziho:** artefakt https://claude.ai/artifact/3xqedLNY3xePQ9RkMdV38D (verze 9). Publikace:
1. `python3 pribeh/dev/build_site.py <scratchpad>/site/index.html --artifact`
2. v souboru nahradit `<title>` za „Honza Tattoo · Příběh“
3. publikovat se soubory `img/*.jpg` a `img/*.webp` (mapa `img/x` → `img/x`)
4. Z jiného vlákna jde na stejný odkaz publikovat jen po přečtení celého živého souboru (asi 6700 řádků, drahé). Levnější je nový artefakt a nový odkaz zapsat sem.

**Mrtvé:**
- `archiv/PREDANI_HONZATATTOO-WEB_2026-11-08.md`, `archiv/PREDANI_HONZATATTOO-WEB_2026-11-07.md` a předání z 6. 11. v historii gitu
- starší náhledy s ID `Ad3FTgi6YvGuDd8C9t3Z8q` (verze 8) a `Uh7SnyB1vDteRY2dQgzCDV` (verze 4 původního příběhu)
- pracovní větev předchozího vlákna (obsah je celý v `pribeh-na-scroll`)
- snímky ve scratchpadu (kontejner je dočasný)

## Kde jsme

Hotová je verze 9 (10. 11. 2026) podle Honziho zadání z 9. 11.: projít celou úvodní animaci, opravit chyby, přidat detail a easter eggy, lepší postavy, nový detail tetování, strojek bez nápisu, lépe rozmístěný interiér a fotky, plynulejší nájezdy, detailnější město a věž. Honzi verzi 9 ještě neviděl a nekomentoval.

Co se ve verzi 9 změnilo:
- **Detail tetování (`close.js`):** přepsaný celý. Teplá kůže se světlem lampy, ruka v černé rukavici a strojek ve správném poměru k předloktí, strojek bez displeje a nápisu, kalíšky s barvami se rozsvítí při vybarvování.
- **Nájezd do detailu (`core.js`):** okolí ruky při nájezdu ztmavne (`zd` u `dimmer`), nejdřív naběhne podklad s předloktím (`bo`), potom kresba (`co`). Svět se už pod detailem neprolíná.
- **Postavy (`chars.js`):** teplejší pleť, barevné oblečení, vlasy klientky s pěšinkou a prameny, oči s duhovkou, rty, límec, kapsy a manžety bundy, Honzovy hodinky a přívěsek, ohrnuté džíny. Honza na konci stojí u dveří na x 3352 (nezakrývá obrazy).
- **Galerie (`core.js`, `WALLS`):** pravá stěna zmenšená, aby obrazy končily nad opěradlem křesla; sloupec nad monsterou zavěšený shora.
- **Přelety kamery:** let mezi fotkami jedním obloukem se stálou vnímanou rychlostí (`flyPath`, van Wijk), měkký rozjezd a dojezd (`sm5`) u letu, u detailu ruky i u fotky anděla. Let je delší (`XG` ve `scrolly.js` 1,6 obrazovky, mobil 1,3). Dojezd scrollu 150 ms.
- **Interiér (`studio.js`):** u okna menší vázy, police jsou čitelné.
- **Ulice (`street.js`):** vysílač o 14 % větší, noční nasvícení v trikolóře (`st_tri`), okna schodiště, záře a postavičky v kabinách; střechy panoramatu s vikýři, krytinou, zábradlím a satelity.
- **Nové easter eggy:** plakát „ZTRATIL SE · ARA“ na sloupu na začátku a papoušek na drátě mezi vlaštovkami na konci; horkovzdušný balon se srdcem; kráter ve tvaru srdce na měsíci; filmová klapka nad radiátorem; tibetská miska a vyvážené kamínky u okna; srdíčko na utěrce a pihy do srdce v detailu ruky.

## Technický stav

- **Prohlížeč:** Playwright přes `require('playwright')`, `chromium.launch()` bez cesty. Bez GPU, časy snímků jsou pesimistické. Na skutečném telefonu neměřeno.
- **Snímky klamou:** zmenšený snímek celé obrazovky vypadá, jako by přes postavy prosvítaly obrazy za nimi. V plném rozlišení (výřez) tam nic neprosvítá. Vrstvy kontrolovat jen na výřezech 1:1.
- **Výkon:** svět má asi 6450 prvků, detail ruky asi 490. Pod detailem ruky musí být svět `display:none` (řeší jádro). Tmavý lem postav jen při `cam.s < 1.9`.
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
- **Zadání 9. 11.:** každá vrstva tam, kde má být, a vrstva za ní nesmí být vidět. Víc easter eggů. Postavy lepší. Detail tetování na ruku byl „opravdu špatně udělaný“. Strojek bez nápisu. Interiér a fotky lépe rozmístit. Nájezdy a přechody plynulejší. Město a věž detailnější.
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
- **Jméno nástroje:** nepsat ho do názvů větví, do předávacích dokumentů ani do commitů. Commity bez podpisových řádků na konci zprávy; autor `honzahealing <jankoblertattoo@gmail.com>` (nastavit `git config user.name` a `user.email` v repozitáři, výchozí autor kontejneru je jiný). Historie `main` i `pribeh-na-scroll` je od toho očištěná (8. 11., s Honziho souhlasem).

## Otevřené

- **Hlasy postav:** Honzi pořád nevybral cestu.
  1. Namluví repliky sám plus ženský hlas.
  2. ElevenLabs přes jeho klíč.
  3. Edge TTS, jen pro mustr.
- **Texty „O mně“:** otázka bez odpovědi, jestli u anděla myslel i je. Od 24. 9. jsou u fotky z práce.
- **Nájezdy kamery:** kamera vjíždí jen do 6 fotek filmu (anděl, já u práce, 4 styly). Ostatní obrazy jsou vidět při přeletech. Nabídnuto, Honzi neodpověděl.
- **Moje volby, které Honzi nekomentoval:**
  - **Galerie:** rozvěšení skupin; čtyři druhy rámů; karta „12+ let“ sloučená do karty Řemeslo; portrét `about.jpg` přidaný na zeď jako „chybějící obrázek“ (nepotvrdil, že to myslel tím).
  - **Ruka a strojek (verze 9):** nová kresba ruky a strojku, barva kůže, kalíšky s barvami, kabel od strojku.
  - **Postavy (verze 9):** barvy oblečení (zelená bunda, hořčicová šála), světlejší pleť.
  - **Věž (verze 9):** nasvícení v trikolóře, větší měřítko.
  - **Easter eggy (verze 9):** výběr motivů (klapka, miska, kamínky, balon, papoušek).
  - **Ulice:** seznam scén v oknech; podoba vysílače, miminek a T3.
  - **Konec:** výzva k hudbě v úvodu; Honza na konci stojí u dveří na x 3352.
- **Ověření:** plynulost na skutečném telefonu.
- **Nasazení:** příběh na živý web (`index.html`) ani pull request nejsou rozhodnuté.

## Zamítnuto a proč

- **První verze kresby:** panáčci z čar byli „extrémně málo detailní, odfláknuté“.
- **Ruce v detailu:** palčáky, obří bloky, svislé drápy (v1 až v3).
- **Levá ruka s ubrouskem a otírání:** „vypadá špatně“, odstraněno 8. 11.
- **Detail ruky z verze 8:** „opravdu špatně udělaný“ (9. 11.). Ruka a strojek byly proti předloktí malé, kůže šedá, na strojku displej s číslem. Nahrazeno ve verzi 9.
- **Galerie z verze 6:** obrazy pověšené přes jiné obrazy a rámečky. Teď skupiny se stejnými mezerami a volným místem nad tetovacím křeslem kvůli rameni lampy.
- **Dveře:** zúžení křídla, kterým postava prošla „jako duch“. Teď skutečné otočení kolem pantu.
- **Postavy:** drdol a zástěra u Honzy. Vzhled je podle `img/ja-u-prace.webp` a `img/about.jpg`.
- **Motivy na zdech:** lotos, mandaly a liška odstraněny.
- **Přechody:** skokové skrývání plánů; nájezd do detailu prolínačkou bez návaznosti.
- **Otáčení postav:** převrácením siluety, bylo ploché.
- **Hlasy:** přes `speechSynthesis` jsou oba strojové a mužské.

## Stav kontrol

**10. 11. 2026**, snímky přes `shot.js` a `siteshot.js`, konzole bez chyb:
- desktop 1440×900: osa T 0 až 14 po částech (úvod, dveře 1.95–2.3, rozhovor, nájezd do detailu 7.7–8.05, detail 8.15–10.0, výjezd 10.75, dveře 11.92–12.25, konec 12.0–13), obě stěny galerie a zóna u okna bez postav
- složený web 1440×900: nájezd do anděla (13.4, 13.8, 13.97, h0) a první let (h5.1 až h6.7)
- mobil 390×844: T 0, 3.4, 7.6, 8.7, 12.8 a první let (h4.6 až h5.3)
- neověřeno: ostatní lety galerie po prodloužení `XG`, plynulost na skutečném telefonu

## První krok

Přečti si Honziho nové zadání a před každou úpravou nafoť dotčené místo přes `shot.js`, ať víš, z čeho vycházíš.
