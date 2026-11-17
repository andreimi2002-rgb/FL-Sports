# Statistici și profiluri MLS

## Stare

MLS este implementat la v49 pe branch-ul cumulativ `stage-32-statistici-nfl-nhl-mls`, în PR #32 draft. Testele locale și verificările live ESPN au trecut. Deploy Preview-ul MLS este în curs de verificare; nu s-a făcut merge în producție.

## Profiluri de jucători

Profilurile se deschid din căutarea globală, loturile echipelor și boxscore. Jucătorii de câmp văd apariții, goluri, pase decisive, șuturi și cartonașe galbene/roșii. Portarii văd apariții, meciuri fără gol primit, șuturi apărate, goluri primite și procentajul șuturilor apărate. Sunt afișate ultimele cinci meciuri când ESPN le oferă; comparația se face între jucători din aceeași categorie.

Abrevierile din tabele sunt explicate sub ele. Endpoint-urile ESPN folosite nu oferă totaluri de carieră MLS în profilul disponibil, așa că pagina nu le inventează și afișează statisticile sezonului.

## Căutare globală

Căutarea include cataloagele de jucători NBA, NFL, NHL și MLS; rezultatele arată liga, echipa și poziția. `node tools/update-player-catalogs.mjs` regenerează cataloagele NFL/NHL/MLS din loturile ESPN.

## Statistici de echipă

Pagina echipei afișează până la cinci repere ESPN: goluri marcate și primite pe meci, șuturi și șuturi pe poartă pe meci și posesie medie. Dacă o medie nu este furnizată direct, este calculată din totalul sezonului și numărul aparițiilor echipei; lipsurile rămân indisponibile, nu zero.

## Verificări

Testul MLS acoperă jucător de câmp și portar, fallback-ul la split-ul MLS din overview, ultimele meciuri, comparații, statisticile echipei și linkurile de profil din roster și boxscore. `npm.cmd test` a trecut local. Endpoint-urile live au fost verificate pe un jucător de câmp, un portar și Inter Miami; verificarea vizuală a preview-ului v49 este în curs.
