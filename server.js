import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import emsRouter from "./routes/ems.js";
import dataRouter from "./routes/api_b.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🟢 WebSocket 서버 생성
export const wss = new WebSocketServer({ noServer: true });

// 🟢 WebSocket 연결 이벤트
wss.on("connection", (ws) => {
  console.log("✅ WebSocket: Client connected");

  ws.on("close", () => console.log("❌ WebSocket: Client disconnected"));
});

// 🟢 EMS 데이터 수신 API (POST)
app.use("/api/v1/ems", emsRouter);

// 🟢 프론트엔드 대시보드용 데이터 조회 API (GET)
app.use("/api/v1/data", dataRouter);

const PORT = process.env.PORT || 8080;

// 🟢 HTTP 서버 + WebSocket Upgrade 처리
const server = app.listen(PORT, () =>
  console.log(`🚀 EMS Mock Server running on port ${PORT}`)
);

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});
