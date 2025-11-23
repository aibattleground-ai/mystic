// ============================================
// MYSTIC AI SERVER - FINAL PRO VERSION
// (Deep Analysis via Split Calls + Full Feature Support)
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Solar } = require('lunar-javascript');
// const fetch = require('node-fetch'); // 삭제: Node 18+ 내장 fetch 사용

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
    stemHan: gan, branchHan: zhi,
    stemKo: GAN_MAP[gan]?.ko || '', branchKo: ZHI_MAP[zhi]?.ko || ''
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
      hour = parseInt(h); min = parseInt(mm);
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
  if (lang === 'Korean') return `${p.stemKo}${p.branchKo}(${p.stemHan}${p.branchHan})`;
  return `${p.stemHan}${p.branchHan}`; // Default
}

function detectLanguage(name = '') {
  const hasKr = /[가-힣]/.test(name);
  if (hasKr) return 'Korean';
  return 'English';
}

// ============================================
// 3. 프롬프트 생성기 (1차/2차 분할용)
// ============================================

// [1차] 도입부 + 핵심 분석 프롬프트
function buildIntroPrompt(name, birthInfo, pillars, lang, category) {
  const pY = formatPillar(pillars.year, lang);
  const pM = formatPillar(pillars.month, lang);
  const pD = formatPillar(pillars.day, lang);
  const pH = formatPillar(pillars.hour, lang);

  return `
You are 'MYSTIC AI', a grandmaster of Saju (Four Pillars of Destiny).
Language: ${lang} (Answer ONLY in ${lang})
Client: ${name}
Birth: ${birthInfo}
Pillars: Year(${pY}), Month(${pM}), Day(${pD}), Hour(${pH})

Task: Write PART 1 of a premium '${category}' report.
Structure:
1. **Greeting & Essence**: deeply analyze their Day Pillar (${pD}) personality.
2. **The Big Picture**: Explain the interaction between their pillars and the 2026 Fire Horse (丙午) year.
3. **Core Themes**: 3 Key keywords for their destiny this year.

IMPORTANT:
- Do NOT write a conclusion. Stop after the Core Themes.
- Use Markdown (## Headers, **Bold**).
- Use emojis (✨, 🔮, 🐉) tastefully.
- Be mystical yet logical.
`;
}

// [2차] 상세 운세 + 솔루션 프롬프트
function buildFinalPrompt(part1, category, lang) {
  return `
You are 'MYSTIC AI'. Continue writing PART 2 of the '${category}' report.
Language: ${lang} (Answer ONLY in ${lang})

Here is PART 1 that you just wrote:
"""
${part1}
"""

Task: Write PART 2 to finish the report.
Structure:
1. **Detailed Flow**: Monthly or seasonal breakdown for 2026.
2. **Actionable Advice**: Specific tips for Wealth, Love, and Career.
3. **Cautionary Notes**: What to watch out for (Health/Relationships).
4. **Lucky Items/Colors**: Practical fung-shui tips.
5. **Final Oracle Message**: A powerful, inspiring closing quote.

IMPORTANT:
- seamless transition from Part 1.
- Maintain the same mystical tone.
- Use Markdown.
- Length: Make it rich and detailed.
`;
}

// ============================================
// 4. Claude API 호출 함수
// ============================================
async function callClaude(prompt) {
  const payload = {
    model: 'claude-3-haiku-20240307',
    max_tokens: 4000, // 안전하게 4000으로 설정
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
    const txt = await resp.text();
    throw new Error(`Anthropic API Error: ${txt}`);
  }

  const data = await resp.json();
  return data?.content?.[0]?.text || '';
}

// ============================================
// 5. 메인 엔드포인트 (분기 처리 완벽 적용)
// ============================================

app.post('/api/fortune', async (req, res) => {
  try {
    const body = req.body;
    
    // --- A. 커플 궁합 (기존 방식: 1회 호출) ---
    if (body.person1 && body.person2) {
      const p1 = body.person1;
      const p2 = body.person2;
      const pillars1 = calculateFourPillars(p1.birthYear, p1.birthMonth, p1.birthDay, p1.birthTime);
      const pillars2 = calculateFourPillars(p2.birthYear, p2.birthMonth, p2.birthDay, p2.birthTime);
      const lang = detectLanguage(p1.name);
      
      const prompt = `
      Analyze compatibility between ${p1.name} (${formatPillar(pillars1.day, lang)}) and ${p2.name} (${formatPillar(pillars2.day, lang)}).
      Provide a score, chemistry analysis, and advice. Use Markdown.
      `;
      const result = await callClaude(prompt);
      return res.status(200).json({ fortune: result });
    }

    // --- B. 꿈 해몽 (기존 방식: 1회 호출) ---
    if (body.dreamContent) {
      const pillars = calculateFourPillars(body.birthYear, body.birthMonth, body.birthDay, body.birthTime);
      const prompt = `Interpret this dream: "${body.dreamContent}" for a person with Day Pillar ${formatPillar(pillars.day, 'English')}. Use Markdown.`;
      const result = await callClaude(prompt);
      return res.status(200).json({ fortune: result });
    }

    // --- C. 개인 운세 (신규 방식: 2회 분할 호출로 길게 뽑기) ---
    const { name, birthYear, birthMonth, birthDay, birthTime, birthPlace, categories } = body;
    const lang = detectLanguage(name);
    const birthInfo = `${birthYear}-${birthMonth}-${birthDay} ${birthTime} (${birthPlace})`;
    const category = (categories && categories[0]) || 'NewYear';
    const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);

    // 1단계: 도입부 생성
    const prompt1 = buildIntroPrompt(name, birthInfo, pillars, lang, category);
    const part1 = await callClaude(prompt1);

    // 2단계: 본문+결론 생성 (1단계 내용을 문맥으로 전달)
    const prompt2 = buildFinalPrompt(part1, category, lang);
    const part2 = await callClaude(prompt2);

    // 합치기
    const finalText = `${part1}\n\n${part2}`;
    
    return res.status(200).json({ fortune: finalText });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

app.listen(PORT, () =>
  console.log(`Mystic AI server running on http://localhost:${PORT}`)
);
