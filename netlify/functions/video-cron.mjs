import { collectCatalog } from '../lib/video-catalog.mjs';
import { videoStore } from '../lib/video-store.mjs';
import { env } from '../lib/subs.mjs';
export default async () => {
  if (env('VIDEO_COLLECTION_DISABLED') === '1') return new Response(null, { status: 204 });
  const store = await videoStore();
  const result = await collectCatalog(await store.get());
  await store.set(result);
  console.log('video catalog', result.videos.length, 'sources', result.sources.filter(s => s.ok).length);
  return new Response(null, { status: 204 });
};
// Eight small batches/day. Scheduled functions run automatically only after production approval.
export const config = { schedule: '17 */3 * * *' };
