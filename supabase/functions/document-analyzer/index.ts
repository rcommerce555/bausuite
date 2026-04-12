// Placeholder Supabase Edge Function for document analysis.
// Move shared logic here if analysis should run close to the database or storage layer.
Deno.serve(async () => new Response(JSON.stringify({ ok: true, message: 'document-analyzer placeholder' }), {
  headers: { 'Content-Type': 'application/json' },
}));
