import express, { Request, Response } from "express";
import config from "./config";
import initDB from "./config/db";
import { authRouter } from "./modules/auth/auth.routes";
import cors from "cors"
import { useRoutes } from "./modules/users/users.routes";

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

app.listen(port, () => {
  console.log(`DriveHub app listening on port ${port}`);
});
