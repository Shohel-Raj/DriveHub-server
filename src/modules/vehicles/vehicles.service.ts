import { pool } from "../../config/db";

const createVehicle = async (payload: {
  vehicle_name: string;
  type: "car" | "bike" | "van" | "SUV";
  registration_number: string;
  daily_rent_price: number;
  availability_status: "available" | "booked";
}) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;
  const res = await pool.query(
    `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );
  return res.rows[0];
};

const getAllVehicles = async () => {
  const res = await pool.query(`SELECT * FROM vehicles ORDER BY id`);
  return res.rows;
};

const getVehicleById = async (id: number) => {
  const res = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
  return res.rows[0];
};

const updateVehicle = async (id: number, updates: Partial<any>) => {
  // simple dynamic update (careful in prod: use validation & whitelist)
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const sets = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const query = `UPDATE vehicles SET ${sets} WHERE id = $${
    fields.length + 1
  } RETURNING *`;
  const res = await pool.query(query, [...values, id]);
  return res.rows[0];
};

const deleteVehicleIfNoActiveBookings = async (id: number) => {
  const activeBookings = await pool.query(
    `SELECT 1 FROM bookings WHERE vehicle_id = $1 AND status = 'active' LIMIT 1`,
    [id]
  );
  if (activeBookings.rowCount! > 0)
    throw { status: 400, message: "Vehicle has active bookings" };
  const res = await pool.query(
    `DELETE FROM vehicles WHERE id = $1 RETURNING *`,
    [id]
  );
  return res.rows[0];
};

export const vehiclesServices = {
  deleteVehicleIfNoActiveBookings,
  createVehicle,
  updateVehicle,
  getAllVehicles,
  getVehicleById,
};
