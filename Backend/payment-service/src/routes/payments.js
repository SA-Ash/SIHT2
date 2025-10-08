import { Router } from "express";
import { body, param } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { Payment } from "../models/Payment.js";
import { requireAuth } from "../middleware/auth.js";
import { publishPaymentEvent } from "../utils/bus.js";

const router = Router();

// Initiate a payment (UPI intent or COD)
router.post(
  "/initiate",
  requireAuth,
  body("orderId").isString(),
  body("amount").isFloat({ gt: 0 }),
  body("method").isIn(["upi", "cod"]),
  async (req, res) => {
    const { orderId, amount, method, upiId } = req.body;
    const payment = await Payment.create({
      orderId: new mongoose.Types.ObjectId(orderId),
      userId: new mongoose.Types.ObjectId(req.user.id),
      method,
      amount,
      status: method === "cod" ? "pending" : "initiated",
    });

    let upiIntent = null;
    if (method === "upi") {
      const payee = process.env.UPI_PAYEE_VPA || "quickprint@upi";
      const txnId = uuidv4().slice(0, 12);
      const note = encodeURIComponent("QuickPrint Order");
      const amt = amount.toFixed(2);
      upiIntent = `upi://pay?pa=${encodeURIComponent(payee)}&pn=QuickPrint&tn=${note}&am=${amt}&cu=INR&tid=${txnId}${upiId ? `&pa2=${encodeURIComponent(upiId)}` : ""}`;
      payment.upiIntent = upiIntent;
      payment.providerRef = txnId;
      await payment.save();
    }

    await publishPaymentEvent("payment.initiated", { id: payment.id, orderId: payment.orderId, method: payment.method, amount: payment.amount });
    return res.status(201).json({ paymentId: payment.id, method, upiIntent, status: payment.status });
  }
);

// Verify payment (UPI callback/poll). For demo, accept token "dev:paid".
router.post(
  "/verify",
  requireAuth,
  body("paymentId").isString(),
  body("providerStatus").isString(),
  async (req, res) => {
    const { paymentId, providerStatus } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (String(payment.userId) !== req.user.id && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    if (providerStatus === "dev:paid") {
      payment.status = "paid";
    } else if (providerStatus === "dev:failed") {
      payment.status = "failed";
    }
    await payment.save();
    await publishPaymentEvent("payment.updated", { id: payment.id, status: payment.status });
    return res.json({ status: payment.status });
  }
);

// Get payment
router.get(
  "/:paymentId",
  requireAuth,
  param("paymentId").isString(),
  async (req, res) => {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (String(payment.userId) !== req.user.id && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    return res.json(payment);
  }
);

// Cancel payment (COD or unpaid UPI)
router.post(
  "/:paymentId/cancel",
  requireAuth,
  param("paymentId").isString(),
  async (req, res) => {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (String(payment.userId) !== req.user.id && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    if (["paid", "refunded", "cancelled"].includes(payment.status)) return res.status(400).json({ error: "Cannot cancel" });
    payment.status = "cancelled";
    await payment.save();
    await publishPaymentEvent("payment.updated", { id: payment.id, status: payment.status });
    return res.json({ status: payment.status });
  }
);

export default router;


