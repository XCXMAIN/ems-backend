import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import emsRouter from "./routes/ems.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 1️⃣ API 라우트 등록 (항상 가장 위에)
app.use("/api/v1/ems", emsRouter);

// ✅ 2️⃣ WebSocket 서버 (선택 사항, 실시간 필요 시)
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  console.log("🔌 WebSocket client connected");

  ws.on("message", (msg) => {
    console.log("📩 Received:", msg.toString());
  });

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
  });
});

// ✅ 3️⃣ 프론트엔드 서빙 (현재는 프론트 별도라 주석 처리)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use(express.static(path.join(__dirname, "frontend/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
// });

// ✅ 4️⃣ 서버 실행
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 EMS Mock Server running on port ${PORT}`);
});

// ✅ 5️⃣ export (ems.js에서 wss 사용 시 필요)
export { wss };
