# Statistici și profiluri NFL

## Stare

Primul lot NFL este în PR #32 draft pe `stage-32-statistici-nfl-nhl-mls`, aplicația v43. [Deploy Preview-ul](https://deploy-preview-32--americansportshub.netlify.app) a fost verificat pe date live; nu s-a făcut merge în producție. NFL, NHL și MLS rămân pe același branch/PR cumulativ, cu același preview actualizat după fiecare ligă și un singur merge final. MLB este amânat.

## Profilul jucătorului

Profilurile se deschid din numele jucătorilor din boxscore NFL și loturile NFL încărcate. Comparația este disponibilă între jucători din meciurile și loturile deja încărcate, fără catalog global NFL. Sunt afișate informațiile ESPN, statisticile sezonului regulat și carierei, statisticile pe sezoane și ultimele cinci meciuri când sursa le oferă. Linkurile și comparația NBA existente sunt păstrate.

## Metrici avansate și proveniență

ESPN furnizează profilul, statistica oficială a sezonului și logul meciurilor. Pentru metrici avansate, se folosește nflverse:

- ESPN ID → GSIS ID prin datasetul oficial nflverse `players.csv`. Lista recentă de ID-uri este inclusă în `netlify/lib/nfl-player-ids.mjs` și se regenerează cu `node tools/update-nfl-player-ids.mjs`.
- EPA sezonier prin `stats_player_reg_<sezon>.csv`, publicat de nflverse și actualizat după programul de date play-by-play. EPA reprezintă puncte așteptate adăugate; nu este o statistică ESPN.
- QB: passing EPA, EPA/dropback (încercări + sack-uri), CPOE în puncte procentuale și EPA/alergare când există volum.
- RB/FB: rushing EPA/alergare și receiving EPA/țintă; RACR când este disponibil.
- WR/TE: receiving EPA/țintă, ponderea țintelor echipei, ponderea air yards, WOPR și RACR.
- ESPN rămâne sursa pentru apărare și celelalte roluri. nflverse nu oferă EPA per jucător pentru orice poziție; pagina explică lipsa, nu afișează zero-uri ca și cum ar fi măsurători.

Datele pot lipsi sau pot fi corectate de surse. Dacă nflverse nu răspunde, profilul ESPN rămâne disponibil și pagina semnalează că datele EPA nu au putut fi încărcate.

## Verificări

Testele automate acoperă CSV-ul nflverse, maparea ID-urilor, metricile QB/RB/WR, comparația, fallback-ul la căderea sursei și linkurile NFL din boxscore/lot. `npm.cmd test` a trecut. În preview au fost verificate pe date live profilul QB, comparația Mahomes–Josh Allen și mesajul pentru un rol defensiv fără EPA; endpoint-urile RB/WR au returnat metrici disponibile. Profilul a fost verificat pe desktop și telefon, în temele luminoasă/întunecată, fără overflow orizontal. Confirmarea utilizatorului privind actualizarea automată pe telefon după merge-uri este consemnată în plan; preview-ul nu înlocuiește acea verificare pe dispozitivul instalat.
