const express = require("express");
const prisma = require("../prisma");
const { authenticateToken } = require("../auth");
const router = express.Router();

// Utility: Get all accepted friends for a user
async function getFriends(userId) {
  // Symmetric friendship
  const friendsA = await prisma.friendship.findMany({
    where: { friendAId: userId, status: "accepted" },
    include: { friendB: { select: { id: true, username: true } } },
  });
  const friendsB = await prisma.friendship.findMany({
    where: { friendBId: userId, status: "accepted" },
    include: { friendA: { select: { id: true, username: true } } },
  });
  // Flatten and unify results
  return [...friendsA.map((f) => f.friendB), ...friendsB.map((f) => f.friendA)];
}

// GET /api/friends - list all friends
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const friends = await getFriends(userId);
  res.json(friends);
});

// POST /api/friends/add - add a friend by username (auto-accept, mutual)
router.post("/add", authenticateToken, async (req, res) => {
  const username = req.body.username;
  const userId = req.user.userId;

  if (!username) return res.status(400).json({ error: "Username required" });
  if (username === req.user.username)
    return res.status(400).json({ error: "Cannot add yourself" });

  const friend = await prisma.user.findUnique({ where: { username } });
  if (!friend) return res.status(404).json({ error: "User not found" });

  // Prevent duplicate friendships (in either direction)
  const exists = await prisma.friendship.findFirst({
    where: {
      OR: [
        { friendAId: userId, friendBId: friend.id },
        { friendAId: friend.id, friendBId: userId },
      ],
    },
  });
  if (exists) return res.status(409).json({ error: "Already friends" });

  // Create mutual friendship (auto-accepted for simplicity)
  await prisma.friendship.create({
    data: {
      friendAId: userId,
      friendBId: friend.id,
      status: "accepted",
    },
  });

  res.json({
    success: true,
    friend: { id: friend.id, username: friend.username },
  });
});

module.exports = router;
