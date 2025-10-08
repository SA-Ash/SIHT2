import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import sanitize from "mongo-sanitize";
import { connectToDatabase } from "./setup/db.js";
import shopsRouter from "./routes/shops.js";

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

app.get("/health", (_req, res) => res.json({ status: "ok", service: "shop-service" }));

app.use("/api/shops", shopsRouter);

const port = process.env.PORT || 4003;
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`shop-service listening on :${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start shop-service", err);
    process.exit(1);
  });

export default app;


