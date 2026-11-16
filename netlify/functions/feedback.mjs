// Public beta collection is retired. Old clients must not create new records.
export default async () => new Response(JSON.stringify({ error: 'Ediție personală: colectarea este oprită.' }), {
  status: 410,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
export const config = { path: '/api/feedback' };
