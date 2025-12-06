import { Request, Response, NextFunction } from "express";
import { userService } from "./users.service";

const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const data = await userService.getAllUsers();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, massage: error.massage });
  }
};

const updateUserController = async (
  req: Request,
  res: Response,

) => {
  try {
    const { userId } = req.params;
    const updated = await userService.updateUser(userId as string, req.body);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(401).json({ success: false, massage: error.massage });
  }
};

const deleteUserController = async (
  req: Request,
  res: Response,

) => {
  try {
    const { userId } = req.params;
    // const id=Number(userId)
    await userService.deleteUser(userId);

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(401).json({ success: false, massage: error.massage });
  }
};

export const userController = {
  getAllUsersController,
  updateUserController,
  deleteUserController,
};
