# Etapa statistici și jucători — NBA, v41

Branch stage-31-statistici-jucatori din main c17c95b (v40). Primul lot al etapei mari: NBA. NHL/xG, NFL/EPA și MLB/Statcast nu sunt încă implementate. Nu revenim la indice sau experimentul YouTube. Fără merge/producție fără acord explicit.

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

Profil NBA: buton pe numele jucătorului din tabelul meciului sau lotul echipei și acces din filtrul hărții. Date biografice, medii sezon/carieră, sezoane, ultimele5 meciuri când ESPN le oferă, comparație cu jucători din meciurile încărcate sau loturile Florida încărcate. Fără căutare globală de jucători în acest lot. Comparația nu este ajustată la posesii, minute sau adversari. Sursa este ESPN, nu model propriu. Lipsurile rămân lipsuri. În modul fără spoilere, statisticile profilului sunt omise; restul aplicației păstrează comportamentul existent.

API /api/player?id= validează ID numeric și folosește numai endpoint-uri NBA fixe; profilul de bază este obligatoriu, statisticile auxiliare pot fi parțiale. Cache browser5min/CDN1h. Pagina meciului și video ESPN rămân existente.

Teste: normalizare, FT excluse, duplicate, coordonate lipsă/negative, verificare boxscore, eFG, validare API și date parțiale. Local: profil/carieră/ultimele meciuri, filtru Franz Wagner/S2 și comparație. Calendarul local folosește snapshot pentru testare; detaliile de meci și profilurile sunt ESPN reale. Verificarea finală se face în Deploy Preview.
