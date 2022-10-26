import express, { Express, Request, Response } from "express";
import cors from "cors";
import bugRoute from "./routes/bug";

const app: Express = express();

app.use(cors());

app.use("/bug", bugRoute);

app.get("/", (req: Request, res: Response) => {
    res.send("sending it");
});

export default app;
