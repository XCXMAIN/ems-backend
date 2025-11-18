import express from "express";

const router = express.Router();

// ✅ 최근 EMS 데이터 저장용 변수
// (A파트가 WebSocket 브로드캐스트 등에 사용할 수 있으므로 유지합니다)
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

    // (TODO: A파트(저)가 여기에 Supabase DB INSERT 로직을 추가해야 합니다.)
    // (B파트님의 /latest API가 데이터를 조회하려면 제가 이 작업을 해야 합니다.)

    return res.status(200).json({ message: "EMS data received successfully" });
  } catch (err) {
    console.error("❌ Error processing EMS data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- B파트님의 api_b.js와 충돌하는 /latest API를 여기서 삭제했습니다 ---
// (GET /latest 및 GET /history는 api_b.js 파일이 모두 담당합니다)

export default router;