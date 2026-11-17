# Statistici și profiluri NFL

## Stare

NFL a fost adăugat la v46 în PR #32, împreună cu NHL și MLS, apoi tot lotul a fost merge-uit în `main` la commitul `9da9fcb`. Preview-ul NFL a fost verificat pe date live; v50 în producție a trecut toate cele 13 smoke checks. MLB este amânat.

## Profilul jucătorului

Profilurile se deschid din căutarea globală, boxscore NFL și loturile încărcate. Catalogul NFL este inclus în căutare; comparația rămâne limitată la jucătorii din meciurile și loturile deja încărcate. Tabelele ESPN afișează numai statisticile de bază relevante poziției: pase și, când există, alergare pentru QB; alergare/recepții pentru RB; recepții pentru WR/TE; placaje/sack-uri/interceptări pentru apărare; field goal-uri, extra-point-uri și puncte pentru kickeri; media și plasările în 20 de yarzi pentru punteri. Sunt păstrate sezonul regulat, cariera, ultimele cinci meciuri și un istoric expandabil cu ultimii cinci ani. Linkurile și comparația NBA existente sunt păstrate.

## Metrici avansate și proveniență

ESPN furnizează profilul, statistica oficială a sezonului și logul meciurilor. Pentru metrici avansate, se folosește nflverse:

- ESPN ID → GSIS ID prin datasetul oficial nflverse `players.csv`. Lista recentă de ID-uri este inclusă în `netlify/lib/nfl-player-ids.mjs` și se regenerează cu `node tools/update-nfl-player-ids.mjs`.
- EPA sezonier prin `stats_player_reg_<sezon>.csv`, publicat de nflverse și actualizat după programul de date play-by-play. EPA reprezintă puncte așteptate adăugate; nu este o statistică ESPN.
- În interfață, QB: EPA/dropback și CPOE; RB/FB/HB: EPA/alergare și EPA/țintă; WR/TE: EPA/țintă și ponderea țintelor echipei. Sunt afișate cel mult două metrici esențiale pe rol, fiecare cu o explicație scurtă.
- ESPN rămâne sursa pentru apărare și celelalte roluri. nflverse nu oferă EPA per jucător pentru orice poziție; pagina explică lipsa, nu afișează zero-uri ca și cum ar fi măsurători.

Datele pot lipsi sau pot fi corectate de surse. Dacă nflverse nu răspunde, profilul ESPN rămâne disponibil și pagina semnalează că datele EPA nu au putut fi încărcate.

## Statistici de echipă

Rezumatul NFL afișează cinci repere ESPN: puncte pe meci, yarzi din pase pe meci, yarzi din alergare pe meci, sack-uri pe meci și interceptări în sezon. La lipsa răspunsului, pagina arată indisponibilitatea explicit; încărcarea datelor proaspete ocolește cache-ul HTTP al browserului, păstrând cache-ul offline al service worker-ului.

## Verificări

Testele automate acoperă CSV-ul nflverse, maparea ID-urilor, metricile QB/RB/WR, comparația, fallback-ul la căderea sursei și linkurile NFL din boxscore/lot. `npm.cmd test` și `node tools/smoke.mjs https://deploy-preview-32--americansportshub.netlify.app` au trecut. În preview au fost verificate pe date live profilul QB, comparația Mahomes–Josh Allen, rolul defensiv fără EPA și statisticile de bază Miami Dolphins pe pagina echipei. Verificarea anterioară pe desktop/telefon și ambele teme rămâne înregistrată; preview-ul nu înlocuiește verificarea utilizatorului pe dispozitivul instalat.
