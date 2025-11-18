import express from 'express';
const router = express.Router();

// DB 클라이언트 import (ESM 방식)
// (api_b.js는 routes 폴더 안에 있으므로, 상위 폴더의 db.js를 가리킴)
import supabase from '../db.js'; 

/**
 * [GET] /api/v1/ems/latest
 * (B파트 DB 연동 버전 / .single() 버그 수정됨)
 */
router.get('/latest', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ems_data')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1); 

        if (error) {
            console.error('Supabase query error:', error.message);
            return res.status(500).json({ message: 'Error fetching data from DB', details: error.message });
        }

        if (!data || data.length === 0) {
            // RLS 정책이 없거나 DB가 비어있으면 여기가 실행됨
            return res.status(404).json({ message: 'No data found' });
        }

        const latestData = data[0];

        const responseData = {
            timestamp: latestData.timestamp,
            site: latestData.site_id,
            soc: latestData.soc,
            pv_power: latestData.pv_power,
            temp: latestData.temperature,
            mode: latestData.mode
        };
        
        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error in /latest route:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


/**
 * [GET] /api/v1/ems/history
 * (B파트 DB 연동 버전)
 */
router.get('/history', async (req, res) => {
    try {
        const { start, end } = req.query;

        // (실제로는 start, end 유효성 검증이 필요함)
        if (!start || !end) {
            return res.status(400).json({ message: 'Missing start or end query parameters' });
        }

        const { data, error } = await supabase
            .from('ems_data')
            .select('*')
            .gte('timestamp', start) // timestamp >= start
            .lte('timestamp', end)   // timestamp <= end
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('Supabase query error (history):', error.message);
            return res.status(500).json({ message: 'Error fetching history data', details: error.message });
        }

        const responseData = data.map(item => ({
            timestamp: item.timestamp,
            site: item.site_id,
            soc: item.soc,
            pv_power: item.pv_power,
            temp: item.temperature,
            mode: item.mode
        }));

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error in /history route:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// export (ESM 방식)
export default router;