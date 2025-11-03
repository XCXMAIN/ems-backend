/**
 * EMS 데이터 시뮬레이터 (백엔드 테스트용)
 * ------------------------------------------
 * - 5초마다 가짜 인버터 데이터를 생성해서 EMS 서버로 전송
 * - 실제 ESS 게이트웨이 통신과 동일한 JSON 구조 사용
 * - 로컬/Render 서버 둘 다 호환 가능
 */

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 EMS 서버 주소 (Render or Local)
const EMS_SERVER = "https://ems-backend.onrender.com/api/v1/ems";
// 👉 로컬 테스트 시: const EMS_SERVER = "http://localhost:8080/api/v1/ems";


// 📂 mock 데이터 폴더 경로 (선택)
const MOCK_DIR = path.join(__dirname, "mock");

// 🔧 랜덤 float 생성 함수
function rand(min, max, decimal = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimal));
}

// ⚡️ EMS 데이터 생성 함수
function generateMockData() {
  return {
    schema: "inverter.telemetry.v1",
    ts: new Date().toISOString(),
    device: {
      vendor: "Voltronic",
      model: "Axpert VM III",
      serial: "SN1234567890",
      fw_main: "00123.01",
      fw_scc: "00045.12"
    },
    site: {
      id: "site-001",
      name: "Main ESS Room"
    },
    ac: {
      grid_v: rand(220, 240),
      grid_hz: rand(49, 51, 1),
      out_v: rand(220, 240),
      out_hz: rand(49, 51, 1),
      out_va: rand(100, 300),
      out_w: rand(100, 250),
      load_pct: rand(5, 20, 1)
    },
    dc: {
      bus_v: rand(360, 400, 1),
      battery_v: rand(48, 52, 1),
      chg_a: rand(0, 5, 1),
      dischg_a: rand(0, 3, 1),
      soc_pct: rand(70, 100, 0),
      temp_c: rand(30, 45, 1)
    },
    pv: {
      pv_a: rand(2, 4, 2),
      pv_v: rand(110, 130, 1),
      pv_w: rand(1000, 1400, 0)
    },
    mode: {
      raw: "L",
      name: "Line"
    },
    status: {
      flags: {
        load_on: true,
        ac_chg_on: false,
        scc_chg_on: true
      },
      warnings: [],
      faults: []
    },
    rating: {
      ac_out_v_nom: 230,
      ac_out_hz_nom: 50,
      ac_out_va_nom: 5000,
      ac_out_w_nom: 4000,
      bat_v_nom: 48
    },
    energy: {
      pv_wh_total: 12345678 + Math.floor(Math.random() * 1000),
      load_wh_total: 9876543 + Math.floor(Math.random() * 500),
      pv_wh_y: 0,
      load_wh_y: 0,
      pv_wh_m: 0,
      load_wh_m: 0,
      pv_wh_d: 0,
      load_wh_d: 0
    }
  };
}

// 📤 EMS 서버로 전송
async function sendMockData() {
  const data = generateMockData();

  try {
    const res = await fetch(EMS_SERVER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      console.log(`🚀 Sent mock data at ${data.ts}`);
    } else {
      console.error(`❌ Server error: ${res.status}`);
    }
  } catch (err) {
    console.error("❌ Failed to send mock data:", err.message);
  }
}

// ♻️ 5초마다 자동 전송
console.log("🌞 EMS Data Simulator started...");
setInterval(sendMockData, 5000);
