import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../../config/db";
dotenv.config();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: "admin" | "customer";
}) => {
  const { name, email, password, phone, role = "customer" } = payload;
  if (password.length < 6)
    throw { status: 400, message: "Password must be at least 6 characters" };
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, phone, role`,
    [name, email.toLowerCase(), hashed, phone, role]
  );
  return result.rows[0];
};

const signinUser = async (email: string, password: string) => {
  const res = await pool.query(
    `SELECT id, name, email, password, role FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (res.rowCount === 0) throw { status: 400, message: "Invalid credentials" };

  const user = res.rows[0];

  const payload = {
    userId: user.id as number,
    role: user.role as string,
    email: user.email as string,
  };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 400, message: "Invalid credentials" };

  // JWT token
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const authService={
    createUser,
    signinUser
}