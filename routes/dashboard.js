import express from 'express';

const router = express.Router();

// 🟢 메모리에 최근 데이터 저장 (최대 1000개)
const dataHistory = [];
const MAX_HISTORY = 1000;

// 🟢 외부에서 데이터 추가할 수 있도록 export
export function addToHistory(data) {
  dataHistory.push({
    ...data,
    id: dataHistory.length + 1
  });
  
  // 최대 개수 초과 시 오래된 데이터 삭제
  if (dataHistory.length > MAX_HISTORY) {
    dataHistory.shift();
  }
}

// 🟢 최신 데이터 가져오기
export function getLatestData() {
  return dataHistory.length > 0 ? dataHistory[dataHistory.length - 1] : null;
}

/**
 * 📌 GET /api/v1/dashboard/latest
 * 가장 최근 데이터 1개 조회 (프론트엔드 대시보드용)
 */
router.get('/latest', (req, res) => {
  const latest = getLatestData();
  
  if (!latest) {
    return res.json({ 
      message: 'No data received yet',
      hint: 'Waiting for ESP32 gateway to send data...'
    });
  }
  
  res.json(latest);
});

/**
 * 📌 GET /api/v1/dashboard/recent
 * 최근 N개의 데이터 조회 (그래프용)
 * 쿼리 파라미터: limit (기본값: 50)
 */
router.get('/recent', (req, res) => {
  const { limit = 50 } = req.query;
  const count = Math.min(parseInt(limit), dataHistory.length);
  
  // 최근 데이터를 시간순으로 반환
  const recentData = dataHistory.slice(-count);
  
  res.json({
    count: recentData.length,
    data: recentData
  });
});

/**
 * 📌 GET /api/v1/dashboard/history
 * 시간 범위별 히스토리 데이터 조회
 * 쿼리 파라미터: start, end (ISO 8601 형식), limit (선택)
 */
router.get('/history', (req, res) => {
  const { start, end, limit = 1000 } = req.query;
  
  if (!start || !end) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      message: 'start and end parameters are required (ISO 8601 format)',
      example: '/api/v1/dashboard/history?start=2025-12-01T00:00:00Z&end=2025-12-01T23:59:59Z'
    });
  }
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const filtered = dataHistory.filter(item => {
    const itemDate = new Date(item.timestamp);
    return itemDate >= startDate && itemDate <= endDate;
  }).slice(0, parseInt(limit));
  
  res.json({
    count: filtered.length,
    data: filtered
  });
});

/**
 * 📌 GET /api/v1/dashboard/stats
 * 통계 데이터 조회 (최근 N개 데이터의 평균, 최대, 최소)
 * 쿼리 파라미터: limit (기본값: 100)
 */
router.get('/stats', (req, res) => {
  const { limit = 100 } = req.query;
  const count = Math.min(parseInt(limit), dataHistory.length);
  
  if (count === 0) {
    return res.json({
      message: 'No data available for statistics',
      count: 0
    });
  }
  
  const recentData = dataHistory.slice(-count);
  
  // 통계 계산
  const stats = {
    count: recentData.length,
    
    // SOC 통계
    avg_soc: average(recentData, 'soc'),
    max_soc: max(recentData, 'soc'),
    min_soc: min(recentData, 'soc'),
    
    // 전력 통계
    avg_power: average(recentData, 'power'),
    max_power: max(recentData, 'power'),
    
    // PV 통계
    avg_pv_power: average(recentData, 'pv_power'),
    max_pv_power: max(recentData, 'pv_power'),
    
    // 배터리 통계
    avg_battery_voltage: average(recentData, 'battery_voltage'),
    avg_battery_temp: average(recentData, 'battery_temp'),
    max_battery_temp: max(recentData, 'battery_temp'),
    
    // 시간 범위
    from: recentData[0]?.timestamp,
    to: recentData[recentData.length - 1]?.timestamp
  };
  
  res.json(stats);
});

/**
 * 📌 GET /api/v1/dashboard/status
 * 서버 상태 및 데이터 수신 현황
 */
router.get('/status', (req, res) => {
  const latest = getLatestData();
  
  res.json({
    status: 'online',
    data_count: dataHistory.length,
    max_history: MAX_HISTORY,
    last_update: latest?.timestamp || null,
    uptime: process.uptime(),
    endpoints: {
      latest: 'GET /api/v1/dashboard/latest',
      recent: 'GET /api/v1/dashboard/recent?limit=50',
      history: 'GET /api/v1/dashboard/history?start=...&end=...',
      stats: 'GET /api/v1/dashboard/stats?limit=100',
      websocket: 'wss://[host]/'
    }
  });
});

// 헬퍼 함수들
function average(arr, key) {
  const values = arr.map(item => item[key]).filter(v => v != null);
  if (values.length === 0) return null;
  return parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
}

function max(arr, key) {
  const values = arr.map(item => item[key]).filter(v => v != null);
  if (values.length === 0) return null;
  return Math.max(...values);
}

function min(arr, key) {
  const values = arr.map(item => item[key]).filter(v => v != null);
  if (values.length === 0) return null;
  return Math.min(...values);
}

export default router;
