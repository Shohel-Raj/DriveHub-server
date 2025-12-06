import { Router } from "express";
import { userController } from "./users.controller";




const router = Router();

// GET all users (Admin only)
router.get("/", userController.getAllUsersController);

// UPDATE user (Admin or the same user)
router.put("/:userId", userController.updateUserController);

// DELETE user (Admin only AND only if no active bookings)
router.delete("/:userId",  userController.deleteUserController);

export const useRoutes = router;
