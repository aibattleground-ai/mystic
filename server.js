// ============================================
// ORACLE EYES - PREMIUM SAJU ENGINE v3.1
// (Fortune Split Writer + Full Mystic Style)
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Solar } = require('lunar-javascript');
// Node18+ 는 fetch 기본 탑재 (node-fetch 불필요)

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*', methods: ['GET', 'POST'], credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.get(['/result', '/result.html'], (req, res) =>
  res.sendFile(path.join(__dirname, 'frontend', 'result.html'))
);

// ============================================
// 1) 만세력 매핑
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

// ============================================
// 2) 정통 사주 계산
// ============================================
function parseGanZhi(gz) {
  if (!gz) return null;
  const gan = gz[0], zhi = gz[1];
  return {
    stemHan: gan,
    branchHan: zhi,
    stemKo: GAN_MAP[gan]?.ko || '',
    branchKo: ZHI_MAP[zhi]?.ko || ''
  };
}

function calculateFourPillars(y, m, d, birthTime) {
  const Y = parseInt(y), M = parseInt(m), D = parseInt(d);
  let H = 12, Min = 0;

  if (birthTime && typeof birthTime === 'string') {
    if (birthTime.includes(':')) {
      const [h, mm] = birthTime.split(':');
      H = parseInt(h); Min = parseInt(mm);
    } else {
      H = parseInt(birthTime);
    }
  }

  const solar = Solar.fromYmdHms(Y, M, D, H, Min || 0, 0);
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

function detectLanguage(name = '') {
  if (/[가-힣]/.test(name)) return 'Korean';
  if (/[\u3040-\u30FF]/.test(name)) return 'Japanese';
  if (/[\u4E00-\u9FFF]/.test(name)) return 'Chinese';
  return 'English';
}

function birthString(y, m, d, t, place) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} ${t || '00:00'} (${place||'unknown'})`;
}

// ============================================
// 3) 프롬프트: PART 1 (프리미엄 오프닝)
// ============================================
function buildIntroPrompt(name, birthInfo, pillars, lang, category) {

  const Y = formatPillar(pillars.year, lang);
  const M = formatPillar(pillars.month, lang);
  const D = formatPillar(pillars.day, lang);
  const H = formatPillar(pillars.hour, lang);

  return `
You are **ORACLE EYES**, a mystical, cinematic, premium Saju oracle.

❗ LANGUAGE: ${lang} ONLY  
❗ TONE: deep, elegant, mystical, premium, dramatic  
❗ USER NAME: always call them "${name}님"  
❗ LENGTH: 700–900 words minimum  
❗ VISUAL STYLE:  
Use Unicode dividers like  
━━━━━━━━━━━━━━━━━━━━━━━  
✦ ✦ ✦  
and elegant emojis (🔮✨🌕🐉).

━━━━━━━━━━━━━━━━━━━━━━━
📌 CLIENT INFO
Name: ${name}  
Birth: ${birthInfo}  
Pillars:  
• Year: ${Y}  
• Month: ${M}  
• Day: ${D}  
• Hour: ${H}
━━━━━━━━━━━━━━━━━━━━━━━

Write **PART 1** of the "${category}" reading.

PART 1 MUST INCLUDE:
1) **Epic Opening Line** (cinematic scene, energetic gate of 2026 opening)  
2) **Day Pillar Deep Essence** (${D} personality in depth)  
3) **Interaction with 2026 Fire Horse Year (丙午)**  
4) **3–4 Key Themes of 2026**  

⛔ DO NOT write a conclusion  
⛔ DO NOT wrap up  
⛔ Stop strictly after "Key Themes"
`;
}
// ============================================
// ORACLE EYES - FINAL PRO SERVER v1.0
// (Deep Analysis: Two-Stage Fortune System)
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Solar } = require('lunar-javascript');

// Node 18+ → fetch 내장 (node-fetch 필요 없음)

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*', methods: ['GET', 'POST'], credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get(['/result', '/result.html'], (req, res) =>
  res.sendFile(path.join(__dirname, 'frontend', 'result.html'))
);

// ============================================
// 1. 만세력 매핑 데이터
// ============================================
const GAN_MAP = {
  '甲': { ko: '갑', en: 'Jia' }, '乙': { ko: '을', en: 'Yi' },
  '丙': { ko: '병', en: 'Bing' }, '丁': { ko: '정', en: 'Ding' },
  '戊': { ko: '무', en: 'Wu' }, '己': { ko: '기', en: 'Ji' },
  '庚': { ko: '경', en: 'Geng' }, '辛': { ko: '신', en: 'Xin' },
  '壬': { ko: '임', en: 'Ren' }, '癸': { ko: '계', en: 'Gui' }
};

const ZHI_MAP = {
  '子': { ko: '자', en: 'Zi' }, '丑': { ko: '축', en: 'Chou' },
  '寅': { ko: '인', en: 'Yin' }, '卯': { ko: '묘', en: 'Mao' },
  '辰': { ko: '진', en: 'Chen' }, '巳': { ko: '사', en: 'Si' },
  '午': { ko: '오', en: 'Wu' }, '未': { ko: '미', en: 'Wei' },
  '申': { ko: '신', en: 'Shen' }, '酉': { ko: '유', en: 'You' },
  '戌': { ko: '술', en: 'Xu' }, '亥': { ko: '해', en: 'Hai' }
};

// ============================================
// 2. 정통 사주 계산 로직
// ============================================
function parseGanZhi(gz) {
  if (!gz) return null;
  const gan = gz[0];
  const zhi = gz[1];
  return {
    stemHan: gan,
    branchHan: zhi,
    stemKo: GAN_MAP[gan]?.ko || '',
    branchKo: ZHI_MAP[zhi]?.ko || ''
  };
}

function calculateFourPillars(y, m, d, birthTime) {
  const year = parseInt(y);
  const month = parseInt(m);
  const day = parseInt(d);

  let hour = 12, min = 0;

  if (typeof birthTime === 'string') {
    if (birthTime.includes(':')) {
      const [h, mm] = birthTime.split(':');
      hour = parseInt(h);
      min = parseInt(mm);
    } else if (birthTime !== '') {
      hour = parseInt(birthTime);
    }
  }

  const solar = Solar.fromYmdHms(year, month, day, hour, min || 0, 0);
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
  if (lang === 'Korean')
    return `${p.stemKo}${p.branchKo}(${p.stemHan}${p.branchHan})`;
  return `${p.stemHan}${p.branchHan}`;
}

function detectLanguage(name = '') {
  const hasKr = /[가-힣]/.test(name);
  if (hasKr) return 'Korean';
  return 'English';
}

// ============================================
// 3. 프롬프트 생성기
// (Oraculum 스타일 강화 버전)
// ============================================

// [1차] 도입 + 핵심 구조
function buildIntroPrompt(name, birthInfo, pillars, lang, category) {
  const pY = formatPillar(pillars.year, lang);
  const pM = formatPillar(pillars.month, lang);
  const pD = formatPillar(pillars.day, lang);
  const pH = formatPillar(pillars.hour, lang);

  return `
You are ORACLE EYES — a celestial seer who blends ancient Saju and modern prophecy.
Language: ${lang} (Answer ONLY in ${lang})

Client Name: ${name}
Birth Info: ${birthInfo}

Four Pillars:
• Year: ${pY}
• Month: ${pM}
• Day: ${pD}
• Hour: ${pH}

Write PART 1 of a premium '${category}' oracle report.

STYLE RULES:
- Cinematic, mystical, premium.
- Use emojis like 🔮✨🌙🐉 wisely.
- Markdown format with big headers.
- Deep but readable.
- Stop after the “Key Themes”.

CONTENT RULES:
1. Greeting + “Soul Signature” based on Day Pillar.
2. Pillars interaction with 2026 (丙午 Fire Horse).
3. 3–4 Key Themes (short but powerful).

Do NOT continue to the final advice. Stop after the themes.
`;
}

// [2차] 결론 + 솔루션
function buildFinalPrompt(part1, category, lang) {
  return `
You are ORACLE EYES. Continue with PART 2 of the '${category}' oracle report.
Language: ${lang} (Answer ONLY in ${lang})

Here is PART 1 you generated:
"""
${part1}
"""

Now write PART 2.

STYLE:
- Cinematic. High-end. Oracle-like.
- Use mystical emojis but not too many.

CONTENT:
1. Detailed flow of 2026 (seasonal or quarterly).
2. Wealth / Love / Career actionable guidance.
3. Warning signs (health, relationships).
4. Lucky colors / items / directions.
5. Final Oracle Message — poetic & powerful.

Make PART 2 long, rich, premium.
`;
}

// ============================================
// 4. Claude API 호출
// ============================================
async function callClaude(prompt) {
  const payload = {
    model: 'claude-3-haiku-20240307',
    max_tokens: 4000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  };

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Anthropic API Error: ${text}`);
  }

  const data = await resp.json();
  return data?.content?.[0]?.text || '';
}
// ============================================
// 5. 메인 엔드포인트 (궁합 + 꿈해몽 + 개별운세 완전 지원)
// ============================================

app.post('/api/fortune', async (req, res) => {
  try {
    const body = req.body;

    // --------------------------------------------------
    // A. 궁합 (Compatibility) — 1회 호출
    // --------------------------------------------------
    if (body.person1 && body.person2) {
      const p1 = body.person1;
      const p2 = body.person2;

      const pillars1 = calculateFourPillars(
        p1.birthYear, p1.birthMonth, p1.birthDay, p1.birthTime
      );
      const pillars2 = calculateFourPillars(
        p2.birthYear, p2.birthMonth, p2.birthDay, p2.birthTime
      );

      const lang = detectLanguage(p1.name);

      const prompt = `
You are ORACLE EYES — a celestial compatibility master.
Analyze love compatibility between:

• ${p1.name} — Day Pillar: ${formatPillar(pillars1.day, lang)}
• ${p2.name} — Day Pillar: ${formatPillar(pillars2.day, lang)}

Provide:
1) Chemistry score (0~100)
2) Strengths of the relationship
3) Danger points
4) Future potential
5) Advice to improve the relationship

Use Markdown + emojis.
      `;

      const result = await callClaude(prompt);
      return res.status(200).json({ fortune: result });
    }

    // --------------------------------------------------
    // B. 꿈해몽 (Dream Interpretation) — 1회 호출
    // --------------------------------------------------
    if (body.dreamContent) {
      const pillars = calculateFourPillars(
        body.birthYear, body.birthMonth, body.birthDay, body.birthTime
      );

      const prompt = `
You are ORACLE EYES — a dream interpreter.
Interpret the following dream:

"${body.dreamContent}"

Consider:
• Their Day Pillar: ${formatPillar(pillars.day, 'English')}

Provide:
- Symbol meaning
- Subconscious message
- Warning signs
- Guidance for next steps

Use elegant Markdown with emojis.
      `;

      const result = await callClaude(prompt);
      return res.status(200).json({ fortune: result });
    }

    // --------------------------------------------------
    // C. 개인 운세 (Single Fortune) — 2회 호출 (PREMIUM MODE)
    // --------------------------------------------------

    const { name, birthYear, birthMonth, birthDay, birthTime, birthPlace, categories } = body;
    const lang = detectLanguage(name);

    const birthInfo =
      `${birthYear}-${birthMonth}-${birthDay} ${birthTime} (${birthPlace || 'Unknown'})`;

    const category = (categories && categories[0]) || 'NewYear';

    const pillars = calculateFourPillars(
      birthYear, birthMonth, birthDay, birthTime
    );

    // 1단계: PART 1 생성
    const prompt1 = buildIntroPrompt(name, birthInfo, pillars, lang, category);
    const part1 = await callClaude(prompt1);

    // 2단계: PART 2 생성
    const prompt2 = buildFinalPrompt(part1, category, lang);
    const part2 = await callClaude(prompt2);

    // 최종 합침
    const finalText = `${part1}\n\n${part2}`;

    return res.status(200).json({ fortune: finalText });

  } catch (err) {
    console.error('SERVER ERROR:', err);
    return res.status(500).json({ error: String(err.message || err) });
  }
});

// ============================================
// 서버 시작
// ============================================
app.listen(PORT, () =>
  console.log(`🔮 ORACLE EYES server running → http://localhost:${PORT}`)
);
