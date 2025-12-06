import { Router } from 'express';
import { vehicleController } from './vehicles.controller';


const router = Router();

router.post('/',  vehicleController.createVehicle); // Admin only

router.get('/', vehicleController.listVehicles); // Public

router.get('/:vehicleId', vehicleController.getVehicle); // Public

router.put('/:vehicleId',   vehicleController.updateVehicle); // Admin only

router.delete('/:vehicleId', vehicleController.deleteVehicle); // Admin only

export const vehicleRouts= router;
