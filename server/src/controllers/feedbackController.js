import { validationResult } from "express-validator";
import Feedback from "../models/Feedback.js";
import { sendFeedbackAcknowledgement } from "../utils/sendEmail.js";

const buildReferenceId = () =>
  `MMF-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

export const createFeedback = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, rating, improvement } = req.body;
    const userId = req.user?.id || req.user?._id || null;
    const referenceId = buildReferenceId();

    const saved = await Feedback.create({
      name,
      email,
      rating,
      improvement,
      referenceId,
      userId
    });

    let emailSent = true;
    try {
      await sendFeedbackAcknowledgement(email, name, {
        rating,
        improvement,
        referenceId
      });
    } catch (emailError) {
      emailSent = false;
      console.warn("Feedback acknowledgement failed:", emailError.message);
    }

    res.status(201).json({
      message: emailSent
        ? "Feedback submitted! A reference copy has been sent to your email."
        : "Feedback submitted, but we could not send the email copy.",
      emailSent,
      feedbackId: saved._id,
      referenceId: saved.referenceId
    });
  } catch (error) {
    next(error);
  }
};
