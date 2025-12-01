import express from "express";
import { wss } from "../server.js";
import { addToHistory } from "./dashboard.js";

const router = express.Router();

// 🟢 최신 인버터 데이터 저장 (메모리 캐시)
let latestInverterData = null;

/**
 * 📌 POST /api/inverter/data
 * ESP32 게이트웨이 → 서버로 인버터 데이터 전송
 * 
 * 데이터 형식:
 * { "type": "QPIGS", "ts_ms": ..., "metrics": { ... } }
 */
router.post("/data", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 [INVERTER DATA RECEIVED]");
    console.log(JSON.stringify(data, null, 2));

    // metrics 안에 실제 데이터가 있음
    const m = data.metrics || data;

    // 1. 데이터 파싱 (ESP32/인버터 실제 형식)
    const parsed = {
      timestamp: new Date().toISOString(),
      site: data.site_id || "site-001",
      type: data.type,
      ts_ms: data.ts_ms,
      
      // 그리드 데이터
      grid_voltage: m.grid_voltage,
      grid_freq: m.grid_freq,
      
      // AC 출력 데이터
      ac_out_voltage: m.ac_out_voltage,
      ac_out_freq: m.ac_out_freq,
      ac_out_va: m.ac_out_va,
      ac_out_watt: m.ac_out_watt,
      load_percent: m.load_percent,
      
      // 배터리 데이터
      soc: m.batt_capacity_percent,
      battery_voltage: m.batt_voltage,
      battery_temp: m.heatsink_temp,
      charge_current: m.batt_charge_current,
      discharge_current: m.batt_discharge_current,
      bus_voltage: m.bus_voltage,
      
      // PV 데이터
      pv_voltage: m.pv_input_voltage,
      pv_current: m.pv_input_current,
      pv_power: m.pv_input_voltage && m.pv_input_current 
        ? parseFloat((m.pv_input_voltage * m.pv_input_current).toFixed(2)) 
        : 0,
      
      // 기타
      device_status: m.device_status_bits
    };

    console.log("\n🟢 [Parsed Inverter Data]");
    console.table(parsed);

    // 2. 메모리에 최신 값 저장
    latestInverterData = parsed;

    // 3. 히스토리에 추가 (대시보드용)
    addToHistory(parsed);

    // 4. WebSocket 실시간 브로드캐스트 (프론트엔드용)
    const wsMessage = JSON.stringify({
      type: 'inverter_data',
      data: parsed
    });
    
    let wsClients = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(wsMessage);
        wsClients++;
      }
    });
    console.log(`📡 [WebSocket] Broadcasted to ${wsClients} clients`);

    // 5. ESP32에 응답 (200 OK)
    res.json({ status: "ok", message: "Data received" });

  } catch (err) {
    console.error("❌ Error in POST /api/inverter/data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 GET /api/inverter/latest
 * 최신 인버터 데이터 조회 (메모리 캐시 - 빠름)
 */
router.get("/latest", (req, res) => {
  if (!latestInverterData) {
    return res.json({ message: "No inverter data received yet" });
  }
  res.json(latestInverterData);
});

export default router;
