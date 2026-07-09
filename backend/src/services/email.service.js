const env = require('../config/env');

const subjectByPurpose = {
  EMAIL_VERIFICATION: 'Verify your email address',
  PASSWORD_RESET: 'Reset your password',
};

async function sendOtpEmail(to, code, purpose) {
  const subject = subjectByPurpose[purpose] || 'Your verification code';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>Inventory Tracker</h2>
      <p>${subject}. Use the code below. It expires in 10 minutes.</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.email.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.email.from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Failed to send email via Resend (${response.status}): ${errorBody}`);
  }
}

module.exports = { sendOtpEmail };
