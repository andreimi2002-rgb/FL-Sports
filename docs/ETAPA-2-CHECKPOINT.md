# Statusul funcțiilor video și al livrărilor ulterioare

Actualizat la 17 noiembrie 2026. Acest document păstrează istoricul retragerii experimentului video; nu descrie o bibliotecă video activă.

## Livrare curentă după NBA

PR #32 a fost merge-uit în `main` la commitul `9da9fcb` (17 noiembrie 2026); v50 este publicată în producție. Lotul include profiluri de jucători de câmp și portari MLS, statistici de echipă și căutare globală NBA/NFL/NHL/MLS. `npm.cmd test`, toate cele 13 smoke checks și verificările vizuale/live din preview au trecut; după merge, toate cele 13 smoke checks și versiunea v50 au fost confirmate în producție. MLB rămâne amânat. Detalii în [PLAN-PERSONAL.md](PLAN-PERSONAL.md), [STATISTICI-NFL.md](STATISTICI-NFL.md), [STATISTICI-NHL.md](STATISTICI-NHL.md) și [STATISTICI-MLS.md](STATISTICI-MLS.md).

## Starea curentă

- Producția rămâne v50. În copia locală, versiunea v51 păstrează playerul ESPN și adaugă pentru fiecare meci terminat un link secundar de căutare YouTube orientat spre rezumate extinse de 5–10 minute. Durata și canalul rezultatului nu sunt garantate; nu există căutare sau colectare în fundal.
- PR #29 a fost merge-uit: atlasul unificat Florida și restaurarea video ESPN stabilă (v37).
- PR #30 a fost merge-uit: Dimineața mea și Mod TV, cu playerul ESPN neatins (v40). Detalii: [DIMINEATA-TV.md](DIMINEATA-TV.md).
- PR #31 a fost merge-uit: primul lot de statistici și profiluri NBA. Titlul PR-ului spune v41; commitul `f3d8ce5` a ridicat codul publicat la v42. Detalii și limite: [STATISTICI-NBA.md](STATISTICI-NBA.md).
- PR #32 a adus codul v50 la `9da9fcb`; documentația a fost sincronizată după merge. NFL a fost adăugat la v46, NHL la v47, iar MLS la v50; `sw.js` și `js/phone.js` au aceeași versiune.
- Verificarea vizuală desktop/mobil și temele luminoasă/întunecată consemnată anterior a fost pentru versiunea v42. Pentru v47, Deploy Preview-ul NHL a fost verificat pe desktop și mobil; pe mobil, ambele teme au fost verificate fără overflow orizontal. Profilurile skater/goalie și pagina de echipă afișează date live ESPN. Pentru v50 MLS, profilurile field player/goalkeeper și pagina Inter Miami au fost verificate în preview pe desktop și mobil; pe mobil, ambele teme au fost verificate, fără overflow orizontal.
- Utilizatorul confirmă că aplicația instalată pe telefon se actualizează automat la deschidere după fiecare merge, fără probleme.

## Video — decizia de retragere din v37

Utilizatorul a raportat lipsa rezumatului NFL și imposibilitatea redării linkului manual. Noua integrare ascundea playerul ESPN stabil și elimina clipurile fără marcaj recap. Experimentul a fost retras integral, nu declarat finalizat.

În producția v50, rezumatul ESPN apare când există; în lipsa lui se păstrează cel mai lung clip disponibil, iar NFL păstrează căutarea externă de dinainte. Schimbarea locală v51 adaugă căutarea YouTube pentru toate meciurile terminate, fără să înlocuiască playerul ESPN. Nu există catalog, colectare periodică, bibliotecă sau player YouTube. Datele locale istorice video nu sunt șterse automat.

Căutarea YouTube este un link extern, nu integrarea unui player cu video lung; un catalog automat și protecția completă contra spoilerelor rămân amânate. Modul existent „Fără spoilere” nu trebuie prezentat ca protecție completă a tuturor suprafețelor.
