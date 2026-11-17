<!-- Decizie curentă v37: experimentul YouTube/Game Night este retras la cererea utilizatorului după regresii. Video ESPN este restaurat exact ca în f7ce1f8: rezumat, altfel cel mai lung clip disponibil; căutare externă NFL existentă. Atlasul v34 rămâne. Nu declara etapa video lung finalizată. -->
<!-- Actualizare de scop v36: la cererea utilizatorului, Game Night și biblioteca sunt eliminate. Păstrăm numai rezumate în pagina fiecărui meci, alternativă ESPN și corectare manuală. Protecția completă contra spoilerelor rămâne amânată. Secțiunile despre Game Night de mai jos sunt istoric. -->
# American Sports Hub — plan personal

Decizia utilizatorului: dezvoltăm ediția personală completă, cu logo-uri oficiale și funcțiile existente. Păstrăm HTML/CSS/module ES, funcțiile Netlify și interfața în română. Fără rescriere inițială, servicii plătite sau chei pentru sursele sportive. Cheile VAPID existente rămân infrastructura notificărilor, nu o nouă sursă de date.

## Baza verificată

La 17 noiembrie 2026 au fost inspectate toate cele 26 de branch-uri remote. `stage-27-jucator` (`0c4a0c2`, 15 noiembrie) este cel mai recent și descinde din `main` (`c936956`). Diferența este corecția care afișează faza ESPN cea mai lungă până apare rezumatul, plus versiunile v31. Nu există un branch separat „premium”; modul web al acestei baze are experiența completă, iar modul Store restrângea imaginile și video.

GitHub este accesibil prin integrarea conectată, cu drepturi de push; repository-ul este public. Netlify `americansportshub` (ID `5984e473-c0e3-4009-8687-d6542704c477`) este asociat cu `andreimi2002-rgb/FL-Sports`. Production branch: `main`. Branch deploys: numai producția. Deploy Previews: orice PR către production branch. Nu trebuie reconfigurat pentru fluxul acceptat. PR #27 are un preview istoric reușit.

Ediția personală nu introduce autentificare și nu modifică vizibilitatea repository-ului ori a site-ului. Indexarea este descurajată prin `noindex` și `robots.txt`; acestea nu restrâng accesul.

## Etape, în ordinea acceptată

1. **Stabilizare personală** — `stage-28-personal-premium`, v32. Florida implicită fără marcaj de proprietar; păstrăm lista personală existentă, identificatorii, scorurile, clasamentele, profilurile, calendarul, notificările, instalarea, offline, video și probabilitățile. Logo-uri, imagini și video ESPN disponibile inclusiv cu marcaj Store vechi. Scoatem beta publică, donații, feedback, promovarea Store și telemetria. `/api/hit` și `/api/feedback` întorc 410 inclusiv pentru clienți vechi; statisticile istorice și pagina administrativă protejată rămân pentru arhivă. Listele vechi New York rămân în stocarea browserului; lista personală Florida nu se suprascrie. Verificăm versiunile egale, actualizarea online/offline și protecția contra reîncărcărilor repetate, apoi UI în ambele teme și dimensiuni.
2. **Video lung și fără spoilere** — descoperire de pe canale YouTube oficiale, asociere după ambele echipe și data meciului, alternativă ESPN și corectare manuală. Colectare periodică și stocare: RSS are o fereastră scurtă și nu oferă durata. Nu promitem rezumat lung sau încorporare pentru fiecare meci. Ascundem rezultatele inclusiv în notificări, titluri, texte și celelalte suprafețe ale aplicației; verificăm expunerile înainte de a numi modul complet.
3. **Dimineața mea** — rezumatele favoritelor, coadă, marcaj văzut, bugete de 15/30/60 minute și interfață potrivită ecranelor mari. Refolosim infrastructura existentă de favorite și rezumat matinal.
4. **Indice de spectacol** — recomandări fără scor din oscilațiile probabilității, echilibru și tensiunea finalului. Formule pe sport. Calcul din seria completă, înainte de reducerea punctelor pentru grafic; explicăm datele lipsă și limitele.
5. **Statistici și jucători** — NBA: verificăm completitudinea coordonatelor ESPN înainte de harta aruncărilor/eficiență. NHL: evenimente și coordonate disponibile; evaluăm separat sursa sau modelul xG. NFL: EPA din nflverse. MLB: Statcast. Profiluri, carieră, ultimele meciuri și comparații, după probe de acoperire.
6. **Fotbal european** — Premier League, Champions League, Liga 1; probe reale de acoperire, în special Liga 1, înainte de promisiuni. Secțiunea existentă Europa/evenimente se păstrează.
7. **Arhivă și finisaje** — meciuri favorite, note, jucători urmăriți, explicații și sincronizarea preferințelor. Alegem stocarea și modelul de sincronizare când ajungem aici.

## Extinderi acceptate după etapa 1

- **Game Night**, în etapele video / Dimineața mea: întregul spectacol NBA și NFL — studio, pregame, încălzire, prezentări, atmosferă, halftime, interviuri, vestiar și postgame. Bibliotecă pe ligă și materiale legate de meci atunci când asocierea este sigură. Surse oficiale și redare încorporată numai când este permisă; link spre sursă pentru conținutul integral din servicii cu abonament. Rămâne de implementat; nu garantăm fiecare segment pentru fiecare meci.
- **Redesign mic, începând cu harta Floridei**: `stage-29-harta-florida`, v34. Atlas cu contur geografic static (U.S. Census via us-atlas 3.0.1), patru zone sportive, selecție prin hartă sau butoane, echipe, stadion în prim-plan și următorul meci. Păstrăm accesul la toate stadioanele, meciurile și orașele zonei. Fără SDK de hartă, cheie API sau cereri geografice la utilizare; geometria se regenerează cu `node tools/build-florida-map.mjs`. Verificăm selecția, tastatura, temele, ecranele mici și cache-ul offline. Secțiunile Orașe/stadioane/vreme și Hartă sunt unificate; vremea se cere doar pentru orașul selectat, când atlasul este vizibil, cu cache și protecție contra cererilor repetate. Preview înainte de merge, în cadrul etapei mari 2.

## Flux de livrare

Etapa 2 v35 livrează video și Game Night. Utilizatorul a mutat protecția completă contra spoilerelor într-o etapă separată; modul existent rămâne, cu limitele lui. Starea verificărilor și limitările sunt în [ETAPA-2-CHECKPOINT.md](ETAPA-2-CHECKPOINT.md).

Un branch / PR pe **etapă mare**, cu baza `main`, pentru a reduce publicările în producție. PR #29 (`stage-29-harta-florida`) rămâne draft și acumulează atlasul și întreaga etapă 2: video lung, fără spoilere și Game Night. Fără merge pentru fiecare îmbunătățire. Verificăm local și facem push în loturi coerente; actualizăm același PR și același Deploy Preview. După finalizarea și verificarea întregii etape 2, cerem acord explicit pentru un singur merge. Nu garantăm tarife sau gratuitatea tuturor resurselor de preview.

La orice schimbare a fișierelor aplicației creștem atât `VERSION` din `sw.js`, cât și `APP_VERSION` din `js/phone.js`. Nu schimbăm cheile `flgames-*`, UID-urile calendarului sau adresa producției. Un preview are propriul origin: preferințele și abonamentele de producție nu apar automat acolo.

## Verificare etapa 1

- `npm test`: cititoare ESPN, funcții simulate, ediția personală cu marcaj Store, logo/video și cronica completă, telemetrie inactivă, actualizare la versiune diferită, offline, limitarea verificărilor și protecția contra buclelor.
- Browser local cu sursa live indisponibilă: programul de rezervă, navigare, teme, desktop și telefon. Este un test al rezervei, nu dovada datelor live.
- După PR: `node tools/smoke.mjs <preview>` și verificare vizuală cu date reale. Verificăm versiunea v32 și endpoint-urile retrase. Notificarea push reală și revenirea în aplicația iPhone necesită dispozitivul utilizatorului; simularea nu le înlocuiește.
