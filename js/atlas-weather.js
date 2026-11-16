// Weather for the selected atlas city. Successful requests are shared for 10 minutes;
// failures wait a minute before retrying, including when the panel is redrawn.
import { getWeather, wxIcon, wxText } from './places.js';
import { esc } from './ui.js';

export function createAtlasWeatherCache(request = getWeather, clock = Date.now) {
  const records = new Map();
  return {
    peek: id => records.get(id),
    load(city) {
      const old = records.get(city.id);
      if (old && (old.pending || clock() - old.at < (old.error ? 60e3 : 600e3))) return old.promise;
      const record = { pending: true, at: clock(), data: null, error: false };
      records.set(city.id, record);
      record.promise = Promise.resolve().then(() => request([city], true)).then(list => {
        if (!Number.isFinite(list?.[0]?.now?.temp)) throw new Error('Weather unavailable');
        record.data = list[0];
      }).catch(() => { record.error = true; }).then(() => {
        record.pending = false; record.at = clock(); return record;
      });
      return record.promise;
    }
  };
}
export const atlasWeatherCache = createAtlasWeatherCache();

export function atlasWeatherHtml(city, record) {
  if (!city) return '';
  const w = record?.data, n = w?.now, d = w?.days?.[0];
  const range = Number.isFinite(d?.lo) && Number.isFinite(d?.hi) ? `${Math.round(d.lo)}° – ${Math.round(d.hi)}°` : '';
  return `<button class="atlas-weather-card" type="button" data-city="${esc(city.id)}">
    <span class="atlas-kicker">${esc(city.name)} · vremea acum</span>
    ${n ? `<span class="atlas-weather-now">${wxIcon(n.code, n.day, 30)}<b>${Math.round(n.temp)}°</b><span>${esc(wxText(n.code))}</span></span>
      <span class="atlas-weather-meta">${range}${Number.isFinite(d?.pp) ? `${range ? ' · ' : ''}Ploaie ${d.pp}%` : ''}<span>Prognoza ↗</span></span>`
      : `<span class="atlas-weather-meta">${record?.error ? 'Vremea nu este disponibilă acum.' : 'Se încarcă vremea…'}<span>Despre oraș ↗</span></span>`}
    </button>`;
}
