# Statistici și profiluri MLS

## Stare

MLS a fost adăugat la v50 în PR #32 și este acum în producție prin commitul `9da9fcb` pe `main`. `npm.cmd test`, toate cele 13 smoke checks și verificările live/vizuale au trecut. Deploy Preview-ul a fost verificat pe profiluri, căutare și pagina Inter Miami.

## Profiluri de jucători

Profilurile se deschid din căutarea globală, loturile echipelor și boxscore. Jucătorii de câmp văd apariții, goluri, pase decisive, șuturi și cartonașe galbene/roșii. Portarii văd apariții, meciuri fără gol primit, șuturi apărate, goluri primite și procentajul șuturilor apărate. Sunt afișate ultimele cinci meciuri când ESPN le oferă; comparația se face între jucători din aceeași categorie.

Abrevierile din tabele sunt explicate sub ele. Endpoint-urile ESPN folosite nu oferă totaluri de carieră MLS în profilul disponibil, așa că pagina nu le inventează și afișează statisticile sezonului.

## Căutare globală

Căutarea include cataloagele de jucători NBA, NFL, NHL și MLS; rezultatele arată liga, echipa și poziția. `node tools/update-player-catalogs.mjs` regenerează cataloagele NFL/NHL/MLS din loturile ESPN.

## Statistici de echipă

Pagina echipei afișează până la cinci repere ESPN: goluri marcate și primite pe meci, șuturi și șuturi pe poartă pe meci și posesie medie. Dacă o medie nu este furnizată direct, este calculată din totalul sezonului și numărul aparițiilor echipei; lipsurile rămân indisponibile, nu zero.

## Verificări

Testul MLS acoperă jucător de câmp și portar, fallback-ul la split-ul MLS din overview, ultimele meciuri, comparații, statisticile echipei și linkurile de profil din roster și boxscore. `npm.cmd test` a trecut local. Endpoint-urile live au fost verificate pe un jucător de câmp, un portar și Inter Miami. În preview, profilurile de jucători și statisticile echipei au fost verificate pe desktop și mobil; pe mobil, temele luminoasă și întunecată au fost verificate fără overflow orizontal.
