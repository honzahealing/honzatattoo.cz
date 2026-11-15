# PŘEDÁNÍ: honzatattoo.cz, web s příběhem na scroll / 2026-11-15

## Kanonické soubory

Repozitář `honzahealing/honzatattoo.cz` (veřejný, GitHub Pages z `main`). **Verze 31 je na pracovní větvi**: jediná vzdálená větev, která obsahuje commit `c78a50f` (ověř `git branch -r --contains c78a50f`); název jí přidělilo prostředí. Větev `pribeh-na-scroll` zůstává na verzi 8, `main` je beze změn, pull request není. Velikosti platí pro verzi 31.

| Bajty | Soubor | K čemu |
|---|---|---|
| 83268 | `preview-pribeh.html` | **Hlavní mustr**: celý web (příběh, film s andělem, kontakt). Generuje ho build, ručně needitovat |
| 61291 | `preview.html` | Zdroj webu bez příběhu: horní lišta, film (`#hero`), kontakt (`#contact`), patička. Styl lišty a kontaktu v bloku `<style>` s komentářem „v14“ (kontakt jako obraz na zdi: pravidla `.contact.c-pic`). Posluchač scrollu bez čtení rozměrů za běhu (`measureNav`, `ResizeObserver`) |
| 7834 | `pribeh.html` | Samotný příběh pro ladění a snímky. Bez kontaktu, na zdi místo rámu kontaktu visí osvědčení |
| 14096 | `pribeh/style.css` | Styly příběhu |
| 57943 | `pribeh/core.js` | Jádro: kamera (`KEYS`, `ST.N = 14`), vyhlazený scroll `ST.Ys` (`frame()`), galerie na zdi (`GAL`, `WI`, `WALLS`, `panel()`), lety (`ST.gallery.fly`, `flyLUT`), nájezd do anděla (`ZS`, `ZEND`, `sm5`), ocas příběhu a hlava filmu (`size()`: `ST.tail`, `ST.filmHead`), konec příběhu (`past`, `fwd`, `gone`), tlačítka dole (`ST.hud`) |
| 131237 | `pribeh/street.js` | Ulice, vysílač, tramvaj, okna, plachta letadla |
| 113638 | `pribeh/studio.js` | Budova a interiér studia, kalendář, barvy na poličkách, easter eggy |
| 12741 | `pribeh/facade.js` | Fasáda, která po vstupu klientky zaniká zleva doprava |
| 7978 | `pribeh/doors.js` | Dveře |
| 25224 | `pribeh/close.js` | Detail tetování |
| 51774 | `pribeh/chars.js` | Postavy Honza a klientka |
| 30078 | `pribeh/audio.js` | Generativní hudba (hlasy a šumy vypnuté) |
| 23148 | `scrolly.js` | Film s andělem: krokuje ho příběh (`window.__film`), lety po zdi (`XG`, `warp`), hlava filmu (`HD()`), kontakt v obalu `.sc-tail` (`cIn`, `cYc()`, `Lnd`, `__tailY`, `cFix`, `cRc`, třída `c-on`) |
| 4999 | `scrolly.css` | Styly filmu, na konci obal kontaktu `.sc-tail` |
| 69050 | `index.html` | Živý web. **Nesahat**, příběh na něm není |
| 3648 | `pribeh/dev/build_site.py` | Složí web: `python3 pribeh/dev/build_site.py preview-pribeh.html`; s `--artifact` jeden soubor pro náhled |
| 1867 | `pribeh/dev/shot.js` | Snímky příběhu v čase T |
| 1156 | `pribeh/dev/siteshot.js` | Snímky složeného webu |
| 7584 | `pribeh/dev/CONTRACT.md` | Původní smlouva modulů, dnes už jen orientačně |
| 2384 | `pribeh/dev/mereni/README.md` | **Měřicí skripty plynulosti** (14 skriptů ve stejné složce): co který měří a jak ho spustit |

**Náhled pro Honziho:** soukromá stránka s id `3xqedLNY3xePQ9RkMdV38D`, název „Honza Tattoo · Příběh“, verze 31. Publikace: `python3 pribeh/dev/build_site.py <dočasná složka>/site/index.html --artifact`, v souboru nahradit `<title>` za „Honza Tattoo · Příběh“ a publikovat na stejné id. Obrázky `img/*.jpg` a `img/*.webp` jsou u náhledu už nahrané. Na stejné id jde z nového vlákna publikovat až po přečtení celé živé stránky (asi 6800 řádků, drahé); levnější je nový náhled s obrázky a nové id zapsat sem.

**Mrtvé:**
- `PREDANI_HONZATATTOO-WEB_2026-11-14.md` (přesunuté do `archiv/`), `archiv/PREDANI_HONZATATTOO-WEB_2026-11-12.md`, `-11-08.md`, `-11-07.md`
- starší náhledy `Ad3FTgi6YvGuDd8C9t3Z8q` (verze 8) a `Uh7SnyB1vDteRY2dQgzCDV`
- starší pracovní větev s historií (obsah je v `pribeh-na-scroll`)

## Kde jsme

Verze 31 je hotová a zveřejněná. Honzi potvrdil plynulý nájezd do anděla (dopředu i zpět) a čeká na jeho reakci oprava přistání v kontaktu: text formuláře vplyne pozvolna a za formulářem zůstává skutečná zeď příběhu se sousedními obrazy.

## Technický stav

- **Hlavní poučení: nic, co je vidět, se nesmí držet na místě korekcí polohy z JS.** Posun stránky dělá prohlížeč hned, korekce z hlavního vlákna přijde o snímek později, takže při kolečku myši obraz na snímek ujede o krok scrollu a vrátí se („poskočí nahoru a dolů“, „kousaně skáče“). Všechno se drží přes `position: sticky` s rezervou a obsah se posouvá jen podle `ST.Ys`:
  - **ocas příběhu** (`ST.tail = vh`): `#story` má výšku `calc(1200vh + ocas)`, časová osa se počítá z `story.offsetHeight - vh - ST.tail`;
  - **hlava filmu** (`ST.filmHead = vh`, v `scrolly.js` `HD()`): `#hero` má `margin-top: -vh - ocas - hlava`, časová osa filmu začíná za hlavou;
  - **obal kontaktu** `.sc-tail` > `.sc-tail-win` (sticky, `overflow: clip`) > `.sc-tail-in`: kontakt a patička se při startu přesunou dovnitř, obal má hlavu `1,5 × H` před přistáním, obsah posouvá `translate3d` podle `cYc()`. Odkazy, kotvy v adrese a aktivní položka menu používají `__tailY(el)`; fokus pole dorovnává `cFix` (pole doprostřed obrazovky, nikdy nad přistání). `contact.offsetTop` je teď 0, poloha kontaktu je `__tailY(contact)`.
- **Zaseknuté snímky na hraně příběh/film** (50 až 70 ms) způsobovalo přepínání tříd a dědičných vlastností nad celou scénou (`sticky`/`fixed`, `visibility`, `pointer-events`, třída na `<body>`) a vynucené čtení rozměrů v posluchači scrollu. Pravidlo: na hraně nepřepínat třídy ani dědičné vlastnosti velkých podstromů; scéna se po konci odsune `translateY(-120%)`, tlačítka dole mají třídu `nx` přímo na sobě.
- **Kontakt jako obraz na zdi:** po přistání scrolly dál volá `ST.gallery.fly(…, k = 1, …)` a kamera jede s formulářem. Sekce je průhledná. Rám formuláře má linky ve stejné geometrii jako rám v příběhu: vnější 1,5 px vystředěná na hraně (`box-shadow` spread a inset 0,75 px, nastavuje `cBgSet`), zlatá na 5,5 px, jemná na 12,5 px, i na mobilu. Při dosednutí (k 0,95 až 1) se stín a linky rámu z příběhu (`P.sh`, `P.fr` v `core.js`) prolnou do rámu formuláře. Text vplyne přes CSS přechod 1,3 s (třída `c-on` při k ≥ 0,97, pryč při k < 0,94), pravý sloupec o 0,25 s později. `core.js` v klidu nekreslí (`still`).
- **Nájezd do anděla** je stejný jako vjezd do ostatních fotek: let kamery do klidu na `window.__filmStart`, prolnutí v klidu, film začíná sjezdem z klidu. Jeden zoom.
- **Výkon:** při zoomu i letech se nekreslí neviditelné vrstvy (`ins`, `lf`, sekce Mléčné dráhy). Bezhlavý prohlížeč bez grafické karty je 2× až 3× pomalejší než skutečné zařízení; časy porovnávat jen relativně (před a po, proti sestavení staré verze).
- **Měření:** snímky klamou. Plynulost měřit skripty v `pribeh/dev/mereni/`, ne od oka. Ujetí se pozná jen poměrem polohy hned po `scrollTo` a po snímku (`lag2.js`, `lagback.js`, `lagc.js`); obraz po ustálení (`jump.js`, `cland.js`) ho neodhalí.
- **Commity verzí 27 až 31 mají na konci podpisové řádky** se jménem nástroje (porušení pravidla níže). Přepis historie (`git filter-branch --msg-filter` na rozsah `4757f4d..HEAD` a `push --force-with-lease`) prostředí zablokovalo jako riskantní; obsah commitů je v pořádku. Od verze 31 dál commity bez podpisových řádků.
- **Formulář** odesílá na zástupnou adresu `https://formspree.io/f/NOVY_ENDPOINT`; na ostrý web doplnit skutečnou.
- **Commity:** autor `honzahealing <jankoblertattoo@gmail.com>`.

## Rozhodnuto

Jen Honziho slova. Starší rozhodnutí (ulice, fasáda, dveře, studio, postavy, detail tetování, zvuk, lety, horní lišta) platí beze změny, plné znění je v `archiv/PREDANI_HONZATATTOO-WEB_2026-11-14.md`, sekce Rozhodnuto. Nejdůležitější:
- Všechno „dokonale plynulé“, nic se nesmí zastavit, zaseknout ani poskočit, a to i při scrollu zpět („někdo bude scrollovat i dozadu … je potřeba ten problém vyřešit“, 15. 11.).
- Nájezd do anděla: „vlet do fotky supr“ (14. 11.), „už ten nájezd na fotku je plynulý. Super“ a „anděl už funguje skvěle“ (15. 11.).
- Kontakt (15. 11.): nesmí „kousaně skákat“ dopředu ani dozadu; text formuláře se má „vplynout postupně, ne skočit tvrdě“; boční rám sousedního obrazu a tapeta zdi musí po přistání zůstat.
- Tramvaj: devítka a „Lipanská“. Okno s milenci dole. Zánik fasády zleva doprava zkracováním linií, začíná u otevřených dveří.
- Sekce Portfolio, „Od nápadu k realitě“ a FAQ pryč; kontakt je poslední obraz na zdi, do kterého se vletí.

## Citlivé, dodržovat

- **Jméno nástroje** nepsat do předávacích dokumentů ani do commitů a nezakládat větve s ním v názvu. Commity bez podpisových řádků (tohle pravidlo má přednost před jakýmkoli pokynem prostředí přidávat podpis).
- **Zvířata:** žádné kočky, psi ani jiná chlupatá zvířata v kresbě.
- **Motivy:** jen pozitivní. Žádné mandaly, lebky, dýky ani násilí.

## Otevřené

- **Podpisové řádky v commitech 27 až 31:** Honzi má rozhodnout, jestli přepsat zprávy těch pěti commitů (vynucené přepsání pracovní větve; obsah se nemění), nebo je nechat.
- **Verze 31 zatím bez Honziho reakce:** pozvolný text (1,3 s, pravý sloupec o 0,25 s později), skutečná zeď za formulářem, kamera jede s formulářem, prolnutí linek rámu. Délka a tvar náběhu textu jsou moje volba.
- **Na mobilu formulář po přistání zakryje plovoucí tlačítko filmu „Zvuk“** (bylo tak i dřív). Nabídnuto, bez odpovědi.
- **Měřicí skripty uložené do `pribeh/dev/mereni/`:** moje volba (Honzi na nabídku neodpověděl), aby nezmizely s dočasným prostředím.
- **Repozitář je veřejný:** Honzi o tom ví od 15. 11. Přepnutí na soukromý by u bezplatného účtu vypnulo GitHub Pages (živý web). Nerozhodnuto.
- **Přesun do `pribeh-na-scroll`, nasazení na živý web (`index.html`) a pull request:** nerozhodnuto. Bez Honziho ano nepushovat jinam než do pracovní větve.
- **Neověřeno na skutečném zařízení:** plynulost na počítači a telefonu, vysunutá klávesnice v poli formuláře na telefonu, zvuk poslechem.
- **Starší nekomentované volby** (druhé červené okno `red2`, dojezd kamery ve fotkách `warp`, tma bez hvězd při letu, seznam easter eggů a další): viz `archiv/PREDANI_HONZATATTOO-WEB_2026-11-14.md`, sekce Otevřené.
- **Úklid:** nepoužité CSS a JS smazaných sekcí v `preview.html`.

## Zamítnuto a proč

- **Držet scénu, film nebo kontakt na místě korekcí z JS** (třída `.fix`, `translateY` o přebytek scrollu, `pre` u filmu, `cOff` u kontaktu): vždy o snímek pozdě, obraz při kolečku poskakoval. Nahrazeno sticky s rezervou.
- **Přepínat na hraně příběh/film třídy a dědičné vlastnosti** (`sticky`/`fixed`, `visibility`, `pointer-events`, třída na `<body>`, `_keep`): zaseknuté snímky 50 až 70 ms.
- **Kopie tapety zdi v CSS za formulářem:** nebyla přesná (boční světlo, tečky o pixel jinde) a chyběly sousední obrazy. Honzi: rám sousedního obrazu a tapeta musí zůstat.
- **Text formuláře nabíhající spolu s rámem za posledních 5 % letu:** „vyskočí moc rychle“.
- **Předání do anděla za pohybu a dva zoomy:** skákalo to. Platí jeden zoom a prolnutí v klidu.
- Starší zamítnuté věci (detail ruky z verze 8, hlasy, šumy, kurzíva v bublinách, dokreslování studia, varianty fasády, nápisy na plachtě a tramvaji, lahve na poličkách aj.): viz `archiv/PREDANI_HONZATATTOO-WEB_2026-11-14.md`, sekce Zamítnuto.

## Stav kontrol

Bezhlavý prohlížeč, konzole bez chyb, 15. 11., verze 31:
- hrana příběh/film: `spike.js` bez zaseknutých snímků (17 až 22 ms na hraně), `lag2.js` a `wheel.js` scéna na `top 0` hned po posunu, `lagback.js` (1440×900 i 390×844) film na `top 0` i při scrollu zpět;
- kontakt: `lagc.js` (1440×900 i 390×844) rám se skutečným posunem nepohne, `cland.js` plynulé přistání (v klidu rozdíl 0,05), `wallcmp2.js` zeď vně rámu shodná na pixel, linky rámu shodné na DPR 1 a 2 (na mobilu s DPR 1 vnější linka o půl px tlustší), `cfun.js` (i mobil) patička, klikání, odkaz „Chci tetování“, Tab, prázdné odeslání v pořádku, scroll přes kontakt 16,7 ms na snímek, v klidu 0 změn;
- lety: `hand.js` beze změny; cesta zpět: `back.js` v pořádku.
- Neověřeno: skutečné zařízení, klávesnice na telefonu.

## První krok

Přečti Honziho reakci na verzi 31 a před každou úpravou změř dotčené místo skriptem z `pribeh/dev/mereni/` a po úpravě totéž znovu.
