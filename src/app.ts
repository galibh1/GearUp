import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import httpsStatus from "http-status";

const app: Application = express(); 

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.post("/api/users/register", async (req: Request, res: Response) => {
  const payload = req.body;

  console.log(payload);

  res.status(httpsStatus.CREATED).json({ message: "User registered successfully"});
});
 
export default app;
