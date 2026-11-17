# Dimineața mea și Mod TV — v40

Branch stage-30-dimineata-tv, bază main 69c0856. Toate cele cinci ligi, nu numai favoritele; favoritele sunt ordonate primele fără a exclude alte echipe. Zi implicită: ziua calendaristică precedentă din SUA (America/New_York); selectorul spune explicit că este data SUA. În listă intră meciuri încheiate sau live, nu cele care n-au început.

Mod TV mărește cardurile și lățimea paginii. Săgețile deplasează focusul după poziția pe ecran, Enter deschide pagina existentă a meciului, Escape închide întâi pagina meciului și apoi modul TV. Nu presupunem compatibilitate cu orice browser/telecomandă smart TV; se verifică separat pe dispozitiv.

Se reutilizează /api/scores; o cerere pe zi la intrare, fără preîncărcarea clipurilor fiecărui meci. Erorile parțiale sunt semnalate. Datele ultimei zile încărcate sunt salvate pentru fallback, etichetate cu momentul salvării; nu sunt prezentate drept live la căderea rețelei. Filtrele ligilor sunt persistente pe dispozitiv. Mod TV nu cere fullscreen sau permisiuni.

Playerul ESPN nu este modificat. Clipurile apar numai dacă ESPN le furnizează; nu promitem video pentru toate meciurile/NFL. Nu se reintroduce Game Night sau YouTube. Protecția completă contra spoilerelor, coada, văzut și bugetele de timp nu fac parte din această livrare. Noul ecran respectă preferința existentă prin omiterea scorurilor din HTML când este activă.

Verificare: npm test și tools/test-morning.mjs; limite de fus orar SUA, an bisect, filtre, meciuri live/încheiate și favorite care nu exclud restul. Browser local cu date ESPN reale pentru 16 noiembrie: 11 meciuri, favorite primele și meciuri ale altor echipe, Mod TV, focus săgeți fără overflow. Verificarea finală se face pe același Deploy Preview al etapei. Merge numai cu acord explicit.

Indicele experimental v39 este retras integral la cererea utilizatorului. Nu se mai fac cereri de analiză și nu se mai calculează punctaje.
