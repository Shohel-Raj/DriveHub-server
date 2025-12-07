import { Router } from "express";
import { userController } from "./users.controller";
import { verifyToken } from "../../middleware/auth";
import { AdminRoutes } from "../../middleware/role";




const router = Router();

// GET all users (Admin only)
router.get("/",verifyToken, AdminRoutes(), userController.getAllUsersController);

// UPDATE user (Admin or the same user)
router.put("/:userId",verifyToken, userController.updateUserController);

// DELETE user (Admin only AND only if no active bookings)
router.delete("/:userId",verifyToken, AdminRoutes(),  userController.deleteUserController);

export const useRoutes = router;
