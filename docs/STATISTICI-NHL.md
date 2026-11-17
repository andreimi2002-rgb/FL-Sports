# Statistici și profiluri NHL

## Stare

NHL este implementat la v47 pe branch-ul cumulativ `stage-32-statistici-nfl-nhl-mls`, în PR #32 draft. [Deploy Preview-ul](https://deploy-preview-32--americansportshub.netlify.app) a trecut toate cele 13 smoke checks; au fost verificate profilurile live skater/goalie, căutarea NBA/NFL/NHL, statisticile Florida Panthers și afișarea desktop/mobil. Nu s-a făcut merge în producție. NFL este descris în [STATISTICI-NFL.md](STATISTICI-NFL.md); planul etapelor este în [PLAN-PERSONAL.md](PLAN-PERSONAL.md).

## Profiluri de jucători

Profilurile se deschid din căutarea globală, loturile NHL și boxscore. Jucătorii de câmp văd meciuri jucate, goluri, pase decisive, puncte, +/- și șuturi; portarii văd meciuri, victorii, înfrângeri, GAA, SV% și shutouts. Sunt incluse statisticile sezonului regulat și carierei, ultimele cinci meciuri când ESPN le oferă și istoricul expandabil pe ultimii cinci ani. Comparația este limitată la aceeași categorie (jucători de câmp sau portari).

Pentru jucătorii de câmp, procentajul la șuturi este afișat ca metrică de eficiență și explicat. Pentru centre se afișează și procentajul angajamentelor câștigate, când sursa îl oferă. xG nu este afișat: endpoint-urile ESPN folosite nu îl furnizează, iar o sursă externă și o mapare fiabilă a jucătorilor nu au fost validate.

## Căutare globală

Căutarea încarcă cataloagele ESPN NBA, NFL, NHL și MLS; rezultatele afișează liga, echipa și poziția. `node tools/update-player-catalogs.mjs` regenerează cataloagele NFL/NHL/MLS din loturile ESPN. MLB se adaugă când profilurile sale sunt implementate, ca rezultatele să nu trimită spre pagini inexistente.

## Statistici de echipă

Pagina echipei afișează cinci repere ESPN: goluri marcate/meci, goluri primite/meci, șuturi/meci, șuturi primite/meci și procentajul angajamentelor câștigate. Lipsurile sunt tratate ca indisponibile, nu ca zero.

## Verificări

Testele NHL acoperă profil skater și goalie, statistici de sezon/carieră și meciuri recente, eficiență, comparație, statistici de echipă și linkuri către profil din roster și boxscore. `npm.cmd test` a trecut local pentru v47; smoke checks și verificarea live în browser au trecut pe preview. Pe mobil (390 px), profilul nu depășește viewport-ul; temele luminoasă și întunecată au fost verificate fără overflow orizontal.
