// script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('saju-form');
    const resultSection = document.getElementById('result-section');
    const resultPreview = document.getElementById('result-preview');
    const fullResult = document.getElementById('full-result');
    const coupangLink = document.getElementById('coupang-link');

    // 페이지 로드 시 확인 - 뒤로가기로 돌아왔는지 체크
    checkPageVisibility();

    // 뒤로가기 감지
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            checkPageVisibility();
        }
    });

    function checkPageVisibility() {
        const savedData = sessionStorage.getItem('sajuData');
        const wasAtCoupang = sessionStorage.getItem('wasAtCoupang');

        if (savedData && wasAtCoupang === 'true') {
            const data = JSON.parse(savedData);
            displayResults(data.name, data.gender, data.birthdate, data.birthtime, data.result, true);

            // 명확하게 상태 재설정
            resultPreview.style.display = 'none';
            fullResult.style.display = 'block';
            document.querySelector('.cta-section').style.display = 'none';

            sessionStorage.removeItem('wasAtCoupang');
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const birthdate = document.getElementById('birthdate').value;
        const birthtime = document.getElementById('birthtime').value;

        resultPreview.innerHTML = "<p>사주풀이 결과를 생성 중입니다...</p>";
        resultPreview.style.display = 'block';
        fullResult.style.display = 'none';
        resultSection.style.display = 'block';

        generateSajuResult(name, gender, birthdate, birthtime);
    });

    async function callGptApi(name, gender, birthdate, birthtime) {
        try {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return `${name}님의 테스트 사주풀이입니다. 이 텍스트는 실제 배포 환경에서는 OpenAI API를 통해 생성된 사주풀이로 대체됩니다.`;
            }

            const response = await fetch('/.netlify/functions/gpt-saju', {
                method: 'POST',
                body: JSON.stringify({ name, gender, birthdate, birthtime })
            });

            const data = await response.json();

            if (data.result) {
                return data.result;
            } else {
                throw new Error(data.error || 'API 응답 오류');
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            return '사주풀이 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
    }

    function displayResults(name, gender, birthdate, birthtime, sajuResult, showFullResults = false) {
        const formattedResult = `
            <h3>${name}님의 사주팔자 분석</h3>
            <p><strong>기본 정보:</strong> ${gender}, ${birthdate} 출생, ${birthtime}</p>
            ${sajuResult.replace(/\n/g, '<br>')}
        `;

        const previewLength = Math.floor(formattedResult.length * 0.1);
        const previewText = formattedResult.substring(0, previewLength) + "...";

        resultPreview.innerHTML = previewText;
        fullResult.innerHTML = formattedResult;
        resultSection.style.display = 'block';

        if (showFullResults) {
            resultPreview.style.display = 'none';
            fullResult.style.display = 'block';
            document.querySelector('.cta-section').style.display = 'none';
        } else {
            resultPreview.style.display = 'block';
            fullResult.style.display = 'none';

            coupangLink.addEventListener('click', function(e) {
                e.preventDefault();
                sessionStorage.setItem('wasAtCoupang', 'true');
                window.location.href = "https://link.coupang.com/a/cmrVHk";
            });
        }
    }

    async function generateSajuResult(name, gender, birthdate, birthtime) {
        try {
            const sajuResult = await callGptApi(name, gender, birthdate, birthtime);

            displayResults(name, gender, birthdate, birthtime, sajuResult);

            const data = { name, gender, birthdate, birthtime, result: sajuResult };
            sessionStorage.setItem('sajuData', JSON.stringify(data));
        } catch (error) {
            console.error('사주풀이 생성 중 오류:', error);
            resultPreview.innerHTML = '<p>사주풀이 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>';
        }
    }
});
