export const SEND_CHANNELS = {
  MANUAL: "manual",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
};

/* ======================================================
   EMAIL API URL (Vercel Serverless Function)
====================================================== */

const EMAIL_API_URL = "/api/send-email";

/* ======================================================
   SEND DISPATCHER
====================================================== */

export async function sendReminder({ channel, reminder }) {
  switch (channel) {
    case SEND_CHANNELS.MANUAL:
      return { success: true, mode: "manual" };

    case SEND_CHANNELS.EMAIL:
      return sendEmail(reminder);

    default:
      return {
        success: false,
        error: "Invalid send channel.",
      };
  }
}

/* ======================================================
   EMAIL SEND
====================================================== */

async function sendEmail(reminder) {
  try {
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

    const data = await res.json();

    if (!data.success) {
      return {
        success: false,
        error: data.error || "Email could not be sent.",
      };
    }

    return { success: true, mode: "email" };
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
