# Statistici și profiluri NBA — v42

NBA a fost primul lot de statistici și profiluri, livrat în PR #31 (cod v42, merge commit `06b099f`). Căutarea globală pentru NBA/NFL/NHL/MLS și profilurile NFL/NHL/MLS au fost adăugate ulterior în PR #32 (v50, acum în producție). MLB/Statcast rămâne amânat. Detalii despre starea curentă și următoarele etape: [PLAN-PERSONAL.md](PLAN-PERSONAL.md).

În pagina meciului, fila Statistici: harta aruncărilor, filtre echipă/jucător/perioadă, FG și eFG pe zone aproximative. Se folosesc punctele ESPN în picioare, x transversal 0–50 și y față de coșul țintă (25,0), limite y -5.25–88.75. Toate atacurile sunt reprezentate către același coș, în stânga, fără a inversa artificial echipele. Coordonatele negative de lângă baseline și aruncările foarte lungi sunt păstrate. Zonele și procentele sunt derivate din faze, nu statistici oficiale de zone NBA. Aruncările libere sunt excluse și ID-urile duplicate eliminate. Date invalide sunt omise și acoperirea este afișată.

Audit real pe toate cele8 meciuri din16 noiembrie2026 (data SUA):

| Meci ESPN | Încercări din faze | Coordonate utilizabile | Lipsă | Neconcordanță cu totalurile oficiale |
|---|---:|---:|---:|---|
| 401909994 | 172 | 172 | 0 | Nu |
| 401909995 | 188 | 188 | 0 | Da |
| 401909996 | 180 | 180 | 0 | Nu |
| 401909997 | 177 | 177 | 0 | Da |
| 401909998 | 185 | 185 | 0 | Da |
| 401909999 | 184 | 184 | 0 | Da |
| 401910000 | 182 | 182 | 0 | Da |
| 401910001 | 172 | 172 | 0 | Da |

Avertismentul este afișat când numărul de încercări sau reușite din hartă diferă față de boxscore. O parte pot fi corecții sau neconcordanțe de echipă; nu ștergem arbitrar evenimente pentru a forța egalitatea. Nu promitem acoperire sezonieră sau istorică dintr-o singură noapte de probă.

Profil NBA: buton pe numele jucătorului din tabelul meciului sau lotul echipei și acces din filtrul hărții. Date biografice, medii sezon/carieră, sezoane, ultimele cinci meciuri când ESPN le oferă, comparație cu jucători din meciurile încărcate sau loturile Florida încărcate. Căutarea globală de jucători a fost adăugată ulterior pentru NBA/NFL/NHL/MLS. Comparația nu este ajustată la posesii, minute sau adversari. Sursa este ESPN, nu model propriu. Lipsurile rămân lipsuri. În modul fără spoilere, statisticile profilului sunt omise; restul aplicației păstrează comportamentul existent.

API `/api/player?league=NBA&id=` validează ID numeric și păstrează rutarea către endpoint-urile ESPN fixe pentru ligă; funcția deservește acum NBA/NFL/NHL/MLS. Profilul de bază este obligatoriu, iar statisticile auxiliare pot fi parțiale. Cache browser 5 minute/CDN 1 oră. Pagina meciului și video ESPN rămân existente.

Teste: normalizare, FT excluse, duplicate, coordonate lipsă/negative, verificare boxscore, eFG, validare API și date parțiale. Testul NBA pentru profil acoperă carieră și lipsa datelor de sezon. `npm test` a trecut în lotul cumulativ v50; Deploy Preview-ul și producția au trecut toate cele 13 smoke checks. Calendarul local folosește snapshot pentru testare; detaliile de meci și profilurile sunt ESPN reale.
