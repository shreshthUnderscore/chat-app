// src/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "changemetosecure";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(409).json({ error: "Username taken" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed },
    });

    const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // After user is created...
    const shreshth = await prisma.user.findUnique({
      where: { username: "Shreshth" },
    });
    if (shreshth && shreshth.id !== user.id) {
      // Check if friendship already exists
      const exists = await prisma.friendship.findFirst({
        where: {
          OR: [
            { friendAId: user.id, friendBId: shreshth.id },
            { friendAId: shreshth.id, friendBId: user.id },
          ],
        },
      });
      if (!exists) {
        await prisma.friendship.create({
          data: {
            friendAId: user.id,
            friendBId: shreshth.id,
            status: "accepted",
          },
        });
      }
    }

    res.status(201).json({ token, username });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
