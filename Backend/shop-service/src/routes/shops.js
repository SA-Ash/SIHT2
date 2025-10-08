import { Router } from "express";
import { body, query, param } from "express-validator";
import mongoose from "mongoose";
import { Shop } from "../models/Shop.js";
import { requireAuth, requireShopOwnerOrAdmin } from "../middleware/auth.js";
import { publishCapacityUpdate } from "../utils/bus.js";

const router = Router();

router.post(
  "/register",
  requireAuth,
  requireShopOwnerOrAdmin,
  body("name").isString().isLength({ min: 2 }),
  body("location.coordinates").isArray({ min: 2, max: 2 }),
  async (req, res) => {
    const { name, location, address, contact, capacity, services, pricing } = req.body;
    const shop = await Shop.create({
      ownerId: new mongoose.Types.ObjectId(req.user.id),
      name,
      location,
      address,
      contact,
      capacity,
      services,
      pricing,
    });
    return res.status(201).json(shop);
  }
);

router.get(
  "/nearby",
  query("lng").isFloat(),
  query("lat").isFloat(),
  query("radius").optional().isInt({ min: 100, max: 50000 }),
  async (req, res) => {
    const { lng, lat } = req.query;
    const radius = Number(req.query.radius || 3000); // meters
    const shops = await Shop.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: radius,
        },
      },
    }).limit(50);
    return res.json(shops);
  }
);

router.get(
  "/:shopId",
  param("shopId").isString(),
  async (req, res) => {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: "Not found" });
    return res.json(shop);
  }
);

router.put(
  "/:shopId/capacity",
  requireAuth,
  requireShopOwnerOrAdmin,
  param("shopId").isString(),
  body("maxQueue").optional().isInt({ min: 0 }),
  body("currentQueue").optional().isInt({ min: 0 }),
  body("processingRate").optional().isInt({ min: 0 }),
  async (req, res) => {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: "Not found" });
    if (String(shop.ownerId) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    shop.capacity = { ...shop.capacity.toObject(), ...req.body };
    await shop.save();
    await publishCapacityUpdate(shop.id, shop.capacity);
    return res.json(shop);
  }
);

router.put(
  "/:shopId/status",
  requireAuth,
  requireShopOwnerOrAdmin,
  param("shopId").isString(),
  body("isActive").isBoolean(),
  async (req, res) => {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: "Not found" });
    if (String(shop.ownerId) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    shop.isActive = req.body.isActive;
    await shop.save();
    return res.json(shop);
  }
);

export default router;


