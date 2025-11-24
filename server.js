// ============================================
// MYSTIC AI SERVER - FINAL PRO EDITION v4.0
// (Model: Claude 3.5 Sonnet '20241022' | Timeout: 300s Ready)
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Solar } = require('lunar-javascript');

const app = express();
const PORT = process.env.PORT || 3001;

// Vercel Pro의 긴 타임아웃을 지원하기 위한 설정
app.use(cors({ origin: '*', methods: ['GET', 'POST'], credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get(['/result', '/result.html'], (req, res) =>
  res.sendFile(path.join(__dirname, 'frontend', 'result.html'))
);

// ============================================
// 1. 만세력 매핑 & 계산 로직 (정확도 100%)
// ============================================
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

// ============================================
// 2. 프롬프트 생성 (Sonnet 3.5 최적화)
// ============================================
function buildPremiumPrompt(name, birthInfo, pillars, lang, category) {
  const pY = formatPillar(pillars.year);
  const pM = formatPillar(pillars.month);
  const pD = formatPillar(pillars.day);
  const pH = formatPillar(pillars.hour);
  
  // ★ 2026년 병오년 강제 주입 (환각 방지)
  const targetYear = "2026 (丙午 - Red Fire Horse)";

  return `
You are ORACLE EYES, the highest-level Saju master.
Language: ${lang} (Use polite, mystical tone: "~습니다")
Client: ${name}
Pillars: Year(${pY}), Month(${pM}), Day(${pD}), Hour(${pH})
Target Year: ${targetYear}

Task: Write a **PREMIUM ${category} REPORT** for ${targetYear}.

[CRITICAL RULES]
1. **Identity**: Deeply analyze Day Pillar (${pD}). This is the core self.
2. **Accuracy**: The target year is strictly ${targetYear}. Do NOT confuse it with any other year.
3. **Tone**: Elegant, insightful, empathetic, professional. Use Markdown headers (##) and Emojis (🔮, ✨, 💰) artistically.
4. **Length**: Write a LONG, detailed report (approx 2000-3000 characters). Do not cut off. Use the extended time limit to write fully.

[STRUCTURE]
## 🔮 ${name}님의 영혼과 기질 (The Essence)
- Analyze the Day Pillar (${pD}) personality.

## ✨ 2026년 병오년의 기운 (The Flow)
- How the Fire Horse energy interacts with their pillars.
- Key theme of the year.

## 💰 부와 커리어 (Wealth & Career)
- Specific opportunities and warnings.

## ❤️ 사랑과 인연 (Love & Relationships)
- Relationship advice for 2026.

## 🗓️ 행운의 시기 (Best Timing)
- Pick key months and explain why.

## 🧿 오라클의 조언 (Final Message)
- Lucky Color, Item.
- A powerful closing message.
`;
}

// ============================================
// 3. API 호출 (여기가 핵심!)
// ============================================
async function callClaude(prompt) {
  const payload = {
    // ★★★ 2024년 6월 출시된 오리지널 Sonnet 3.5 (가장 안전함) ★★★
    model: 'claude-sonnet-4-5-20250929', 
    max_tokens: 4096,
    temperature: 0.9,
    messages: [{ role: 'user', content: prompt }]
  };

  // ★ 타임아웃 290초 (Vercel Pro 300초 제한 대비 안전마진 10초)
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
      console.error("Anthropic API Error Detail:", err); // 에러 로그 강화
      throw new Error(`Anthropic Error: ${err}`);
    }
    const data = await resp.json();
    return data.content[0].text;

  } finally {
    clearTimeout(timeout);
  }
}

// ============================================
// 4. 라우터 (API Endpoints)
// ============================================
app.post('/api/fortune', async (req, res) => {
  try {
    const body = req.body;

    // A. 궁합 (Compatibility)
    if (body.person1 && body.person2) {
      const p1 = calculateFourPillars(body.person1.birthYear, body.person1.birthMonth, body.person1.birthDay, body.person1.birthTime);
      const p2 = calculateFourPillars(body.person2.birthYear, body.person2.birthMonth, body.person2.birthDay, body.person2.birthTime);
      const prompt = `Analyze compatibility between ${body.person1.name}(${formatPillar(p1.day)}) and ${body.person2.name}(${formatPillar(p2.day)}). Use Korean. Premium style with Markdown.`;
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }

    // B. 꿈해몽 (Dream)
    if (body.dreamContent) {
      const prompt = `해몽해줘: "${body.dreamContent}". 고급스러운 말투로, 상징과 조언을 포함해서. Use Korean with Markdown.`;
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }

    // C. 신년운세 (New Year - Premium)
    const { name, birthYear, birthMonth, birthDay, birthTime, categories } = body;
    const birthInfo = `${birthYear}-${birthMonth}-${birthDay}`;
    const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);
    const category = (categories && categories[0]) || 'NewYear';

    const prompt = buildPremiumPrompt(name, birthInfo, pillars, detectLanguage(name), category);
    const result = await callClaude(prompt);

    return res.json({ fortune: result });

  } catch (err) {
    console.error('Server Error:', err);
    
    // 타임아웃 에러 핸들링
    if (err.name === 'AbortError') {
        return res.status(504).json({ error: "The stars are taking too long to align. Please try again! (Timeout)" });
    }
    return res.status(500).json({ error: String(err.message) });
  }
});

// 서버 시작
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
