import nodemailer from "nodemailer";

export default async (req, res) => {
  // ✅ Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Only POST requests allowed",
    });
  }

  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
    });
  }

  try {
    // ✅ Gmail SMTP Transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // ✅ Send Email
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to,
      subject,
      text: message,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
