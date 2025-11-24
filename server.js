// ============================================
// ORACLE EYES SERVER - ULTIMATE EDITION v6.0
// - Enhanced Category Prompts ✅
// - Language Detection Fixed ✅  
// - Anti-Truncation Maximized ✅
// - Ready for Option B Fake Loading ✅
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
// 1. 만세력 매핑 & 계산
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
    stemHan: gz[0], 
    branchHan: gz[1], 
    stemKo: GAN_MAP[gz[0]]?.ko || '', 
    branchKo: ZHI_MAP[gz[1]]?.ko || '' 
  };
}

function calculateFourPillars(y, m, d, t) {
  const Y = parseInt(y), M = parseInt(m), D = parseInt(d);
  let H = 12, Min = 0;
  
  if (typeof t === 'string' && t.includes(':')) {
    const parts = t.split(':'); 
    H = parseInt(parts[0]); 
    Min = parseInt(parts[1]);
  } else if (typeof t === 'number') { 
    H = t; 
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

function formatPillar(p) { 
  return p ? `${p.stemKo}${p.branchKo}(${p.stemHan}${p.branchHan})` : ''; 
}

// ★ 강화된 언어 감지
function detectLanguage(name) {
  const hasKorean = /[가-힣]/.test(name);
  const hasEnglish = /[a-zA-Z]/.test(name);
  
  // 한글이 하나라도 있으면 무조건 한글
  if (hasKorean) return 'Korean';
  
  // 순수 영어만 있으면 영어
  if (hasEnglish && !hasKorean) return 'English';
  
  // 기타는 영어로
  return 'English';
}

// ============================================
// 2. 카테고리별 포커스 & 구조 정의
// ============================================
function getCategoryData(category, lang) {
  const data = {
    'NewYear': {
      focus: lang === 'Korean' 
        ? '2026년 전반적인 운세 - 재물, 사랑, 건강, 커리어 모든 영역을 균형있게 다룸'
        : '2026 overall fortune - balanced coverage of wealth, love, health, and career',
      
      structure: lang === 'Korean' ? `

## 🔮 ${'{NAME}'}님의 영혼 코드 (Soul DNA)

Day Pillar 분석을 통한 본질적 성격과 운명의 설계도를 해독합니다.

## 🐴 2026 병오년, 붉은 불의 말이 가져올 변화

Fire Horse 에너지가 당신의 사주와 만나 만들어낼 화학작용을 예측합니다.

## 💰 재물운 & 커리어 (Wealth Destiny)

구체적인 수입 기회, 승진 타이밍, 사업 확장 시기를 월별로 분석합니다.

## ❤️ 사랑과 인연 (Love Connections)

연애, 결혼, 인간관계의 흐름과 결정적 만남의 시기를 읽습니다.

## 🗓️ 황금 타이밍 달력 (Golden Months)

2026년 중 가장 강력한 행운의 시기 3개월을 선정하고 이유를 설명합니다.

## 🎁 행운 아이템 & 오라클의 최종 메시지

- 행운의 색상 1개
- 행운의 숫자 1개  
- 2026년을 관통하는 핵심 조언 3줄

` : `

## 🔮 Your Soul Code (Day Pillar Decoded)

Deep analysis of your Day Pillar revealing your core nature and destiny blueprint.

## 🐴 2026: Year of the Red Fire Horse

How the Fire Horse energy interacts with your Four Pillars to create opportunities.

## 💰 Wealth & Career Destiny

Specific income opportunities, promotion timing, and business expansion windows by month.

## ❤️ Love Connections

Romance, marriage, and relationship flow with key meeting periods identified.

## 🗓️ Golden Months Calendar

The 3 most powerful lucky periods in 2026 with detailed explanations.

## 🎁 Lucky Charms & Oracle's Final Wisdom

- Lucky Color: 1 color
- Lucky Number: 1 number
- Core guidance for 2026 (3 key messages)

`
    },

    'CryptoDestiny': {
      focus: lang === 'Korean'
        ? '암호화폐 투자 운세 ONLY - 비트코인, 알트코인, DeFi, NFT 타이밍과 전략. 다른 주제는 언급하지 말 것'
        : 'Cryptocurrency investment fortune ONLY - Bitcoin, Altcoins, DeFi, NFT timing and strategy. Do not mention other topics',
      
      structure: lang === 'Korean' ? `

## 🪙 ${'{NAME}'}님의 금융 DNA 해부 (Financial Genome)

Day Pillar 분석으로 밝혀낸 투자 성향: 공격형 vs 안정형, 단타 vs 장타 적성

## 🔥 2026 암호화폐 시장 X 당신의 사주 케미스트리

병오년(Fire Horse) 에너지가 디지털 자산 시장에 미칠 영향과 당신의 운과의 조합

## 📈 월별 트레이딩 타이밍 (Trading Windows)

- 강력 매수 추천 구간 (3개월 구체적으로 지정)
- 위험 구간 / 관망 추천 시기 (2개월)
- 수익 실현 최적 타이밍 (2개월)

## 💎 2026 추천 포트폴리오 전략

- BTC vs 알트코인 비율 제안
- 주목해야 할 섹터 (DeFi, AI코인, 게임파이, 밈코인 등)
- 절대 피해야 할 함정

## 🎰 리스크 vs 보상 밸런싱

당신의 사주가 감당할 수 있는 리스크 레벨과 최적 자산배분

## 🧿 크립토 오라클의 최종 조언

- 행운의 코인 색상 (예: 골드/실버/블루)
- 지갑 체크 행운의 요일
- 2026 암호화폐 투자 핵심 원칙 3가지

` : `

## 🪙 Your Financial DNA Decoded

Investment personality from Day Pillar: Aggressive vs Conservative, Short vs Long-term aptitude

## 🔥 2026 Crypto Market X Your Saju Chemistry

How Fire Horse energy impacts digital assets combined with your personal fortune

## 📈 Monthly Trading Windows

- Strong Buy Periods (3 months specifically identified)
- High Risk / Hold Zones (2 months)
- Optimal Profit-Taking Timing (2 months)

## 💎 2026 Recommended Portfolio Strategy

- BTC vs Altcoin allocation suggestion
- Sectors to watch (DeFi, AI coins, GameFi, Meme coins, etc.)
- Absolute traps to avoid

## 🎰 Risk vs Reward Balancing

Risk tolerance level your Saju can handle and optimal asset allocation

## 🧿 Crypto Oracle's Final Wisdom

- Lucky coin color (e.g., Gold/Silver/Blue)
- Lucky day for wallet checks
- 3 core principles for 2026 crypto investing

`
    },

    'Love': {
      focus: lang === 'Korean'
        ? '연애운 ONLY - 이상형, 만남 시기, 고백 타이밍, 결혼운. 재물이나 커리어는 언급하지 말 것'
        : 'Romance fortune ONLY - ideal type, meeting timing, confession windows, marriage luck. Do not mention wealth or career',
      
      structure: lang === 'Korean' ? `

## 💕 ${'{NAME}'}님의 사랑 설계도 (Love Blueprint)

Day Pillar로 읽는 연애 스타일: 열정형 vs 신중형, 끌리는 이성상

## 🌹 2026년 로맨스 기운 분석

병오년이 가져올 연애 에너지 - 새로운 만남 vs 기존 관계 심화

## 💘 결정적 만남의 시기 (Fateful Encounters)

- 인연이 들어오는 달 (3개월 구체적으로 지정)
- 만남의 장소 힌트 (온라인 vs 오프라인, 소개팅 vs 자연스러운 만남)
- 이상형의 특징 (외모, 성격, 직업 성향)

## 💍 고백 & 프러포즈 황금 타이밍

- 고백 성공률 최고인 시기
- 결혼 이야기 꺼내기 좋은 달
- 커플이라면 관계 발전 적기

## ⚠️ 연애 주의보 발령 구간

다툼 위험 높은 시기와 갈등 해결 방법

## 🎁 연애운 부스터 아이템

- 데이트 추천 색상
- 첫 만남 행운의 장소 타입
- 오라클의 연애 조언 (3줄)

` : `

## 💕 Your Love Blueprint

Romance style from Day Pillar: Passionate vs Cautious, attraction patterns

## 🌹 2026 Romance Energy Analysis

Love energy Fire Horse brings - new encounters vs deepening existing bonds

## 💘 Fateful Encounter Windows

- Months when connections enter (3 months specifically identified)
- Meeting place hints (online vs offline, blind date vs organic)
- Ideal type characteristics (appearance, personality, career tendencies)

## 💍 Confession & Proposal Golden Timing

- Highest success rate period for confession
- Best month to discuss marriage
- For couples: relationship advancement timing

## ⚠️ Romance Warning Zones

High-conflict periods and resolution strategies

## 🎁 Love Luck Boosters

- Date outfit lucky color
- Ideal first meeting venue type
- Oracle's romance advice (3 key tips)

`
    },

    'Career': {
      focus: lang === 'Korean'
        ? '커리어 운세 ONLY - 승진, 이직, 창업, 연봉협상 타이밍. 연애나 개인적 주제는 언급하지 말 것'
        : 'Career fortune ONLY - promotion, job change, startup, salary negotiation timing. Do not mention romance or personal topics',
      
      structure: lang === 'Korean' ? `

## 💼 ${'{NAME}'}님의 커리어 DNA (Professional Identity)

Day Pillar가 말하는 직업 적성과 성공 패턴

## 🚀 2026 커리어 로드맵

병오년 에너지가 당신의 직업운에 미칠 영향 - 도약 vs 안정화

## 📊 승진 & 인정받을 시기

- 상사에게 어필하기 좋은 달 (2개월)
- 프로젝트 성과 극대화 타이밍
- 평가/승진 심사 유리한 시기

## 🔄 이직 & 새 기회 윈도우

- 이력서 넣기 최적 시기
- 면접 운 최강인 달
- 피해야 할 이직 시기
- 창업 고려 시 적기

## 💰 연봉 협상 & 재정 운

- 연봉 협상 성공률 높은 시기
- 부수입 기회가 들어오는 달
- 투자/사업 확장 타이밍

## 🎯 2026 커리어 전략 요약

- 집중해야 할 스킬 1가지
- 네트워킹 강화 시기
- 오라클의 커리어 조언 (3줄)

` : `

## 💼 Your Career DNA

Professional aptitude and success patterns from Day Pillar

## 🚀 2026 Career Roadmap

Fire Horse energy impact on career - breakthrough vs stabilization

## 📊 Promotion & Recognition Timing

- Best months to impress superiors (2 months)
- Project success maximization timing
- Favorable evaluation/promotion periods

## 🔄 Job Change & New Opportunity Windows

- Optimal resume submission period
- Strongest interview luck month
- Job change periods to avoid
- Startup timing if considering

## 💰 Salary Negotiation & Financial Fortune

- High success rate negotiation period
- Side income opportunity months
- Investment/business expansion timing

## 🎯 2026 Career Strategy Summary

- 1 skill to focus on developing
- Networking power periods
- Oracle's career wisdom (3 core tips)

`
    },

    'Health': {
      focus: lang === 'Korean'
        ? '건강운 ONLY - 신체 에너지, 정신 건강, 주의 질환, 회복 타이밍. 다른 운세 주제는 언급하지 말 것'
        : 'Health fortune ONLY - physical energy, mental wellness, risk periods, recovery timing. Do not mention other fortune topics',
      
      structure: lang === 'Korean' ? `

## 🧬 ${'{NAME}'}님의 신체 에너지 맵 (Body Energy Map)

Day Pillar로 읽는 선천적 체질과 에너지 흐름 패턴

## 🔥 2026 건강 바이오리듬

병오년(Fire) 에너지가 당신의 몸에 미칠 영향 - 활력 vs 과열 주의

## ⚠️ 건강 주의 시그널 (Warning Periods)

- 피로 누적 주의 구간 (2개월)
- 스트레스 관리 필요 시기
- 면역력 저하 구간
- 주의해야 할 신체 부위

## 💪 에너지 충전 & 회복 타이밍

- 운동 시작하기 좋은 달
- 디톡스/클렌징 효과 극대화 시기
- 휴식이 약이 되는 달
- 건강검진 추천 시기

## 🧘 정신 건강 & 마음 관리

- 번아웃 위험 시기
- 명상/요가 효과 좋은 달
- 심리적 안정 찾는 시기

## 🍀 2026 건강 관리 가이드

- 추천 식습관 방향
- 수면 패턴 최적화 시기
- 오라클의 건강 조언 (3줄)

` : `

## 🧬 Your Body Energy Map

Innate constitution and energy flow patterns from Day Pillar

## 🔥 2026 Health Biorhythm

Fire Horse energy impact on your body - vitality boost vs overheating risks

## ⚠️ Health Warning Signals

- Fatigue accumulation zones (2 months)
- Stress management needed periods
- Immunity low points
- Body parts requiring attention

## 💪 Energy Recharge & Recovery Timing

- Great months to start exercising
- Detox/cleansing maximization periods
- Rest-as-medicine months
- Recommended health checkup timing

## 🧘 Mental Health & Mind Care

- Burnout risk periods
- Meditation/yoga high-effect months
- Psychological stability windows

## 🍀 2026 Health Management Guide

- Recommended dietary direction
- Sleep pattern optimization timing
- Oracle's health wisdom (3 core tips)

`
    }
  };

  return data[category] || data['NewYear'];
}

// ============================================
// 3. 프롬프트 빌더 (완전 재구성)
// ============================================
function buildPremiumPrompt(name, birthInfo, pillars, lang, category) {
  const pY = formatPillar(pillars.year);
  const pM = formatPillar(pillars.month);
  const pD = formatPillar(pillars.day);
  const pH = formatPillar(pillars.hour);
  
  const targetYear = "2026 (丙午 - Red Fire Horse Year)";
  const categoryData = getCategoryData(category, lang);
  
  // ★ 언어별 엄격한 지시
  const languageRule = lang === 'Korean' 
    ? `**ABSOLUTE LANGUAGE RULE**: 
       - Write ENTIRELY in Korean using formal polite endings (습니다, 세요, 십니다)
       - ZERO English words allowed except: proper nouns (Bitcoin, DeFi, NFT, names)
       - NO mixed language sentences
       - NO English grammar with Korean words
       - Example CORRECT: "당신은 계해 일주입니다"
       - Example WRONG: "You are 계해 일주입니다" or "당신은 계해 일주 you are"`
    : `**ABSOLUTE LANGUAGE RULE**: 
       - Write ENTIRELY in English
       - ZERO Korean characters allowed (no 습니다, 세요, or any Hangul)
       - Use mystical yet professional tone throughout
       - NO Korean words mixed into English sentences`;

  // ★ Anti-truncation 명령어 강화
  const completionRule = `
**COMPLETION MANDATE - CRITICAL**: 
- You MUST write the COMPLETE reading from start to finish
- NEVER stop mid-sentence or mid-section
- If approaching token limits, PRIORITIZE completing the final section over adding details to earlier sections
- The ending wisdom section is MANDATORY - never cut it off
- Aim for 2800-3500 characters total
- This is a PREMIUM reading - length matters for value perception
`;

  // ★ 카테고리 집중 명령어
  const categoryFocusRule = `
**CATEGORY FOCUS - STRICT**:
- This is a ${category} reading
- Focus EXCLUSIVELY on: ${categoryData.focus}
- DO NOT mention topics outside this category
- Example: If this is CryptoDestiny, do NOT discuss romance or health
- Example: If this is Love, do NOT discuss career or wealth
- Stay laser-focused on the category theme
`;

  return `
You are ORACLE EYES (오라클 아이즈), the world's most advanced AI Saju master.

${languageRule}

${completionRule}

${categoryFocusRule}

**CLIENT DATA**
Name: ${name}
Birth: ${birthInfo}
Four Pillars: 
- Year Pillar (년주): ${pY}
- Month Pillar (월주): ${pM}  
- Day Pillar (일주): ${pD} ← **CORE IDENTITY - START HERE**
- Hour Pillar (시주): ${pH}

Target Year: ${targetYear}

**READING TYPE**: ${category}

**YOUR MISSION**:
Create a deeply personalized, insightful ${category} reading for ${targetYear}.

**ANALYSIS APPROACH**:
1. START with Day Pillar (${pD}) analysis - this is their soul's signature
2. Analyze how Fire Horse (병오) energy of 2026 interacts with their pillars
3. Provide SPECIFIC months, dates, and actionable advice
4. Be concrete, not vague - "3월, 7월" not "좋은 시기가 올 것"

**TONE REQUIREMENTS**:
- Mystical yet grounded (not fantasy fiction)
- Specific and actionable (not vague generalizations)  
- Empowering and optimistic (but honest about challenges)
- ${lang === 'Korean' ? '존댓말 필수, 친근하면서도 전문적인 어조' : 'Professional mystic voice, warm yet authoritative'}

**STRUCTURE TO FOLLOW**:
${categoryData.structure.replace('{NAME}', name)}

**CRITICAL QUALITY CHECKS**:
✓ Day Pillar (${pD}) referenced in personality analysis
✓ 2026 Fire Horse energy clearly explained
✓ Specific months mentioned (not just "good time coming")
✓ Concrete advice (actionable items)
✓ Appropriate emoji use (2-3 per section, not excessive)
✓ Markdown formatting (## headers, **bold**)
✓ Complete ending wisdom section (NEVER cut off)

**LENGTH TARGET**: 2800-3500 characters (this is premium content)

**FINAL REMINDER**: 
- Language: ${lang} ONLY (no mixing)
- Category: ${category} ONLY (no other topics)
- Complete: MUST finish the final wisdom section

BEGIN THE READING NOW:
`;
}

// ============================================
// 4. Claude API 호출
// ============================================
async function callClaude(prompt) {
  const payload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000, // 대폭 증가
    temperature: 0.85,
    messages: [{ role: 'user', content: prompt }]
  };

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
      console.error("❌ Anthropic API Error:", err);
      throw new Error(`Anthropic API failed: ${resp.status}`);
    }
    
    const data = await resp.json();
    
    // ★ 응답 검증
    if (data.stop_reason !== 'end_turn') {
      console.warn(`⚠️ Warning: Response may be truncated. Stop reason: ${data.stop_reason}`);
    }
    
    console.log(`✅ Fortune generated successfully (${data.usage?.output_tokens || 'unknown'} tokens)`);
    
    return data.content[0].text;

  } catch (error) {
    console.error('❌ Claude API Error:', error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================
// 5. API 라우터
// ============================================
app.post('/api/fortune', async (req, res) => {
  try {
    const body = req.body;
    console.log('📥 Fortune request received:', { 
      name: body.name || body.person1?.name, 
      category: body.categories?.[0] || 'compatibility/dream' 
    });

    // A. 궁합 (Compatibility)
    if (body.person1 && body.person2) {
      const p1 = calculateFourPillars(
        body.person1.birthYear, 
        body.person1.birthMonth, 
        body.person1.birthDay, 
        body.person1.birthTime
      );
      const p2 = calculateFourPillars(
        body.person2.birthYear, 
        body.person2.birthMonth, 
        body.person2.birthDay, 
        body.person2.birthTime
      );
      
      const lang = detectLanguage(body.person1.name);
      const langInstruction = lang === 'Korean' 
        ? '**WRITE ENTIRELY IN KOREAN** with 존댓말 (습니다, 세요). NO English mixed in.'
        : '**WRITE ENTIRELY IN ENGLISH**. NO Korean characters.';
      
      const prompt = `
${langInstruction}

Analyze the romantic/partnership compatibility between:
- ${body.person1.name}: Day Pillar ${formatPillar(p1.day)}
- ${body.person2.name}: Day Pillar ${formatPillar(p2.day)}

Provide a detailed compatibility analysis covering:
1. Core personality chemistry
2. Strengths as a couple  
3. Potential conflict areas
4. Long-term outlook
5. Advice for harmony

Use Markdown formatting. Be specific and insightful. 2000+ characters.
Write COMPLETE analysis - do not cut off.
`;
      
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }

    // B. 꿈해몽 (Dream Interpretation)
    if (body.dreamContent) {
      const lang = /[가-힣]/.test(body.dreamContent) ? 'Korean' : 'English';
      const langInstruction = lang === 'Korean'
        ? '**완전히 한국어로만 작성**하세요. 존댓말 사용 (습니다, 세요).'
        : '**Write entirely in English**. Mystical professional tone.';
      
      const prompt = `
${langInstruction}

Interpret this dream: "${body.dreamContent}"

Provide:
1. **Symbolism Analysis**: What each element represents
2. **Psychological Meaning**: Subconscious message
3. **Fortune Prediction**: What this means for the future
4. **Actionable Advice**: What to do based on this dream

Use Markdown formatting. Be mystical yet practical. 1800+ characters.
Write COMPLETE interpretation - do not cut off the ending.
`;
      
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }

    // C. 신년운세 & 카테고리 운세 (Main Fortune Reading)
    const { name, birthYear, birthMonth, birthDay, birthTime, categories } = body;
    
    if (!name || !birthYear || !birthMonth || !birthDay) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const birthInfo = `${birthYear}-${birthMonth}-${birthDay}`;
    const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);
    const category = (categories && categories[0]) || 'NewYear';
    const lang = detectLanguage(name);

    console.log(`🔮 Generating ${category} fortune in ${lang} for ${name}...`);

    const prompt = buildPremiumPrompt(name, birthInfo, pillars, lang, category);
    const result = await callClaude(prompt);

    console.log(`✅ Fortune generation complete for ${name}`);
    
    return res.json({ fortune: result });

  } catch (err) {
    console.error('❌ Server Error:', err);
    
    if (err.name === 'AbortError') {
      return res.status(504).json({ 
        error: "The cosmic forces are taking longer than expected. Please try again." 
      });
    }
    
    return res.status(500).json({ 
      error: "An error occurred while consulting the Oracle. Please try again.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '🔮 Oracle is awake', 
    timestamp: new Date().toISOString(),
    model: 'claude-sonnet-4-20250514'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 ORACLE EYES SERVER v6.0 RUNNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port: ${PORT}
Model: claude-sonnet-4-20250514
Max Tokens: 8000
Features:
  ✅ Enhanced language detection
  ✅ Category-focused prompts
  ✅ Anti-truncation maximized
  ✅ Ready for Option B loading
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
