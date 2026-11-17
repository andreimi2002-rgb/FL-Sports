# Dimineața mea și Mod TV

## Extinderea v52 — în PR #33, nepublicată

„Dimineața mea” devine o filă din Ligile; vechea adresă `#dimineata` rămâne funcțională. Rezultatele sunt vizibile peste tot, iar modul fără spoilere a fost retras la cererea utilizatorului. Preferințele vechi nu sunt șterse.

La apăsarea „Pregătește coada”, browserul verifică direct la ESPN meciurile încheiate din ligile alese. Se prioritizează o favorită și un alt meci important când există ambele, apoi celelalte favorite și restul, după criteriile existente de forță a echipelor, playoff și transmisiune, fără scorul final. Clasamentele folosite sunt cele curente, nu istorice. Se verifică progresiv până se atinge bugetul estimat sau se epuizează lista; nu există cereri de descoperire video prin Netlify. Lista de meciuri folosește în continuare `/api/scores`.

Pentru 15, 30 sau 60 de minute se includ doar rezumatele ESPN sigure cu durată cunoscută care încap în bugetul estimat; durata reală poate diferi. Se afișează cât s-a găsit și erorile. Când un rezumat lipsește, are durată necunoscută sau nu încape, se oferă o căutare YouTube externă, fără garanție de durată sau sursă. Redarea începe la cererea utilizatorului; trecerea automată între clipuri poate fi blocată de browser. Dacă redarea eșuează, apare un link YouTube și se poate trece la clipul următor. Nu există player YouTube încorporat, catalog, colectare în fundal sau marcaj „văzut”.

Sursele ESPN sunt neoficiale: disponibilitatea, CORS și drepturile de redare se pot schimba. Verificarea pe dispozitive fizice și în Deploy Preview rămâne necesară.

## Livrarea inițială v40

Livrat în PR #30 și în producție; documentul de mai jos păstrează scopul și verificările de la etapa inițială.

Branch stage-30-dimineata-tv, bază main 69c0856. Toate cele cinci ligi, nu numai favoritele; favoritele sunt ordonate primele fără a exclude alte echipe. Zi implicită: ziua calendaristică precedentă din SUA (America/New_York); selectorul spune explicit că este data SUA. În listă intră meciuri încheiate sau live, nu cele care n-au început.

Mod TV mărește cardurile și lățimea paginii. Săgețile deplasează focusul după poziția pe ecran, Enter deschide pagina existentă a meciului, Escape închide întâi pagina meciului și apoi modul TV. Nu presupunem compatibilitate cu orice browser/telecomandă smart TV; se verifică separat pe dispozitiv.

Se reutilizează /api/scores; o cerere pe zi la intrare, fără preîncărcarea clipurilor fiecărui meci. Erorile parțiale sunt semnalate. Datele ultimei zile încărcate sunt salvate pentru fallback, etichetate cu momentul salvării; nu sunt prezentate drept live la căderea rețelei. Filtrele ligilor sunt persistente pe dispozitiv. Mod TV nu cere fullscreen sau permisiuni.

Playerul ESPN nu este modificat. Clipurile apar numai dacă ESPN le furnizează; nu promitem video pentru toate meciurile/NFL. Nu se reintroduce Game Night sau YouTube. Protecția completă contra spoilerelor, coada, văzut și bugetele de timp nu fac parte din această livrare. Noul ecran respectă preferința existentă prin omiterea scorurilor din HTML când este activă.

Verificare la livrare: `npm test` și `tools/test-morning.mjs`; limite de fus orar SUA, an bisect, filtre, meciuri live/încheiate și favorite care nu exclud restul. Browser local cu date ESPN reale pentru 16 noiembrie: 11 meciuri, favorite primele și meciuri ale altor echipe, Mod TV, focus săgeți fără overflow. Etapa a fost merge-uită după acordul utilizatorului.

Indicele experimental v39 este retras integral la cererea utilizatorului. Nu se mai fac cereri de analiză și nu se mai calculează punctaje.
