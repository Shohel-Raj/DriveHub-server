import { Request, Response } from "express";
import { userService } from "./users.service";

const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const data = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
      errors: error.message,
    });
  }
};

const updateUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;          // requested user ID
    const loggedInUserId = req.user.userId; // from JWT
    const role = req.user.role;             // from JWT

    // Check ownership
    const isOwner = await userService.isOwner(loggedInUserId, userId as string);

    if (!isOwner && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not allowed to update this user",
        errors: "not-owner",
      });
    }

    const updated = await userService.updateUser(userId as string, req.body);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user",
      errors: error.message,
    });
  }
};

const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await userService.deleteUser(userId as string);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user",
      errors: error.message,
    });
  }
};

export const userController = {
  getAllUsersController,
  updateUserController,
  deleteUserController,
};
