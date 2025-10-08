import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import sanitize from "mongo-sanitize";
import { connectToDatabase } from "./setup/db.js";
import paymentsRouter from "./routes/payments.js";

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

app.get("/health", (_req, res) => res.json({ status: "ok", service: "payment-service" }));

app.use("/api/payments", paymentsRouter);

const port = process.env.PORT || 4006;
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`payment-service listening on :${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start payment-service", err);
    process.exit(1);
  });

export default app;


