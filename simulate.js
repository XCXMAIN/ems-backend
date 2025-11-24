/**
 * EMS Data Simulator (REAL METRICS FORMAT)
 * ------------------------------------------
 * - 백엔드가 기대하는 실제 EMS 인버터 데이터 구조에 맞춰 전송
 * - metrics 구조 기반 (담당자가 준 JSON 구조 그대로)
 * - 5초마다 서버로 실시간 데이터 push
 */

import fetch from "node-fetch";

// -------------------------------
// Render EMS 서버 주소
// -------------------------------
const EMS_SERVER = "https://ems-backend-e79r.onrender.com/api/v1/ems";

// -------------------------------
// 랜덤값 생성 함수
// -------------------------------
function rand(min, max, decimal = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimal));
}

// -------------------------------
// 실제 EMS 장비의 metrics 기반 Mock 데이터 생성
// -------------------------------
function generateMetricData() {
  return {
    type: "QPIGS",
    ts_ms: Date.now(),
    crc_ok: true,
    metrics: {
      grid_voltage: rand(220, 240),
      grid_freq: rand(49, 51),
      ac_out_voltage: rand(220, 240),
      ac_out_freq: rand(49, 51),
      ac_out_va: rand(100, 500),
      ac_out_watt: rand(80, 300),
      load_percent: rand(5, 25),
      bus_voltage: rand(330, 400),
      batt_voltage: rand(47, 52),
      batt_charge_current: rand(0, 8),
      batt_capacity_percent: rand(60, 100, 0), // SOC
      heatsink_temp: rand(30, 45),
      pv_input_current: rand(0, 5),
      pv_input_voltage: rand(100, 130),
      scc_batt_voltage: rand(48, 52),
      batt_discharge_current: rand(0, 6),
      device_status_bits: 16
    },
    extras: ["00", "00", "00000", "011", "0", "00", "0000"]
  };
}

// -------------------------------
// 서버 전송 함수
// -------------------------------
async function sendMockData() {
  const data = generateMetricData();

  try {
    const res = await fetch(EMS_SERVER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      console.log(`🚀 Sent EMS mock data @ ${new Date().toISOString()}`);
    } else {
      console.error(`❌ Server returned ${res.status}`);
    }
  } catch (err) {
    console.error("❌ Failed:", err.message);
  }
}

// -------------------------------
// 실행
// -------------------------------
console.log("🌞 EMS Real-Format Data Simulator Started...");
setInterval(sendMockData, 5000);
