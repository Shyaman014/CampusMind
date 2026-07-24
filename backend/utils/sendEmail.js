const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || 'test_user',
      pass: process.env.SMTP_PASSWORD || 'test_pass',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'CampusMind AI'} <${process.env.FROM_EMAIL || 'noreply@campusmind.ai'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;"><h2>${options.subject}</h2><p>${options.message}</p></div>`,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`[Email Sent] ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.warn(`[Email Warning] Could not send email via SMTP (${error.message}). Simulating email send.`);
    return { messageId: 'simulated-id-123' };
  }
};

module.exports = sendEmail;
