import express from "express";
import { wss } from "../server.js";

const router = express.Router();
let latestData = {};

// 📘 데이터 파싱 함수 (요약형 구조)
function parseInverterData(raw) {
  return {
    timestamp: raw.ts,
    site: {
      id: raw.site?.id || "unknown",
      name: raw.site?.name || "N/A"
    },
    device: {
      model: raw.device?.model || "unknown",
      mode: raw.mode?.name || "unknown",
      load_on: raw.status?.flags?.load_on ?? false
    },
    battery: {
      soc: raw.dc?.soc_pct ?? null,
      voltage_v: raw.dc?.battery_v ?? null,
      charge_a: raw.dc?.chg_a ?? null,
      discharge_a: raw.dc?.dischg_a ?? null,
      temperature_c: raw.dc?.temp_c ?? null
    },
    pv: {
      power_w: raw.pv?.pv_w ?? null,
      voltage_v: raw.pv?.pv_v ?? null,
      current_a: raw.pv?.pv_a ?? null
    },
    ac: {
      grid_v: raw.ac?.grid_v ?? null,
      out_v: raw.ac?.out_v ?? null,
      load_pct: raw.ac?.load_pct ?? null
    },
    energy: {
      pv_wh_total: raw.energy?.pv_wh_total ?? null,
      load_wh_total: raw.energy?.load_wh_total ?? null
    }
  };
}

// 📥 게이트웨이 or 시뮬레이터 → EMS 서버로 데이터 수신
router.post("/", (req, res) => {
  const raw = req.body;
  const parsed = parseInverterData(raw);

  latestData = parsed;

  console.log("\n📩 [EMS Data Received]");
  console.table({
    timestamp: parsed.timestamp,
    site: parsed.site.id,
    soc: parsed.battery.soc,
    pv_power: parsed.pv.power_w,
    temp: parsed.battery.temperature_c,
    mode: parsed.device.mode
  });

  // ✅ 프론트에 WebSocket으로 실시간 데이터 송신
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(JSON.stringify(parsed));
  });

  res.json({ success: true });
});

// 📤 프론트에서 최신 데이터 조회용 API
router.get("/latest", (req, res) => {
  if (!latestData.timestamp)
    return res.status(404).json({ message: "No EMS data received yet" });
  res.json(latestData);
});

export default router;
