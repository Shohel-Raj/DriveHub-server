import { pool } from "../../config/db";

const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT id, name, email, phone, role FROM users ORDER BY id DESC"
  );
  return result.rows;
};

const updateUser = async (userId: string, updates: any) => {
  const allowedFields = ["name", "email", "phone", "password", "role"];
  const setQuery: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in updates) {
    if (allowedFields.includes(key)) {
      setQuery.push(`${key} = $${index}`);
      values.push(updates[key]);
      index++;
    }
  }

  if (setQuery.length === 0) {
    throw new Error("No valid fields to update");
  }

  values.push(userId);

  const query = `
    UPDATE users
    SET ${setQuery.join(", ")}
    WHERE id = $${index}
    RETURNING id, name, email, phone, role
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteUser = async (userId: string) => {
  const bookings = await pool.query(
    "SELECT id FROM bookings WHERE customer_id = $1",
    [userId]
  );

  if (bookings.rowCount! > 0) {
    throw new Error("User cannot be deleted because they have bookings");
  }

  // Safe to delete
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
};
const isOwner = async (loggedInUserId: string, requestedUserId: string) => {
  const result = await pool.query(
    "SELECT id FROM users WHERE id = $1",
    [requestedUserId]
  );

  if (result.rowCount === 0) {
    return false;
  }

  return loggedInUserId === requestedUserId;
};


export const userService = {
  getAllUsers,
  updateUser,
  deleteUser,
  isOwner
};
