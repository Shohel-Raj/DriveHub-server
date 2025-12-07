import { Router } from "express";
import { bookingController } from "./booking.controller";
import { verifyToken } from "../../middleware/auth";

const router = Router();

router.post("/", verifyToken, bookingController.createBooking);
router.get("/", verifyToken, bookingController.listBookings);
router.put("/:bookingId", verifyToken, bookingController.updateBooking);

export const bookingRoutes = router;
