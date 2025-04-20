const express = require("express");
const cors = require("cors");
const http = require("http");
const { createWebSocketServer } = require("./wsServer");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const friendsRoutes = require("./routes/friends");
const dmRoutes = require("./routes/dm");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/dm", dmRoutes);

const server = http.createServer(app);

createWebSocketServer(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
