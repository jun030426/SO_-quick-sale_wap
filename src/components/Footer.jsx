function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-title">급매 MVP Prototype</p>
          <p>
            기획서 기준 핵심 흐름인 AI 급매 검증, 조건 알림, 매도 등록, 파트너 중개사 매칭을
            한 번에 보여주는 프론트엔드 데모입니다.
          </p>
        </div>

        <div>
          <p className="footer-title">현재 데모 범위</p>
          <p>국토부 실거래가 API, 푸시 알림, CRM은 실제 서비스 단계에서 백엔드 연동이 필요합니다.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
