import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
const emailService = process.env.EMAIL_SERVICE;
const emailPort = Number(process.env.EMAIL_PORT || 587);
const emailHost = process.env.EMAIL_HOST;
const emailSecure = process.env.EMAIL_SECURE === "true" || emailPort === 465;

let transporter = null;
let hasVerifiedTransport = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPathCandidates = [
  path.resolve(__dirname, "../../../client/src/image/MockMind.png"),
  path.resolve(__dirname, "../../../client/src/image/Mockmind.png"),
  path.resolve(__dirname, "../../../client/src/image/Interview.png")
];

const hasEmailCredentials = () => Boolean(emailUser && emailPass);
const getLogoPath = () => logoPathCandidates.find((filePath) => fs.existsSync(filePath)) || null;

const createTransporter = () => {
  if (!hasEmailCredentials()) {
    return null;
  }

  if (emailService) {
    return nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

const withLogoAttachment = (mailOptions, htmlWithLogoFactory) => {
  const logoPath = getLogoPath();
  if (!logoPath) {
    return mailOptions;
  }

  const logoCid = `mockmind-logo-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  return {
    ...mailOptions,
    html: htmlWithLogoFactory(logoCid),
    attachments: [
      {
        filename: path.basename(logoPath),
        path: logoPath,
        cid: logoCid
      }
    ]
  };
};

export const verifyEmailTransport = async () => {
  if (!emailUser || !emailPass) {
    console.warn("Email credentials missing. Skipping registration email.");
    return false;
  }

  if (!transporter) {
    transporter = createTransporter();
  }

  if (!transporter) {
    console.warn("Email transporter not configured. Skipping registration email.");
    return false;
  }

  if (hasVerifiedTransport) {
    return true;
  }

  try {
    await transporter.verify();
    hasVerifiedTransport = true;
    console.log("SMTP connection verified successfully.");
    return true;
  } catch (error) {
    console.error("SMTP verification failed:", error.message);
    return false;
  }
};

export const sendRegistrationEmail = async (toEmail, name) => {
  const canSend = await verifyEmailTransport();
  if (!canSend) {
    throw new Error("SMTP transporter is not ready.");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: "Welcome to MockMind",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thanks for registering, ${name}!</h2>
      <p>Your account has been created successfully in MockMind.</p>
      <p>You can now login and continue using the platform.</p>
      <p style="margin-top:20px; font-size:14px; color:#666;">
        MockMind - AI Powered Interview Preparation Platform
      </p>
    </div>
  `
  };

  const mailWithInlineLogo = withLogoAttachment(
    mailOptions,
    (logoCid) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thanks for registering, ${name}!</h2>
      <p>Your account has been created successfully in MockMind.</p>
      <p>You can now login and continue using the platform.</p>
      <div style="margin-top:20px;">
        <img src="cid:${logoCid}" alt="MockMind" style="width:150px; max-width:100%; height:auto; display:block;" />
      </div>
      <p style="margin-top:20px; font-size:14px; color:#666;">
        MockMind - AI Powered Interview Preparation Platform
      </p>
    </div>
  `
  );

  const info = await transporter.sendMail(mailWithInlineLogo);
  console.log(`Registration email sent to ${toEmail}. Message ID: ${info.messageId}`);
  return info;
};

export const sendContactAcknowledgement = async (toEmail, name, message) => {
  const canSend = await verifyEmailTransport();
  if (!canSend) {
    throw new Error("SMTP transporter is not ready.");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: "We received your message - MockMind",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hi ${name},</h2>
      <p>Thanks for contacting MockMind. We received your message and will get back to you within 24 hours.</p>
      <div style="margin-top:16px; padding:12px; background:#f8fafc; border-radius:8px;">
        <strong>Your message:</strong>
        <p style="margin:8px 0 0;">${message}</p>
      </div>
      <p style="margin-top:20px; font-size:14px; color:#666;">
        MockMind - AI Powered Interview Preparation Platform
      </p>
    </div>
  `
  };

  const contactMailWithInlineLogo = withLogoAttachment(
    mailOptions,
    (logoCid) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hi ${name},</h2>
      <p>Thanks for contacting MockMind. We received your message and will get back to you within 24 hours.</p>
      <div style="margin-top:16px; padding:12px; background:#f8fafc; border-radius:8px;">
        <strong>Your message:</strong>
        <p style="margin:8px 0 0;">${message}</p>
      </div>
      <div style="margin-top:20px;">
        <img src="cid:${logoCid}" alt="MockMind" style="width:150px; max-width:100%; height:auto; display:block;" />
      </div>
      <p style="margin-top:20px; font-size:14px; color:#666;">
        MockMind - AI Powered Interview Preparation Platform
      </p>
    </div>
  `
  );

  const info = await transporter.sendMail(contactMailWithInlineLogo);
  console.log(`Contact acknowledgement sent to ${toEmail}. Message ID: ${info.messageId}`);
  return info;
};

export const sendFeedbackAcknowledgement = async (
  toEmail,
  name,
  { rating, improvement, referenceId }
) => {
  const canSend = await verifyEmailTransport();
  if (!canSend) {
    throw new Error("SMTP transporter is not ready.");
  }

  const stars = "*".repeat(Number(rating)) + "-".repeat(5 - Number(rating));

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: `Feedback received - Ref ${referenceId}`,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hi ${name},</h2>
      <p>Thank you for sharing your feedback with MockMind.</p>
      <p>Your feedback reference ID is <strong>${referenceId}</strong>. Please keep it for future communication.</p>
      <div style="margin-top:16px; padding:12px; background:#f8fafc; border-radius:8px;">
        <p style="margin:0 0 8px;"><strong>Rating:</strong> ${rating}/5 (${stars})</p>
        <p style="margin:0;"><strong>Improvement:</strong><br/>${improvement}</p>
      </div>
      <p style="margin-top:20px; font-size:14px; color:#666;">
        MockMind - AI Powered Interview Preparation Platform
      </p>
    </div>
  `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Feedback acknowledgement sent to ${toEmail}. Message ID: ${info.messageId}`);
  return info;
};
