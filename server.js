// ============================================
// MYSTIC AI SERVER - A안 (2회 자동 분할 호출)
// 완전 정통 사주 계산 + Haiku 이중 호출 + 긴 리포트 보장
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Solar } = require('lunar-javascript');
const fetch = require('node-fetch');

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
// 2. 정통 사주 계산
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
    } else {
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
  return `${p.stemHan}${p.branchHan}`;
}

function detectLanguage(name = '') {
  const hasKr = /[가-힣]/.test(name);
  const hasJp = /[\u3040-\u30FF]/.test(name);
  const hasZh = /[\u4E00-\u9FFF]/.test(name);
  if (hasKr) return 'Korean';
  if (hasJp) return 'Japanese';
  if (hasZh) return 'Chinese';
  return 'English';
}

// ============================================
// 3. 프롬프트 생성 (1차 + 2차 분할)
// ============================================

function buildIntroPrompt(name, birthInfo, pillars, lang, category) {
  const pY = formatPillar(pillars.year, lang);
  const pM = formatPillar(pillars.month, lang);
  const pD = formatPillar(pillars.day, lang);
  const pH = formatPillar(pillars.hour, lang);

  return `
너는 'MYSTIC AI'라는 40년 경력 한국 사주 명리 마스터다.
사용자 이름: ${name}
출생 정보: ${birthInfo}

[정확히 계산된 사주]
- 년주: ${pY}
- 월주: ${pM}
- 일주: ${pD}
- 시주: ${pH}

이 사주 정보를 기초로 해서 '${category}' 리포트의
1) 도입부  
2) 핵심 성향 분석  
3) 2026 병오년 운세의 큰 그림 요약  
4) 기대감을 올리는 중간 브릿지

까지만 작성해라.

**아직 결론, 상세 월별, 조언, 경고, 핵심 문장 등은 쓰지 마라.** (2차에서 이어서 작성할 것)
톤은 따뜻하고 깊이 있고, 섹션 제목에 ✨🌙💰❤️🔮 이모지를 자연스럽게 섞어라.
`;
}

function buildFinalPrompt(part1, name, category) {
  return `
너는 이어서 '${category}' 리포트의 마무리 부분을 작성한다.

여기는 2차 호출이다.
아래는 1차에서 네가 작성한 도입부 + 중간까지의 내용이다:

[1차 내용 시작]
${part1}
[1차 내용 끝]

이제 이어서:

- 세부 흐름  
- 2026 병오년 월별  
- 재물/일/사람 관계/멘탈 조언  
- 건강 주의 포인트  
- 현실적인 가이드 + 개운법  
- 마지막 3줄 핵심 문장(명언 느낌)

을 자연스럽게 이어서 작성해라.

조건:
- 1차와 2차 연결이 매끄럽게  
- 톤/이모지/스타일 유지  
- 과장 금지, 실전적이고 깊이 있게  
- 최소 1500~2000자 분량  
`;
}

// ============================================
// 4. Haiku API 호출
// ============================================

async function callClaude(prompt) {
  const payload = {
    model: 'claude-3-haiku-20240307',
    max_tokens: 4500,
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

  const data = await resp.json();
  return data?.content?.[0]?.text || '';
}

// ============================================
// 5. 메인 엔드포인트 — 2회 자동 호출
// ============================================

app.post('/api/fortune', async (req, res) => {
  try {
    const body = req.body;
    const { name, birthYear, birthMonth, birthDay, birthTime, birthPlace, categories } = body;

    const lang = detectLanguage(name);
    const birthInfo = `${birthYear}-${birthMonth}-${birthDay} ${birthTime} (${birthPlace})`;
    const category = (categories && categories[0]) || 'NewYear';

    const pillars = calculateFourPillars(birthYear, birthMonth, birthDay, birthTime);

    // ------- 1차 호출 -------
    const prompt1 = buildIntroPrompt(name, birthInfo, pillars, lang, category);
    const part1 = await callClaude(prompt1);
    // ------- 2차 호출 -------
    const prompt2 = buildFinalPrompt(part1, name, category);
    const part2 = await callClaude(prompt2);

    // 최종 합치기
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
