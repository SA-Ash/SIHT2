import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import sanitize from "mongo-sanitize";
import { connectToDatabase } from "./setup/db.js";
import discoveryRouter from "./routes/discovery.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") req.body = sanitize(req.body);
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "discovery-service" }));

app.use("/api/discovery", discoveryRouter);

const port = process.env.PORT || 4004;
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`discovery-service listening on :${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start discovery-service", err);
    process.exit(1);
  });

export default app;


