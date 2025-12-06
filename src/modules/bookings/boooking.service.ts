import { pool } from "../../config/db";

// check availability: vehicle must be 'available' and have no overlapping active bookings
const isVehicleAvailableForRange = async (
  vehicleId: number,
  startDate: string,
  endDate: string
) => {
  // ensure vehicle exists and status is 'available'
  const vRes = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
    vehicleId,
  ]);
  if (vRes.rowCount === 0) throw { status: 404, message: "Vehicle not found" };
  const vehicle = vRes.rows[0];
  if (vehicle.availability_status !== "available") return false;

  // Check overlapping bookings
  const overlap = await pool.query(
    `SELECT 1 FROM bookings WHERE vehicle_id = $1 AND status = 'active' AND NOT (rent_end_date < $2 OR rent_start_date > $3) LIMIT 1`,
    [vehicleId, startDate, endDate]
  );
  return overlap.rowCount === 0;
};

const daysInclusive = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.ceil((e.getTime() - s.getTime()) / msPerDay);
  return diff + 1; // inclusive
};

const createBooking = async (payload: {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  // validate dates
  const start = new Date(rent_start_date);
  const end = new Date(rent_end_date);
  if (isNaN(start.getTime()) || isNaN(end.getTime()))
    throw { status: 400, message: "Invalid dates" };
  if (!(end > start))
    throw {
      status: 400,
      message: "rent_end_date must be after rent_start_date",
    };

  // availability
  const available = await isVehicleAvailableForRange(
    vehicle_id,
    rent_start_date,
    rent_end_date
  );
  if (!available)
    throw {
      status: 400,
      message: "Vehicle not available for the requested period",
    };

  // fetch daily rate
  const vRes = await pool.query(
    `SELECT daily_rent_price FROM vehicles WHERE id = $1`,
    [vehicle_id]
  );
  const pricePerDay = Number(vRes.rows[0].daily_rent_price);

  const days = daysInclusive(rent_start_date, rent_end_date);
  const total_price = parseFloat((pricePerDay * days).toFixed(2));

  // create booking as 'active' and update vehicle availability to 'booked'
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const bRes = await client.query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES ($1,$2,$3,$4,$5,'active') RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );
    await client.query(
      `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
      [vehicle_id]
    );
    await client.query("COMMIT");
    return bRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getBookingsForUserOrAll = async (user: any) => {
  if (user.role === "admin") {
    const res = await pool.query(`SELECT * FROM bookings ORDER BY id`);
    return res.rows;
  } else {
    const res = await pool.query(
      `SELECT * FROM bookings WHERE customer_id = $1 ORDER BY id`,
      [user.userId]
    );
    return res.rows;
  }
};

const cancelBookingIfBeforeStart = async (
  bookingId: number,
  requester: any
) => {
  const res = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [
    bookingId,
  ]);
  if (res.rowCount === 0) throw { status: 404, message: "Booking not found" };
  const booking = res.rows[0];
  if (booking.status !== "active")
    throw { status: 400, message: "Only active bookings can be cancelled" };
  const now = new Date();
  const start = new Date(booking.rent_start_date);
  if (!(start > now))
    throw {
      status: 400,
      message: "Cannot cancel booking that already started or started today",
    };

  // ensure requester is admin or owner
  if (requester.role !== "admin" && requester.userId !== booking.customer_id)
    throw { status: 403, message: "Forbidden" };

  // cancel and set vehicle available
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
      [bookingId]
    );
    await client.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
      [booking.vehicle_id]
    );
    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const markReturned = async (bookingId: number) => {
  // Admin can mark returned (status -> 'returned', vehicle -> 'available')
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const bRes = await client.query(`SELECT * FROM bookings WHERE id = $1`, [
      bookingId,
    ]);
    if (bRes.rowCount === 0)
      throw { status: 404, message: "Booking not found" };
    const booking = bRes.rows[0];
    if (booking.status !== "active")
      throw { status: 400, message: "Booking not active" };
    await client.query(
      `UPDATE bookings SET status = 'returned' WHERE id = $1`,
      [bookingId]
    );
    await client.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
      [booking.vehicle_id]
    );
    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// helper to auto-mark past bookings returned
const autoReturnPastBookings = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // find bookings where rent_end_date < today and status = 'active'
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const res = await client.query(
      `SELECT id, vehicle_id FROM bookings WHERE status = 'active' AND rent_end_date < $1`,
      [today]
    );
    for (const row of res.rows) {
      await client.query(
        `UPDATE bookings SET status = 'returned' WHERE id = $1`,
        [row.id]
      );
      await client.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [row.vehicle_id]
      );
    }
    await client.query("COMMIT");
    return { processed: res.rowCount };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const bookingServices = {
  isVehicleAvailableForRange,
  createBooking,
  getBookingsForUserOrAll,
  cancelBookingIfBeforeStart,
  markReturned,
  autoReturnPastBookings,
};
