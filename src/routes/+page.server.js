export async function load(params) {
  const token = event.cookies.get("session") ?? null;
  if (token === null) {
    return new Response(null, { status: 401 });
  }
}
