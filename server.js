// ============================================
// MYSTIC AI SERVER - Premium Saju Expert Edition
// (includes: deep Korean persona + strict formatting rules)
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Solar } = require('lunar-javascript');

const app = express();
const PORT = process.env.PORT || 3001;

// ----------------------
// Middleware
// ----------------------
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(express.json());

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'frontend')));
app.get(['/result', '/result.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'result.html'));
});

// ============================================
// 1. 만세력 변환 데이터
// ============================================

const GAN_MAP = {
  '甲': { ko: '갑', en: 'Jia' }, '乙': { ko: '을', en: 'Yi' }, '丙': { ko: '병', en: 'Bing' },
  '丁': { ko: '정', en: 'Ding' }, '戊': { ko: '무', en: 'Wu' }, '己': { ko: '기', en: 'Ji' },
  '庚': { ko: '경', en: 'Geng' }, '辛': { ko: '신', en: 'Xin' }, '壬': { ko: '임', en: 'Ren' },
  '癸': { ko: '계', en: 'Gui' }
};

const ZHI_MAP = {
  '子': { ko: '자', en: 'Zi' }, '丑': { ko: '축', en: 'Chou' }, '寅': { ko: '인', en: 'Yin' },
  '卯': { ko: '묘', en: 'Mao' }, '辰': { ko: '진', en: 'Chen' }, '巳': { ko: '사', en: 'Si' },
  '午': { ko: '오', en: 'Wu' }, '未': { ko: '미', en: 'Wei' }, '申': { ko: '신', en: 'Shen' },
  '酉': { ko: '유', en: 'You' }, '戌': { ko: '술', en: 'Xu' }, '亥': { ko: '해', en: 'Hai' }
};

// ============================================
// 2. 만세력 계산
// ============================================

function parseGanZhi(str) {
  if (!str || str.length < 2) return null;
  const gan = str[0];
  const zhi = str[1];
  return {
    stemHan: gan,
    stemKo: GAN_MAP[gan]?.ko ?? '',
    stemEn: GAN_MAP[gan]?.en ?? '',
    branchHan: zhi,
    branchKo: ZHI_MAP[zhi]?.ko ?? '',
    branchEn: ZHI_MAP[zhi]?.en ?? ''
  };
}

function calculateFourPillars(y, m, d, t) {
  const year = parseInt(y);
  const month = parseInt(m);
  const day = parseInt(d);

  let hour = 12, min = 0;

  if (typeof t === 'string') {
    if (t.includes(':')) {
      const parts = t.split(':');
      hour = parseInt(parts[0]); 
      min = parseInt(parts[1]);
    } else if (t !== '') {
      hour = parseInt(t);
    }
  } else if (typeof t === 'number') hour = t;

  if (isNaN(hour)) hour = 12;

  const solar = Solar.fromYmdHms(year, month, day, hour, min, 0);
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

// ============================================
// 3. 언어 판별
// ============================================

function detectLanguageFromName(name = '') {
  if (/[가-힣]/.test(name)) return 'Korean';
  if (/[\u3040-\u30FF]/.test(name)) return 'Japanese';
  if (/[\u4E00-\u9FFF]/.test(name)) return 'Chinese';
  return 'English';
}

function buildBirthInfoString(y, m, d, t, place) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} ${t || 'unknown'} (${place || 'unknown'})`;
}

// ============================================
// 4. 프롬프트 — ★ 한국 프롬프트 완전 개편본 ★
// ============================================

function buildBaseInstruction(language, userName, pillars) {
  const Y = formatPillar(pillars?.year, language);
  const M = formatPillar(pillars?.month, language);
  const D = formatPillar(pillars?.day, language);
  const H = formatPillar(pillars?.hour, language);

  const fourPillarsBlock = `
[Four Pillars - DO NOT MODIFY]
Year  : ${Y}
Month : ${M}
Day   : ${D}
Hour  : ${H}
`;

  if (language === 'Korean') {
    return `
너는 40년 경력의 한국 사주 명리 전문가 'MYSTIC AI'로서만 말한다.

${fourPillarsBlock}

[절대 규칙]
1) 네 기둥 정보는 '사실'이며 수정 금지.  
2) "${userName}님"이라고 부르고 "당신" 금지.  
3) 절대 자기소개 금지 (“저는 AI입니다”, “살펴보겠습니다”, “분석해보겠습니다” 등 모두 금지).  
4) 답변의 첫 문장은 정확히:
   → "안녕하세요, ${userName}님."
5) 그 다음 줄부터 곧바로 사주 해석을 시작한다.
6) 아래 포맷을 ‘무조건’ 지켜서 작성한다.

[포맷 규칙]
각 섹션은 아래 형태로 시작해야 한다:

━━━━━━━━━━━━━━━━━━━━━━━
✨ 1. 섹션 제목 ✨
━━━━━━━━━━━━━━━━━━━━━━━

- 제목 한 줄 + 본문 최소 3문단  
- 이모지는 적당히 (과다 금지)  
- 마크다운 헤더(#) 사용 금지  
- 전체 분량 최소 12문단 이상  
- 유료 신년 리포트 수준의 깊이로 작성  

[내용 규칙]
- 일주(특히 ${D}) 중심으로 성향·성격·대인·일·재물 패턴을 깊게 분석  
- 십성(비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인) 풀어서 반드시 설명  
- 격국/용신/형충합/세운을 “스토리로” 풀어줄 것  
- 겁주는 표현 금지. 경고는 하되 반드시 대안·해결책을 함께 제시  

언어: 자연스러운 고급 한국어로 작성한다.
`;
  }

  // 영어/일본어/중국어는 기존 스타일 유지
  return `
You are MYSTIC AI, a Korean Saju master.
${fourPillarsBlock}
Rules:
- Always trust the pillars.
- Speak warmly and mystically.
`;
}

// ===============================
// 5. 카테고리 프롬프트
// ===============================

function generateNewYearPrompt(name, birthInfo, lang, pillars) {
  const base = buildBaseInstruction(lang, name, pillars);

  return `${base}

[작업 지시]
"${name}님"의 2026년 병오년(丙午年) 운세를  
아래 9개 섹션 전체로 구성하여,  
유료 프리미엄 신년 리포트 수준으로 작성하라.

1. 네 기둥 핵심 해석
2. 2026년 전체 테마 3~4개
3. 십성 기반 2026 흐름
4. 격국·형충합·세운 상호작용
5. 재물·일·커리어
6. 인간관계·연애·가족
7. 건강·컨디션·멘탈
8. 성장·전환점·기회 포인트
9. 2026년 결론 요약

각 섹션은 반드시 3문단 이상.
전체는 최소 12문단 이상.
`;
}

function generateLovePrompt(name, birthInfo, lang, pillars) {
  const base = buildBaseInstruction(lang, name, pillars);
  return `${base}

[작업 지시]
"${name}님"의 연애·관계 성향·타이밍·2026 흐름 전체를  
섹션 구조로 깊이 있게 작성하라.`;
}

function generateMoneyPrompt(name, birthInfo, lang, pillars) {
  const base = buildBaseInstruction(lang, name, pillars);
  return `${base}
[작업 지시]
"${name}님"의 재물·커리어·기회 포인트를  
십성 기반으로 상세히 작성하라.`;
}

function generateCareerPrompt(name, birthInfo, lang, pillars) {
  return buildMoneyPrompt(name, birthInfo, lang, pillars);
}

function generateCryptoPrompt(name, birthInfo, lang, pillars) {
  const base = buildBaseInstruction(lang, name, pillars);
  return `${base}
[작업 지시]
"${name}님"의 투자 성향·위험 감수·2026 재물 타이밍을  
사주 관점에서 설명하라.`;
}

function generatePersonaPrompt(name, birthInfo, lang, pillars) {
  const base = buildBaseInstruction(lang, name, pillars);
  return `${base}
[작업 지시]
"${name}님"의 겉·속 페르소나, 심리 패턴을  
일주·십성 중심으로 서술하라.`;
}

function generateKarmaPrompt(name, birthInfo, lang, pillars) {
  const base = buildBaseInstruction(lang, name, pillars);
  return `${base}
[작업 지시]
"${name}님"의 전생·카르마 패턴을  
네 기둥 기반으로 신중하게 서술하라.`;
}

// ============================================
// 6. API Endpoint
// ============================================

app.post('/api/fortune', async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY)
      return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' });

    const body = req.body;
    const nameToCheck = body?.name || body?.person1?.name || body?.person2?.name || '';
    const language = detectLanguageFromName(nameToCheck);

    let prompt = '';

    // 커플 궁합
    if (body.person1 && body.person2) {
      const p1 = body.person1;
      const p2 = body.person2;

      const pillars1 = calculateFourPillars(p1.birthYear, p1.birthMonth, p1.birthDay, p1.birthTime);
      const pillars2 = calculateFourPillars(p2.birthYear, p2.birthMonth, p2.birthDay, p2.birthTime);

      const p1Str = formatPillar(pillars1.day, language);
      const p2Str = formatPillar(pillars2.day, language);

      prompt = `
Analyze the compatibility of:
1) ${p1.name} – Day Pillar: ${p1Str}
2) ${p2.name} – Day Pillar: ${p2Str}
Provide deep compatibility + timing.`;
    }

    // 꿈 해석
    else if (body.dreamContent) {
      const { name, birthYear, birthMonth, birthDay, birthTime } = body;
      const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);
      const base = buildBaseInstruction(language, name, pillars);

      prompt = `${base}
Interpret this dream: "${body.dreamContent}". Relate to current fortune.`;
    }

    // 일반 카테고리
    else {
      const { name, birthYear, birthMonth, birthDay, birthTime, birthPlace, categories } = body;
      const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);
      const birthInfo = buildBirthInfoString(birthYear, birthMonth, birthDay, birthTime, birthPlace);

      const cat = (categories && categories[0]) || 'NewYear';

      if (cat === 'NewYear') prompt = generateNewYearPrompt(name, birthInfo, language, pillars);
      else if (cat === 'Love') prompt = generateLovePrompt(name, birthInfo, language, pillars);
      else if (cat === 'Money') prompt = generateMoneyPrompt(name, birthInfo, language, pillars);
      else if (cat === 'Career') prompt = generateMoneyPrompt(name, birthInfo, language, pillars);
      else if (cat === 'Crypto') prompt = generateCryptoPrompt(name, birthInfo, language, pillars);
      else if (cat === 'Persona') prompt = generatePersonaPrompt(name, birthInfo, language, pillars);
      else if (cat === 'Karma') prompt = generateKarmaPrompt(name, birthInfo, language, pillars);
      else prompt = generateNewYearPrompt(name, birthInfo, language, pillars);
    }

    // Claude API 요청
    const payload = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 2600,
      temperature: 0.75,
      messages: [{ role: 'user', content: prompt }],
    };

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(500).json({ error: `Anthropic API Error: ${txt}` });
    }

    const data = await resp.json();
    const content = Array.isArray(data?.content) ? data.content[0]?.text || '' : '';

    return res.status(200).json({ fortune: content });

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`MYSTIC AI server running on http://localhost:${PORT}`);
});
