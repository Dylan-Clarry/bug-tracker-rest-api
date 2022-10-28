import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bugRoute from "./routes/bugRoute";
import userRoute from "./routes/userRoute";

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/bug", bugRoute);
app.use("/user", userRoute);

app.get("/", (_req: Request, res: Response) => {
    res.send("sending it");
});

export default app;
