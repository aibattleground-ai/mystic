// api/fortune.js
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const nameToCheck = body.name || body.person1?.name || '';
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(nameToCheck);
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(nameToCheck);
    const language = hasKorean ? 'Korean' : hasJapanese ? 'Japanese' : 'English';

    // 최소 동작용 심플 프롬프트 (우선 작동 확인부터)
    const summary = `Category: ${body.categories || body.category || 'General'}
Name: ${body.name || body.person1?.name || 'User'}
Birth: ${[body.birthYear, body.birthMonth, body.birthDay].filter(Boolean).join('-')} ${body.birthTime || ''} ${body.birthPlace || ''}`;
    const prompt = `${summary}\n\nWrite a premium fortune in ${language} with emojis and sections.`;

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    return res.status(200).json({ fortune: msg.content?.[0]?.text || '' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to generate fortune' });
  }
};
