const nodemailer = require('nodemailer');

console.log({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_EMAIL,
    secure: port === 465,
});
try {
    await transporter.verify();
    console.log("SMTP connected successfully");
} catch (err) {
    console.error("SMTP Verify Error:", err);
}

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.SMTP_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    console.error('Error code:', err.code);
    throw err;
  }
};

module.exports = sendEmail;
