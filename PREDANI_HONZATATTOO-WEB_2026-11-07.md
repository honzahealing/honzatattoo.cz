# PŘEDÁNÍ: honzatattoo.cz, web s příběhem na scroll / 2026-11-07


## Novinky 7. 11. 2026 (verze 5) — čti první

- **Větev:** práce je teď na `claude/beautiful-volta-qqu59n` (vychází z `pribeh-na-scroll`). Pull request zatím není.
- **Náhled verze 5:** nový artefakt https://claude.ai/artifact/Ad3FTgi6YvGuDd8C9t3Z8q (starý odkaz z verze 4 zůstal beze změny). Publikace: `build_site.py <scratchpad>/site/index.html --artifact`, `<title>` na „Honza Tattoo · Příběh“, publikovat stejný soubor se soubory `img/*`.
- **Nový modul `pribeh/doors.js`:** obě dveře (křídlo s panty, klikou a sklem, otočení kolem pantu, osvětlený otvor, světlo na chodník). `ST.doorOpen(i,T)`, `ST.doorHandle(i,T)`. Staré křídlo ve `studio.js` je odstraněné, cedule HONZA TATTOO je zvednutá nad hlavu.
- **Průchod dveřmi:** klientka zastaví (x 750, T 1,9), sáhne na kliku, dveře se otevřou (T 1,98–2,24), projde, zavřou se za ní (2,52–2,86). Odchod: dojde k x 3372, klika, dveře 2 se otevřou (11,98–12,2), vyjde ven. Honza stojí na x 3296.
- **Ruce v detailu (`close.js`, oddíl 4–6):** přepsané od základu: správné pořadí prstů (palec, ukazovák … malíček), články s klouby, nitrilový lesk, manžeta, tetované předloktí tatéra, pravá ruka drží strojek jako tužku (ukazovák nahoře, palec z boku, prostředník pod gripem, prsteník a malíček zatočené). Přibylo otírání ubrouskem (T 8,4; 8,78; 9,5) a film barvy kolem čerstvých linek.
- **Postavy (`chars.js`):** stíny na zemi, opasek se sponou, kapsy a nýty na džínách, švy, zip a kapsa bundy, taška s klopnou, boty s očky a prošitím, bohatší tetování rukávů.
- **Kulisy:** subagenti (Sonnet) dokreslili město (`street.js`, kočky odstraněné, opravené překryvy z mřížky) a studio (`studio.js`, lišák a lotos odstraněné).
- **Konec a anděl:** `ST.N = 14`. Na zdi studia visí zarámovaná fotka anděla (`ST.photo`, x 3198, y 298, 72×108). T 13,15–14 kamera najede do fotky tak, že na konci sedí přesně tam, kde ji ukazuje film `#hero` (scrolly.js). Pak scéna zmizí (podle skutečného scrollu `Tt`). Texty u anděla (`.sc-intro`, „Umění, které nosíte s sebou“) teď po najetí nabíhají (`scrolly.js`, `afterStory`), verze `?v=15`.
- **Hudba:** zvuk je výchozí zapnutý; spustí se při prvním doteku, kliknutí nebo klávese (prohlížeče bez gesta zvuk nepustí). V úvodu je výzva „Klepněte kamkoli a hraje hudba“. Vypnutí si stránka pamatuje.
- **Čitelnost:** popisek kroku na tmavém panelu, podsvícený nadpis, tmavý pás pod lištou kroků a pod hlavičkou, kontrastnější bubliny.
- **Otevřené:** hlasy (volba pořád čeká na Honziho), plynulost na skutečném telefonu, jestli Honzi u anděla myslel i texty „O mně“ (ty jsou od 24. 9. u fotky z práce).

## Kanonické soubory (stav 6. 11.)

Repozitář `honzahealing/honzatattoo.cz`, větev **`pribeh-na-scroll`**, poslední commit `42653c2` (6. 11. 2026). Pull request zatím není a `main` je beze změn. Velikosti platí pro commit `42653c2`.

| Bajty | Soubor | K čemu |
|---|---|---|
| 80344 | `preview-pribeh.html` | **Hlavní mustr:** `preview.html` s příběhem vloženým před film s andělem. Generuje se skriptem, ručně needitovat. |
| 7663 | `pribeh.html` | Samotný příběh (zdroj značkování příběhu, slouží i k ladění) |
| 10651 | `pribeh/style.css` | Styly příběhu (proměnné na `:root`, na webu je build přepíše na `#story`) |
| 29167 | `pribeh/core.js` | Jádro: plány s paralaxou, kamera (klíče `KEYS`), virtuální kamera nájezdu do detailu (`ZW0`, `ZC0`, `ZK`), časová osa T 0 až 13, bubliny (`BUB`), kroky (`STEPS`), motiv papouška (`PARROT`, `buildMotif`, `setMotif`, `packMotif`), postup tetování v detailu, přechod na anděla |
| 75302 | `pribeh/street.js` | Ulice Žižkova (obloha, vysílač, činžáky, tramvaj, easter eggy). Psal subagent. |
| 77122 | `pribeh/studio.js` | Budova a interiér studia (pen displej se slotem `board`, tetovací kout, easter eggy). Psal subagent. |
| 29898 | `pribeh/close.js` | Detail předloktí: kůže, opěrka, ruce v rukavicích a strojek (`chain()` a `finger()`). Pozadí psal subagent, ruce a strojek hlavní relace. |
| 43544 | `pribeh/chars.js` | Postavy Honza a klientka: kostra, IK, chůze, čelní pohled pro otáčení (`buildFront`), vlasy, pohyb v klidu |
| 27365 | `pribeh/audio.js` | Generativní chill jazz (Web Audio) a hlasy přes `speechSynthesis`. Psal subagent. |
| 7659 | `pribeh/dev/CONTRACT.md` | Smlouva modulů: souřadnice, API, časová osa, pevná geometrie pro postavy. **Dát každému novému subagentovi.** |
| 1713 | `pribeh/dev/shot.js` | Snímky: `node pribeh/dev/shot.js <prefix> 1440 900 "T" "T@x,y,w,h" [--q=nochars=1]` |
| 3659 | `pribeh/dev/build_site.py` | Složí web: `python3 pribeh/dev/build_site.py preview-pribeh.html` (s `--artifact` vznikne jeden soubor pro náhled) |
| 1139 | `pribeh/dev/build.py` | Složí samotný příběh do jednoho souboru (pomocný nástroj) |
| 61943 | `preview.html` | Náhled nového webu s filmem anděla. Příběh do něj vkládá build, soubor sám zůstal beze změny. |
| 69050 | `index.html` | Živý web. **Nesahat**, příběh na něm není. |

Náhled pro Honziho je artefakt https://claude.ai/artifact/Uh7SnyB1vDteRY2dQgzCDV, **verze 4**. Je to složený `preview-pribeh.html` s obrázky z `img/`. Publikace: `build_site.py <scratchpad>/site/index.html --artifact`, v něm nahradit `<title>` za „Honza Tattoo · Příběh“ a publikovat na stejné `url` se soubory `img/*.jpg` a `img/*.webp`. Honzi verzi 4 ještě neviděl.

**Mrtvé:**
- první jednosouborový `pribeh.html` (minimalistická kresba tuší, zamítnuto 6. 11.), zůstal jen v historii gitu
- verze artefaktu 1 až 3
- snímky ve scratchpadu (kontejner je dočasný, nic z nich nepřežije)

## Kde jsme

Hotová je verze 4: příběh v 7 krocích (ulice, konzultace, návrh papouška na pen displeji, záloha, tetování s detailem ruky, hojení, odchod), na konci prolnutí do filmu s andělem. Honzi na verzi 3 odpověděl, že „mnohé věci nesedí“ a že je to „potřeba ještě hodně vyladit“. Jeho výtky (papoušek na displeji a během tetování, linie pozadí přes popředí, hlasy) jsou ve verzi 4 opravené, ale on je ještě neviděl. Na volbu cesty pro hlasy neodpověděl.

## Technický stav

- **Prohlížeč:** Playwright z `/opt/node-tools/node_modules/playwright`, Chromium `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Bez GPU, takže časy snímků jsou pesimistické: 20 až 80 ms na desktopu. Na skutečném telefonu neměřeno.
- **Výkon, záludná místa:**
  - Pod detailem ruky musí být svět `display:none`. Kresby mají natvrdo `visibility:visible` a `visibility:hidden` na `#world` nefunguje, jinak je snímek 350 ms.
  - Tmavý lem postav (filtr `chSep`) je zapnutý jen při `cam.s < 1.9`.
  - Filtr `blurFore` se nesmí používat na pohyblivých vrstvách.
- **Napojení na anděla:**
  - `#story` má `z-index: 2` a nesmí mít pozadí (tmavé pozadí sekce zakrývalo anděla).
  - `#hero` dostává z jádra `margin-top: -vh`.
  - Scéna se v T 12,8 až 13 rozplyne do průhledna.
  - Třída `in-story` na body skrývá navigaci webu, oznamovací lištu, `#sticky-cta`, `#btt` a `#scroll-progress`.
  - Po příběhu zůstává tlačítko zvuku vpravo dole.
  - Kontaktní výzva příběhu je na webu skrytá (`ST.hasHero`).
- **Kolize s `preview.html`:** jeho styly mají `.btn` a `nav{}`, proto se v příběhu používá `.st-btn` a lišta kroků je `div`. Proměnné příběhu (`--bg` a další) build omezuje na `#story`.
- **Zamítnuté akce:** schvalovací filtr prostředí zamítl `pip install edge-tts` a opakované zadání práce subagentovi ulice (SendMessage). Neobcházet.
- **Subagenti** z tohoto vlákna v novém vlákně neexistují. Noví dostanou `CONTRACT.md` a cestu ke svému modulu. Na kreslení kulis se osvědčil Sonnet s kontrolou přes zvětšené snímky.

## Rozhodnuto

- **Koncept:** scroll pohání jeden animovaný příběh. Klient přijde, zeptá se, tatér odpoví, pak spolu udělají další kroky a nakonec se tetuje (Honzi 13. 10.).
- **Úroveň zpracování:** vizuálně umělecké, maximum krásy a detailu, „promakat to celé mnohem víc“ (Honzi 13. 10. a 6. 11.).
- **Co se mu líbí:** noční Žižkov v pozadí a barvy („Barvy jsou moc fajn“, „hudba je fajn“).
- **Honza nemá culík.** Klientka musí mít delší vlasy.
- **Žádná kočka.** Honza je na kočky extrémně alergický a žádnou nemá.
- **Motiv:** Honza netetuje mandaly, motivem je papoušek. Návrh papouška se dělá v počítači.
- **Pohyb v klidu:** v každém okamžiku, kdy se scroll zastaví, se má něco hýbat.
- **Easter eggy:** v každém plánu drobné skryté detaily jako v dětských hledacích knížkách, „sem tam, ne moc“.
- **Konec:** musí přejít do scrollu na fotku anděla.
- **Hudba:** na pozadí chill-out jazz. Současná generativní hudba je v pořádku.
- **Hlasy:** postavy mají repliky z bublin říct i hlasem. Současné hlasy (oba mužské, strojové) nejsou dobře.
- **Výtky k verzi 2, ve verzi 3 a 4 řešené:** přechody nebyly plynulé, otáčení postav bylo plochých 2D, přechod do detailu ruky byl špatný, ruce špatné, proces tetování vypadal divně, chtěl víc detailu hlavně u postav a tetovacích rukou.
- **Výtky k verzi 3, ve verzi 4 řešené:** papoušek na displeji a na ruce během tetování nesedí, některé linie pozadí překrývají popředí.

## Citlivé, dodržovat

- **Zvířata:** žádné kočky ani jiná chlupatá zvířata v kresbě (alergie).
- **Motivy:** na zdech a v tetování jen pozitivní motivy, žádné mandaly, lebky, dýky ani agresivní motivy.

## Otevřené

- **Hlasy, čeká na Honziho volbu:**
  1. Namluví repliky sám plus ženský hlas (12 vět).
  2. ElevenLabs přes jeho API klíč.
  3. Microsoft Edge TTS (zdarma, přirozené, ale použití na komerčním webu je právně sporné, jen pro mustr, a vyžaduje jeho povolení instalace).
  
  Mezitím `audio.js` přednostně vybírá přirozené prohlížečové hlasy (Vlasta a Antonín v Edge, Zuzana na Apple).
- **Verze 4 čeká na Honziho kontrolu.** Novinky:
  - postup tetování: fialový obtisk šablony, linky, vybarvení po plochách, hojení
  - papoušek na displeji je oříznutý a po nakreslení se digitálně vybarví
  - levá rukavice leží naplocho na kůži
  - displej je za postavami (Honza kreslí stylusem před ním)
  - klientka má u stolu ruce na desce
  - jemnější obrysy vlasů
- **Překryvy linek na ulici:** kontrola není dokončená. Subagent nemohl navázat, hlavní relace opravila jen strom na konci (přesun z x 4180 na 4730, sloup na 4960). Studio prošel subagent celou mřížkou.
- **Moje návrhy, které Honzi nekomentoval:**
  - texty bublin a popisků kroků
  - podoba papouška (ara na větvi, tlumené barvy)
  - kontaktní výzva příběhu skrytá na webu
  - hlavní mustr je `preview-pribeh.html`
  - ruce v detailu jsou podle mě pořád nejslabší místo
  - archanděl ve flash sheetech je stylizovaný, ne realistický
- **Vlastní kresby postav:** Honzi 13. 10. zmínil, že „třeba“ vytvoří postavy sám a jen se nahradí. Nerozhodnuto.
- **Nasazení na živý web** (`index.html`) a otevření pull requestu: nerozhodnuto, Honzi o tom nemluvil.
- **Plynulost na telefonu:** neověřená na skutečném zařízení.

## Zamítnuto a proč

- **První verze** (jednoduchá kresba tuší, panáčci z čar): „extrémně málo detailní, extrémně nekvalitní, odfláknuté“ (6. 11.).
- **Postavy jako figuríny z trubek** se švy v kloubech: nahrazeny plynulými obrysy a anatomickými díly.
- **Drdol a zástěra u Honzy:** Honza nemá culík. Vzhled je podle fotek `img/ja-u-prace.webp` a `img/about.jpg`: krátké vlasy sčesané nahoru, prošedivělý plnovous, tenké kovové brýle, černé tričko, tetované ruce, černé rukavice.
- **Culík klientky:** chce delší vlasy.
- **Lotos se slunečním kruhem a mandaly** na zdech i v tetování: netetuje mandaly.
- **Kočka ve studiu:** alergie.
- **Skokové skrývání plánů podle T:** pozadí „najednou přestane prosvítat“. Teď jsou plány souvislé.
- **Otáčení převrácením siluety:** bylo plochých 2D. Teď vede přes čelní pohled.
- **Nájezd do detailu prolínačkou bez návaznosti:** „není dobrý“. Teď se detail přesně překryje se světovým předloktím.
- **Ruce v detailu:**
  - verze 1: palčáky
  - verze 2: obří černé bloky
  - verze 3: levá ruka svisle jako drápy
- **Hlasy `speechSynthesis` bez nahrávek:** oba stejné, mužské, strojové.

## Stav kontrol

- **6. 11. 2026:** snímky desktop 1440×900 a mobil 390×844 přes celou osu T 0 až 13 i přechod na anděla, konzole bez chyb.
- **Počty prvků světa:** zhruba 4100 až 4300 při T 5,4. Detail ruky má asi 650 prvků.
- **Mřížka snímků ulice pro dokončení kontroly překryvů** (s `--q=nochars=1`):
  - úvod: `"0.5@x,y,480,300"` pro x −700, −400, −100, 200, 500 a y 300 a 560
  - konec: `"12.8@x,y,480,300"` pro x 3600, 3900, 4200, 4500 a y 250 a 560
  - nad střechou studia: `"2.6@1400,150,700,300"` a `"6@2400,140,900,300"`

## První krok

Dokonči kontrolu překryvů linek na ulici podle mřížky ze Stavu kontrol, oprav je v `pribeh/street.js`, slož web přes `build_site.py`, publikuj artefakt jako verzi 5 na stejný odkaz a Honzimu ukaž verzi 5 spolu s otázkou na hlasy.
