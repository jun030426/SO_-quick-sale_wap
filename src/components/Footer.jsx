function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-title">급매</p>
          <p>
            대한민국 아파트 타임딜 거래소. 데이터로 검증된 급매만 노출하고, 알림과 상담, 등록
            심사까지 한 흐름으로 연결합니다.
          </p>
        </div>

        <div>
          <p className="footer-title">서비스</p>
          <p>AI 인증 매물 · 조건 알림 · 매도 등록 · 파트너 매칭 · 운영 대시보드</p>
        </div>

        <div>
          <p className="footer-title">운영 메모</p>
          <p>실거래가 API, 외부 알림 채널, CRM 연동은 운영 환경에서 단계적으로 확장할 수 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
