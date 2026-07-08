// Generates a 6-digit numeric OTP code
function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const OTP_EXPIRY_MINUTES = 10;

function getOtpExpiry() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

module.exports = { generateOtpCode, getOtpExpiry, OTP_EXPIRY_MINUTES };
