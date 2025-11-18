const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'SMTP configuration missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.'
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

async function sendOtpEmail(to, code) {
  const mailer = getTransporter();
  const from = process.env.EMAIL_FROM || 'ClassHub <no-reply@classhub.com>';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2 style="color:#7c3aed">Your ClassHub login code</h2>
      <p>Use the code below to finish logging in. It will expire in 5 minutes.</p>
      <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color:#111827; padding: 12px 16px; background:#f5f3ff; border-radius:12px; text-align:center;">
        ${code}
      </div>
      <p style="font-size:12px; color:#6b7280">If you did not request this code, you can safely ignore this email.</p>
    </div>
  `;

  await mailer.sendMail({
    from,
    to,
    subject: 'Your ClassHub OTP code',
    text: `Your ClassHub login code is ${code}. It expires in 5 minutes.`,
    html,
  });
}

module.exports = { sendOtpEmail };

