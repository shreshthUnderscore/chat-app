const express = require("express");
const prisma = require("../prisma");
const { authenticateToken } = require("../auth");
const router = express.Router();

// GET /api/friends - list all users except self
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    select: { id: true, username: true },
  });
  res.json(users);
});

module.exports = router;
