# American Sports Hub

Ediție personală premium, în română: experiența completă, fără abonament. Direcția de produs public este oprită. [Planul de dezvoltare și verificare](docs/PLAN-PERSONAL.md).

Sportul american pe românește: echipele tale din NBA, NHL, NFL, MLS și MLB (implicit cele din
Florida: Heat, Magic, Panthers, Lightning, Dolphins, Buccaneers, Jaguars, Inter Miami, Orlando City,
Marlins, Rays), cu ora României, scor live, rezultate,
clasamente, profiluri de echipă și pagini de meci. Profilurile și căutarea globală de jucători sunt
disponibile pentru NBA, NFL, NHL și MLS; statisticile de jucători MLB rămân amânate.

- Site static (HTML, CSS, module JavaScript) și funcții Netlify care citesc datele publice ESPN.
  Fără chei API sau servicii plătite pentru datele sportive.
- Statistici de bază pentru jucători NFL/NHL/MLS, statistici de echipă și profiluri/comparații;
  metricile avansate NFL sunt furnizate de nflverse. Detalii în [documentația ligilor](docs/).
- Pagini pentru orașele și stadioanele echipelor, cu vremea (Open-Meteo), clima pe luni și
  poze de pe Wikimedia Commons (cu autor și licență).
- Logo-urile oficiale se încarcă de pe serverul ESPN; proiect pentru uz personal.
- Dacă sursa live nu răspunde, pagina arată ultimele date salvate.

## Rulare locală

```sh
npx netlify dev          # pagina + funcțiile /api/*
# sau doar pagina, cu datele de rezervă:
python -m http.server 8000
```

Testele complete: `npm test`. Verificarea endpoint-urilor live: `node tools/smoke.mjs <URL>`.
