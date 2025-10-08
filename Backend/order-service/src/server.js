import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import sanitize from "mongo-sanitize";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectToDatabase } from "./setup/db.js";
import ordersRouter from "./routes/orders.js";

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

app.get("/health", (_req, res) => res.json({ status: "ok", service: "order-service" }));

app.use("/api/orders", ordersRouter);

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user to their personal room
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join partner to their shop room
  socket.on('join_shop_room', (shopId) => {
    socket.join(`shop_${shopId}`);
    console.log(`Partner joined shop room: ${shopId}`);
  });

  // Handle order status updates
  socket.on('order_status_update', (data) => {
    // Broadcast to all users in the shop room
    socket.to(`shop_${data.shopId}`).emit('order_updated', data);
    // Broadcast to the user who placed the order
    socket.to(`user_${data.userId}`).emit('order_updated', data);
  });

  // Handle new order creation
  socket.on('new_order', (data) => {
    // Broadcast to shop room
    socket.to(`shop_${data.shopId}`).emit('new_order_received', data);
    // Broadcast to user room
    socket.to(`user_${data.userId}`).emit('order_created', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available globally
app.set('io', io);

const port = process.env.PORT || 4002;
connectToDatabase()
  .then(() => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`order-service listening on :${port} with Socket.IO`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start order-service", err);
    process.exit(1);
  });

export default app;


