import { Request, Response } from "express";
import { vehiclesServices } from "./vehicles.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate required fields
    const required = [
      "vehicle_name",
      "type",
      "registration_number",
      "daily_rent_price",
      "availability_status",
    ];

    for (const f of required) {
      if (body[f] === undefined) {
        return res.status(400).json({
          success: false,
          message: `${f} is required`,
          errors: `${f} is required`,
        });
      }
    }

    const vehicle = await vehiclesServices.createVehicle(body);

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error",
      errors: err.message,
    });
  }
};

const listVehicles = async (_req: Request, res: Response) => {
  try {
    const vehicles = await vehiclesServices.getAllVehicles();

    return res.json({
      success: true,
      message: "Vehicles fetched successfully",
      data: vehicles,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
      errors: err.message,
    });
  }
};

const getVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.vehicleId);
    const v = await vehiclesServices.getVehicleById(id);

    if (!v) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle not found",
      });
    }

    return res.json({
      success: true,
      message: "Vehicle fetched successfully",
      data: v,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
      errors: err.message,
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.vehicleId);
    const updates = req.body;

    const updated = await vehiclesServices.updateVehicle(id, updates);

    return res.json({
      success: true,
      message: "Vehicle updated successfully",
      data: updated,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error",
      errors: err.message,
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.vehicleId);

    const deleted = await vehiclesServices.deleteVehicleIfNoActiveBookings(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle not found",
      });
    }

    return res.json({
      success: true,
      message: "Vehicle deleted successfully",
      data: deleted,
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error",
      errors: err.message,
    });
  }
};

export const vehicleController = {
  createVehicle,
  getVehicle,
  deleteVehicle,
  updateVehicle,
  listVehicles,
};
