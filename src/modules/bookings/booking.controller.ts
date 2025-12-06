import { Request, Response } from "express";
import { bookingServices } from "./boooking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const { vehicle_id,customer_id, rent_start_date, rent_end_date } = req.body;
    const user = (req as any).user;
    if (!vehicle_id || !rent_start_date || !rent_end_date)
      return res.status(400).json({ error: "Missing fields" });
    const booking = await bookingServices.createBooking({
      customer_id: customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
    });
    return res.status(201).json({
      success: true,
      massage: "Vehicle booked successfully",
      data: booking,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      massage: "Bookig not possible now!",
      errors: err.message || "Server error",
    });
  }
};

const listBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const bookings = await bookingServices.getBookingsForUserOrAll(user);
    return res.json({ success: true, massage: "Listbooking data ", data: bookings });
  } catch (err: any) {
    return res
      .status(500)
      .json({
        success: false,
        massage: "No Booking Available!",
        errors: err.message || "Server error",
      });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  const bookingId = Number(req.params.bookingId);
  const user = (req as any).user;
  try {
    // If customer: cancel before start date
    if (user.role === "customer") {
      await bookingServices.cancelBookingIfBeforeStart(bookingId, user);
      return res.json({ data: "Booking cancelled" });
    } else if (user.role === "admin") {
      // Admin: mark as returned
      await bookingServices.markReturned(bookingId);
      return res.json({ data: "Booking marked returned" });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }
  } catch (err: any) {
    return res
      .status(err.status || 500)
      .json({ success: false,
        massage: "Updating Booking is not possible now!",
        errors: err.message || "Server error",});
  }
};


export const bookingController = {
  createBooking,
  listBookings,
  updateBooking,

};
