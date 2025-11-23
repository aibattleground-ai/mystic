// ============================================
// ORACLE EYES - STABLE PRO SERVER v2.0
// (One-Shot High Speed Engine to fix Timeout)
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

// ============================================
// 1. 만세력 매핑
// ============================================
const GAN_MAP = {
  '甲': { ko: '갑' }, '乙': { ko: '을' }, '丙': { ko: '병' }, '丁': { ko: '정' },
  '戊': { ko: '무' }, '己': { ko: '기' }, '庚': { ko: '경' }, '辛': { ko: '신' },
  '壬': { ko: '임' }, '癸': { ko: '계' }
};

const ZHI_MAP = {
  '子': { ko: '자' }, '丑': { ko: '축' }, '寅': { ko: '인' }, '卯': { ko: '묘' },
  '辰': { ko: '진' }, '巳': { ko: '사' }, '午': { ko: '오' }, '未': { ko: '미' },
  '申': { ko: '신' }, '酉': { ko: '유' }, '戌': { ko: '술' }, '亥': { ko: '해' }
};

function parseGanZhi(gz) {
  if (!gz) return null;
  return {
    stemHan: gz[0], branchHan: gz[1],
    stemKo: GAN_MAP[gz[0]]?.ko || '', branchKo: ZHI_MAP[gz[1]]?.ko || ''
  };
}

function calculateFourPillars(y, m, d, birthTime) {
  const Y = parseInt(y), M = parseInt(m), D = parseInt(d);
  let H = 12, Min = 0;
  if (birthTime && typeof birthTime === 'string') {
    if (birthTime.includes(':')) {
      const [h, mm] = birthTime.split(':');
      H = parseInt(h); Min = parseInt(mm);
    } else { H = parseInt(birthTime); }
  }
  
  const solar = Solar.fromYmdHms(Y, M, D, H, Min, 0);
  const lunar = solar.getLunar();

  return {
    year: parseGanZhi(lunar.getYearInGanZhiExact()),
    month: parseGanZhi(lunar.getMonthInGanZhiExact()),
    day: parseGanZhi(lunar.getDayInGanZhiExact()),
    hour: parseGanZhi(lunar.getTimeInGanZhi())
  };
}

function formatPillar(p, lang) {
  if (!p) return '';
  if (lang === 'Korean') return `${p.stemKo}${p.branchKo}(${p.stemHan}${p.branchHan})`;
  return `${p.stemHan}${p.branchHan}`;
}

function detectLanguage(name) {
  return /[가-힣]/.test(name) ? 'Korean' : 'English';
}

// ============================================
// 2. 통합 프롬프트 (One-Shot Premium)
// ============================================
function buildPremiumPrompt(name, birthInfo, pillars, lang, category) {
  const pY = formatPillar(pillars.year, lang);
  const pM = formatPillar(pillars.month, lang);
  const pD = formatPillar(pillars.day, lang);
  const pH = formatPillar(pillars.hour, lang);

  return `
You are ORACLE EYES, a premium Saju master.
Language: ${lang} (Answer ONLY in ${lang})
Client: ${name}
Pillars: Year(${pY}), Month(${pM}), Day(${pD}), Hour(${pH})

Task: Write a COMPLETE, PREMIUM '${category}' report for 2026 (Fire Horse Year).

STRUCTURE & RULES:
1. **The Essence**: Analyze their Day Pillar (${pD}) personality deeply.
2. **2026 Forecast**: How 2026's energy affects them (Wealth, Love, Career).
3. **Monthly Flow**: Briefly mention key months to watch.
4. **Oracle's Advice**: Specific action items and lucky tips.
5. **Formatting**: Use Markdown (## Headers, **Bold**) and mystical emojis (🔮, ✨) tastefully.
6. **Length**: Detailed but concise enough to fit in one response.

Do not cut off. Provide a full, inspiring conclusion.
`;
}

// ============================================
// 3. API 호출
// ============================================
async function callClaude(prompt) {
  const payload = {
    model: 'claude-3-haiku-20240307',
    max_tokens: 3500, // 타임아웃 방지를 위해 살짝 줄임
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  };

  // 타임아웃 8초 설정 (Vercel 10초 제한 대비)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

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
      const errText = await resp.text();
      throw new Error(`Anthropic Error: ${errText}`);
    }

    const data = await resp.json();
    return data.content[0].text;

  } finally {
    clearTimeout(timeout);
  }
}

// ============================================
// 4. 메인 엔드포인트
// ============================================
app.post('/api/fortune', async (req, res) => {
  try {
    const body = req.body;

    // A. 궁합
    if (body.person1 && body.person2) {
      const p1 = calculateFourPillars(body.person1.birthYear, body.person1.birthMonth, body.person1.birthDay, body.person1.birthTime);
      const p2 = calculateFourPillars(body.person2.birthYear, body.person2.birthMonth, body.person2.birthDay, body.person2.birthTime);
      const lang = detectLanguage(body.person1.name);
      
      const prompt = `Analyze compatibility between ${body.person1.name}(${formatPillar(p1.day, lang)}) and ${body.person2.name}(${formatPillar(p2.day, lang)}). Structure: Score, Chemistry, Advice. Use Markdown.`;
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }

    // B. 꿈해몽
    if (body.dreamContent) {
      const prompt = `Interpret dream: "${body.dreamContent}". Provide: Symbolism, Message, Action. Use Markdown.`;
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }

    // C. 개인 운세 (통합 호출)
    const { name, birthYear, birthMonth, birthDay, birthTime, birthPlace, categories } = body;
    const lang = detectLanguage(name);
    const birthInfo = `${birthYear}-${birthMonth}-${birthDay}`;
    const category = (categories && categories[0]) || 'NewYear';
    const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);

    const prompt = buildPremiumPrompt(name, birthInfo, pillars, lang, category);
    const result = await callClaude(prompt); // 1번만 호출!

    return res.json({ fortune: result });

  } catch (err) {
    console.error('Server Error:', err);
    // 타임아웃 에러일 경우 친절한 메시지 반환
    if (err.name === 'AbortError') {
        return res.status(504).json({ error: "The stars are taking too long to align. Please try again!" });
    }
    return res.status(500).json({ error: String(err.message) });
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
