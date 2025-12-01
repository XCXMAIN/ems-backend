import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config();
const app = express();

// 🟢 CORS 설정 (모든 도메인 허용)
app.use(cors());
app.use(express.json());

// 🟢 WebSocket 서버 생성
export const wss = new WebSocketServer({ noServer: true });

// WebSocket 연결 이벤트
wss.on("connection", (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`✅ WebSocket: Client connected from ${clientIP}`);
  
  // 연결 시 환영 메시지
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connected to EMS server',
    timestamp: new Date().toISOString()
  }));

  ws.on("close", () => {
    console.log(`❌ WebSocket: Client disconnected from ${clientIP}`);
  });
  
  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

// 🟢 라우터 Import (순서 중요: dashboard를 먼저)
import dashboardRouter from "./routes/dashboard.js";
import inverterRouter from "./routes/inverter.js";

// 🟢 ESP32 게이트웨이 → 서버: 인버터 데이터 수신
app.use("/api/inverter", inverterRouter);

// 🟢 프론트엔드 ← 서버: 대시보드 데이터 조회
app.use("/api/v1/dashboard", dashboardRouter);

// 🟢 루트 경로 - API 정보
app.get("/", (req, res) => {
  res.json({
    name: "EMS Backend Server",
    version: "2.0.0",
    status: "online",
    endpoints: {
      // ESP32 → 서버
      inverter_data: "POST /api/inverter/data",
      inverter_latest: "GET /api/inverter/latest",
      
      // 프론트엔드 ← 서버
      dashboard_latest: "GET /api/v1/dashboard/latest",
      dashboard_recent: "GET /api/v1/dashboard/recent?limit=50",
      dashboard_history: "GET /api/v1/dashboard/history?start=...&end=...",
      dashboard_stats: "GET /api/v1/dashboard/stats?limit=100",
      dashboard_status: "GET /api/v1/dashboard/status",
      
      // 실시간
      websocket: "wss://[host]/"
    }
  });
});

// 🟢 Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;

// 🟢 HTTP 서버 시작
const server = app.listen(PORT, () => {
  console.log(`🚀 EMS Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}/`);
  console.log(`\n📋 API Endpoints:`);
  console.log(`   ESP32 → POST /api/inverter/data`);
  console.log(`   Frontend → GET /api/v1/dashboard/latest`);
  console.log(`   Frontend → GET /api/v1/dashboard/recent`);
  console.log(`   Frontend → WebSocket ws://localhost:${PORT}/`);
});

// 🟢 WebSocket Upgrade 처리
server.on("upgrade", (req, socket, head) => {
  if (req.url === "/" || req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});
