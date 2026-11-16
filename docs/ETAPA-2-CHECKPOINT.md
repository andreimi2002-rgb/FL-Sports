# Etapa 2 — punct de reluare local, 17 noiembrie 2026

**În lucru, incomplet, nepublicat.** Același branch `stage-29-harta-florida`, PR #29 draft. Utilizatorul a semnalat că mai are puțin usage; salvăm progresul local și reluăm fără investigații repetate. Nu face push doar pentru acest checkpoint. Preview-ul existent rămâne v34; v35 este rezervată local. Fără merge / producție fără acord explicit. Grupăm întreaga etapă 2 într-o livrare coerentă.

## Ce există

- `js/video-data.js`: nouă canale oficiale NBA/NFL/NHL/MLB/MLS, NBA on ESPN/NBC, NFL Network/Films; categorii Game Night; validarea strictă a linkurilor YouTube; asociere conservatoare după ambele echipe, ligă, data meciului în fusul SUA și publicare. Fără dată explicită, sugestie numai la 1–18 ore după start. Durată necunoscută nu înseamnă rezumat lung.
- `netlify/lib/video-catalog.mjs`: parser RSS, verificarea proprietarului la citirea metadatelor YouTube, îmbinare / retenție 45 zile / maxim 1500 clipuri, păstrarea datelor la căderea sursei. RSS real poate omite prefixul `UC` din `yt:channelId`; acceptăm doar cele două reprezentări exacte ale canalului configurat.
- `video-store.mjs`, `/api/videos`, `video-cron.mjs`: Blobs separat producție/preview, seed JSON de rezervă; GET public fără refresh declanșabil de vizitatori. Cron la 3 ore, 3 feeduri simultan, maxim 6 verificări de durată/rulare. Trebuie încă verificată limita totală de 30 secunde și ambalarea esbuild / JSON în Netlify. `VIDEO_COLLECTION_DISABLED=1` oprește colectarea. Costurile nu sunt garantate gratuite.
- `tools/collect-videos.mjs [--backfill]`: colectare manuală / inițializare din fila oficială `/videos`, exclusiv metadate, verifică proprietarul. Seed real: **158 clipuri, 9 feeduri reușite**, 2 rezumate de minimum 6 minute la ultima colectare. Nu confunda clipurile lungi de studio cu rezumatele lungi. RSS are doar o fereastră recentă; colectarea nu garantează toate meciurile.
- `js/videos.js`: **modul UI neconectat** pentru bibliotecă, categorii, surse urmărite, salvare locală, sugestii per meci, corectare manuală și player click-to-load. Verificat sintactic, **netestat în browser**. Nu apare încă în navigare și nu este în shell-ul offline. Nu îl declara funcțional înainte de integrare și QA. Preferințe `flgames-video-*`, fără sincronizare. Verifică în special numele echipelor Florida și păstrarea playerului la refresh.
- `tools/test-videos.mjs`: URL-uri ostile, identitate canal, RSS, durate verificate, meciuri consecutive / ligi diferite / clipuri scurte și păstrare la erori. Inclus în `npm test`.

## Următoarea muncă, fără a reface cercetarea

1. Conectează `#video` în `index.html`, `views.setView`, `pages.route`, `app.handle`; adaugă stiluri responsive / teme și shell offline. Conectează `gameVideosHtml/loadGameVideos` în pagina meciului, în afara protecției statisticilor. ESPN folosește `v.mp4`, `v.thumb`, `v.title`, `v.dur`; evită dublarea cu video din `game.summaryHtml`.
2. **Fără spoilere complet**: acum protecția existentă ascunde multe rezultate doar prin CSS. `core.sp` trebuie să nu includă rezultatul în DOM când este ascuns; toggle/reveal trebuie să rerandeze. `pages.openGame/refreshGame` nu trebuie să includă statistici, cronica, probabilități, contexte cu scoruri sau detalii de prelungiri când sunt blocate. Atenție la profiluri, clasamente, playoff, forma echipelor, tooltipuri, sharecard și calendar .ics.
3. Notificări: adaugă preferință `nospoil` per abonament și texte neutre final/morning/weekly în `netlify/lib/notify.mjs`; sincronizează fără a cere permisiune nouă și fără a suprascrie alegerile echipelor. Worker-ul trebuie să poată neutraliza payloaduri vechi când modul local este activ; preferința trebuie să supraviețuiască schimbărilor de cache. Nu declara push testat pe dispozitiv real doar din teste Node.
4. Teste API + UI: player fără cereri YouTube înainte de click, linkuri manuale invalide, corectare/reset, salvate după expirarea catalogului, mod fără spoilere (inclusiv DOM/accesibilitate), telefon/desktop/teme/offline. Rulează suita, apoi un singur lot push în PR #29 și verifică același preview. Nu iniția etapa 3 (coadă / văzut / bugete) prematur.

## Surse verificate pentru implementare

- RSS pentru fiecare ID configurat: `https://www.youtube.com/feeds/videos.xml?channel_id=…`.
- [YouTube player parameters](https://developers.google.com/youtube/player_parameters): `rel=0` nu elimină toate recomandările; nu promite ascunderea titlurilor în player.
- [YouTube privacy-enhanced embed](https://support.google.com/youtube/answer/171780): `youtube-nocookie.com`; link extern dacă încorporarea este restricționată.
- [Netlify scheduled functions](https://docs.netlify.com/build/functions/scheduled-functions/): 30 secunde, cron UTC, automat numai pe producție, nu URL public de refresh.

Fișierele scratch cu răspunsurile surselor sunt în directorul părinte `work/`: `feed-*.xml`, `channel-*.html`, `watch-test.html`. Nu se comit. Pentru push autorizat, scriptul local `work/push-map.mjs` evită helperul Git blocat în sandbox fără a afișa tokenul; nu trebuie o nouă autentificare GitHub.
