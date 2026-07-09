const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: Number(env.smtp.port),
  secure: Number(env.smtp.port) === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP VERIFY ERROR:", error);
  } else {
    console.log("SMTP server is ready");
  }
});

module.exports = transporter;