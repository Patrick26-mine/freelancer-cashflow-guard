export const SEND_CHANNELS = {
  MANUAL: "manual",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
};

export async function sendReminder({ channel, reminder }) {
  switch (channel) {
    case SEND_CHANNELS.MANUAL:
      return { success: true };

    case SEND_CHANNELS.EMAIL:
      return await sendEmail(reminder);

    default:
      return {
        success: false,
        error: "Invalid send channel",
      };
  }
}

async function sendEmail(reminder) {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: reminder.client_email,
        subject: `Payment Reminder — Invoice ${reminder.invoice_number}`,
        message: reminder.message,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      return {
        success: false,
        error: data.error || "Email could not be sent.",
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Email service unreachable.",
    };
  }
}
