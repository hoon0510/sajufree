document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('saju-form');
    const resultSection = document.getElementById('result-section');
    const resultPreview = document.getElementById('result-preview');
    const fullResult = document.getElementById('full-result');
    const coupangLink = document.getElementById('coupang-link');
    
    // 페이지 로드 시 URL 해시 확인
    checkHashAndDisplayResults();
    
    // URL 해시 변경 감지
    window.addEventListener('hashchange', checkHashAndDisplayResults);
    
    // 사주풀이 폼 제출 처리
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 폼 데이터 수집
        const name = document.getElementById('name').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const birthdate = document.getElementById('birthdate').value;
        const birthtime = document.getElementById('birthtime').value;
        
        // 로딩 표시
        resultPreview.innerHTML = "<p>사주풀이 결과를 생성 중입니다...</p>";
        resultSection.style.display = 'block';
        
        // API 호출
        generateSajuResult(name, gender, birthdate, birthtime);
    });
    
    // 해시 확인 및 결과 표시 함수
    function checkHashAndDisplayResults() {
        if (window.location.hash === '#full') {
            const savedData = sessionStorage.getItem('sajuData');
            if (savedData) {
                const data = JSON.parse(savedData);
                displayResults(data.name, data.gender, data.birthdate, data.birthtime, data.result, true);
                // 해시 제거 (새로고침 시 계속 전체 결과가 표시되는 것 방지)
                history.replaceState(null, null, ' ');
            }
        }
    }
    
    // API 호출 함수
    async function callGptApi(name, gender, birthdate, birthtime) {
        try {
            // 로컬 개발 환경에서는 임시 데이터 반환
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return `${name}님의 테스트 사주풀이입니다. 이 텍스트는 실제 배포 환경에서는 OpenAI API를 통해 생성된 사주풀이로 대체됩니다.`;
            }
            
            // 실제 API 호출 (배포 환경)
            const response = await fetch('/.netlify/functions/gpt-saju', {
                method: 'POST',
                body: JSON.stringify({ name, gender, birthdate, birthtime })
            });
            
            const data = await response.json();
            
            if (data.result) {
                return data.result;
            } else {
                throw new Error('API 응답에 오류가 있습니다.');
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            return '사주풀이 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
    }
    
    // 결과 표시 함수
    function displayResults(name, gender, birthdate, birthtime, sajuResult, showFullResults = false) {
        // HTML 형식으로 포맷팅
        const formattedResult = `
            <h3>${name}님의 사주팔자 분석</h3>
            <p><strong>기본 정보:</strong> ${gender}, ${birthdate} 출생, ${birthtime}</p>
            
            ${sajuResult.replace(/\n/g, '<br>')}
        `;
        
        // 결과의 10%만 미리보기로 표시
        const previewLength = Math.floor(formattedResult.length * 0.1);
        const previewText = formattedResult.substring(0, previewLength) + "...";
        
        // 결과 표시
        resultPreview.innerHTML = previewText;
        fullResult.innerHTML = formattedResult;
        
        // 결과 섹션 표시
        resultSection.style.display = 'block';
        
        // 전체 결과 표시 여부
        if (showFullResults) {
            fullResult.style.display = 'block';
            document.querySelector('.cta-section').style.display = 'none'; // CTA 섹션 숨기기
        } else {
            // 버튼 클릭 시 쿠팡으로 이동, 그 후 돌아올 때 #full 해시 사용
            coupangLink.addEventListener('click', function() {
                // 현재 URL + #full 해시를 세션 스토리지에 저장
                sessionStorage.setItem('returnUrl', window.location.href.split('#')[0] + '#full');
                
                // 쿠팡 파트너스 링크로 이동
                window.location.href = 'https://link.coupang.com/a/cmrVHk';
                
                return true; // 링크 이동 허용
            });
        }
    }
    
    // 사주풀이 결과 생성 함수
    async function generateSajuResult(name, gender, birthdate, birthtime) {
        try {
            // GPT API 호출
            const sajuResult = await callGptApi(name, gender, birthdate, birthtime);
            
            // 결과 표시
            displayResults(name, gender, birthdate, birthtime, sajuResult);
            
            // 데이터 저장 (쿠팡에서 돌아올 때 사용)
            const data = {
                name, gender, birthdate, birthtime, result: sajuResult
            };
            sessionStorage.setItem('sajuData', JSON.stringify(data));
            
        } catch (error) {
            console.error('사주풀이 생성 중 오류:', error);
            resultPreview.innerHTML = '<p>사주풀이 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>';
        }
    }
});