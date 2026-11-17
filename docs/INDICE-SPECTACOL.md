# Indice de spectacol — versiune experimentală 1, aplicație v39

În același PR30, fără merge. Acoperire verificată punctual pe ESPN: NBA 401909994 (489 puncte), NFL 401873065 (185), NHL 401892726 (fără serie). MLS/MLB neconfirmate în probele folosite. Scorurile sunt disponibile numai NBA/NFL, numai pentru meciuri încheiate. Nu extrapolăm după marja scorului final pentru celelalte ligi.

Calculul din netlify/lib/excitement.mjs primește seria brută j.winprobability, înainte de winProbability(j) care simplifică graficul. Punctele invalide se exclud; dacă mai mult de 10% sunt invalide, rezultatul este indisponibil. Minimum NBA40/NFL20 puncte și ultimul punct în [0,.02] sau [.98,1]. Aceste verificări NU garantează că ESPN a trimis fiecare fază sau începutul seriei.

Echilibru = media 1-2*abs(p-.5); tensiune finală = aceeași medie în ultimele 20% din evenimente; oscilații = min(1, suma abs(p[i]-p[i-1])/scala). Scor 0–100 rotunjit. NBA: 45% echilibru, 30% tensiune, 25% oscilații, scala8; NFL: 30/40/30%, scala4. Parametri euristici, necalibrați pe studii sau preferințe ale utilizatorului. Ponderea este per eveniment, NU temporală; densitatea înregistrării afectează rezultatul. Nu este predicție de calitate a meciului sau a videoclipului. Compararea între sporturi este orientativă.

În Dimineața mea, analiza este explicită la cerere. Cel mult20 meciuri noi/lot și3 cereri simultane către endpoint-ul game existent; nu încărcăm clipurile în browser și nu schimbăm playerul. Punctajele sunt păstrate în memorie, sortarea pune necunoscutele la final, iar ordinea după indice are prioritate față de favorite. Se pot analiza loturi ulterioare prin încă o apăsare. La schimbarea zilei sau ieșirea din pagină nu se mai pornesc cereri din coada veche. Eșecurile de rețea pot fi reîncercate.

Rezultatul metricii nu include scor final, câștigător sau explicații despre răsturnări/prelungiri. Noul ecran omite scorurile când preferința existentă fără spoilere este activă. Protecția completă a restului aplicației rămâne amânată.

Teste: comparații meci stabil/echilibrat/oscilant, limite, sporturi diferite, simetrie gazde/oaspeți, lipsuri/live/serii incomplete și calcul normalizeSummary pe801 puncte față de grafic redus. Browser local: punctaje, sortare, fără erori JS. Producția rămâne v37 până la acord explicit.
