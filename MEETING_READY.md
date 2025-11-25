# 회의 준비 완료 문서

## ✅ 준비 완료 항목

### 1. 백엔드 서버 (Render 클라우드)
- **URL**: `https://ems-backend-e79r.onrender.com`
- **상태**: ✅ 정상 가동 중
- **테스트**: ✅ 데이터 수신 확인됨

### 2. 🔴 데이터 수신 API (인버터 → 서버)
```
POST https://ems-backend-e79r.onrender.com/api/v1/device/ems
Content-Type: application/json
```

### 3. 🔵 프론트엔드 조회 API (프론트 ← 서버)
```
# 최신 데이터 (DB 기반)
GET https://ems-backend-e79r.onrender.com/api/v1/dashboard/latest

# 히스토리 조회 (시간 범위)
GET https://ems-backend-e79r.onrender.com/api/v1/dashboard/history?start=2025-11-24T00:00:00Z&end=2025-11-24T23:59:59Z

# 최근 N개 데이터 (그래프용)
GET https://ems-backend-e79r.onrender.com/api/v1/dashboard/recent?limit=50

# 통계 데이터
GET https://ems-backend-e79r.onrender.com/api/v1/dashboard/stats?limit=100

# 디바이스 확인용 (메모리 캐시)
GET https://ems-backend-e79r.onrender.com/api/v1/device/latest
```

### 4. 🌐 WebSocket 실시간 스트림
```
wss://ems-backend-e79r.onrender.com/
```
5초마다 자동으로 최신 데이터가 푸시됩니다.

---

## 📋 사측에 전달할 정보

### 요청 형식
```json
POST https://ems-backend-e79r.onrender.com/api/v1/device/ems
Content-Type: application/json

{
  "type": "QPIGS",
  "ts_ms": 1732435200000,
  "crc_ok": true,
  "metrics": {
    "grid_voltage": 220.5,
    "grid_freq": 50.0,
    "ac_out_voltage": 230.2,
    "ac_out_freq": 50.1,
    "ac_out_va": 350,
    "ac_out_watt": 182.3,
    "load_percent": 15,
    "bus_voltage": 335,
    "batt_voltage": 48.5,
    "batt_charge_current": 5.2,
    "batt_discharge_current": 2.5,
    "batt_capacity_percent": 85,
    "heatsink_temp": 38.5,
    "pv_input_current": 3.5,
    "pv_input_voltage": 120.5,
    "device_status_bits": 16
  }
}
```

### curl 테스트 명령어 (사측에서 테스트 가능)
```bash
curl -X POST https://ems-backend-e79r.onrender.com/api/v1/device/ems \
  -H "Content-Type: application/json" \
  -d '{"type":"QPIGS","ts_ms":1732435200000,"crc_ok":true,"metrics":{"grid_voltage":220.5,"batt_capacity_percent":85,"ac_out_watt":182.3}}'
```

---

## ❓ 회의 시 확인할 질문

### 1. 통신 방식
- [ ] 인버터가 직접 HTTPS POST를 지원하나요?
- [ ] Serial/RS485/Modbus 등 다른 통신 방식인가요?
- [ ] 게이트웨이가 필요한가요?

### 2. 데이터 형식
- [ ] 위의 JSON 형식이 실제 데이터 형식과 일치하나요?
- [ ] 데이터 단위가 맞나요? (전압: V, 전력: W, 온도: °C)

### 3. 전송 주기
- [ ] 몇 초마다 데이터를 보내나요?
- [ ] 인버터가 자동으로 보내나요? (Push)
- [ ] 우리가 요청해야 하나요? (Poll)

### 4. 네트워크
- [ ] 인버터가 인터넷에 연결되어 있나요?
- [ ] 고정 IP가 필요한가요?
- [ ] 방화벽/보안 설정이 필요한가요?

### 5. 인증
- [ ] API Key가 필요한가요?
- [ ] IP 화이트리스트가 필요한가요?

---


##  연동 시나리오

### 시나리오 A: 인버터가 직접 전송 (가장 이상적)
```
[인버터] → HTTPS POST → [우리 서버]
```
**필요한 것**: 인버터 설정에 우리 URL 입력

### 시나리오 B: 게이트웨이 필요
```
[인버터] → Serial/Modbus → [게이트웨이 PC] → HTTPS POST → [우리 서버]
```
**필요한 것**: 게이트웨이 소프트웨어 개발 (우리가 담당)

---

**서버 주소**: https://ems-backend-e79r.onrender.com


---

위 정보를 받으면 **즉시 실제 장비 연동 코드 작성** 가능합니다!
