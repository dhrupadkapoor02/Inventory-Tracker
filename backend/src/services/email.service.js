const transporter = require('../config/mailer');
const env = require('../config/env');

const subjectByPurpose = {
  EMAIL_VERIFICATION: 'Verify your email address',
  PASSWORD_RESET: 'Reset your password',
};

async function sendOtpEmail(to, code, purpose) {
  const subject = subjectByPurpose[purpose] || 'Your verification code';

  try {
    console.log('==============================');
    console.log('Sending OTP Email...');
    console.log('To:', to);
    console.log('Subject:', subject);

    const info = await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Inventory Tracker</h2>
          <p>${subject}. Use the code below. It expires in 10 minutes.</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('==============================');
  } catch (err) {
    console.error('========== EMAIL ERROR ==========');
    console.error(err);
    console.error('=================================');
    throw err;
  }
}

module.exports = { sendOtpEmail };