import express, { Request, Response } from "express";
import config from "./config";
import initDB from "./config/db";
import { authRouter } from "./modules/auth/auth.routes";
import cors from "cors"
import { useRoutes } from "./modules/users/users.routes";
import { vehicleRouts } from "./modules/vehicles/vehicles.routes";
import { bookingServices } from "./modules/bookings/boooking.service";
import { bookingRoutes } from "./modules/bookings/booking.routes";

const app = express();
// const port = Number(process.env.PORT);
const port=config.port

initDB();

// parser
app.use(express.json())
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("DriveHub app listening .......");
});


// Auth Routes

app.use("/api/v1/auth", authRouter)

app.use("/api/v1/users", useRoutes)

app.use("/api/v1/vehicles", vehicleRouts)

app.use("/api/v1/bookings", bookingRoutes)

setInterval(async () => {
  try {
    console.log("Auto return job running...");
    await bookingServices.autoReturnPastBookings();
    console.log("Auto return job completed.");
  } catch (err) {
    console.error("Auto return failed:", err);
  }
}, 30 * 60 * 1000);

app.listen(port, () => {
  console.log(`DriveHub app listening on port ${port}`);
});
