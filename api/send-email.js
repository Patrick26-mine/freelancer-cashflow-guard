import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { to, subject, message } = req.body;

  try {
    await resend.emails.send({
      from: "Cashflow Guard <onboarding@resend.dev>",
      to: to,
      subject: subject,
      text: message,
    });

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
