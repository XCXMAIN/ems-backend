import express from "express";
import { wss } from "../server.js";

const router = express.Router();

// 🟢 최신 EMS 요약 데이터 저장
let latestEMSData = null;

/**
 * 📌 POST /api/v1/ems
 * EMS 단말 → 서버로 원본 데이터 전송
 */
router.post("/", (req, res) => {
  const data = req.body;

  console.log("📩 [RAW EMS DATA RECEIVED]");
  console.log(JSON.stringify(data, null, 2));

  // 🟥 실제 EMS 인버터 데이터 구조 처리
  const metrics = data.metrics;

  const parsed = {
    timestamp: new Date().toISOString(),
    site: "site-001",

    soc: metrics.batt_capacity_percent,
    pv_power: metrics.pv_input_voltage * metrics.pv_input_current,

    battery_voltage: metrics.batt_voltage,
    battery_temp: metrics.heatsink_temp,

    charge_current: metrics.batt_charge_current,
    discharge_current: metrics.batt_discharge_current,

    ac_output_w: metrics.ac_out_watt,
    load_percent: metrics.load_percent,

    grid_voltage: metrics.grid_voltage,

    mode: data.type
  };

  console.log("\n🟢 [EMS Parsed Data]");
  console.table(parsed);

  latestEMSData = parsed;

  // 🟢 WebSocket 실시간 브로드캐스트
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(parsed));
    }
  });

  res.json({ status: "ok" });
});

/**
 * 📌 GET /api/v1/ems/latest
 * 프론트 → 최신 EMS 요약 데이터 조회
 */
router.get("/latest", (req, res) => {
  if (!latestEMSData) {
    return res.json({ message: "No EMS data received yet" });
  }

  res.json(latestEMSData);
});

export default router;
