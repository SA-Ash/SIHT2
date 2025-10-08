import { Router } from "express";
import { body, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { sendSms, sendEmail } from "../utils/comm.js";
import { signAccessToken, signRefreshToken, hashToken, compareToken, verifyRefreshToken } from "../utils/jwt.js";

const router = Router();

function badRequest(res, errors) {
  return res.status(400).json({ errors });
}

function issueTokens(user) {
  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: user.id });
  return { accessToken, refreshToken };
}

// POST /api/auth/phone/initiate
router.post(
  "/phone/initiate",
  body("phone").isString().isLength({ min: 8, max: 20 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array());
    const { phone } = req.body;

    const code = String(Math.floor(1000 + Math.random() * 9000));
    const ttl = Number(process.env.OTP_TTL_SEC || 300);
    const expiresAt = new Date(Date.now() + ttl * 1000);

    await Otp.deleteMany({ phone });
    await Otp.create({ phone, code: await bcrypt.hash(code, 10), expiresAt });

    await sendSms(phone, `Your QuickPrint OTP is ${code}. It expires in ${Math.floor(ttl / 60)} min.`);
    console.log("SMS sent to", phone);
    console.log("Code:", code);
    return res.json({ success: true });
  }
);

// POST /api/auth/phone/verify
router.post(
  "/phone/verify",
  body("phone").isString(),
  body("code").isString().isLength({ min: 4, max: 10 }),
  body("college").optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array());
    const { phone, code, college } = req.body;

    const otp = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    if (!otp) return res.status(400).json({ error: "OTP not found" });
    if (otp.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: "OTP expired" });
    if (!(await bcrypt.compare(code, otp.code))) {
      otp.attempts += 1;
      await otp.save();
      return res.status(400).json({ error: "Invalid code" });
    }

    await Otp.deleteMany({ phone });

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, college, role: "client", isVerified: true, lastLoginAt: new Date() });
    } else {
      user.isVerified = true;
      user.lastLoginAt = new Date();
      if (college) user.college = college;
      await user.save();
    }

    const { accessToken, refreshToken } = issueTokens(user);
    user.refreshTokenHash = await hashToken(refreshToken);
    await user.save();

    return res.json({ accessToken, refreshToken, user: { id: user.id, role: user.role, phone: user.phone, college: user.college } });
  }
);

// POST /api/auth/google
router.post(
  "/google",
  body("idToken").isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array());
    const { idToken } = req.body;

    // Minimal verification: accept dev token, otherwise expect upstream verification to be added later
    const allowDev = process.env.ALLOW_DEV_GOOGLE === "true";
    let googleId = null;
    let email = null;
    let name = null;
    if (allowDev && idToken.startsWith("dev:")) {
      // dev:id:email:name
      const parts = idToken.split(":");
      googleId = parts[1] || uuidv4();
      email = parts[2] || undefined;
      name = parts[3] || undefined;
    } else {
      return res.status(501).json({ error: "Google verification not configured" });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ googleId, email, name, role: "client", isVerified: true, lastLoginAt: new Date() });
    } else {
      user.lastLoginAt = new Date();
      user.isVerified = true;
      await user.save();
    }

    const { accessToken, refreshToken } = issueTokens(user);
    user.refreshTokenHash = await hashToken(refreshToken);
    await user.save();

    return res.json({ accessToken, refreshToken, user: { id: user.id, role: user.role, email: user.email, name: user.name } });
  }
);

// POST /api/auth/college
router.post(
  "/college",
  body("email").isEmail(),
  body("code").optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array());
    const { email, code } = req.body;

    const allowed = (process.env.COLLEGE_DOMAIN || "edu").toLowerCase();
    if (!email.toLowerCase().includes(`.${allowed}`) && !email.toLowerCase().endsWith(`@${allowed}`)) {
      return res.status(400).json({ error: "Email domain not allowed" });
    }

    if (!code) {
      const emailCode = String(Math.floor(100000 + Math.random() * 900000));
      const ttl = Number(process.env.OTP_TTL_SEC || 300);
      const expiresAt = new Date(Date.now() + ttl * 1000);
      await Otp.deleteMany({ phone: email });
      await Otp.create({ phone: email, code: await bcrypt.hash(emailCode, 10), expiresAt });
      await sendEmail(email, "Your QuickPrint verification code", `<p>Your code is <b>${emailCode}</b></p>`);
      return res.json({ challenge: "email_code_sent" });
    }

    const otp = await Otp.findOne({ phone: email }).sort({ createdAt: -1 });
    if (!otp) return res.status(400).json({ error: "Code not found" });
    if (otp.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: "Code expired" });
    if (!(await bcrypt.compare(code, otp.code))) return res.status(400).json({ error: "Invalid code" });
    await Otp.deleteMany({ phone: email });

    let user = await User.findOne({ email });
    if (!user) user = await User.create({ email, role: "client", isVerified: true, lastLoginAt: new Date() });
    else {
      user.isVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const { accessToken, refreshToken } = issueTokens(user);
    user.refreshTokenHash = await hashToken(refreshToken);
    await user.save();
    return res.json({ accessToken, refreshToken, user: { id: user.id, role: user.role, email: user.email } });
  }
);

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.json({ success: true });
  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.sub);
    if (user) {
      user.refreshTokenHash = undefined;
      await user.save();
    }
  } catch (_) {
    // ignore
  }
  return res.json({ success: true });
});

// POST /api/auth/refresh
router.post(
  "/refresh",
  body("refreshToken").isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array());
    const { refreshToken } = req.body;
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (e) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    const user = await User.findById(decoded.sub);
    if (!user || !(await compareToken(refreshToken, user.refreshTokenHash))) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    const tokens = issueTokens(user);
    user.refreshTokenHash = await hashToken(tokens.refreshToken);
    await user.save();
    return res.json(tokens);
  }
);

export default router;


