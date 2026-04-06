function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-title">급매</p>
          <p>
            아파트 매도인과 매수인을 지도 기반으로 연결하는 전용 플랫폼입니다. 검증된 급매만
            빠르게 비교하고 바로 문의까지 이어갈 수 있게 구성했습니다.
          </p>
        </div>

        <div>
          <p className="footer-title">서비스</p>
          <p>급매 지도 · 급매 알림 · 아파트 매도 등록 · 실거래 비교 · 계정 관리</p>
        </div>

        <div>
          <p className="footer-title">확장 포인트</p>
          <p>실운영에서는 네이버 지도 API 키, 실거래가 데이터, CRM 알림 연동까지 이어서 붙일 수 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
