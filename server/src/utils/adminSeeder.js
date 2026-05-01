import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

export const ensureFixedAdmin = async () => {
  const existingAdmin = await Admin.findOne({ singletonKey: "PRIMARY_FIXED_ADMIN" });
  if (existingAdmin) {
    return existingAdmin;
  }

  const email = (process.env.ADMIN_EMAIL || "admin@mockmind.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "MockMind Admin";

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "ADMIN_EMAIL/ADMIN_PASSWORD are not set. Using default fixed admin credentials. Change them in .env for production."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    singletonKey: "PRIMARY_FIXED_ADMIN",
    name,
    email,
    password: hashedPassword,
    isActive: true
  });

  console.log(`Fixed admin ensured in DB: ${admin.email}`);
  return admin;
};
