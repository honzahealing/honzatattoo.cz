# PŘEDÁNÍ: honzatattoo.cz, web s příběhem na scroll / 2026-11-10

## Kanonické soubory

Repozitář `honzahealing/honzatattoo.cz`, větev **`pribeh-na-scroll`** obsahuje verzi 8. **Verze 9 (10. 11. 2026) je na pracovní větvi vlákna z 10. 11.** (jediná větev se sedmi commity nad `pribeh-na-scroll`, název jí přidělilo prostředí); do `pribeh-na-scroll` ji přesunout až s Honziho souhlasem. Pull request není a `main` je beze změn. Velikosti platí pro verzi 11 (třetí kolo 10. 11.).

| Bajty | Soubor | K čemu |
|---|---|---|
| 83794 | `preview-pribeh.html` | **Hlavní mustr:** `preview.html` s příběhem před filmem s andělem. Generuje ho build, ručně needitovat. |
| 7793 | `pribeh.html` | Samotný příběh (značkování, slouží k ladění a ke snímkům) |
| 13971 | `pribeh/style.css` | Styly příběhu, na konci podklady pro čitelnost písma a `.st-veil`, `.stage.gal` pro galerii |
| 47211 | `pribeh/core.js` | Jádro: kamera (`KEYS`, `ST.N = 14`), nájezd do detailu ruky, motiv papouška, bubliny (`BUB`), kroky (`STEPS`), **galerie na zdi** (`GAL`, `WI`, `WALLS`, `layoutWall`), nájezd do fotky anděla (`photoZoom`, T 13,15–14), let po zdi (`ST.gallery.fly`) |
| 125959 | `pribeh/street.js` | Ulice Žižkova: obloha, Žižkovský vysílač (`buildTower`), tramvaj T3 (`buildTram`), činžáky, příběhy v oknech (`SCENES`, `windowScene`, ambient `amb.scn`) |
| 112737 | `pribeh/studio.js` | Budova a interiér studia. `ST.galleryWall = true` vypíná staré kreslené rámečky, zrcadlo, klíče, polaroidy a závěsná světla na stěnách galerie |
| 7510 | `pribeh/doors.js` | Obě dveře: křídlo s panty vlevo a klikou vpravo, otevírá se dovnitř, osvětlený otvor, `ST.doorOpen(i,T)`, `ST.doorHandle(i,T)` |
| 25224 | `pribeh/close.js` | Detail předloktí, **10. 11. celý přepsaný**: kůže se světlem lampy, opěrka, kalíšky s barvami, jediná ruka v rukavici s Pen strojkem (oddíl 4, měřítko podle `img/ja-u-prace.webp`, grip asi pětina šířky předloktí), život ruky (oddíl 5). Strojek bez displeje a bez nápisu |
| 51774 | `pribeh/chars.js` | Postavy Honza a klientka: kostra, chůze, oblečení, stíny na zemi, sáhnutí na kliku (`reachArm`) |
| 30078 | `pribeh/audio.js` | Generativní chill jazz a hlasy. Zvuk je výchozí zapnutý, spustí se při prvním doteku, kliknutí nebo klávese, v úvodu výzva „Klepněte kamkoli a hraje hudba“ |
| 14200 | `scrolly.js` | Film s andělem. S příběhem před sebou (`afterStory`, `gal`) dělá mezi záběry let po zdi studia (`XG`, `pose`, `shotRect`, `angelRect`) a texty úvodu anděla nabíhají až po nájezdu |
| 4639 | `scrolly.css` | Styly filmu (beze změny) |
| 61943 | `preview.html` | Náhled webu s filmem, načítá `scrolly.*?v=16`. Příběh do něj vkládá build |
| 69050 | `index.html` | Živý web. **Nesahat**, příběh na něm není |
| 7584 | `pribeh/dev/CONTRACT.md` | Smlouva modulů (souřadnice, API, časová osa). Dát každému pomocníkovi |
| 1867 | `pribeh/dev/shot.js` | Snímky příběhu: `node pribeh/dev/shot.js <prefix> 1440 900 "T" "T@x,y,w,h" [--q=nochars=1]`. Ambientní pohyb je při snímání zmrazený (stejný snímek pokaždé) |
| 1156 | `pribeh/dev/siteshot.js` | Snímky složeného webu i s filmem: `node pribeh/dev/siteshot.js $PWD/preview-pribeh.html <prefix> 1440 900 13.97 h0 h5.6` (hN = N obrazovek za koncem příběhu) |
| 3668 | `pribeh/dev/build_site.py` | Složí web: `python3 pribeh/dev/build_site.py preview-pribeh.html`, s `--artifact` jeden soubor pro náhled |

**Náhled pro Honziho:** artefakt https://claude.ai/artifact/3xqedLNY3xePQ9RkMdV38D (verze 11). Publikace:
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

### Verze 10 (10. 11., druhé kolo po Honziho snímcích)

Honzi k verzi 9: „nájezdy do fotek na zdi jsou výborné“. Opraveno podle jeho čtyř snímků a pokynů:
- **Prázdné místo vpravo a fotky „v prostoru“ na širokém okně:** studio i obrazy se dokreslují podle toho, kdy jejich místo vjede do záběru (`ST.seenAt(x)` v `core.js`, počítá se ze skutečného poměru stran okna; `tt()` ve `studio.js` bere polohu z první souřadnice cesty). Ulice za studiem se na širokém okně dokreslí dřív (`ES`, `E()` ve `street.js`). Po změně velikosti okna se časy nepřepočítají (jen po novém načtení).
- **Za otevřenými dveřmi bylo vidět město:** otvor dveří 1 má neprůhledný podklad s tapetou, obložením, podlahou a lampou (`doors.js`).
- **Ruka pohybující se v pozadí při nájezdu do detailu:** okolí zhasne úplně (`zd`), svět se schová (`display:none`) a detail se otevře kruhovou clonou z místa tetování (`mk`, maska na `#close` a `#closeBg`), která roste s nájezdem.
- **Prsteník a malíček se ohýbaly obráceně:** nově zatočené do dlaně (`close.js`, `curlG`).
- **Let mezi fotkami:** oblouk s větším oddálením (`gc` v `updateCam`: oddálit do 40 %, přelet 16 až 84 %, přiblížit od 60 %), na počítači je vidět celé studio; na výšku menší oddálení. Let je delší (`XG` 1,9 obrazovky, mobil 1,5).
- **Zvuk:** hlasy postav vypnuté (`synth = null`), repliky jen psané. Pryč je šum vinylu, lupání, bzučení strojku a metličky; hraje jen hudba.
- **Písmo bublin:** Outfit (jako zbytek webu) místo kurzívy Cormorant.

### Verze 11 (10. 11., třetí kolo)

Honzi k verzi 10: oblouk mezi obrazy „je už krásně daleko“, ale nebyl plynulý. Opraveno:
- **Studio se při scrollu nedokresluje vůbec** (Honzi: „ať se raději ve studiu uvnitř nevykresluje nic“). `tt()` ve `studio.js` vrací `STAT`, všechno je nakreslené od začátku; výjimky jsou jen děje příběhu (pára `ZFIX`, kroužek v kalendáři, lampa). Obrazy na zdi a dveře bez náběhu. `ST.seenAt` zůstává jen pro ulici za studiem (`ES`).
- **Za dveřmi:** stejné barvy jako studio (tapeta, obložení), žádná zlatá výplň.
- **Let mezi fotkami (`flyLUT` a `gc` v `core.js`):** jedna křivka bez prodlev. Šířka záběru je oblouk v logaritmu (`B*sin`), posun běží úměrně šířce záběru, tabulka `U` vyrovnává tempo (poměr nejrychlejší a nejpomalejší části asi 3:1, dřív 7:1). Čas se měří `path.js` ve scratchpadu (nepřežije kontejner).
- **Výkon letu:** při letu se nekreslí obloha, vzdálené domy, postavy a popředí (`visibility:hidden` na vrstvách), sekce studia zůstávají během filmu zobrazené (`ST._keep`) a mimo let se příběh nepřekresluje (`idle` ve `frame`). Čas snímku v bezhlavém prohlížeči: film 25 ms, let 32 ms (dřív 63 ms).
- **Věž za oknem:** Žižkovský vysílač (tři tubusy, kabiny, anténa), posunutý vlevo od příčky okna.
- **Papoušek v detailu:** menší (`scale(.7)`) a níž, vystředěný na předloktí; zarudnutí a fólie posunuté s ním.
- **Spodní okraj:** `.floorfade` se počítá podle polohy země (`gyp`), kresba pod chodníkem mizí do tmy; konec chodníku u studia má měkký přechod (`st_endA`, `st_endB`).
- **Nové easter eggy:** akvárko s plovoucí rybkou a krystal na poličce v čekárně, gumová kachnička u umyvadla, kudlanka na listu fikusu u dveří, papírová lodička v louži, šipka křídou a srdce na chodníku před studiem, tenisky na drátě, plakát „NALEZEN“ na konci ulice, souhvězdí srdce, náramek s pírkem na zápěstí v detailu. Zrušen lístek, který visel ve vzduchu vedle pultu.

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
- **Zvuk (10. 11.):** žádný hlas Honzy ani klientky, „bude to jenom psané“. Žádný šum na pozadí mimo hudbu.
- **Písmo v přímé řeči (10. 11.):** původní bylo „ošklivý font“, má být hezké a podobné vizuálu webu.
- **Lety mezi fotkami (10. 11.):** oblouk s větším oddálením, aby bylo víc vidět studio. Nájezdy do fotek jsou „výborné“, neměnit. Oddálení ve verzi 10 je „krásně daleko“. Let „nesmí se nikde stavit, zaseknout“, „všechno musí být dokonale plynulé“.
- **Studio (10. 11.):** uvnitř se při scrollu nemá nic dokreslovat. Za dveřmi stejná barva jako celé studio. Za oknem žižkovská věž.
- **Easter eggy (10. 11.):** chce jich víc.
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
- **Hlasy:** přes `speechSynthesis` jsou oba strojové a mužské. 10. 11. Honzi hlasy zrušil úplně.
- **Šum na pozadí** (vinyl, lupání, bzučení strojku): zrušeno 10. 11.
- **Kurzíva Cormorant v bublinách:** „ošklivý font“, nahrazeno 10. 11.
- **Krátké oddálení při letu mezi fotkami** (verze 9): studio jen probliklo.
- **Let s prodlevou uprostřed** (verze 10): oddálit, podržet, přiblížit; působilo to jako zastavení.
- **Dokreslování studia podle kamery** (verze 10): Honzi nechce ve studiu žádné dokreslování.
- **Zlatý průhled do dveří** a **věž s kuličkami za oknem** (vypadala jako z jiného města).

## Stav kontrol

**10. 11. 2026 (verze 11)**, snímky přes `shot.js` a složený web, konzole bez chyb:
- široké okno 2000×991: T 1.9 (spodní okraj, dveře), 5.5 (okno s věží), 8.6 (detail), 0, 12.6, výřezy nových easter eggů
- 1440×900: T 0, 3.4, 6.3, 7.86, 9.3, 10.9, 13; první dva lety po krocích, 3. a 4. uprostřed
- mobil 390×844: T 0.6, 2.2, 5.4, 8.6, 12.7 a lety
- dráha prvního letu změřená číselně (bez zastavení, nejmenší rychlost 37 px na 1 % letu)
- neověřeno: zvuk poslechem, plynulost na skutečném počítači a telefonu (měřeno jen v bezhlavém prohlížeči), pátý let

## První krok

Přečti si Honziho nové zadání a před každou úpravou nafoť dotčené místo přes `shot.js`, ať víš, z čeho vycházíš.
