// @TASK P7-T7.3 - 개인정보처리방침 페이지
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export const metadata = {
  title: '개인정보처리방침 | Roomy',
  description: 'Roomy 서비스의 개인정보처리방침입니다.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <BookOpen className="w-5 h-5" />
            <span>Roomy</span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
        <p className="text-gray-500 mb-8">최종 업데이트: 2024년 1월 1일</p>

        <div className="prose prose-gray max-w-none">
          <p>
            주식회사 루미(이하 "회사")는 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등
            개인정보 보호 관련 법령을 준수하며, 회원의 개인정보를 보호하기 위해 최선을 다합니다.
          </p>

          <h2>제1조 (개인정보의 수집 및 이용 목적)</h2>
          <p>회사는 다음의 목적을 위해 개인정보를 처리합니다:</p>
          <ol>
            <li>서비스 제공 및 계약의 이행</li>
            <li>회원 관리 (회원 식별, 본인 확인, 가입 의사 확인)</li>
            <li>서비스 개선 및 신규 서비스 개발</li>
            <li>마케팅 및 광고에의 활용 (동의한 경우)</li>
            <li>요금 결제 및 정산</li>
          </ol>

          <h2>제2조 (수집하는 개인정보 항목)</h2>
          <h3>필수 수집 항목</h3>
          <ul>
            <li>이메일 주소</li>
            <li>비밀번호</li>
            <li>이름 (또는 닉네임)</li>
          </ul>

          <h3>선택 수집 항목</h3>
          <ul>
            <li>프로필 이미지</li>
            <li>연락처</li>
            <li>숙소 정보 (주소, 설명 등)</li>
          </ul>

          <h3>자동 수집 항목</h3>
          <ul>
            <li>IP 주소</li>
            <li>쿠키</li>
            <li>방문 일시</li>
            <li>서비스 이용 기록</li>
            <li>기기 정보 (브라우저 종류, OS 등)</li>
          </ul>

          <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
          <ol>
            <li>회원 탈퇴 시까지 보유하며, 탈퇴 후 지체 없이 파기합니다.</li>
            <li>단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다:
              <ul>
                <li>계약 또는 청약 철회에 관한 기록: 5년 (전자상거래법)</li>
                <li>대금 결제 및 재화 공급에 관한 기록: 5년 (전자상거래법)</li>
                <li>소비자 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)</li>
                <li>로그인 기록: 3개월 (통신비밀보호법)</li>
              </ul>
            </li>
          </ol>

          <h2>제4조 (개인정보의 제3자 제공)</h2>
          <p>
            회사는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다:
          </p>
          <ol>
            <li>회원이 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ol>

          <h2>제5조 (개인정보 처리의 위탁)</h2>
          <p>회사는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다:</p>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">수탁업체</th>
                <th className="border p-2">위탁 업무</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Amazon Web Services</td>
                <td className="border p-2">클라우드 서버 운영</td>
              </tr>
              <tr>
                <td className="border p-2">토스페이먼츠</td>
                <td className="border p-2">결제 처리</td>
              </tr>
              <tr>
                <td className="border p-2">SendGrid</td>
                <td className="border p-2">이메일 발송</td>
              </tr>
            </tbody>
          </table>

          <h2>제6조 (회원의 권리와 행사 방법)</h2>
          <p>회원은 다음의 권리를 행사할 수 있습니다:</p>
          <ol>
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정 요구</li>
            <li>개인정보 삭제 요구</li>
            <li>개인정보 처리 정지 요구</li>
          </ol>
          <p>권리 행사는 서비스 내 설정 페이지에서 직접 하거나, privacy@roomy.kr로 요청할 수 있습니다.</p>

          <h2>제7조 (개인정보의 파기)</h2>
          <ol>
            <li>회사는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 개인정보를 파기합니다.</li>
            <li>전자적 파일 형태인 경우 복구할 수 없는 방법으로 영구 삭제합니다.</li>
            <li>종이 문서인 경우 분쇄기로 분쇄하거나 소각합니다.</li>
          </ol>

          <h2>제8조 (개인정보의 안전성 확보 조치)</h2>
          <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
          <ol>
            <li>개인정보 취급 직원의 최소화 및 교육</li>
            <li>내부관리계획의 수립 및 시행</li>
            <li>개인정보에 대한 접근 통제 및 접근 권한의 제한</li>
            <li>개인정보를 안전하게 저장·전송할 수 있는 암호화 기술의 적용</li>
            <li>해킹 등에 대비한 기술적 대책</li>
            <li>개인정보의 안전한 보관을 위한 잠금장치 적용</li>
          </ol>

          <h2>제9조 (개인정보 보호책임자)</h2>
          <p>
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
            정보주체의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <ul>
            <li>개인정보 보호책임자: 홍길동 (대표이사)</li>
            <li>이메일: privacy@roomy.kr</li>
            <li>전화: 02-1234-5678</li>
          </ul>

          <h2>제10조 (고지의 의무)</h2>
          <p>
            본 개인정보처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용의 추가, 삭제 및 수정이 있을 수 있으며,
            변경 시에는 시행일 7일 전부터 서비스 내 공지사항을 통해 고지합니다.
          </p>

          <h2>부칙</h2>
          <p>본 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.</p>
        </div>
      </div>
    </div>
  );
}
