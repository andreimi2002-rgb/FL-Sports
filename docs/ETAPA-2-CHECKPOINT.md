# Etapa 2 — v35, video și Game Night

Utilizatorul a amânat explicit extinderea protecției contra spoilerelor. WIP-ul respectiv este păstrat numai pe branch-ul local checkpoint/stage-2-spoilers-wip (d414007); modificările sale sunt retrase din pachetul video. Modul existent rămâne; nu promitem protecție completă în notificări, calendar sau restul aplicației.

## Livrat în cod

- Biblioteca #video: filtre de ligă/moment/sursă, surse urmărite, echipe favorite și clipuri salvate local. Pregame, atmosferă/pauze, studio, postgame, culise și rezumate, în funcție de publicările oficiale.
- 9 canale oficiale verificate, seed de 158 clipuri, collector RSS periodic la 3 ore, retenție 45 zile / 1500 clipuri și Blobs separat producție/preview. RSS are fereastră mică; durata este necunoscută dacă nu poate fi verificată. Nu garantăm rezumate lungi sau toate segmentele pentru fiecare meci.
- Asociere conservatoare după ambele echipe, ligă și dată/publicare. Fără dată explicită: doar sugestie în intervalul 1–18 ore după start. Corectare manuală/reset per meci, alternativă ESPN.
- Player YouTube nocookie încărcat numai la click, link extern dacă embed este restricționat. Clipurile și recomandările din player pot dezvălui rezultate. Preferințele și salvările sunt locale, fără sincronizare.
- Cronul pornește automat numai după un eventual merge aprobat în producție. Preview-ul folosește seed-ul; nu declanșăm producția pentru a testa cronul. VIDEO_COLLECTION_DISABLED=1 oprește colectarea. Costurile Netlify nu sunt garantate gratuite.

## Verificări

- npm test: cititoare ESPN, 14 verificări funcții, ediție personală / actualizare PWA și teste video (linkuri ostile, identitate canal, RSS, durată, asociere și păstrare la căderea surselor).
- Browser local: biblioteca se încarcă din seed când API-ul cade; navigare, filtre studio, salvare și filtrare salvate verificate. Niciun iframe înainte de click; fără erori JavaScript în verificarea respectivă.
- Verificările suplimentare și deploy preview-ul se consemnează după publicarea pe branch. Fără merge în main sau publicare în producție fără acord explicit.

## Surse tehnice

https://developers.google.com/youtube/player_parameters — rel=0 nu elimină toate recomandările.
https://support.google.com/youtube/answer/171780 — player privacy enhanced și restricții de embed.
https://docs.netlify.com/build/functions/scheduled-functions/ — cron UTC, limită 30 secunde, rulare automată numai pe producție.
