import express from 'express';
import pool from '../db.js'; // PostgreSQL 연결

const router = express.Router();

/**
 * 📌 GET /api/v1/dashboard/latest
 * DB에서 가장 최근 데이터 1개 조회 (대시보드용)
 */
router.get('/latest', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                timestamp,
                type,
                grid_voltage,
                grid_freq,
                ac_out_voltage,
                ac_out_freq,
                ac_out_va,
                ac_out_watt,
                load_percent,
                bus_voltage,
                batt_voltage,
                batt_charge_current,
                batt_discharge_current,
                batt_capacity_percent as soc,
                heatsink_temp,
                pv_input_current,
                pv_input_voltage,
                (pv_input_voltage * pv_input_current) as pv_power,
                device_status_bits
            FROM ems_readings
            ORDER BY timestamp DESC
            LIMIT 1
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No data found' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('❌ Error in /latest:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * 📌 GET /api/v1/dashboard/history
 * 시간 범위별 히스토리 데이터 조회
 * 쿼리 파라미터: start, end (ISO 8601 형식), limit (선택)
 * 예: /api/v1/dashboard/history?start=2025-11-24T00:00:00Z&end=2025-11-24T23:59:59Z&limit=100
 */
router.get('/history', async (req, res) => {
    try {
        const { start, end, limit = 1000 } = req.query;

        if (!start || !end) {
            return res.status(400).json({ 
                error: 'Missing required parameters',
                message: 'start and end parameters are required (ISO 8601 format)'
            });
        }

        const query = `
            SELECT 
                id,
                timestamp,
                type,
                grid_voltage,
                ac_out_watt,
                load_percent,
                batt_voltage,
                batt_capacity_percent as soc,
                batt_charge_current,
                batt_discharge_current,
                heatsink_temp,
                pv_input_voltage,
                pv_input_current,
                (pv_input_voltage * pv_input_current) as pv_power
            FROM ems_readings
            WHERE timestamp >= $1 AND timestamp <= $2
            ORDER BY timestamp ASC
            LIMIT $3
        `;

        const result = await pool.query(query, [start, end, parseInt(limit)]);

        res.json({
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('❌ Error in /history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * 📌 GET /api/v1/dashboard/stats
 * 통계 데이터 조회 (최근 N개 데이터의 평균, 최대, 최소)
 * 쿼리 파라미터: limit (기본값: 100)
 */
router.get('/stats', async (req, res) => {
    try {
        const { limit = 100 } = req.query;

        const query = `
            SELECT 
                COUNT(*) as count,
                AVG(batt_capacity_percent) as avg_soc,
                MAX(batt_capacity_percent) as max_soc,
                MIN(batt_capacity_percent) as min_soc,
                AVG(ac_out_watt) as avg_power,
                MAX(ac_out_watt) as max_power,
                AVG(batt_voltage) as avg_battery_voltage,
                AVG(heatsink_temp) as avg_temp,
                MAX(heatsink_temp) as max_temp
            FROM (
                SELECT * FROM ems_readings
                ORDER BY timestamp DESC
                LIMIT $1
            ) recent_data
        `;

        const result = await pool.query(query, [parseInt(limit)]);

        res.json(result.rows[0]);

    } catch (error) {
        console.error('❌ Error in /stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * 📌 GET /api/v1/dashboard/recent
 * 최근 N개의 데이터 조회 (그래프용)
 * 쿼리 파라미터: limit (기본값: 50)
 */
router.get('/recent', async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const query = `
            SELECT 
                timestamp,
                batt_capacity_percent as soc,
                ac_out_watt,
                batt_voltage,
                heatsink_temp,
                (pv_input_voltage * pv_input_current) as pv_power,
                load_percent
            FROM ems_readings
            ORDER BY timestamp DESC
            LIMIT $1
        `;

        const result = await pool.query(query, [parseInt(limit)]);

        // 최신순으로 조회했으므로 오래된 순으로 정렬
        res.json(result.rows.reverse());

    } catch (error) {
        console.error('❌ Error in /recent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;