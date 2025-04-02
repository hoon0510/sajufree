// netlify/functions/gpt-saju.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, gender, birthdate, birthtime } = JSON.parse(event.body);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 명리학에 정통한 사주풀이 전문가입니다. 사용자의 이름, 성별, 생년월일, 출생시간을 바탕으로 상세한 사주풀이를 해주세요. 사주의 기본 구성, 성격 및 기질, 재물운 및 직업운, 대인관계 및 연애운, 건강운, 10년 대운 분석, 종합 운세 등을 포함하여 분석해주세요.'
          },
          {
            role: 'user',
            content: `이름: ${name}, 성별: ${gender}, 생년월일(양력): ${birthdate}, 출생시간: ${birthtime}의 사주를 풀이해주세요.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json();

    // 🔍 응답 전체를 로그로 출력 (Netlify Functions에서 확인 가능)
    console.error("GPT 전체 응답:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GPT 응답이 예상과 다릅니다.', raw: data })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        result: data.choices[0].message.content
      })
    };

  } catch (error) {
    console.error('최종 처리 오류:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '사주풀이 생성 중 오류가 발생했습니다.' })
    };
  }
};
