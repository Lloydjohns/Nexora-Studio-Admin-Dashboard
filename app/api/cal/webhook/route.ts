export async function POST(request: Request) {
  const booking = await request.json();

  // Get booking information

  // Save booking to Supabase

  return Response.json({
    success: true,
  });
}