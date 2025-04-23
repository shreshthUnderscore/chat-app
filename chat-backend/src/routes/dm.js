const express = require("express");
const prisma = require("../prisma");
const { authenticateToken } = require("../auth");
const router = express.Router();

// Utility: all users are friends by default (except self)
function areFriends(userId, friendId) {
  return userId !== friendId;
}

// GET /api/dm/:friendId - get all messages between this user and a friend
router.get("/:friendId", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const friendId = parseInt(req.params.friendId);

  if (!areFriends(userId, friendId))
    return res.status(403).json({ error: "Cannot DM yourself" });

  // Ensure friend exists
  const friend = await prisma.user.findUnique({ where: { id: friendId } });
  if (!friend) return res.status(404).json({ error: "User not found" });

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

  if (!areFriends(userId, friendId))
    return res.status(403).json({ error: "Cannot DM yourself" });

  // Ensure friend exists
  const friend = await prisma.user.findUnique({ where: { id: friendId } });
  if (!friend) return res.status(404).json({ error: "User not found" });

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

  // (WebSocket notification logic can go here if needed)

  res.status(201).json(message);
});

module.exports = router;
