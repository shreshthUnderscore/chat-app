const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const prisma = require("./prisma");

const JWT_SECRET = process.env.JWT_SECRET || "changemetosecure";

// userId => ws
const onlineUsers = new Map();

/**
 * Client protocol:
 * - { type: "message", to: <friendId>, content: <text> }
 * - (optional) { type: "ping" } // for keepalive
 */

function createWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });
  console.log("[WebSocket] Panchayat DM Server initialized");

  wss.on("connection", async (ws, req) => {
    // Authenticate via ?token=
    const params = new URLSearchParams(req.url.split("?")[1] || "");
    const token = params.get("token");
    if (!token) {
      ws.close(4001, "Authentication required");
      return;
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      ws.close(4002, "Invalid token");
      return;
    }

    onlineUsers.set(user.userId, ws);
    ws.user = user; // Attach to socket for convenience

    ws.send(
      JSON.stringify({ type: "info", message: "Connected to Panchayat DM" })
    );

    ws.on("message", async (data) => {
      let msg;
      try {
        msg = JSON.parse(data);
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      if (msg.type === "message") {
        const toId = Number(msg.to);
        const content = msg.content;
        // Validate friendship
        const friendship = await prisma.friendship.findFirst({
          where: {
            status: "accepted",
            OR: [
              { friendAId: user.userId, friendBId: toId },
              { friendAId: toId, friendBId: user.userId },
            ],
          },
        });
        if (!friendship) {
          ws.send(JSON.stringify({ type: "error", message: "Not friends" }));
          return;
        }
        // Save message
        const dm = await prisma.message.create({
          data: {
            content,
            senderId: user.userId,
            receiverId: toId,
          },
          include: {
            sender: { select: { id: true, username: true } },
            receiver: { select: { id: true, username: true } },
          },
        });
        // Send message to self (sender)
        ws.send(
          JSON.stringify({
            type: "message",
            message: dm,
          })
        );
        // Send to recipient if online
        const friendWs = onlineUsers.get(toId);
        if (friendWs && friendWs.readyState === WebSocket.OPEN) {
          friendWs.send(
            JSON.stringify({
              type: "message",
              message: dm,
            })
          );
        }
      }
      // Optionally handle ping/pong
    });

    ws.on("close", () => {
      onlineUsers.delete(user.userId);
    });
  });
}

module.exports = { createWebSocketServer };
