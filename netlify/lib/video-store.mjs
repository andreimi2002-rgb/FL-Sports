import seed from '../../data/video-catalog.json' with { type: 'json' };
import { env } from './subs.mjs';
export async function videoStore() {
  if (!globalThis.Netlify) return { get: async () => seed, set: async () => {} };
  const { getStore } = await import('@netlify/blobs');
  const store = getStore({ name: env('CONTEXT') === 'production' ? 'video-catalog' : 'video-catalog-preview', consistency: 'strong' });
  return { get: async () => await store.get('catalog', { type: 'json' }) || seed, set: value => store.setJSON('catalog', value) };
}
