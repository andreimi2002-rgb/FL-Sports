# Statusul funcțiilor video și al livrărilor ulterioare

Actualizat la 17 noiembrie 2026. Acest document păstrează istoricul retragerii experimentului video; nu descrie o bibliotecă video activă.

## Starea curentă

- PR #29 a fost merge-uit: atlasul unificat Florida și restaurarea video ESPN stabilă (v37).
- PR #30 a fost merge-uit: Dimineața mea și Mod TV, cu playerul ESPN neatins (v40). Detalii: [DIMINEATA-TV.md](DIMINEATA-TV.md).
- PR #31 a fost merge-uit: primul lot de statistici și profiluri NBA. Titlul PR-ului spune v41; commitul `f3d8ce5` a ridicat codul publicat la v42. Detalii și limite: [STATISTICI-NBA.md](STATISTICI-NBA.md).
- `main` public verificat este la commitul `06b099f` (PR #31). `sw.js` și `js/phone.js` sunt v42 atât în `main`, cât și în copia locală. Comparația după normalizarea newline-urilor confirmă că fișierele aplicației coincid; folderul local nu are `.git`, deci nu păstrează branch-ul sau istoricul de commit.
- Testele `npm.cmd test` au trecut pentru copia locală. În browserul local, verificarea vizuală desktop/mobil și temele luminoasă/întunecată au trecut fără overflow orizontal. Serverul static nu include funcțiile Netlify: s-au afișat datele de rezervă, nu date live.
- Utilizatorul confirmă că aplicația instalată pe telefon se actualizează automat la deschidere după fiecare merge, fără probleme.

## Video — decizia de retragere din v37

Utilizatorul a raportat lipsa rezumatului NFL și imposibilitatea redării linkului manual. Noua integrare ascundea playerul ESPN stabil și elimina clipurile fără marcaj recap. Experimentul a fost retras integral, nu declarat finalizat.

Rezumatul ESPN apare când există; în lipsa lui se păstrează cel mai lung clip disponibil, iar NFL păstrează căutarea externă de dinainte. Nu există catalog YouTube, colectare periodică, bibliotecă, link manual sau player YouTube. Datele locale istorice video nu sunt șterse automat.

Extinderea către video lung și protecția completă contra spoilerelor rămân amânate. O reluare necesită întâi o probă reală de acoperire și redare înaintea oricărei integrări. Modul existent „Fără spoilere” nu trebuie prezentat ca protecție completă a tuturor suprafețelor.
