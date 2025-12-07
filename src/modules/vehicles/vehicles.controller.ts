import { Request, Response } from "express";
import { vehiclesServices } from "./vehicles.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    // validate required fields
    const required = [
      "vehicle_name",
      "type",
      "registration_number",
      "daily_rent_price",
      "availability_status",
    ];
    for (const f of required)
      if (body[f] === undefined)
        return res.status(400).json({ error: `${f} is required` });
    const vehicle = await vehiclesServices.createVehicle(body);
    return res.status(201).json({ data: vehicle });
  } catch (err: any) {
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
};

const listVehicles = async (_req: Request, res: Response) => {
  const vehicles = await vehiclesServices.getAllVehicles();
  return res.json({ data: vehicles });
};

const getVehicle = async (req: Request, res: Response) => {
  const id = Number(req.params.vehicleId);
  const v = await vehiclesServices.getVehicleById(id);
  if (!v) return res.status(404).json({ error: "Vehicle not found" });
  return res.json({ data: v });
};

const updateVehicle = async (req: Request, res: Response) => {
  const id = Number(req.params.vehicleId);
  const updates = req.body;
  try {
    const updated = await vehiclesServices.updateVehicle(id, updates);
    return res.json({ data: updated });
  } catch (err: any) {
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  const id = Number(req.params.vehicleId);
  try {
    const deleted = await vehiclesServices.deleteVehicleIfNoActiveBookings(id);
    if (!deleted) return res.status(404).json({ error: "Vehicle not found" });
    return res.json({ data: deleted });
  } catch (err: any) {
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
};

export const vehicleController = {
  createVehicle,
  getVehicle,
  deleteVehicle,
  updateVehicle,
  listVehicles,
};
