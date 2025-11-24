// ============================================
// MYSTIC AI SERVER - FINAL FIX
// (Model: 'claude-3-5-sonnet-latest')
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Solar } = require('lunar-javascript');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*', methods: ['GET', 'POST'], credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get(['/result', '/result.html'], (req, res) =>
  res.sendFile(path.join(__dirname, 'frontend', 'result.html'))
);

// 1. 만세력 매핑
const GAN_MAP = { '甲': { ko: '갑' }, '乙': { ko: '을' }, '丙': { ko: '병' }, '丁': { ko: '정' }, '戊': { ko: '무' }, '己': { ko: '기' }, '庚': { ko: '경' }, '辛': { ko: '신' }, '壬': { ko: '임' }, '癸': { ko: '계' } };
const ZHI_MAP = { '子': { ko: '자' }, '丑': { ko: '축' }, '寅': { ko: '인' }, '卯': { ko: '묘' }, '辰': { ko: '진' }, '巳': { ko: '사' }, '午': { ko: '오' }, '未': { ko: '미' }, '申': { ko: '신' }, '酉': { ko: '유' }, '戌': { ko: '술' }, '亥': { ko: '해' } };

function parseGanZhi(gz) {
  if (!gz) return null;
  return { stemHan: gz[0], branchHan: gz[1], stemKo: GAN_MAP[gz[0]]?.ko || '', branchKo: ZHI_MAP[gz[1]]?.ko || '' };
}

function calculateFourPillars(y, m, d, t) {
  const Y = parseInt(y), M = parseInt(m), D = parseInt(d);
  let H = 12, Min = 0;
  if (typeof t === 'string' && t.includes(':')) {
    const parts = t.split(':'); H = parseInt(parts[0]); Min = parseInt(parts[1]);
  } else if (typeof t === 'number') { H = t; }
  
  const solar = Solar.fromYmdHms(Y, M, D, H, Min, 0);
  const lunar = solar.getLunar();
  return {
    year: parseGanZhi(lunar.getYearInGanZhiExact()),
    month: parseGanZhi(lunar.getMonthInGanZhiExact()),
    day: parseGanZhi(lunar.getDayInGanZhiExact()),
    hour: parseGanZhi(lunar.getTimeInGanZhi())
  };
}

function formatPillar(p) { return p ? `${p.stemKo}${p.branchKo}(${p.stemHan}${p.branchHan})` : ''; }
function detectLanguage(name) { return /[가-힣]/.test(name) ? 'Korean' : 'English'; }

// 2. 프롬프트 (Sonnet 최적화)
function buildPremiumPrompt(name, birthInfo, pillars, lang, category) {
  const pY = formatPillar(pillars.year);
  const pM = formatPillar(pillars.month);
  const pD = formatPillar(pillars.day);
  const pH = formatPillar(pillars.hour);
  const targetYear = "2026 (丙午 - Red Fire Horse)";

  return `
You are ORACLE EYES, the highest-level Saju master.
Language: ${lang} (Use polite, mystical tone: "~습니다")
Client: ${name}
Pillars: Year(${pY}), Month(${pM}), Day(${pD}), Hour(${pH})
Target Year: ${targetYear}

Task: Write a **PREMIUM ${category} REPORT** for ${targetYear}.

[RULES]
1. **Identity**: Deeply analyze Day Pillar (${pD}).
2. **Accuracy**: Focus on interaction with ${targetYear}. No hallucinations.
3. **Tone**: Elegant, insightful, empathetic. Use Markdown headers (##) and Emojis (🔮, ✨).
4. **Length**: Detailed report (approx 2000-2500 chars). Do not cut off.

[STRUCTURE]
## 🔮 ${name}님의 영혼과 기질
## ✨ 2026년 병오년의 기운
## 💰 부와 커리어
## ❤️ 사랑과 인연
## 🗓️ 행운의 시기
## 🧿 오라클의 조언
`;
}

// 3. API 호출 (여기가 수정됨!)
async function callClaude(prompt) {
  const payload = {
    // ★★★ 가장 안전한 '최신 버전 자동 선택' 옵션 ★★★
    model: 'claude-3-5-sonnet-20241022', 
    max_tokens: 4096, 
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  };

  // 타임아웃 290초 (Vercel Pro 대응)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 290000); 

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Anthropic Error: ${err}`);
    }
    const data = await resp.json();
    return data.content[0].text;

  } finally {
    clearTimeout(timeout);
  }
}

// 4. 라우터
app.post('/api/fortune', async (req, res) => {
  try {
    const body = req.body;
    // 궁합
    if (body.person1 && body.person2) {
      const p1 = calculateFourPillars(body.person1.birthYear, body.person1.birthMonth, body.person1.birthDay, body.person1.birthTime);
      const p2 = calculateFourPillars(body.person2.birthYear, body.person2.birthMonth, body.person2.birthDay, body.person2.birthTime);
      const prompt = `Analyze compatibility between ${body.person1.name}(${formatPillar(p1.day)}) and ${body.person2.name}(${formatPillar(p2.day)}). Use Korean. Premium style.`;
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }
    // 꿈해몽
    if (body.dreamContent) {
      const prompt = `해몽해줘: "${body.dreamContent}". 고급스러운 말투로. Use Korean.`;
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }
    // 신년운세
    const { name, birthYear, birthMonth, birthDay, birthTime, categories } = body;
    const birthInfo = `${birthYear}-${birthMonth}-${birthDay}`;
    const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);
    const category = (categories && categories[0]) || 'NewYear';

    const prompt = buildPremiumPrompt(name, birthInfo, pillars, detectLanguage(name), category);
    const result = await callClaude(prompt);

    return res.json({ fortune: result });

  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: String(err.message) });
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
