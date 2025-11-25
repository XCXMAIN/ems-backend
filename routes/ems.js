import express from "express";
import { wss } from "../server.js"; // WebSocket
import pool from "../db.js";       // ✅ DB 연결 추가 (B파트)

const router = express.Router();

// 🟢 최신 EMS 요약 데이터 저장 (메모리 캐시)
let latestEMSData = null;

/**
 * 📌 POST /api/v1/device/ems
 * 인버터 → 서버로 원본 데이터 전송 & DB 저장 & 브로드캐스트
 */
router.post("/ems", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 [RAW EMS DATA RECEIVED]");
    // console.log(JSON.stringify(data, null, 2)); // 로그 너무 길면 주석 처리

    // 1. 데이터 검증
    if (!data.metrics) {
        return res.status(400).json({ error: "metrics missing" });
    }

    // 🟥 실제 EMS 인버터 데이터 구조 처리
    const metrics = data.metrics;

    // 2. (A파트) 프론트엔드 전송용 요약 데이터 생성
    const parsed = {
      timestamp: new Date().toISOString(),
      site: "site-001", // 나중에 data.site_id가 오면 교체

      soc: metrics.batt_capacity_percent,
      pv_power: Math.round((metrics.pv_input_voltage || 0) * (metrics.pv_input_current || 0)), // 계산

      battery_voltage: metrics.batt_voltage,
      battery_temp: metrics.heatsink_temp,

      charge_current: metrics.batt_charge_current,
      discharge_current: metrics.batt_discharge_current,

      ac_output_w: metrics.ac_out_watt,
      load_percent: metrics.load_percent,

      grid_voltage: metrics.grid_voltage,

      mode: data.type // 혹은 "Normal"
    };

    console.log("\n🟢 [EMS Parsed Data]");
    console.table(parsed);

    // 3. (A파트) 메모리에 최신 값 저장
    latestEMSData = parsed;

    // 4. (A파트) WebSocket 실시간 브로드캐스트 (프론트엔드 그래프용)
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(parsed));
      }
    });

    // 5. (✅ B파트 추가) PostgreSQL DB에 저장 (히스토리용)
    // DB가 설정되어 있으면 저장, 없으면 스킵
    if (pool) {
      try {
        const query = `
          INSERT INTO ems_readings (
            timestamp, ts_ms, type, crc_ok,
            grid_voltage, grid_freq, ac_out_voltage, ac_out_freq,
            ac_out_va, ac_out_watt, load_percent,
            bus_voltage, batt_voltage, batt_charge_current, batt_discharge_current,
            batt_capacity_percent, heatsink_temp,
            pv_input_current, pv_input_voltage,
            device_status_bits, raw_json
          ) VALUES (
            NOW(), $1, $2, $3,
            $4, $5, $6, $7,
            $8, $9, $10,
            $11, $12, $13, $14,
            $15, $16,
            $17, $18,
            $19, $20
          )
        `;

        const values = [
          data.ts_ms, data.type, data.crc_ok,
          metrics.grid_voltage, metrics.grid_freq, metrics.ac_out_voltage, metrics.ac_out_freq,
          metrics.ac_out_va, metrics.ac_out_watt, metrics.load_percent,
          metrics.bus_voltage, metrics.batt_voltage, metrics.batt_charge_current, metrics.batt_discharge_current,
          metrics.batt_capacity_percent, metrics.heatsink_temp,
          metrics.pv_input_current, metrics.pv_input_voltage,
          metrics.device_status_bits, JSON.stringify(data)
        ];

        await pool.query(query, values);
        console.log("✅ [DB] Saved to PostgreSQL");
      } catch (dbError) {
        console.warn("⚠️  [DB] Save failed (DB not configured):", dbError.message);
      }
    } else {
      console.log("ℹ️  [DB] Skipped (no DATABASE_URL configured)");
    }

    res.json({ status: "ok", message: "Received & Saved" });

  } catch (err) {
    console.error("❌ Error in POST /ems:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 GET /api/v1/device/latest
 * (메모리 캐시 버전 - 아주 빠름)
 * 프론트엔드는 /api/v1/dashboard/latest를 사용하세요.
 * 이건 디바이스 측 확인용입니다.
 */
router.get("/latest", (req, res) => {
  if (!latestEMSData) {
    return res.json({ message: "No EMS data received yet" });
  }
  res.json(latestEMSData);
});

export default router;