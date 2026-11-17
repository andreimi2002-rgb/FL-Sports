# Statusul funcțiilor video și al livrărilor ulterioare

Actualizat la 17 noiembrie 2026. Acest document păstrează istoricul retragerii experimentului video; nu descrie o bibliotecă video activă.

## Livrare curentă după NBA

PR #32 rămâne draft pe `stage-32-statistici-nfl-nhl-mls`, fără merge în producție. NFL a fost adăugat la v46, NHL la v47, iar MLS este implementat local la v48. Include profiluri de jucători de câmp și portari, statistici de echipă și căutare globală pentru NBA/NFL/NHL/MLS. `npm.cmd test` a trecut local, iar endpoint-urile live ESPN au fost verificate pentru profiluri MLS și Inter Miami. Preview-ul MLS urmează să fie actualizat și verificat; până atunci, verificarea vizuală rămâne cea a etapei NHL: profiluri skater/goalie, căutare, statisticile Florida Panthers și layout desktop/mobil. Nu s-a făcut merge în producție. MLB rămâne amânat. Detalii în [PLAN-PERSONAL.md](PLAN-PERSONAL.md), [STATISTICI-NFL.md](STATISTICI-NFL.md), [STATISTICI-NHL.md](STATISTICI-NHL.md) și [STATISTICI-MLS.md](STATISTICI-MLS.md).

## Starea curentă

- PR #29 a fost merge-uit: atlasul unificat Florida și restaurarea video ESPN stabilă (v37).
- PR #30 a fost merge-uit: Dimineața mea și Mod TV, cu playerul ESPN neatins (v40). Detalii: [DIMINEATA-TV.md](DIMINEATA-TV.md).
- PR #31 a fost merge-uit: primul lot de statistici și profiluri NBA. Titlul PR-ului spune v41; commitul `f3d8ce5` a ridicat codul publicat la v42. Detalii și limite: [STATISTICI-NBA.md](STATISTICI-NBA.md).
- `main` public verificat pentru PR #31 este la commitul `06b099f` (cod v42). Branch-ul cumulativ PR #32 a continuat cu NFL la v46, NHL la v47 și MLS la v48; `sw.js` și `js/phone.js` trebuie să aibă aceeași versiune.
- Verificarea vizuală desktop/mobil și temele luminoasă/întunecată consemnată anterior a fost pentru versiunea v42. Pentru v47, Deploy Preview-ul NHL a fost verificat pe desktop și mobil; pe mobil, ambele teme au fost verificate fără overflow orizontal. Profilurile skater/goalie și pagina de echipă afișează date live ESPN. Verificarea vizuală MLS este în așteptarea actualizării preview-ului.
- Utilizatorul confirmă că aplicația instalată pe telefon se actualizează automat la deschidere după fiecare merge, fără probleme.

## Video — decizia de retragere din v37

Utilizatorul a raportat lipsa rezumatului NFL și imposibilitatea redării linkului manual. Noua integrare ascundea playerul ESPN stabil și elimina clipurile fără marcaj recap. Experimentul a fost retras integral, nu declarat finalizat.

Rezumatul ESPN apare când există; în lipsa lui se păstrează cel mai lung clip disponibil, iar NFL păstrează căutarea externă de dinainte. Nu există catalog YouTube, colectare periodică, bibliotecă, link manual sau player YouTube. Datele locale istorice video nu sunt șterse automat.

Extinderea către video lung și protecția completă contra spoilerelor rămân amânate. O reluare necesită întâi o probă reală de acoperire și redare înaintea oricărei integrări. Modul existent „Fără spoilere” nu trebuie prezentat ca protecție completă a tuturor suprafețelor.
