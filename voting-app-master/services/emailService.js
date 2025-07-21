require('dotenv').config(); // Make sure this is at the top
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log("Loaded SMTP:", process.env.SMTP_HOST, process.env.SMTP_EMAIL); // For debugging

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
