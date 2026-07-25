const nodemailer = require('nodemailer');

const getVerificationEmailHtml = (name, verifyUrl) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111111; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #27272a;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a855f7; margin: 0; font-size: 28px;">CampusMind AI</h1>
    <p style="color: #a1a1aa; font-size: 14px; margin-top: 5px;">Enterprise Academic Intelligence</p>
  </div>
  <div style="background: #18181b; padding: 30px; border-radius: 8px; border: 1px solid #27272a;">
    <h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">Verify Your Email Address</h2>
    <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
    <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">Thank you for registering with CampusMind AI! To activate your account and start using instant AI problem explanations and collaborative study rooms, please verify your email address by clicking the button below.</p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="${verifyUrl}" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);">Verify Account</a>
    </div>
    <p style="color: #71717a; font-size: 14px; margin-bottom: 0;">Or copy and paste this URL into your browser:<br/><a href="${verifyUrl}" style="color: #a855f7; word-break: break-all;">${verifyUrl}</a></p>
  </div>
  <div style="text-align: center; margin-top: 30px; color: #71717a; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} CampusMind AI. All rights reserved.</p>
  </div>
</div>
`;

const getPasswordResetEmailHtml = (name, resetUrl) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111111; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #27272a;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a855f7; margin: 0; font-size: 28px;">CampusMind AI</h1>
  </div>
  <div style="background: #18181b; padding: 30px; border-radius: 8px; border: 1px solid #27272a;">
    <h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
    <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
    <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">We received a request to reset your CampusMind AI password. This secure link will expire in <strong>15 minutes</strong>.</p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #f43f5e, #a855f7); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(244, 63, 94, 0.4);">Reset Password</a>
    </div>
    <p style="color: #a1a1aa; font-size: 14px;">If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
    <p style="color: #71717a; font-size: 14px; margin-bottom: 0;">Or copy this URL into your browser:<br/><a href="${resetUrl}" style="color: #a855f7; word-break: break-all;">${resetUrl}</a></p>
  </div>
  <div style="text-align: center; margin-top: 30px; color: #71717a; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} CampusMind AI. All rights reserved.</p>
  </div>
</div>
`;

const getWelcomeEmailHtml = (name, clientUrl) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111111; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #27272a;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a855f7; margin: 0; font-size: 28px;">Welcome to CampusMind AI! 🎉</h1>
  </div>
  <div style="background: #18181b; padding: 30px; border-radius: 8px; border: 1px solid #27272a;">
    <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
    <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">Your email address has been successfully verified! You now have full access to our AI tutor, collaborative learning spaces, and student leaderboard.</p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="${clientUrl}" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Explore CampusMind</a>
    </div>
  </div>
</div>
`;

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || process.env.SMTP_EMAIL || 'test_user',
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || 'test_pass',
    },
  });

  const fromEmail = process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'noreply@campusmind.ai';

  const message = {
    from: `${process.env.FROM_NAME || 'CampusMind AI'} <${fromEmail}>`,
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

module.exports = {
  sendEmail,
  getVerificationEmailHtml,
  getPasswordResetEmailHtml,
  getWelcomeEmailHtml,
};
