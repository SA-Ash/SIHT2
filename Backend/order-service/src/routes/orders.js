import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { requireAuth, requireShopOrAdmin } from "../middleware/auth.js";
import { publishEvent } from "../utils/bus.js";

const router = Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
}

// helper to compute cost (simple model; adjust as needed)
function computeCost(printConfig) {
  const basePerPage = printConfig.color ? 2 : 1; // currency units
  const duplexMultiplier = printConfig.doubleSided ? 0.9 : 1;
  const typeMultiplier = printConfig.paperType === "premium" ? 1.5 : 1;
  const sizeMultiplier = printConfig.paperSize && printConfig.paperSize !== "A4" ? 1.2 : 1;
  const perPage = basePerPage * duplexMultiplier * typeMultiplier * sizeMultiplier;
  return Math.round(perPage * printConfig.pages * printConfig.copies * 100) / 100;
}

// Create new order
router.post(
  "/",
  requireAuth,
  body("shopId").isString(),
  body("fileUrl").isURL(),
  body("printConfig.pages").isInt({ min: 1 }),
  body("printConfig.color").isBoolean(),
  body("printConfig.doubleSided").isBoolean(),
  body("printConfig.copies").isInt({ min: 1 }),
  body("printConfig.paperSize").isString(),
  body("printConfig.paperType").isString(),
  validate,
  async (req, res) => {
    const shopId = new mongoose.Types.ObjectId(req.body.shopId);
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { fileUrl, printConfig, college } = req.body;

    const totalCost = computeCost(printConfig);
    const order = await Order.create({
      userId,
      shopId,
      status: "pending",
      fileUrl,
      printConfig,
      college,
      totalCost,
      estimatedTime: 0,
      queuePosition: 0,
    });

    // Emit Socket.IO event for new order
    const io = req.app.get('io');
    if (io) {
      io.to(`shop_${shopId}`).emit('new_order_received', {
        orderId: order._id,
        userId: order.userId,
        shopId: order.shopId,
        status: order.status,
        totalCost: order.totalCost,
        college: order.college,
        createdAt: order.createdAt
      });
    }

    await publishEvent("orders", "order.created", { id: order.id, userId: order.userId, shopId: order.shopId });
    return res.status(201).json(order);
  }
);

// Get order details
router.get(
  "/:orderId",
  requireAuth,
  param("orderId").isString(),
  async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Not found" });
    if (String(order.userId) !== req.user.id && req.user.role === "client") return res.status(403).json({ error: "Forbidden" });
    return res.json(order);
  }
);

// Get user orders
router.get(
  "/user/:userId",
  requireAuth,
  param("userId").isString(),
  async (req, res) => {
    if (req.user.role === "client" && req.params.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    return res.json(orders);
  }
);

// Update order status
router.put(
  "/:orderId/status",
  requireAuth,
  requireShopOrAdmin,
  param("orderId").isString(),
  body("status").isIn(["pending", "accepted", "printing", "completed", "cancelled"]),
  async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Not found" });
    
    const oldStatus = order.status;
    order.status = req.body.status;
    await order.save();

    // Emit Socket.IO event for status update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.userId}`).emit('order_updated', {
        orderId: order._id,
        userId: order.userId,
        shopId: order.shopId,
        oldStatus,
        newStatus: order.status,
        updatedAt: order.updatedAt
      });
    }

    await publishEvent("orders", "order.status", { id: order.id, status: order.status });
    return res.json(order);
  }
);

// Cancel order
router.post(
  "/:orderId/cancel",
  requireAuth,
  param("orderId").isString(),
  async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Not found" });
    if (String(order.userId) !== req.user.id && req.user.role === "client") return res.status(403).json({ error: "Forbidden" });
    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(400).json({ error: "Cannot cancel" });
    }
    order.status = "cancelled";
    await order.save();
    await publishEvent("orders", "order.cancelled", { id: order.id });
    return res.json(order);
  }
);

// Get orders for a shop
router.get(
  "/shop/:shopId",
  requireAuth,
  requireShopOrAdmin,
  param("shopId").isString(),
  async (req, res) => {
    const orders = await Order.find({ shopId: req.params.shopId }).sort({ createdAt: -1 });
    return res.json(orders);
  }
);

// Get current user's orders (for students)
router.get(
  "/my-orders",
  requireAuth,
  async (req, res) => {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(orders);
  }
);

// Get orders for current partner's shop
router.get(
  "/partner-orders",
  requireAuth,
  requireShopOrAdmin,
  async (req, res) => {
    // For now, we'll get all orders and filter by shop
    // In a real implementation, you'd get the shop ID from the partner's profile
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.json(orders);
  }
);

export default router;


