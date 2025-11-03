import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import emsRouter from "./routes/ems.js"; // 라우터 파일 있을 경우

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 1️⃣ API 라우트는 항상 맨 위에 있어야 함
app.use("/api/v1/ems", emsRouter);

// ✅ 2️⃣ 프론트 정적 파일 서빙은 맨 마지막에
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// ✅ 3️⃣ 서버 실행
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 EMS Mock Server running on port ${PORT}`);
});
