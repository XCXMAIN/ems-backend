// 이 프로그램은 "보드" 역할을 흉내내서 5초마다 데이터를 서버로 보냅니다.
const SERVER_URL = "http://localhost:8080/api/v1/ems";

// QPIGS 포맷 데이터 생성기
function generateMockData() {
  const now = new Date();
  
  // 값이 조금씩 변하는 것처럼 랜덤하게 만듭니다.
  const randomVoltage = 47 + Math.random(); // 47.x ~ 48.x
  const randomTemp = 35 + Math.floor(Math.random() * 5); // 35 ~ 39도
  const randomSoc = 45 + Math.floor(Math.random() * 10); // 45 ~ 54%

  return {
    type: "QPIGS",
    ts_ms: now.getTime(),
    crc_ok: true,
    metrics: {
      grid_voltage: 0,
      grid_freq: 0,
      ac_out_voltage: 229.9,
      ac_out_freq: 50,
      ac_out_va: 0,
      ac_out_watt: 0,
      load_percent: 0,
      bus_voltage: 335,
      batt_voltage: randomVoltage, // 랜덤 전압
      batt_charge_current: 0,
      batt_capacity_percent: randomSoc, // 랜덤 SOC
      heatsink_temp: randomTemp, // 랜덤 온도
      pv_input_current: 5,  // 태양광 들어온다고 가정
      pv_input_voltage: 120,
      scc_batt_voltage: 0,
      batt_discharge_current: 0,
      device_status_bits: 16
    },
    extras: ["00", "00", "00000", "011", "0", "00", "0000"]
  };
}

async function sendData() {
  const data = generateMockData();
  
  console.log(`📤 [Board] Sending data to Server... (SOC: ${data.metrics.batt_capacity_percent}%)`);

  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("✅ [Board] Success! Server received data.");
    } else {
      console.log("❌ [Board] Server Error:", response.status, response.statusText);
      // 서버가 에러 내용을 JSON으로 보냈을 수 있으니 확인
      const errJson = await response.json(); 
      console.log("   Details:", errJson);
    }
  } catch (error) {
    console.log("❌ [Board] Connection Failed. Is the server running?");
    console.log("   Error:", error.cause ? error.cause : error.message);
  }
}

// 5초마다 sendData 함수 실행
console.log("🚀 Mock Board Simulator Started!");
setInterval(sendData, 5000);
sendData(); // 시작하자마자 한번 실행