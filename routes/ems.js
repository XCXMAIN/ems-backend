import express from "express";

const router = express.Router();

// ✅ 최근 EMS 데이터 저장용 변수
let latestEMSData = null;

/**
 * @route POST /api/v1/ems
 * @desc  EMS에서 서버로 데이터 수신 (JSON)
 * @access Public
 */
router.post("/", (req, res) => {
  try {
    const data = req.body;

    // 필수 필드 검증
    if (!data.ts || !data.site || !data.dc || !data.pv) {
      return res.status(400).json({ error: "Invalid EMS data format" });
    }

    // 요약 데이터 정리
    latestEMSData = {
      timestamp: data.ts,
      site: data.site.id,
      soc: data.dc.soc_pct,
      pv_power: data.pv.pv_w,
      temp: data.dc.temp_c,
      mode: data.mode.name,
    };

    console.log("📩 [EMS Data Received & Parsed]");
    console.table(latestEMSData);

    return res.status(200).json({ message: "EMS data received successfully" });
  } catch (err) {
    console.error("❌ Error processing EMS data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route GET /api/v1/ems/latest
 * @desc  최신 EMS 데이터 조회
 * @access Public
 */
router.get("/latest", (req, res) => {
  if (!latestEMSData) {
    return res.status(200).json({ message: "No EMS data received yet" });
  }
  return res.status(200).json(latestEMSData);
});

export default router;
