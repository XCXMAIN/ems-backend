import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import emsRouter from "./routes/ems.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// EMS 라우터 등록
app.use("/api/v1/ems", emsRouter);

// 서버 실행
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () =>
  console.log(`✅ EMS Mock Server running on port ${PORT}`)
);

// WebSocket 서버 생성
const wss = new WebSocketServer({ server });
export { wss };
