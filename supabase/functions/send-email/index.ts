// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, message } = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY not set");
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Freelancer Cashflow Guard",
          email: "pratikjadhao189@gmail.com", // VERIFIED
        },
        to: [{ email: to }],
        subject: subject || "Payment Reminder",
        textContent: message,
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(text);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
