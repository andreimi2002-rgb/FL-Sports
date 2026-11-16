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

## Flux de livrare

Un branch și PR pe etapă, cu baza `main`. Pentru etape dependente încă neintegrate păstrăm explicit baza și diferențele cumulative în PR; nu aruncăm funcții pentru a micșora diff-ul. Teste locale, server local și capturi; push, PR și verificarea preview-ului automat. Trimitem linkul utilizatorului pentru testare. Merge-ul și orice publicare în producție cer acord explicit.

La orice schimbare a fișierelor aplicației creștem atât `VERSION` din `sw.js`, cât și `APP_VERSION` din `js/phone.js`. Nu schimbăm cheile `flgames-*`, UID-urile calendarului sau adresa producției. Un preview are propriul origin: preferințele și abonamentele de producție nu apar automat acolo.

## Verificare etapa 1

- `npm test`: cititoare ESPN, funcții simulate, ediția personală cu marcaj Store, logo/video și cronica completă, telemetrie inactivă, actualizare la versiune diferită, offline, limitarea verificărilor și protecția contra buclelor.
- Browser local cu sursa live indisponibilă: programul de rezervă, navigare, teme, desktop și telefon. Este un test al rezervei, nu dovada datelor live.
- După PR: `node tools/smoke.mjs <preview>` și verificare vizuală cu date reale. Verificăm versiunea v32 și endpoint-urile retrase. Notificarea push reală și revenirea în aplicația iPhone necesită dispozitivul utilizatorului; simularea nu le înlocuiește.
