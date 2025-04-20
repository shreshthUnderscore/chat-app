const express = require("express");
const prisma = require("../prisma");
const { authenticateToken } = require("../auth");
const router = express.Router();

// Utility: check if two users are friends (accepted)
async function areFriends(userId, friendId) {
  if (userId === friendId) return false; // No DMs with self
  const fs = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { friendAId: userId, friendBId: friendId },
        { friendAId: friendId, friendBId: userId },
      ],
    },
  });
  return !!fs;
}

// GET /api/dm/:friendId - get all messages between this user and a friend
router.get("/:friendId", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const friendId = parseInt(req.params.friendId);

  if (!(await areFriends(userId, friendId)))
    return res.status(403).json({ error: "Not friends" });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } },
    },
  });

  res.json(messages);
});

// POST /api/dm/:friendId - send a DM to a friend
router.post("/:friendId", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const friendId = parseInt(req.params.friendId);
  const { content } = req.body;

  if (!(await areFriends(userId, friendId)))
    return res.status(403).json({ error: "Not friends" });
  if (!content || !content.trim())
    return res.status(400).json({ error: "Message content required" });

  const message = await prisma.message.create({
    data: {
      content,
      senderId: userId,
      receiverId: friendId,
    },
    include: {
      sender: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } },
    },
  });

  // You can later trigger a WebSocket notification here

  res.status(201).json(message);
});

module.exports = router;
