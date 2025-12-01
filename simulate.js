/**
 * ESP32 Gateway Simulator
 * ------------------------------------------
 * ESP32 게이트웨이가 보내는 형식의 데이터를 시뮬레이션
 * 1초마다 서버로 데이터 전송 (실제 ESP32와 동일)
 */

import fetch from "node-fetch";

// -------------------------------
// 서버 주소 설정
// -------------------------------
const SERVER_URL = "https://ems-backend-e79r.onrender.com/api/inverter/data";
// 로컬 테스트 시:
// const SERVER_URL = "http://localhost:8080/api/inverter/data";

// -------------------------------
// 랜덤값 생성 함수
// -------------------------------
function rand(min, max, decimal = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimal));
}

// -------------------------------
// ESP32 형식의 인버터 데이터 생성
// -------------------------------
function generateInverterData() {
  return {
    // 사이트 정보
    site_id: "site-001",
    device_id: "inverter-001",
    
    // 기본 전력 데이터 (다이어그램 예시: voltage: 400.0, current: 12.5)
    voltage: rand(380, 420, 1),      // AC 출력 전압 (V)
    current: rand(10, 15, 2),        // AC 출력 전류 (A)
    
    // 배터리 데이터
    soc: rand(20, 100, 0),           // 배터리 잔량 (%)
    battery_voltage: rand(48, 54, 1), // 배터리 전압 (V)
    battery_temp: rand(25, 45, 1),    // 배터리 온도 (°C)
    charge_current: rand(0, 10, 1),   // 충전 전류 (A)
    discharge_current: rand(0, 5, 1), // 방전 전류 (A)
    
    // PV (태양광) 데이터
    pv_voltage: rand(100, 150, 1),    // PV 전압 (V)
    pv_current: rand(5, 15, 2),       // PV 전류 (A)
    
    // 그리드/출력 데이터
    grid_voltage: rand(218, 225, 1),  // 그리드 전압 (V)
    grid_freq: rand(59.9, 60.1, 2),   // 그리드 주파수 (Hz)
    ac_output_w: rand(500, 3000, 0),  // AC 출력 전력 (W)
    load_percent: rand(10, 80, 0)     // 부하율 (%)
  };
}

// -------------------------------
// 데이터 전송 함수
// -------------------------------
async function sendData() {
  const data = generateInverterData();
  
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`🚀 [${new Date().toISOString()}] Data sent successfully`);
      console.log(`   SOC: ${data.soc}%, Power: ${data.ac_output_w}W, PV: ${(data.pv_voltage * data.pv_current).toFixed(0)}W`);
    } else {
      console.error(`❌ Server error: ${result.error || response.status}`);
    }
  } catch (err) {
    console.error(`❌ Connection error: ${err.message}`);
  }
}

// -------------------------------
// 시뮬레이터 시작
// -------------------------------
console.log("🌞 ESP32 Gateway Simulator Started");
console.log(`📡 Sending to: ${SERVER_URL}`);
console.log(`⏱️  Interval: 1 second\n`);

// 즉시 첫 데이터 전송
sendData();

// 1초마다 데이터 전송 (실제 ESP32와 동일)
setInterval(sendData, 1000);
