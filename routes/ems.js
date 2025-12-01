import express from "express";
import { wss } from "../server.js"; // WebSocket
import pool from "../db.js";       // DB 연결

const router = express.Router();

// 🟢 최신 인버터 데이터 저장 (메모리 캐시)
let latestInverterData = null;

/**
 * 📌 POST /api/inverter/data
 * ESP32 게이트웨이 → 서버로 인버터 데이터 전송
 * 
 * 예상 데이터 형식 (스프레드시트 확인 후 조정):
 * { "voltage": 400.0, "current": 12.5, ... }
 */
router.post("/data", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 [INVERTER DATA RECEIVED]");
    console.log(JSON.stringify(data, null, 2));

    // 1. 데이터 파싱 (ESP32에서 보내는 형식)
    // TODO: 스프레드시트 확인 후 필드명 조정 필요
    const parsed = {
      timestamp: new Date().toISOString(),
      site: data.site_id || "site-001",
      
      // 기본 전력 데이터
      voltage: data.voltage,
      current: data.current,
      power: data.power || (data.voltage && data.current ? data.voltage * data.current : null),
      
      // 배터리 데이터
      soc: data.soc,
      battery_voltage: data.battery_voltage,
      battery_temp: data.battery_temp,
      charge_current: data.charge_current,
      discharge_current: data.discharge_current,
      
      // PV 데이터
      pv_voltage: data.pv_voltage,
      pv_current: data.pv_current,
      pv_power: data.pv_power || (data.pv_voltage && data.pv_current ? data.pv_voltage * data.pv_current : null),
      
      // 그리드/출력 데이터
      grid_voltage: data.grid_voltage,
      grid_freq: data.grid_freq,
      ac_output_w: data.ac_output_w,
      load_percent: data.load_percent,
      
      // 원본 데이터 보존
      raw: data
    };

    console.log("\n🟢 [Parsed Inverter Data]");
    console.table(parsed);

    // 2. 메모리에 최신 값 저장
    latestInverterData = parsed;

    // 3. WebSocket 실시간 브로드캐스트 (프론트엔드용)
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(parsed));
      }
    });

    // 4. DB 저장 (설정되어 있으면)
    if (pool) {
      try {
        const query = `
          INSERT INTO inverter_data (
            timestamp, site_id, voltage, current, power,
            soc, battery_voltage, battery_temp,
            pv_voltage, pv_current, pv_power,
            grid_voltage, ac_output_w, load_percent,
            raw_json
          ) VALUES (
            NOW(), $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9, $10,
            $11, $12, $13,
            $14
          )
        `;

        const values = [
          parsed.site,
          parsed.voltage, parsed.current, parsed.power,
          parsed.soc, parsed.battery_voltage, parsed.battery_temp,
          parsed.pv_voltage, parsed.pv_current, parsed.pv_power,
          parsed.grid_voltage, parsed.ac_output_w, parsed.load_percent,
          JSON.stringify(data)
        ];

        await pool.query(query, values);
        console.log("✅ [DB] Saved to PostgreSQL");
      } catch (dbError) {
        console.warn("⚠️  [DB] Save failed:", dbError.message);
      }
    } else {
      console.log("ℹ️  [DB] Skipped (not configured)");
    }

    // 5. ESP32에 응답 (200 OK)
    res.json({ status: "ok", message: "Data received" });

  } catch (err) {
    console.error("❌ Error in POST /api/inverter/data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 GET /api/inverter/latest
 * 최신 인버터 데이터 조회 (메모리 캐시)
 */
router.get("/latest", (req, res) => {
  if (!latestInverterData) {
    return res.json({ message: "No inverter data received yet" });
  }
  res.json(latestInverterData);
});

export default router;
