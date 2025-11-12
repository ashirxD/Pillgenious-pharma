// serverSession.js - Authentication middleware
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { ADMIN_CREDENTIALS } = require("../config/adminCredentials");
const util = require("util");
const verifyAsync = util.promisify(jwt.verify);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

async function getServerSession(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No authorization header" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid authorization format" });
    }

    const token = parts[1];

    let payload;
    try {
      payload = await verifyAsync(token, JWT_SECRET);
    } catch (err) {
      // token expired or invalid
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired token" });
    }

    if (!payload || typeof payload !== "object" || !payload.sub) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token payload" });
    }

    // Check if it's a hardcoded admin first
    const adminUser = ADMIN_CREDENTIALS.find(admin => admin.id === payload.sub);
    if (adminUser) {
      req.user = {
        _id: adminUser.id,
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      };
      return next();
    }

    // If not admin, check database users
    // fetch only required fields — projection reduces payload size and DB work
    const user = await User.findById(payload.sub).select("_id email role name").exec();
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "User not found" });
    }

    req.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
}

module.exports = getServerSession;
