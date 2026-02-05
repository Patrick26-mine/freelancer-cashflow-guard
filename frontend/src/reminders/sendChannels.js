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
      return {
        success: true,
        mode: "manual",
      };

    case SEND_CHANNELS.EMAIL:
      return openGmailCompose(reminder);

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
   OPTION B EMAIL SYSTEM (FREE FOREVER)
   ✅ Opens Gmail compose window
   ✅ No backend needed
   ✅ No OAuth
   ✅ No Resend
   ✅ No verification
====================================================== */

function openGmailCompose(reminder) {
  const to = reminder?.client_email?.trim();

  if (!to) {
    return {
      success: false,
      error: "Client email not available.",
    };
  }

  const subject = encodeURIComponent(
    `Payment reminder — Invoice ${reminder.invoice_number}`
  );

  const body = encodeURIComponent(reminder.message || "");

  // ✅ Gmail Compose URL
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;

  // ✅ Open Gmail compose in new tab
  window.open(gmailUrl, "_blank");

  return {
    success: true,
    mode: "email",
    info: "Opened Gmail compose window.",
  };
}
