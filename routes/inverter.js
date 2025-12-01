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
 * { "voltage": 400.0, "current": 12.5, "soc": 85, ... }
 */
router.post("/data", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 [INVERTER DATA RECEIVED]");
    console.log(JSON.stringify(data, null, 2));

    // 1. 데이터 파싱 (ESP32에서 보내는 형식)
    const parsed = {
      timestamp: new Date().toISOString(),
      site: data.site_id || "site-001",
      
      // 기본 전력 데이터
      voltage: data.voltage,
      current: data.current,
      power: data.power || (data.voltage && data.current ? parseFloat((data.voltage * data.current).toFixed(2)) : null),
      
      // 배터리 데이터
      soc: data.soc,
      battery_voltage: data.battery_voltage,
      battery_temp: data.battery_temp,
      charge_current: data.charge_current,
      discharge_current: data.discharge_current,
      
      // PV 데이터
      pv_voltage: data.pv_voltage,
      pv_current: data.pv_current,
      pv_power: data.pv_power || (data.pv_voltage && data.pv_current ? parseFloat((data.pv_voltage * data.pv_current).toFixed(2)) : null),
      
      // 그리드/출력 데이터
      grid_voltage: data.grid_voltage,
      grid_freq: data.grid_freq,
      ac_output_w: data.ac_output_w,
      load_percent: data.load_percent
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
