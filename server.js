// ============================================
// ORACLE EYES SERVER - FINAL EDITION v7.0
// - Text Length: 4500-5500 characters ✅
// - English Mode: NO Chinese characters ✅
// - Quiz Priority Integration ✅
// - Section Depth Requirements ✅
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
  '甲': { ko: '갑', en: 'Jia' }, '乙': { ko: '을', en: 'Yi' }, '丙': { ko: '병', en: 'Bing' }, 
  '丁': { ko: '정', en: 'Ding' }, '戊': { ko: '무', en: 'Wu' }, '己': { ko: '기', en: 'Ji' }, 
  '庚': { ko: '경', en: 'Geng' }, '辛': { ko: '신', en: 'Xin' }, '壬': { ko: '임', en: 'Ren' }, 
  '癸': { ko: '계', en: 'Gui' } 
};

const ZHI_MAP = { 
  '子': { ko: '자', en: 'Zi (Rat)' }, '丑': { ko: '축', en: 'Chou (Ox)' }, 
  '寅': { ko: '인', en: 'Yin (Tiger)' }, '卯': { ko: '묘', en: 'Mao (Rabbit)' }, 
  '辰': { ko: '진', en: 'Chen (Dragon)' }, '巳': { ko: '사', en: 'Si (Snake)' }, 
  '午': { ko: '오', en: 'Wu (Horse)' }, '未': { ko: '미', en: 'Wei (Goat)' }, 
  '申': { ko: '신', en: 'Shen (Monkey)' }, '酉': { ko: '유', en: 'You (Rooster)' }, 
  '戌': { ko: '술', en: 'Xu (Dog)' }, '亥': { ko: '해', en: 'Hai (Pig)' } 
};

function parseGanZhi(gz) {
  if (!gz) return null;
  return { 
    stemHan: gz[0], 
    branchHan: gz[1], 
    stemKo: GAN_MAP[gz[0]]?.ko || '', 
    branchKo: ZHI_MAP[gz[1]]?.ko || '',
    stemEn: GAN_MAP[gz[0]]?.en || '',
    branchEn: ZHI_MAP[gz[1]]?.en || ''
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

function formatPillar(p, lang) {
  if (!p) return '';
  
  if (lang === 'Korean') {
    return `${p.stemKo}${p.branchKo}(${p.stemHan}${p.branchHan})`;
  } else {
    // English: NO Chinese characters
    return `${p.stemEn} ${p.branchEn}`;
  }
}

// ★ 강화된 언어 감지
function detectLanguage(name) {
  const hasKorean = /[가-힣]/.test(name);
  const hasEnglish = /[a-zA-Z]/.test(name);
  
  if (hasKorean) return 'Korean';
  if (hasEnglish && !hasKorean) return 'English';
  return 'English';
}

// ============================================
// 2. 카테고리별 포커스 & 구조 정의
// ============================================
function getCategoryData(category, lang) {
  const data = {
    'NewYear': {
      focus: lang === 'Korean' 
        ? '2026년 전반적인 운세 - 재물, 사랑, 건강, 커리어 모든 영역을 균형있고 상세하게 다룸'
        : '2026 overall fortune - balanced and detailed coverage of wealth, love, health, and career',
      
      structure: lang === 'Korean' ? `

## 🔮 {NAME}님의 영혼 코드 (Soul DNA)

Day Pillar 분석을 통한 본질적 성격과 운명의 설계도 (최소 900자):
- 핵심 성격 3가지와 구체적 사례
- 타고난 강점과 활용 방법
- 주의해야 할 약점과 극복 전략
- 인생의 사명과 방향성

## 🐴 2026 병오년, 붉은 불의 말이 가져올 변화

Fire Horse 에너지 상세 분석 (최소 800자):
- 올해의 전반적 테마와 기운
- 당신의 사주와의 구체적 상호작용
- 주요 전환점과 타이밍
- 월별 에너지 흐름 예측

## 💰 재물운 & 커리어 (Wealth Destiny)

구체적인 재물과 직업 운세 (최소 1100자):
- 수입 증대 기회 3가지와 실행 방법
- 승진/인정받을 시기와 전략
- 이직/창업 타이밍과 주의사항
- 투자/재테크 조언
- 피해야 할 함정

## ❤️ 사랑과 인연 (Love Connections)

연애, 결혼, 인간관계 운세 (최소 1100자):
- 연애운 전망과 구체적 조언
- 결정적 만남의 시기, 장소, 상황
- 이상형의 특징과 찾는 방법
- 기존 관계 발전 전략
- 갈등 시기와 해결 방법

## 🗓️ 황금 타이밍 달력 (Golden Months)

2026년 최고의 시기 분석 (최소 700자):
- 가장 좋은 3개월 선정과 이유
- 각 달의 구체적 기회
- 실천해야 할 행동
- 주의사항

## 🎁 행운 아이템 & 오라클의 최종 메시지

마무리 조언 (최소 600자):
- 행운의 색상과 활용법
- 행운의 숫자와 의미
- 2026년을 관통하는 핵심 조언 3가지 (각 150자)

` : `

## 🔮 Your Soul Code (Day Pillar Decoded)

Deep personality analysis through Day Pillar (minimum 900 characters):
- Three core personality traits with specific examples
- Innate strengths and how to leverage them
- Weaknesses to watch and strategies to overcome
- Life mission and direction

## 🐴 2026: Year of the Red Fire Horse

Detailed Fire Horse energy analysis (minimum 800 characters):
- Overall theme and energy of the year
- Specific interactions with your Four Pillars
- Major turning points and timing
- Monthly energy flow predictions

## 💰 Wealth & Career Destiny

Detailed wealth and career forecast (minimum 1100 characters):
- Three income opportunities with execution methods
- Promotion/recognition timing and strategies
- Job change/startup timing and precautions
- Investment/financial advice
- Traps to avoid

## ❤️ Love Connections

Romance, marriage, and relationship forecast (minimum 1100 characters):
- Romance outlook and specific advice
- Fateful meeting timing, places, situations
- Ideal type characteristics and how to find them
- Strategies for developing existing relationships
- Conflict periods and resolution methods

## 🗓️ Golden Months Calendar

Best timing analysis for 2026 (minimum 700 characters):
- Selection of 3 best months with reasons
- Specific opportunities each month
- Actions to take
- Precautions

## 🎁 Lucky Charms & Oracle's Final Wisdom

Closing guidance (minimum 600 characters):
- Lucky color and how to use it
- Lucky number and its meaning
- Three core pieces of advice for 2026 (150 chars each)

`
    },

    'CryptoDestiny': {
      focus: lang === 'Korean'
        ? '암호화폐 투자 운세 ONLY - 비트코인, 알트코인, DeFi, NFT 타이밍과 전략을 매우 상세하게'
        : 'Cryptocurrency investment fortune ONLY - Bitcoin, Altcoins, DeFi, NFT timing and strategy in great detail',
      
      structure: lang === 'Korean' ? `

## 🪙 {NAME}님의 금융 DNA 해부 (Financial Genome)

Day Pillar 기반 투자 성향 분석 (최소 800자):
- 투자 성향: 공격형 vs 안정형 상세 분석
- 단타 vs 장타 적성과 이유
- 리스크 감내 수준
- 의사결정 패턴
- 강점과 약점

## 🔥 2026 암호화폐 시장 X 당신의 사주 케미스트리

병오년 디지털 자산 운세 (최소 900자):
- 2026년 암호화폐 시장 전망
- 당신의 사주와의 구체적 상호작용
- Fire Horse 에너지가 포트폴리오에 미치는 영향
- 분기별 시장 흐름 예측

## 📈 월별 트레이딩 타이밍 (Trading Windows)

초정밀 타이밍 분석 (최소 1000자):
- 강력 매수 추천 구간 3개월 (각 월별 구체적 이유와 전략)
- 위험 구간 2개월 (피해야 할 이유)
- 수익 실현 최적 타이밍 2개월
- 각 시기별 추천 코인 섹터

## 💎 2026 추천 포트폴리오 전략

구체적 투자 전략 (최소 900자):
- BTC vs 알트코인 비율 제안과 이유
- 주목해야 할 섹터 TOP 5 (각각 설명)
- 각 섹터별 추천 접근법
- 절대 피해야 할 함정 3가지
- 리밸런싱 타이밍

## 🎰 리스크 vs 보상 밸런싱

위험 관리 전략 (최소 700자):
- 당신의 사주가 감당할 수 있는 리스크 레벨
- 최적 자산배분 비율
- 손절/익절 기준
- 심리 관리 방법

## 🧿 크립토 오라클의 최종 조언

마무리 지혜 (최소 600자):
- 행운의 코인 색상과 의미
- 지갑 체크 행운의 요일
- 2026 암호화폐 투자 핵심 원칙 3가지 (각 150자)

` : `

## 🪙 Your Financial DNA Decoded

Investment personality analysis (minimum 800 characters):
- Investment style: Aggressive vs Conservative detailed analysis
- Short-term vs Long-term trading aptitude and reasons
- Risk tolerance level
- Decision-making patterns
- Strengths and weaknesses

## 🔥 2026 Crypto Market X Your Saju Chemistry

Digital asset fortune for Fire Horse year (minimum 900 characters):
- 2026 cryptocurrency market outlook
- Specific interactions with your Four Pillars
- Fire Horse energy impact on your portfolio
- Quarterly market flow predictions

## 📈 Monthly Trading Windows

Precision timing analysis (minimum 1000 characters):
- 3 strong buy periods (specific reasons and strategies for each month)
- 2 high-risk periods (reasons to avoid)
- 2 optimal profit-taking periods
- Recommended coin sectors for each period

## 💎 2026 Recommended Portfolio Strategy

Specific investment strategy (minimum 900 characters):
- BTC vs Altcoin allocation with rationale
- TOP 5 sectors to watch (explanation for each)
- Recommended approach for each sector
- 3 absolute traps to avoid
- Rebalancing timing

## 🎰 Risk vs Reward Balancing

Risk management strategy (minimum 700 characters):
- Risk level your Saju can handle
- Optimal asset allocation percentages
- Stop-loss/take-profit criteria
- Psychological management methods

## 🧿 Crypto Oracle's Final Wisdom

Closing wisdom (minimum 600 characters):
- Lucky coin color and meaning
- Lucky day for wallet checks
- 3 core principles for 2026 crypto investing (150 chars each)

`
    },

    'Love': {
      focus: lang === 'Korean'
        ? '연애운 ONLY - 이상형, 만남 시기, 고백 타이밍, 결혼운을 매우 구체적이고 상세하게'
        : 'Romance fortune ONLY - ideal type, meeting timing, confession windows, marriage luck in great detail',
      
      structure: lang === 'Korean' ? `

## 💕 {NAME}님의 사랑 설계도 (Love Blueprint)

Day Pillar 기반 연애 분석 (최소 900자):
- 연애 스타일: 열정형 vs 신중형 상세 분석
- 끌리는 이성의 유형과 이유
- 사랑할 때의 강점 3가지
- 주의해야 할 패턴
- 이상적인 관계 형태

## 🌹 2026년 로맨스 기운 분석

병오년 연애 에너지 (최소 900자):
- 올해의 전반적 연애운 흐름
- 새로운 만남 vs 기존 관계 심화
- Fire Horse가 사랑에 미치는 영향
- 분기별 연애운 변화

## 💘 결정적 만남의 시기 (Fateful Encounters)

구체적 만남 예측 (최소 1000자):
- 인연이 들어오는 달 3개월 (각 월별 상세 분석)
- 만남의 장소와 상황 (온라인/오프라인, 소개팅/자연스러운 만남)
- 이상형의 외모, 성격, 직업 특징
- 첫 만남에서 주의할 점
- 관계 발전 전략

## 💍 고백 & 프러포즈 황금 타이밍

결정적 순간 포착 (최소 800자):
- 고백 성공률 최고인 시기와 이유
- 고백 방법 조언
- 결혼 이야기 꺼내기 좋은 달
- 커플이라면 관계 발전 적기
- 프러포즈 추천 타이밍

## ⚠️ 연애 주의보 발령 구간

갈등 예방 가이드 (최소 700자):
- 다툼 위험 높은 시기
- 갈등의 원인 예측
- 해결 방법과 대화 전략
- 냉각기 극복 방법

## 🎁 연애운 부스터 아이템

실천 가능한 조언 (최소 600자):
- 데이트 추천 색상과 스타일
- 첫 만남 행운의 장소 타입
- 관계 발전에 도움되는 습관
- 오라클의 연애 조언 3가지 (각 150자)

` : `

## 💕 Your Love Blueprint

Romance style analysis (minimum 900 characters):
- Romance style: Passionate vs Cautious detailed analysis
- Type of person you're attracted to and why
- Three strengths in love
- Patterns to watch out for
- Ideal relationship form

## 🌹 2026 Romance Energy Analysis

Fire Horse year love energy (minimum 900 characters):
- Overall romance flow for the year
- New encounters vs deepening existing bonds
- Fire Horse impact on love life
- Quarterly romance changes

## 💘 Fateful Encounter Windows

Specific meeting predictions (minimum 1000 characters):
- 3 months when connections enter (detailed analysis for each)
- Meeting places and situations (online/offline, setup/organic)
- Ideal type's appearance, personality, career characteristics
- Points to watch on first meeting
- Relationship development strategy

## 💍 Confession & Proposal Golden Timing

Decisive moment capture (minimum 800 characters):
- Highest success rate period for confession and why
- Confession method advice
- Best month to discuss marriage
- For couples: relationship advancement timing
- Proposal timing recommendations

## ⚠️ Romance Warning Zones

Conflict prevention guide (minimum 700 characters):
- High conflict risk periods
- Predicted causes of conflicts
- Resolution methods and communication strategies
- How to overcome cooling-off periods

## 🎁 Love Luck Boosters

Actionable advice (minimum 600 characters):
- Recommended date colors and style
- Ideal first meeting venue type
- Habits that help relationship development
- Oracle's 3 romance tips (150 chars each)

`
    },

    'Career': {
      focus: lang === 'Korean'
        ? '커리어 운세 ONLY - 승진, 이직, 창업, 연봉협상을 매우 구체적으로'
        : 'Career fortune ONLY - promotion, job change, startup, salary negotiation in great detail',
      
      structure: lang === 'Korean' ? `

## 💼 {NAME}님의 커리어 DNA (Professional Identity)

Day Pillar 기반 직업 분석 (최소 900자):
- 직업 적성과 성공 패턴
- 리더십 스타일
- 업무 처리 방식의 강점
- 주의해야 할 약점
- 최적의 커리어 경로

## 🚀 2026 커리어 로드맵

병오년 직업운 (최소 900자):
- 올해의 전반적 커리어 흐름
- 도약 vs 안정화 방향
- Fire Horse 에너지가 직업에 미치는 영향
- 분기별 커리어 변화

## 📊 승진 & 인정받을 시기

성과 극대화 전략 (최소 1000자):
- 상사에게 어필하기 좋은 달 2-3개월 (각 상세)
- 프로젝트 성과 극대화 타이밍
- 평가/승진 심사 유리한 시기
- 어필 전략과 방법
- 준비해야 할 것들

## 🔄 이직 & 새 기회 윈도우

커리어 전환 가이드 (최소 1000자):
- 이력서 넣기 최적 시기
- 면접 운 최강인 달
- 피해야 할 이직 시기와 이유
- 창업 고려 시 적기
- 업종/직무 추천
- 연봉 협상 전략

## 💰 연봉 협상 & 재정 운

수입 증대 전략 (최소 800자):
- 연봉 협상 성공률 높은 시기
- 협상 전략과 멘트
- 부수입 기회 포착 시기
- 투자/사업 확장 타이밍
- 재정 관리 조언

## 🎯 2026 커리어 전략 요약

실행 계획 (최소 600자):
- 집중해야 할 스킬 1-2가지
- 네트워킹 강화 시기
- 학습/자격증 추천 타이밍
- 오라클의 커리어 조언 3가지 (각 150자)

` : `... (similar English structure with same character counts)`
    },

    'Health': {
      focus: lang === 'Korean'
        ? '건강운 ONLY - 신체/정신 건강을 매우 구체적으로'
        : 'Health fortune ONLY - physical/mental wellness in great detail',
      
      structure: lang === 'Korean' ? `

## 🧬 {NAME}님의 신체 에너지 맵 (Body Energy Map)

Day Pillar 기반 체질 분석 (최소 900자):
- 선천적 체질과 특성
- 에너지 흐름 패턴
- 강한 장기와 약한 장기
- 대사 특성
- 최적의 건강 관리법

## 🔥 2026 건강 바이오리듬

병오년 건강운 (최소 900자):
- 올해의 전반적 건강 흐름
- Fire 에너지가 몸에 미치는 영향
- 활력 증가 vs 과열 주의
- 분기별 건강 변화

## ⚠️ 건강 주의 시그널 (Warning Periods)

예방 가이드 (최소 1000자):
- 피로 누적 주의 구간 2-3개월
- 각 시기별 구체적 증상
- 스트레스 관리 필요 시기
- 면역력 저하 구간
- 주의해야 할 신체 부위
- 예방 방법

## 💪 에너지 충전 & 회복 타이밍

건강 증진 전략 (최소 1000자):
- 운동 시작하기 좋은 달
- 추천 운동 종류
- 디톡스/클렌징 효과 극대화 시기
- 휴식이 약이 되는 달
- 건강검진 추천 시기
- 체력 관리 방법

## 🧘 정신 건강 & 마음 관리

멘탈 케어 가이드 (최소 800자):
- 번아웃 위험 시기
- 스트레스 해소 방법
- 명상/요가 효과 좋은 달
- 심리적 안정 찾는 시기
- 수면 패턴 최적화

## 🍀 2026 건강 관리 가이드

실천 계획 (최소 600자):
- 추천 식습관 방향
- 피해야 할 음식
- 생활 습관 개선 포인트
- 오라클의 건강 조언 3가지 (각 150자)

` : `... (similar English structure)`
    }
  };

  return data[category] || data['NewYear'];
}

// ============================================
// 3. 프롬프트 빌더
// ============================================
function buildPremiumPrompt(name, birthInfo, pillars, lang, category, priority) {
  const pY = formatPillar(pillars.year, lang);
  const pM = formatPillar(pillars.month, lang);
  const pD = formatPillar(pillars.day, lang);
  const pH = formatPillar(pillars.hour, lang);
  
  const targetYear = "2026 (Bing Wu - Red Fire Horse Year)";
  const categoryData = getCategoryData(category, lang);
  
  // ★ 언어별 엄격한 지시
  const languageRule = lang === 'Korean' 
    ? `**ABSOLUTE LANGUAGE RULE**: 
       - Write ENTIRELY in Korean using formal polite endings (습니다, 세요, 십니다)
       - ZERO English words allowed except: proper nouns (Bitcoin, DeFi, NFT, BTC, ETH)
       - NO mixed language sentences
       - Example CORRECT: "당신은 무진(戊辰) 일주입니다"
       - Example WRONG: "You are 무진 일주입니다"`
    : `**ABSOLUTE LANGUAGE RULE - CRITICAL**: 
       - Write ENTIRELY in English
       - ZERO Korean characters allowed (no 습니다, 세요, or any Hangul)
       - ZERO Chinese characters like 무진(戊辰), 병오(丙午), 갑오(甲午)
       - When mentioning pillars, use ONLY: "${pD}" format (already in English)
       - When mentioning years, write: "Bing Wu (Fire Horse)" NOT "병오"
       - Use mystical yet professional English tone throughout
       - If you include ANY Chinese or Korean characters, you have FAILED`;

  // ★ Anti-truncation 명령어 강화
  const completionRule = `
**COMPLETION MANDATE - ABSOLUTELY CRITICAL**: 
- You MUST write the COMPLETE reading from start to finish
- NEVER stop mid-sentence or mid-section
- The ending wisdom section is MANDATORY - never cut it off
- If approaching token limits, PRIORITIZE completing final section
- THIS IS A PREMIUM READING - LENGTH MATTERS FOR VALUE
`;

  // ★ 길이 요구사항 대폭 증가
  const lengthRequirement = `
**LENGTH REQUIREMENTS - NON-NEGOTIABLE**:
- TOTAL TARGET: 4500-5500 characters minimum
- Each major section (##) must be 700-1100 characters
- Provide SPECIFIC examples, months, dates, and actionable advice
- Don't be vague - give concrete details and tell stories
- This is NOT a summary - this is a COMPREHENSIVE premium reading
- If you write less than 4000 characters, you have COMPLETELY FAILED
`;

  // ★ 카테고리 집중 명령어
  const categoryFocusRule = `
**CATEGORY FOCUS - STRICT**:
- This is a ${category} reading
- Focus EXCLUSIVELY on: ${categoryData.focus}
- DO NOT mention topics outside this category
- Example: If CryptoDestiny, NO romance/health; If Love, NO career/wealth
- Stay laser-focused on the category theme throughout
`;

  // ★★ 퀴즈 우선순위 반영 ★★
  const priorityHint = priority ? `
**USER PRIORITY FOCUS - SPECIAL INSTRUCTION**:
The user selected "${priority}" as their top priority for 2026.

${priority === 'wealth' ? `
- Give 300 EXTRA characters to the Wealth/Career/Financial section
- Provide MORE specific months, opportunities, and actionable strategies
- Include detailed examples and scenarios for wealth growth
` : ''}${priority === 'love' ? `
- Give 300 EXTRA characters to the Love/Romance/Relationship section
- Provide MORE specific timing for meetings and relationship milestones
- Include detailed advice on attraction and relationship development
` : ''}${priority === 'health' ? `
- Give 300 EXTRA characters to the Health/Wellness section
- Provide MORE specific body care advice and warning periods
- Include detailed prevention and recovery strategies
` : ''}${priority === 'career' ? `
- Give 300 EXTRA characters to the Career/Professional section
- Provide MORE specific promotion timing and strategies
- Include detailed job change and networking advice
` : ''}
Make this section NOTABLY more detailed, specific, and actionable than others.
` : '';

  return `
You are ORACLE EYES (오라클 아이즈), the world's most advanced AI Saju master.

${languageRule}

${completionRule}

${lengthRequirement}

${categoryFocusRule}

${priorityHint}

**CLIENT DATA**
Name: ${name}
Birth: ${birthInfo}
Four Pillars: 
- Year Pillar: ${pY}
- Month Pillar: ${pM}  
- Day Pillar: ${pD} ← **CORE IDENTITY - START HERE**
- Hour Pillar: ${pH}

Target Year: ${targetYear}

**READING TYPE**: ${category}

**YOUR MISSION**:
Create a deeply personalized, comprehensive ${category} reading for ${targetYear}.

**ANALYSIS APPROACH**:
1. START with Day Pillar (${pD}) deep analysis
2. Analyze Fire Horse (Bing Wu) energy interaction with pillars
3. Provide SPECIFIC months, dates, percentages, and actionable advice
4. Be concrete - "March, July, October" not "좋은 시기"
5. Tell vivid stories and create imagery

**TONE REQUIREMENTS**:
- Mystical yet grounded (not fantasy)
- Specific and actionable (not vague)
- Empowering and optimistic (honest about challenges)
- ${lang === 'Korean' ? '존댓말 필수, 친근하면서 권위있는 어조' : 'Professional mystic voice, warm yet authoritative'}

**STRUCTURE TO FOLLOW**:
${categoryData.structure.replace('{NAME}', name)}

**CRITICAL QUALITY CHECKS BEFORE SUBMITTING**:
✓ Day Pillar (${pD}) deeply analyzed in first section
✓ 2026 Fire Horse energy clearly explained
✓ SPECIFIC months mentioned (at least 6 different months)
✓ Concrete advice with actionable steps
✓ Appropriate emoji use (2-3 per section)
✓ Markdown formatting (## headers, **bold**)
✓ Complete ending wisdom section (NEVER cut off)
✓ Total length 4500-5500 characters
✓ Language: ${lang} ONLY (absolutely no mixing)

**FINAL REMINDER**: 
- Language: ${lang} ONLY (no mixing, no Chinese chars if English)
- Category: ${category} ONLY (no other topics)
- Length: 4500-5500 chars (less than 4000 = FAILURE)
- Complete: MUST finish final wisdom section
${priority ? `- Priority: Give extra 300 chars to ${priority} section` : ''}

BEGIN THE COMPREHENSIVE PREMIUM READING NOW:
`;
}

// ============================================
// 4. Claude API 호출
// ============================================
async function callClaude(prompt) {
  const payload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
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
    
    if (data.stop_reason !== 'end_turn') {
      console.warn(`⚠️ Warning: Response may be truncated. Stop reason: ${data.stop_reason}`);
    }
    
    const outputLength = data.content[0].text.length;
    console.log(`✅ Fortune generated: ${outputLength} characters (${data.usage?.output_tokens || 'unknown'} tokens)`);
    
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
    console.log('📥 Fortune request:', { 
      name: body.name || body.person1?.name, 
      category: body.categories?.[0] || 'other',
      priority: body.priority || 'none'
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
      const p1Day = formatPillar(p1.day, lang);
      const p2Day = formatPillar(p2.day, lang);
      
      const langInstruction = lang === 'Korean' 
        ? '**WRITE ENTIRELY IN KOREAN** with 존댓말 (습니다, 세요). NO English mixed in.'
        : '**WRITE ENTIRELY IN ENGLISH**. NO Korean or Chinese characters.';
      
      const prompt = `
${langInstruction}

Analyze romantic/partnership compatibility between:
- ${body.person1.name}: Day Pillar ${p1Day}
- ${body.person2.name}: Day Pillar ${p2Day}

Provide detailed analysis (2500+ characters):
1. Core personality chemistry
2. Strengths as a couple  
3. Potential conflict areas
4. Long-term outlook
5. Advice for harmony

Use Markdown. Be specific. Write COMPLETE analysis.
`;
      
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }

    // B. 꿈해몽 (Dream)
    if (body.dreamContent) {
      const lang = /[가-힣]/.test(body.dreamContent) ? 'Korean' : 'English';
      const langInstruction = lang === 'Korean'
        ? '**완전히 한국어로만 작성**. 존댓말 (습니다, 세요).'
        : '**Write entirely in English**. Mystical professional tone.';
      
      const prompt = `
${langInstruction}

Interpret dream: "${body.dreamContent}"

Provide (2000+ characters):
1. Symbolism Analysis
2. Psychological Meaning
3. Fortune Prediction
4. Actionable Advice

Markdown format. Complete interpretation.
`;
      
      const result = await callClaude(prompt);
      return res.json({ fortune: result });
    }

    // C. 메인 운세 (신년/카테고리)
    const { name, birthYear, birthMonth, birthDay, birthTime, categories, priority } = body;
    
    if (!name || !birthYear || !birthMonth || !birthDay) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const birthInfo = `${birthYear}-${birthMonth}-${birthDay}`;
    const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);
    const category = (categories && categories[0]) || 'NewYear';
    const lang = detectLanguage(name);

    console.log(`🔮 Generating ${category} (${lang}) for ${name}${priority ? ` [Priority: ${priority}]` : ''}...`);

    const prompt = buildPremiumPrompt(name, birthInfo, pillars, lang, category, priority);
    const result = await callClaude(prompt);

    console.log(`✅ Complete for ${name}`);
    
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
    model: 'claude-sonnet-4-20250514',
    version: 'v7.0'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 ORACLE EYES SERVER v7.0 RUNNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port: ${PORT}
Model: claude-sonnet-4-20250514
Max Tokens: 8000
Target Length: 4500-5500 characters
Features:
  ✅ Enhanced length (4500-5500 chars)
  ✅ NO Chinese chars in English mode
  ✅ Quiz priority integration
  ✅ Section depth requirements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
