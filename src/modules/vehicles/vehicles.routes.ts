import { Router } from "express";
import { vehicleController } from "./vehicles.controller";
import { verifyToken } from "../../middleware/auth";
import { AdminRoutes } from "../../middleware/role";

const router = Router();

router.post("/", verifyToken, AdminRoutes(), vehicleController.createVehicle); // Admin only

router.get("/", vehicleController.listVehicles); // Public

router.get("/:vehicleId", vehicleController.getVehicle); // Public

router.put(
  "/:vehicleId",
  verifyToken,
  AdminRoutes(),
  vehicleController.updateVehicle
); // Admin only

router.delete(
  "/:vehicleId",
  verifyToken,
  AdminRoutes(),
  vehicleController.deleteVehicle
); // Admin only

export const vehicleRouts = router;
