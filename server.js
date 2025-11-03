import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import emsRouter from "./routes/ems.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 1️⃣ API 라우트는 항상 맨 위에 있어야 함
app.use("/api/v1/ems", emsRouter);

// ✅ 2️⃣ WebSocket 서버 (필요할 때)
const wss = new WebSocketServer({ noServer: true });
wss.on("connection", (ws) => {
  console.log("🔌 WebSocket client connected");
});

// ✅ 3️⃣ 프론트 빌드 파일 제공 (맨 마지막)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// ✅ 4️⃣ 서버 실행
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 EMS Mock Server running on port ${PORT}`);
});

export { wss };
