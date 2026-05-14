import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

export default app;
