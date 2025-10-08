import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "dev_access_secret");
    req.user = { id: decoded.sub, role: decoded.role };
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}


