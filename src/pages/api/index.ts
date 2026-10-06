export const prerender = false;

export async function GET() {
  return new Response(
    JSON.stringify({
      service: "PackersHub API",
      status: "operational",
      version: "10.7.35",
      endpoints: {
        chat: "/api/chat",
        lead: "/api/lead",
        track: "/api/track",
        payment: "/api/payment/create-order",
        paymentVerify: "/api/payment/verify"
      }
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}
