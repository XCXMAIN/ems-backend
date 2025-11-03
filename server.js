import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------
// ✅ WebSocket 서버 생성
// ----------------------------
const wss = new WebSocketServer({ noServer: true });

// 클라이언트 연결 이벤트
wss.on("connection", (ws) => {
  console.log("🔌 WebSocket client connected");

  ws.on("message", (msg) => {
    console.log("📩 Received:", msg.toString());
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});

// ----------------------------
// ✅ API 라우트 연결
// ----------------------------
import emsRouter from "./routes/ems.js";
app.use("/api/v1/ems", emsRouter);

// ----------------------------
// ✅ 서버 실행
// ----------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 EMS Mock Server running on port ${PORT}`);
});

// ----------------------------
// ✅ export (여기가 핵심!!!)
// ----------------------------
export { wss };
