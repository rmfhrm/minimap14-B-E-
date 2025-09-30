const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('AI 창업 내비게이터 백엔드 서버입니다.');
});

// AI 리포트 생성 API 라우트
app.post('/api/generate-report', async (req, res) => {
  try {
    const { placedItems, storeInfo, businessType } = req.body;
    console.log("리포트 생성 요청 받음:", { placedItems, storeInfo, businessType });

    const itemList = placedItems.map(item => item.name).join(', ');
    const prompt = `
      당신은 대한민국 광주광역시의 소상공인을 위한 창업 컨설턴트입니다.
      아래 정보를 바탕으로 초기 창업 비용 분석 리포트를 생성해주세요.
      결과는 반드시 마크다운 형식으로, 각 항목을 명확하게 구분해서 작성해야 합니다.

      - **업종:** ${businessType}
      - **상가 면적:** ${storeInfo.area}
      - **핵심 배치 가구 및 설비 목록:** ${itemList}

      **리포트 포함 내용:**
      1.  **보증금 및 임대료:** 광주광역시의 충장로 상권 특성을 고려한 현실적인 예상 비용.
      2.  **인테리어 비용:** 기본 공사(전기, 조명, 바닥 등)와 컨셉 비용을 포함한 평당 예상 비용.
      3.  **설비 및 가구 비용:** 사용자가 배치한 목록(${itemList})을 중심으로 각 항목별 상세 비용 추산. 목록에 없는 필수 설비가 있다면 추가 제안 및 비용 포함.
      4.  **초도물품비:** 업종에 필요한 초기 재료, 상품 등의 비용.
      5.  **인허가 및 기타비용:** 사업자 등록, 간판, 마케팅 등 기타 부대 비용.
      6.  **총 예상 창업 비용:** 위 모든 항목을 합산한 최종 금액과 전문가로서의 종합적인 조언.
    `;

    // 이 부분이 수정되었습니다!
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reportText = response.text();

    res.json({ report: reportText });

  } catch (error) {
    console.error("AI 리포트 생성 중 에러 발생:", error);
    res.status(500).json({ error: "AI 리포트 생성에 실패했습니다." });
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});