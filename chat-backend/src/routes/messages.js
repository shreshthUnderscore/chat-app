// src/routes/messages.js
const express = require("express");
const prisma = require("../prisma");
const { authenticateToken } = require("../auth");
const router = express.Router();

// GET /api/messages/rooms - list all chat rooms
router.get("/rooms", authenticateToken, async (req, res) => {
  const rooms = await prisma.room.findMany({
    select: { id: true, name: true, createdAt: true },
  });
  res.json(rooms);
});

// POST /api/messages/rooms - create new room
router.post("/rooms", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Room name required" });

  // Avoid duplicate names
  const existing = await prisma.room.findUnique({ where: { name } });
  if (existing) return res.status(409).json({ error: "Room name taken" });

  const room = await prisma.room.create({ data: { name } });
  res.status(201).json(room);
});

// GET /api/messages/:roomId - get message history for a room
router.get("/:roomId", authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  // You may want to check if room exists first
  const messages = await prisma.message.findMany({
    where: { roomId: Number(roomId) },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "asc" },
    take: 100, // limit history
  });
  // Format: [{id, content, createdAt, user: {username}}]
  res.json(messages);
});

// POST /api/messages/:roomId - post a new message in a room
router.post("/:roomId", authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content required" });

  // Optional: Check if room exists
  const room = await prisma.room.findUnique({ where: { id: Number(roomId) } });
  if (!room) return res.status(404).json({ error: "Room not found" });

  const message = await prisma.message.create({
    data: {
      content,
      userId: req.user.userId,
      roomId: Number(roomId),
    },
    include: { user: { select: { username: true } } },
  });

  res.status(201).json(message); // Optionally broadcast over WebSocket later
});

module.exports = router;
