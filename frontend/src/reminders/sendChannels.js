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
   BACKEND URL (LOCAL + PRODUCTION SAFE)
====================================================== */

const EMAIL_API =
  import.meta.env.MODE === "development"
    ? "http://127.0.0.1:8001"
    : "https://freelancer-cashflow-guard.onrender.com";

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
      throw new Error("WhatsApp not enabled yet");

    default:
      throw new Error("Invalid send channel");
  }
}

/* ======================================================
   CHANNEL IMPLEMENTATIONS
====================================================== */

async function sendManual() {
  return { success: true, mode: "manual" };
}

/* ======================================================
   EMAIL (Python SMTP Backend)
====================================================== */

async function sendEmail(reminder) {
  try {
    const res = await fetch(`${EMAIL_API}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: reminder.client_email,
        subject: `Payment reminder — Invoice ${reminder.invoice_number}`,
        message: reminder.message,
      }),
    });

    if (!res.ok) {
      return {
        success: false,
        error: "Email failed to send.",
      };
    }

    return { success: true, mode: "email" };
  } catch (err) {
    return {
      success: false,
      error: "Email service unavailable.",
    };
  }
}
