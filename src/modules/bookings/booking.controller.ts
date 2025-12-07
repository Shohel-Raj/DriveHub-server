import { Request, Response } from "express";
import { bookingServices } from "./boooking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const { vehicle_id, customer_id, rent_start_date, rent_end_date } = req.body;
    const user = (req as any).user;

    // Validate required fields
    if (!vehicle_id || !rent_start_date || !rent_end_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: "vehicle_id, rent_start_date, rent_end_date are required",
      });
    }

    const booking = await bookingServices.createBooking({
      customer_id: customer_id || user.userId,
      vehicle_id,
      rent_start_date,
      rent_end_date,
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle booked successfully",
      data: booking,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: "Booking not possible now!",
      errors: err.message || "Server error",
    });
  }
};

const listBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const bookings = await bookingServices.getBookingsForUserOrAll(user);

    return res.json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      errors: err.message || "Server error",
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  const bookingId = Number(req.params.bookingId);
  const user = (req as any).user;

  try {
    if (user.role === "customer") {
      await bookingServices.cancelBookingIfBeforeStart(bookingId, user);
      return res.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    } else if (user.role === "admin") {
      await bookingServices.markReturned(bookingId);
      return res.json({
        success: true,
        message: "Booking marked as returned successfully",
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You do not have permission to update this booking",
      });
    }
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: "Updating booking is not possible now",
      errors: err.message || "Server error",
    });
  }
};

export const bookingController = {
  createBooking,
  listBookings,
  updateBooking,
};
