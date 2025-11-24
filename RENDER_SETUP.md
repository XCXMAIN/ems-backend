# Render 배포 가이드

## 1️⃣ PostgreSQL 데이터베이스 생성

1. Render 대시보드 접속: https://dashboard.render.com
2. **New +** → **PostgreSQL** 선택
3. 데이터베이스 이름: `ems-db` (또는 원하는 이름)
4. **Create Database** 클릭
5. 생성 후 **Internal Database URL** 복사 (예: `postgresql://...`)

## 2️⃣ Web Service 배포

1. **New +** → **Web Service** 선택
2. GitHub 저장소 연결: `XCXMAIN/ems-backend`
3. 설정:
   - **Name**: `ems-backend` (또는 원하는 이름)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

## 3️⃣ 환경변수 설정 (Environment Variables)

Render Web Service 설정 → **Environment** 탭에서 추가:

```
DATABASE_URL = [1단계에서 복사한 Internal Database URL]
PORT = 8080
```

예시:
```
DATABASE_URL = postgresql://ems_db_user:xxxxx@dpg-xxxxx-a.oregon-postgres.render.com/ems_db
PORT = 8080
```

## 4️⃣ 배포 후 테이블 생성

배포 완료 후, Render 대시보드에서:
1. PostgreSQL 데이터베이스 선택
2. **Connect** → **PSQL Command** 복사
3. 로컬 터미널에서 실행 (psql 설치 필요)
4. 아래 SQL 실행:

```sql
CREATE TABLE IF NOT EXISTS ems_readings (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ts_ms BIGINT,
  type VARCHAR(20),
  crc_ok BOOLEAN,
  
  grid_voltage REAL,
  grid_freq REAL,
  ac_out_voltage REAL,
  ac_out_freq REAL,
  ac_out_va REAL,
  ac_out_watt REAL,
  load_percent REAL,
  
  bus_voltage REAL,
  batt_voltage REAL,
  batt_charge_current REAL,
  batt_discharge_current REAL,
  batt_capacity_percent INTEGER,
  heatsink_temp REAL,
  
  pv_input_current REAL,
  pv_input_voltage REAL,
  
  device_status_bits INTEGER,
  raw_json JSONB
);

CREATE INDEX idx_timestamp ON ems_readings(timestamp DESC);
CREATE INDEX idx_type ON ems_readings(type);
```

## 5️⃣ API 엔드포인트

배포 후 사용 가능한 API:

### 실시간 최신 데이터
```
GET https://ems-backend-xxxx.onrender.com/api/v1/data/latest
```

### 히스토리 데이터 (기간 조회)
```
GET https://ems-backend-xxxx.onrender.com/api/v1/data/history?start=2024-05-21T00:00:00Z&end=2024-05-21T23:59:59Z
```

### WebSocket 연결
```javascript
const ws = new WebSocket('wss://ems-backend-xxxx.onrender.com');
```

## 6️⃣ 시뮬레이터 설정 변경

`simulate.js` 파일에서 Render URL로 변경:
```javascript
const EMS_SERVER = "https://ems-backend-xxxx.onrender.com/api/v1/ems";
```

## ⚠️ 주의사항

- Render 무료 플랜은 15분 비활성 시 슬립 모드 진입
- 첫 요청 시 재시작까지 30초~1분 소요
- 유료 플랜($7/월)으로 업그레이드하면 항시 가동
- PostgreSQL도 무료는 90일 후 만료 (유료 $7/월)
