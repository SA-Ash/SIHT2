import { Router } from "express";
import { body } from "express-validator";
import { Shop } from "../models/Shop.js";

const router = Router();

function haversineKm(a, b) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function estimateWaitMinutes(shop) {
  const rate = Math.max(shop.capacity?.processingRate || 10, 1);
  const queued = shop.capacity?.currentQueue || 0;
  return Math.round((queued / rate) * 60);
}

function estimateCost(printJob, pricing) {
  const basePerPage = printJob.color ? (pricing?.color || 2) : (pricing?.bw || 1);
  const duplexMultiplier = printJob.doubleSided ? 0.9 : 1;
  const typeMultiplier = printJob.paperType === "premium" ? 1.5 : 1;
  const sizeMultiplier = printJob.paperSize && printJob.paperSize !== "A4" ? 1.2 : 1;
  return Math.round(basePerPage * duplexMultiplier * typeMultiplier * sizeMultiplier * printJob.pages * printJob.copies * 100) / 100;
}

// POST /api/discovery/optimal-shop
router.post(
  "/optimal-shop",
  body("userLocation").isArray({ min: 2, max: 2 }),
  body("printJob.pages").isInt({ min: 1 }),
  body("printJob.color").isBoolean(),
  body("printJob.doubleSided").isBoolean(),
  body("printJob.copies").isInt({ min: 1 }),
  body("printJob.paperSize").isString(),
  body("printJob.paperType").isString(),
  async (req, res) => {
    const { userLocation, printJob, radiusKm = 5 } = req.body;
    const lng = Number(userLocation[0]);
    const lat = Number(userLocation[1]);

    const shops = await Shop.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: Number(radiusKm) * 1000,
        },
      },
    }).limit(100);

    const scored = shops
      .filter((s) => (s.capacity?.currentQueue || 0) < (s.capacity?.maxQueue || 10))
      .map((shop) => {
        const distanceKm = haversineKm([lng, lat], shop.location.coordinates);
        const estimatedWait = estimateWaitMinutes(shop);
        const cost = estimateCost(printJob, shop.pricing);
        return { shop, distanceKm, estimatedWait, cost };
      })
      .sort((a, b) => a.estimatedWait - b.estimatedWait || a.distanceKm - b.distanceKm || a.cost - b.cost);

    return res.json({ best: scored[0] || null, candidates: scored.slice(0, 10) });
  }
);

export default router;


