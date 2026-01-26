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
   EMAIL (Python SMTP backend)
====================================================== */

async function sendEmail(reminder) {
  try {
    const res = await fetch("http://127.0.0.1:8001/send-email", {
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
      const text = await res.text();
      throw new Error(text || "Email failed");
    }

    return { success: true, mode: "email" };
  } catch (err) {
    alert(
      "Email service is not reachable.\n\n" +
      "Is the Python server running on port 8001?"
    );
    throw err;
  }
}
