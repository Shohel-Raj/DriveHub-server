import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: config.connection_str,
});

// Initialize all database tables
const initDB = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL ,
        email TEXT NOT NULL UNIQUE CHECK (email = LOWER(email)),
        password TEXT NOT NULL CHECK (char_length(password) >= 6),
        phone TEXT NOT NULL ,
        role TEXT NOT NULL CHECK (role IN ('admin','customer')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // Vehicles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('car','bike','van','SUV')),
        registration_number TEXT NOT NULL UNIQUE,
        daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
        availability_status TEXT NOT NULL CHECK (availability_status IN ('available','booked')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // Bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        rent_start_date DATE NOT NULL,
        rent_end_date DATE NOT NULL,
        total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
        status TEXT NOT NULL CHECK (status IN ('active','cancelled','returned')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // Date constraint (run separately)
    await pool.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_dates'
    ) THEN
      ALTER TABLE bookings
      ADD CONSTRAINT check_dates
      CHECK (rent_end_date > rent_start_date);
    END IF;
  END;
  $$;
`);

    console.log("🟢 Database initialized successfully");
  } catch (error) {
    console.error("🔴 Database initialization error:", error);
    throw error;
  }
};

export default initDB;
