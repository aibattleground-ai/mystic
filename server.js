// ============================================
// MYSTIC AI SERVER - Global Saju Expert Version
// (Fixed: Integer Parsing & Safe Token Limits)
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
// 1. 만세력 변환 데이터 (Mapping)
// ============================================

const GAN_MAP = {
  '甲': { ko: '갑', en: 'Jia' }, '乙': { ko: '을', en: 'Yi' }, '丙': { ko: '병', en: 'Bing' }, '丁': { ko: '정', en: 'Ding' },
  '戊': { ko: '무', en: 'Wu' }, '己': { ko: '기', en: 'Ji' }, '庚': { ko: '경', en: 'Geng' }, '辛': { ko: '신', en: 'Xin' },
  '壬': { ko: '임', en: 'Ren' }, '癸': { ko: '계', en: 'Gui' }
};

const ZHI_MAP = {
  '子': { ko: '자', en: 'Zi' }, '丑': { ko: '축', en: 'Chou' }, '寅': { ko: '인', en: 'Yin' }, '卯': { ko: '묘', en: 'Mao' },
  '辰': { ko: '진', en: 'Chen' }, '巳': { ko: '사', en: 'Si' }, '午': { ko: '오', en: 'Wu' }, '未': { ko: '미', en: 'Wei' },
  '申': { ko: '신', en: 'Shen' }, '酉': { ko: '유', en: 'You' }, '戌': { ko: '술', en: 'Xu' }, '亥': { ko: '해', en: 'Hai' }
};

// ============================================
// 2. 정확한 사주 계산 로직 (Library 사용)
// ============================================

function parseGanZhi(ganZhiString) {
  if (!ganZhiString || ganZhiString.length < 2) return null;
  const stemHan = ganZhiString[0];
  const branchHan = ganZhiString[1];

  const stemData = GAN_MAP[stemHan] || { ko: '', en: '' };
  const branchData = ZHI_MAP[branchHan] || { ko: '', en: '' };

  return {
    stemHan: stemHan,
    stemKo: stemData.ko,
    stemEn: stemData.en,
    branchHan: branchHan,
    branchKo: branchData.ko,
    branchEn: branchData.en
  };
}

// ★ 핵심 수정: 입력값을 무조건 숫자로 변환하여 에러 방지
function calculateFourPillars(year, month, day, birthTime) {
  // 1. 숫자 강제 변환 (매우 중요)
  const y = parseInt(year);
  const m = parseInt(month);
  const d = parseInt(day);
  
  let h = 12, min = 0;
  
  if (typeof birthTime === 'string') {
      if (birthTime.includes(':')) {
          const parts = birthTime.split(':');
          h = parseInt(parts[0]);
          min = parseInt(parts[1]);
      } else if (birthTime !== '') {
          h = parseInt(birthTime);
      }
  } else if (typeof birthTime === 'number') {
      h = birthTime;
  }
  
  if (isNaN(h)) h = 12;
  if (isNaN(min)) min = 0;

  // 2. Solar 객체 생성
  // fromYmdHms에 반드시 숫자가 들어가야 함!
  const solar = Solar.fromYmdHms(y, m, d, h, min, 0);
  const lunar = solar.getLunar();

  // 3. 사주 추출
  const yearGanZhi = lunar.getYearInGanZhiExact(); 
  const monthGanZhi = lunar.getMonthInGanZhiExact();
  const dayGanZhi = lunar.getDayInGanZhiExact();
  const hourGanZhi = lunar.getTimeInGanZhi();

  return {
    year: parseGanZhi(yearGanZhi),
    month: parseGanZhi(monthGanZhi),
    day: parseGanZhi(dayGanZhi),
    hour: parseGanZhi(hourGanZhi)
  };
}

function formatPillar(pillar, language) {
  if (!pillar) return '';
  if (language === 'Korean') return `${pillar.stemKo}${pillar.branchKo}(${pillar.stemHan}${pillar.branchHan})`;
  if (language === 'Japanese') return `${pillar.stemHan}${pillar.branchHan}`;
  if (language === 'Chinese') return `${pillar.stemHan}${pillar.branchHan}`;
  return `${pillar.stemEn}-${pillar.branchEn} (${pillar.stemHan}${pillar.branchHan})`;
}

// ============================================
// 3. 유틸리티
// ============================================

function detectLanguageFromName(name = '') {
  const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(name);
  const hasKana = /[\u3040-\u309F\u30A0-\u30FF]/.test(name);
  const hasCJK = /[\u4E00-\u9FFF]/.test(name);

  if (hasKorean) return 'Korean';
  if (hasKana) return 'Japanese';
  if (hasCJK) return 'Chinese';
  return 'English';
}

function buildBirthInfoString(year, month, day, time, place) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${time || 'unknown'} (${place || 'unknown'})`;
}

// ============================================
// 4. 프롬프트 생성기
// ============================================

function buildBaseInstruction(language, nameForGreeting = '', pillars) {
  const yearStr = formatPillar(pillars?.year, language);
  const monthStr = formatPillar(pillars?.month, language);
  const dayStr = formatPillar(pillars?.day, language);
  const hourStr = formatPillar(pillars?.hour, language);

  const fourPillarsBlock = `
[Calculated Four Pillars]
Year: ${yearStr}
Month: ${monthStr}
Day: ${dayStr}
Hour: ${hourStr}
`;

  if (language === 'Korean') {
    return `
너는 'MYSTIC AI'라는 한국 사주 명리 전문가다.
${fourPillarsBlock}
[규칙]
- 위 사주 정보(특히 일주: ${dayStr})를 절대적으로 신뢰하고 분석의 기준으로 삼는다.
- 사용자를 "당신"이라 하지 않고 "${nameForGreeting}님"이라고 부른다.
- 전문적이지만 따뜻하고 희망적인 톤을 유지한다.
- Markdown 포맷을 사용하여 가독성을 높인다.
`;
  }
  
  return `
You are 'MYSTIC AI', a master of Korean Saju.
${fourPillarsBlock}
[Rules]
- Use the pillars above (Day Pillar: ${dayStr}) as the absolute truth.
- Address the user as "${nameForGreeting}".
- Keep the tone warm, insightful, and slightly mystical.
- Use Markdown formatting.
`;
}

// 프롬프트 생성 함수들 (핵심만 남김)
function generateNewYearPrompt(name, birthInfo, language, pillars) {
  const base = buildBaseInstruction(language, name, pillars);
  const header = language === 'Korean' ? `2026년 병오년 신년운세` : `2026 New Year Fortune`;
  return `${base}\nClient: ${name}\nInfo: ${birthInfo}\nTask: Create a detailed ${header} report focusing on opportunities, wealth, and relationships in 2026. Explain specifically how the year 2026 (Fire Horse) interacts with their Day Pillar.`;
}

function generateLovePrompt(name, birthInfo, language, pillars) {
  const base = buildBaseInstruction(language, name, pillars);
  return `${base}\nClient: ${name}\nInfo: ${birthInfo}\nTask: Create a detailed Love & Relationship reading. Analyze their romance style based on their Day Pillar and suggest timing for love.`;
}

function generateMoneyPrompt(name, birthInfo, language, pillars) {
  const base = buildBaseInstruction(language, name, pillars);
  return `${base}\nClient: ${name}\nInfo: ${birthInfo}\nTask: Create a detailed Wealth & Career reading. Analyze their money bowl and potential financial success.`;
}

function generateCareerPrompt(name, birthInfo, language, pillars) {
  const base = buildBaseInstruction(language, name, pillars);
  return `${base}\nClient: ${name}\nInfo: ${birthInfo}\nTask: Create a detailed Career path reading. What is their true calling based on their Saju structure?`;
}

function generateCryptoPrompt(name, birthInfo, language, pillars) {
  const base = buildBaseInstruction(language, name, pillars);
  return `${base}\nClient: ${name}\nInfo: ${birthInfo}\nTask: Create a Crypto & Investment style reading. Analyze their risk tolerance and luck in speculative markets.`;
}

function generatePersonaPrompt(name, birthInfo, language, pillars) {
  const base = buildBaseInstruction(language, name, pillars);
  return `${base}\nClient: ${name}\nInfo: ${birthInfo}\nTask: Analyze their True Persona. What is their hidden inner self versus their outer mask?`;
}

function generateKarmaPrompt(name, birthInfo, language, pillars) {
  const base = buildBaseInstruction(language, name, pillars);
  return `${base}\nClient: ${name}\nInfo: ${birthInfo}\nTask: Create a Past Life & Karma reading. What karmic lessons are they carrying in this life?`;
}

// ============================================
// 5. API Endpoint
// ============================================

app.post('/api/fortune', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' });
  }

  try {
    const body = req.body;
    const nameToCheck = body?.name || body?.person1?.name || body?.person2?.name || '';
    const language = detectLanguageFromName(nameToCheck);
    let prompt = '';

    // 1) 커플 궁합
    if (body.person1 && body.person2) {
      const p1 = body.person1;
      const p2 = body.person2;
      const pillars1 = calculateFourPillars(p1.birthYear, p1.birthMonth, p1.birthDay, p1.birthTime);
      const pillars2 = calculateFourPillars(p2.birthYear, p2.birthMonth, p2.birthDay, p2.birthTime);
      
      const base = buildBaseInstruction(language, `${p1.name} & ${p2.name}`, null);
      const p1Str = formatPillar(pillars1.day, language);
      const p2Str = formatPillar(pillars2.day, language);
      
      prompt = `${base}
Analyze compatibility between:
1. ${p1.name} (Day Pillar: ${p1Str})
2. ${p2.name} (Day Pillar: ${p2Str})
Provide a compatibility score and detailed relationship advice.
`;
    }
    // 2) 꿈 해석
    else if (body.dreamContent) {
      const { name, birthYear, birthMonth, birthDay, birthTime } = body;
      const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);
      const base = buildBaseInstruction(language, name, pillars);
      prompt = `${base}\nInterpret this dream: "${body.dreamContent}". Relate it to their current fortune.`;
    }
    // 3) 일반 운세
    else {
      const { name, birthYear, birthMonth, birthDay, birthTime, birthPlace, categories } = body;
      const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);
      const birthInfo = buildBirthInfoString(birthYear, birthMonth, birthDay, birthTime, birthPlace);
      const category = (categories && categories[0]) || 'NewYear';

      switch (category) {
        case 'NewYear': prompt = generateNewYearPrompt(name, birthInfo, language, pillars); break;
        case 'Love': prompt = generateLovePrompt(name, birthInfo, language, pillars); break;
        case 'Money': prompt = generateMoneyPrompt(name, birthInfo, language, pillars); break;
        case 'Career': prompt = generateCareerPrompt(name, birthInfo, language, pillars); break;
        case 'Crypto': prompt = generateCryptoPrompt(name, birthInfo, language, pillars); break;
        case 'Persona': prompt = generatePersonaPrompt(name, birthInfo, language, pillars); break;
        case 'Karma': prompt = generateKarmaPrompt(name, birthInfo, language, pillars); break;
        default: prompt = generateNewYearPrompt(name, birthInfo, language, pillars);
      }
    }

    // Anthropic API Call
    const payload = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000, // ★ 4000 -> 3000으로 안전하게 줄임 (400 에러 방지)
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }], // Format simplified
    };

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('Anthropic API error:', resp.status, txt);
      // ★ 에러 내용을 프론트엔드로 보내서 확인 가능하게 변경
      return res.status(500).json({ error: `Anthropic API Error: ${txt}` });
    }

    const data = await resp.json();
    const first = Array.isArray(data?.content) ? data.content[0] : null;
    const text = first && first.type === 'text' ? first.text : '';

    return res.status(200).json({ fortune: text });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: String(error?.message || error) });
  }
});

app.listen(PORT, () => {
  console.log(`Mystic AI server running on http://localhost:${PORT}`);
});