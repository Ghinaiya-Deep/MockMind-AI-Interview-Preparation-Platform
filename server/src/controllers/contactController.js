import { validationResult } from "express-validator";
import ContactMessage from "../models/ContactMessage.js";
import { sendContactAcknowledgement } from "../utils/sendEmail.js";

export const createContactMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;
    const userId = req.user?.id || req.user?._id || null;

    const saved = await ContactMessage.create({
      name,
      email,
      message,
      userId
    });

    let emailSent = true;
    try {
      await sendContactAcknowledgement(email, name, message);
    } catch (emailError) {
      emailSent = false;
      console.warn("Contact acknowledgement failed:", emailError.message);
    }

    res.status(201).json({
      message: emailSent
        ? "Thanks! We received your message and sent a confirmation email."
        : "Thanks! We received your message, but we could not send email.",
      emailSent,
      contactId: saved._id
    });
  } catch (error) {
    next(error);
  }
};
