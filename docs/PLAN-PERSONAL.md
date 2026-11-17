<!-- Stare curentă: PR #28 (v32), PR #29 (v37), PR #30 (v40) și PR #31 (titlu v41, cod v42) sunt livrate. PR #32 este draft pe branch-ul cumulativ NFL/NHL/MLS; codul MLS este acum la v49, iar preview-ul urmează să fie verificat. -->
<!-- Decizie video: experimentul YouTube/Game Night a fost retras după regresii. Rămâne playerul ESPN stabil: rezumat când există, altfel cel mai lung clip disponibil; căutarea externă NFL existentă. Video lung și protecția completă contra spoilerelor sunt amânate. -->
<!-- Actualizare de scop v36: Game Night și biblioteca au fost eliminate la cererea utilizatorului. Păstrăm numai rezumatele din pagina meciului și alternativa ESPN. Secțiunile istorice despre Game Night nu descriu funcționalități active. -->
# American Sports Hub — plan personal

Decizia utilizatorului: dezvoltăm ediția personală completă, cu logo-uri oficiale și funcțiile existente. Păstrăm HTML/CSS/module ES, funcțiile Netlify și interfața în română. Fără rescriere inițială, servicii plătite sau chei pentru sursele sportive. Cheile VAPID existente rămân infrastructura notificărilor, nu o nouă sursă de date.

## Baza verificată

La 17 noiembrie 2026, cel mai recent merge public verificat este PR #31, commit `06b099f` pe `main`: primul lot NBA (titlul PR indică v41, codul publicat este v42). Marcajele v42 au fost introduse în commitul `f3d8ce5` („Add NBA roster players to global search”), inclus în PR #31. PR #28 (ediția personală, v32), PR #29 (atlas și video ESPN stabil, v37) și PR #30 (Dimineața mea și Mod TV, v40) sunt de asemenea merge-uite. Comparația fișierelor după normalizarea newline-urilor confirmă că sursa aplicației locale coincide cu `main`. Directorul local nu conține `.git`, deci branch-ul și istoricul local nu pot fi recuperate din această copie.

GitHub este accesibil prin integrarea conectată, cu drepturi de push; repository-ul este public. Netlify `americansportshub` (ID `5984e473-c0e3-4009-8687-d6542704c477`) este asociat cu `andreimi2002-rgb/FL-Sports`. Production branch: `main`. Branch deploys: numai producția. Deploy Previews: orice PR către production branch. Nu trebuie reconfigurat pentru fluxul acceptat. PR #27 are un preview istoric reușit.

Ediția personală nu introduce autentificare și nu modifică vizibilitatea repository-ului ori a site-ului. Indexarea este descurajată prin `noindex` și `robots.txt`; acestea nu restrâng accesul.

## Etape, în ordinea acceptată

1. **Stabilizare personală — finalizată în PR #28 (v32).** Florida implicită fără marcaj de proprietar; păstrăm preferințele și identificatorii existenți, datele sportive, calendarul, notificările, instalarea și offline. Beta publică, donațiile, feedback-ul și telemetria sunt retrase; `/api/hit` și `/api/feedback` răspund cu 410 inclusiv pentru clienți vechi. Testele automate `npm.cmd test` au trecut pe copia locală v42 la 17 noiembrie. Utilizatorul confirmă că aplicația instalată pe telefon se actualizează automat la deschidere după fiecare merge, fără probleme. v32 este versiunea livrării PR #28, nu versiunea curentă a copiei locale.
2. **Video lung și protecție completă contra spoilerelor — amânate.** Experimentul YouTube/Game Night a fost retras după regresii. Rămâne video ESPN stabil: rezumat când există, altfel clipul disponibil cel mai lung; pentru NFL se păstrează căutarea externă existentă. Nu există catalog YouTube, colectare periodică, bibliotecă sau link manual. Modul fără spoilere existent nu acoperă încă toate suprafețele aplicației.
3. **Dimineața mea și Mod TV — livrate în PR #30 (v40), cu scop restrâns.** Afișează meciurile încheiate/live din ligile alese pentru o zi SUA, cu favoritele prioritizate fără să excludă alte echipe, plus Mod TV cu navigare din tastatură. Nu include coadă, marcaj „văzut” sau bugete de timp. Detalii și verificări în [DIMINEATA-TV.md](DIMINEATA-TV.md).
4. **Indice de spectacol — retras.** Experimentul v39 a fost eliminat la cererea utilizatorului și nu face parte din produs.
5. **Statistici și pagini de jucători — în extindere.** NBA a fost livrat în PR #31 (titlu v41, codul aplicației v42): hartă de aruncări și profiluri/comparații; limitele sunt în [STATISTICI-NBA.md](STATISTICI-NBA.md). NFL (v46) și NHL (v47) sunt în PR #32 draft. MLS este implementat local la v49: profiluri pentru jucători de câmp și portari, statistici de echipă și căutare globală. MLS afișează doar reperele de bază, explicate sub tabele; nu inventează statistici de carieră pe care ESPN nu le oferă. Testele automate și verificările API live au trecut; verificarea Deploy Preview-ului MLS este în curs. Detalii: [NFL](STATISTICI-NFL.md), [NHL](STATISTICI-NHL.md) și [MLS](STATISTICI-MLS.md). MLB/Statcast rămâne amânat.
6. **Fotbal european** — Premier League, Champions League, Liga 1; probe reale de acoperire, în special Liga 1, înainte de promisiuni. Secțiunea existentă Europa/evenimente se păstrează.
7. **Arhivă și finisaje** — meciuri favorite, note, jucători urmăriți, explicații și sincronizarea preferințelor. Alegem stocarea și modelul de sincronizare când ajungem aici.

## Decizii și extinderi

- **Atlas Florida — livrat în PR #29 (v37).** Geometrie statică, patru zone sportive și selecție prin hartă sau butoane; fără SDK/cheie API și fără cereri geografice la utilizare. Secțiunile despre orașe/stadioane și hartă sunt unificate; vremea se cere pentru orașul selectat. PR #29 nu mai este în lucru.
- Video ESPN stabil rămâne disponibil; nu reluăm un catalog YouTube/Game Night fără o probă reală de acoperire și redare și o decizie nouă.

## Flux de livrare

Etapele livrate recent sunt PR #29–#31; starea video și limitele experimentului retras sunt consemnate în [ETAPA-2-CHECKPOINT.md](ETAPA-2-CHECKPOINT.md). Video lung și protecția completă contra spoilerelor nu sunt livrate.

PR #29 (atlas, v37), PR #30 (Dimineața mea/Mod TV, v40) și PR #31 (primul lot NBA; codul aplicației v42) sunt merge-uite. PR #32 rămâne draft. Pentru NFL → NHL → MLS, lucrăm pe branch-ul cumulativ `stage-32-statistici-nfl-nhl-mls` și un singur PR către `main`; același Deploy Preview se actualizează după fiecare ligă și se verifică separat. Preview-urile NFL și NHL au fost verificate; verificarea preview-ului MLS este în curs. Merge-ul în producție se face o singură dată, la finalul celor trei ligi și numai după acordul utilizatorului. MLB rămâne în afara acestui PR. Nu garantăm tarife sau gratuitatea tuturor resurselor de preview.

La orice schimbare a fișierelor aplicației creștem atât `VERSION` din `sw.js`, cât și `APP_VERSION` din `js/phone.js`. Nu schimbăm cheile `flgames-*`, UID-urile calendarului sau adresa producției. Un preview are propriul origin: preferințele și abonamentele de producție nu apar automat acolo.

## Verificare etapa 1

- `npm.cmd test` a trecut pe copia locală v42 (aceeași sursă ca `main`) înainte de începerea lotului NFL: cititoare ESPN, funcții simulate, ediție personală, endpoint-uri retrase, actualizare, offline, Dimineața mea și NBA.
- Verificare vizuală locală: desktop și mobil, teme luminoasă și întunecată; fără overflow orizontal. Serverul static nu include funcțiile Netlify, așa că aplicația a afișat datele de rezervă și mesajul de indisponibilitate live. Aceasta verifică interfața/fallback-ul, nu datele live.
- Utilizatorul confirmă actualizarea automată pe telefon la deschidere după merge-uri. Notificările push reale rămân o verificare separată; simularea nu le înlocuiește.
- Pentru testarea live a funcțiilor se folosește `node tools/smoke.mjs <preview>` pe un Deploy Preview disponibil. Nu se mai verifică o versiune fixă v32: versiunea trebuie să fie egală între `sw.js` și `js/phone.js`.
