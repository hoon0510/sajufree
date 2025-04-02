document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('saju-form');
    const resultSection = document.getElementById('result-section');
    const resultPreview = document.getElementById('result-preview');
    const fullResult = document.getElementById('full-result');
    const coupangLink = document.getElementById('coupang-link');
    
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
    
    // 사주풀이 결과 생성 함수
    async function generateSajuResult(name, gender, birthdate, birthtime) {
        try {
            // GPT API 호출
            const sajuResult = await callGptApi(name, gender, birthdate, birthtime);
            
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
            
            // 쿠팡 파트너스 링크 설정
            coupangLink.href = "https://coupa.ng/your-affiliate-link";
            
            // 결과 섹션 표시
            resultSection.style.display = 'block';
            
            // 쿠팡 링크 클릭 시 전체 결과 표시 (테스트용)
            coupangLink.addEventListener('click', function(e) {
                // 테스트 중일 때만 사용, 실제 서비스에서는 제거
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    e.preventDefault();
                    fullResult.style.display = 'block';
                    this.textContent = '전체 결과가 표시되었습니다';
                    this.style.backgroundColor = '#4CAF50';
                }
            });
        } catch (error) {
            console.error('사주풀이 생성 중 오류:', error);
            resultPreview.innerHTML = '<p>사주풀이 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>';
        }
    }
});