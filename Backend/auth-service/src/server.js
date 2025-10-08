import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import sanitize from "mongo-sanitize";
import { connectToDatabase } from "./setup/db.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();

// Basic security and hardening
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

// Simple body sanitization middleware
app.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }
  next();
});

// Handle JSON parse/body errors to avoid empty replies
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, next) => {
  if (err && (err.type === 'entity.parse.failed' || err.name === 'SyntaxError' || err.message?.includes('request aborted'))) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  return res.status(500).json({ error: 'Internal server error' });
});

// Rate limit auth endpoints
app.use(
  "/api/auth",
  rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.use("/api/auth", authRouter);

const port = process.env.PORT || 4001;

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`auth-service listening on :${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start auth-service", err);
    process.exit(1);
  });

export default app;


