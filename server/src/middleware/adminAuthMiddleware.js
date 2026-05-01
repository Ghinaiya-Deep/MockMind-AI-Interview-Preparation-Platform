import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const createAdminToken = (admin) =>
  jwt.sign(
    { id: admin._id, role: "admin", email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

export const protectAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({ message: "No admin token. Access denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid admin token user." });
    }

    req.admin = admin;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Admin token is invalid or expired." });
  }
};
