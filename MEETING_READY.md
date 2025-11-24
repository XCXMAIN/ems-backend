# 회의 준비 완료 문서

## ✅ 준비 완료 항목

### 1. 백엔드 서버 (Render 클라우드)
- **URL**: `https://ems-backend-e79r.onrender.com`
- **상태**: ✅ 정상 가동 중
- **테스트**: ✅ 데이터 수신 확인됨

### 2. 데이터 수신 API
```
POST https://ems-backend-e79r.onrender.com/api/v1/ems
Content-Type: application/json
```

**사측에서 이 주소로 데이터를 전송하면 됩니다!**

### 3. 데이터 확인 API
```
GET https://ems-backend-e79r.onrender.com/api/v1/ems/latest
```
브라우저에서 바로 확인 가능합니다.

---

## 📋 사측에 전달할 정보

### 요청 형식
```json
POST https://ems-backend-e79r.onrender.com/api/v1/ems
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
curl -X POST https://ems-backend-e79r.onrender.com/api/v1/ems \
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

## 📄 필요 자료 요청

다음 자료를 요청해주세요:
1. 인버터 통신 프로토콜 문서
2. 샘플 데이터 로그
3. 데이터 필드 설명서
4. 인버터 매뉴얼

---

## 🚀 연동 시나리오

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

## 📞 담당자 정보

**서버 관리자**: 배남규
**서버 주소**: https://ems-backend-e79r.onrender.com
**API 문서**: 이 문서 참조
**문의사항**: [연락처]

---

## ✅ 회의 후 할 일

회의에서 답변 받은 내용:
```
통신 방식: ______________
포트/주소: ______________
데이터 형식: ______________
전송 주기: ______________초
게이트웨이 필요 여부: ______________
```

위 정보를 받으면 **즉시 실제 장비 연동 코드 작성** 가능합니다!
