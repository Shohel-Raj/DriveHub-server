import { Request, Response, NextFunction } from "express";

export const AdminRoutes = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user; // attached by auth middleware

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User info not found",
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You don't have permission",
        });
      }

      // If role === admin → go next
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};
