import express, { Request, Response } from "express";
import config from "./config";
import initDB from "./config/db";

const app = express();
// const port = Number(process.env.PORT);
const port=config.port

initDB();

// parser
app.use(express.json())

app.get("/", (req: Request, res: Response) => {
  res.send("DriveHub");
});

app.listen(port, () => {
  console.log(`DriveHub app listening on port ${port}`);
});
