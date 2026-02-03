/* ======================================================
   SEND CHANNEL CONTRACT
   Manual | Email | WhatsApp
====================================================== */

export const SEND_CHANNELS = {
  MANUAL: "manual",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
};

/* ======================================================
   EMAIL API URL (Vercel Serverless Route)
   ✅ Works Locally + Production Automatically
====================================================== */

const EMAIL_API_URL = "/api/send-email";

/* ======================================================
   SEND DISPATCHER
====================================================== */

export async function sendReminder({ channel, reminder }) {
  switch (channel) {
    case SEND_CHANNELS.MANUAL:
      return sendManual();

    case SEND_CHANNELS.EMAIL:
      return sendEmail(reminder);

    case SEND_CHANNELS.WHATSAPP:
      return {
        success: false,
        error: "WhatsApp sending not enabled yet.",
      };

    default:
      return {
        success: false,
        error: "Invalid send channel.",
      };
  }
}

/* ======================================================
   CHANNEL IMPLEMENTATIONS
====================================================== */

async function sendManual() {
  return { success: true, mode: "manual" };
}

/* ======================================================
   EMAIL (Vercel Serverless Function)
   ✅ No CORS
   ✅ No Render Sleeping
   ✅ Timeout Protected
====================================================== */

async function sendEmail(reminder) {
  try {
    // ✅ Prevent infinite loading
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(EMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        to: reminder.client_email,
        subject: `Payment reminder — Invoice ${reminder.invoice_number}`,
        message: reminder.message,
      }),
    });

    clearTimeout(timeout);

    // ✅ Safe JSON parse
    const data = await res.json();

    // ✅ Backend returned failure
    if (!data.success) {
      return {
        success: false,
        error: data.error || "Email could not be sent.",
      };
    }

    // ✅ Success
    return {
      success: true,
      mode: "email",
    };
  } catch (err) {
    return {
      success: false,
      error:
        err.name === "AbortError"
          ? "Email request timed out."
          : "Email service unreachable.",
    };
  }
}
