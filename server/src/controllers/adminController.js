import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import ContactMessage from "../models/ContactMessage.js";
import { createAdminToken } from "../middleware/adminAuthMiddleware.js";

const startOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

const startOfTomorrow = () => {
  const end = new Date();
  end.setHours(24, 0, 0, 0);
  return end;
};

const formatDate = (date) => date.toISOString().slice(0, 10);

const collectionExists = async (name) => {
  const rows = await mongoose.connection.db
    .listCollections({ name })
    .toArray();
  return rows.length > 0;
};

const getFirstExistingCollection = async (names) => {
  for (const name of names) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await collectionExists(name);
    if (exists) {
      return name;
    }
  }
  return names[0];
};

const getDateWindow = (days) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const fillDailySeries = (days, bucketsMap, keyName, labelName) => {
  const labels = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  for (let i = 0; i < days; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const label = formatDate(date);
    labels.push({
      [labelName]: label,
      [keyName]: bucketsMap.get(label) || 0
    });
  }

  return labels;
};

const aggregateDailyCount = async (model, days, keyName, labelName) => {
  const { start, end } = getDateWindow(days);
  const rows = await model.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const map = new Map(rows.map((item) => [item._id, item.count]));
  return fillDailySeries(days, map, keyName, labelName);
};

export const adminLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const admin = await Admin.findOne({
      singletonKey: "PRIMARY_FIXED_ADMIN",
      email: email.toLowerCase()
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    res.status(200).json({
      message: "Admin login successful.",
      token: createAdminToken(admin),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (_req, res) => {
  res.status(200).json({ message: "Admin logout successful." });
};

export const getAdminMe = async (req, res) => {
  res.status(200).json({
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email
    }
  });
};

export const getDashboardStats = async (_req, res, next) => {
  try {
    const todayStart = startOfToday();
    const todayEnd = startOfTomorrow();

    const [interviewCollectionName, aiCollectionName] = await Promise.all([
      getFirstExistingCollection(["practisesessions", "practicesessions"]),
      getFirstExistingCollection(["ailogs", "aiLogs"])
    ]);

    const [totalUsers, totalInterviews, interviewsToday, ratingData, totalFeedback, totalContacts, totalAiCalls] =
      await Promise.all([
        User.countDocuments(),
        mongoose.connection.db.collection(interviewCollectionName).countDocuments(),
        mongoose.connection.db
          .collection(interviewCollectionName)
          .countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
        Feedback.aggregate([
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" }
            }
          }
        ]),
        Feedback.countDocuments(),
        ContactMessage.countDocuments(),
        mongoose.connection.db.collection(aiCollectionName).countDocuments()
      ]);

    const averageRating = ratingData[0]?.averageRating
      ? Number(ratingData[0].averageRating.toFixed(2))
      : 0;

    res.status(200).json({
      totalUsers,
      totalInterviews,
      interviewsToday,
      averageRating,
      totalAiCalls,
      totalFeedback,
      totalContacts
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminChartStats = async (_req, res, next) => {
  try {
    const interviewCollectionName = await getFirstExistingCollection([
      "practisesessions",
      "practicesessions"
    ]);
    const interviewWindow = getDateWindow(7);

    const [userGrowth, interviewRows, ratingRows] = await Promise.all([
      aggregateDailyCount(User, 7, "users", "date"),
      mongoose.connection.db
        .collection(interviewCollectionName)
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: interviewWindow.start,
                $lte: interviewWindow.end
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt"
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
        .toArray(),
      Feedback.aggregate([
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    const interviewMap = new Map(interviewRows.map((item) => [item._id, item.count]));
    const interviewActivity = fillDailySeries(7, interviewMap, "interviews", "date");

    const ratingMap = new Map(ratingRows.map((row) => [String(row._id), row.count]));
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      name: `${rating} Star`,
      value: ratingMap.get(String(rating)) || 0
    }));

    res.status(200).json({
      userGrowth,
      interviewActivity,
      ratingDistribution
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFeedbacksForAdmin = async (req, res, next) => {
  try {
    const { sort = "latest" } = req.query;
    let sortQuery = { createdAt: -1 };

    if (sort === "rating_desc") {
      sortQuery = { rating: -1, createdAt: -1 };
    } else if (sort === "rating_asc") {
      sortQuery = { rating: 1, createdAt: -1 };
    } else if (sort === "oldest") {
      sortQuery = { createdAt: 1 };
    }

    const feedbacks = await Feedback.find()
      .sort(sortQuery)
      .select("name email rating improvement referenceId createdAt updatedAt");

    res.status(200).json({ feedbacks });
  } catch (error) {
    next(error);
  }
};

export const deleteFeedbackForAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const deleted = await Feedback.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Feedback not found." });
    }
    res.status(200).json({ message: "Feedback deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getAllContactsForAdmin = async (_req, res, next) => {
  try {
    const contacts = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .select("name email message createdAt updatedAt");
    res.status(200).json({ contacts });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersForAdmin = async (_req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("name email createdAt updatedAt");

    res.status(200).json({
      totalUsers: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactForAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Contact message not found." });
    }
    res.status(200).json({ message: "Contact message deleted successfully." });
  } catch (error) {
    next(error);
  }
};
