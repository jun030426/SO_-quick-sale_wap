import { Link } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import SearchBox from "../components/SearchBox";
import { useMarketplace } from "../context/MarketplaceContext";
import { formatPercent } from "../utils/marketplace";
import "../styles/home.css";

function Home() {
  const { listings, alertProfiles, stats, isAuthenticated } = useMarketplace();

  const featuredListings = listings.slice(0, 3);
  const savedAlertCount = isAuthenticated ? alertProfiles.length : stats.alertsCount;

  const heroMetrics = [
    {
      label: "현재 급매 등록",
      value: `${stats.listingsCount}건`,
      detail: "AI 검증 통과 매물",
    },
    {
      label: "누적 문의 접수",
      value: `${stats.inquiriesCount}건`,
      detail: "매물별 상담 흐름",
    },
    {
      label: "평균 할인율",
      value: formatPercent(stats.averageDiscount),
      detail: "최근 3개월 평균 비교",
    },
  ];

  const features = [
    {
      title: "실거래가 AI 검증",
      body: "국토부 실거래와 동일 생활권 평균을 함께 비교해 실제 가격 메리트가 있는 급매만 선별합니다.",
      meta: "시세 대비 최소 5% 이상",
    },
    {
      title: "빠른 판단을 위한 현장 정보",
      body: "영상 현장과 체크 포인트를 요약해, 앱 안에서 첫 판단을 끝내고 바로 상세 검토로 넘어갈 수 있게 만듭니다.",
      meta: "리포트 · 영상 · 파트너 매칭",
    },
    {
      title: "조건 저장과 즉시 알림",
      body: "지역, 예산, 면적 조건을 저장해두면 새 급매가 올라오는 순간 먼저 대응할 수 있습니다.",
      meta: "계정 단위 저장",
    },
  ];

  const roleCards = [
    {
      role: "매수인",
      title: "진짜 급매만 빠르게 고르는 동선",
      body: "홈에서 기회를 빠르게 훑고, 급매 지도에서 비교한 뒤, 상세에서 문의까지 이어지는 흐름에 맞췄습니다.",
      actionLabel: "급매 지도 보기",
      actionTo: "/listings",
    },
    {
      role: "매도인",
      title: "심사와 노출을 한 번에 연결",
      body: "가격 근거와 매도 사유를 입력하면 즉시 심사하고, 승인된 매물은 실제 목록 흐름 안으로 들어갑니다.",
      actionLabel: "매도 등록하기",
      actionTo: "/sell",
    },
    {
      role: "파트너 중개사",
      title: "탐색보다 전환율에 가까운 구조",
      body: "광고성 노출보다 실제 문의와 거래 연결이 쉬운 매물 중심으로 대응할 수 있게 설계했습니다.",
      actionLabel: "급매 알림 보기",
      actionTo: "/alerts",
    },
  ];

  const comparisonRows = [
    {
      label: "정보 구조",
      legacy: "광고성 매물을 길게 비교",
      geupmae: "AI 검증 급매만 먼저 노출",
    },
    {
      label: "판단 기준",
      legacy: "텍스트·사진 중심 탐색",
      geupmae: "실거래 데이터와 현장 정보 중심",
    },
    {
      label: "반응 속도",
      legacy: "사용자 개별 검색과 수동 연락",
      geupmae: "조건 저장 후 새 급매 즉시 포착",
    },
    {
      label: "거래 연결",
      legacy: "플랫폼 안에서 정보만 소비",
      geupmae: "문의·알림·매도 등록까지 연결",
    },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-shell">
          <div className="hero-copy-block">
            <span className="hero-live">LIVE · 국토부 실거래가 AI 검증 중</span>
            <h1 className="hero-title">
              진짜 아파트 급매만
              <br />
              가장 빠르게 선점하세요
            </h1>
            <p className="hero-description">
              홈에서는 가장 중요한 기회만 깔끔하게 보여주고, 실제 비교와 문의는 각 카테고리
              페이지에서 이어갈 수 있도록 정리했습니다.
            </p>

            <div className="hero-metric-row">
              {heroMetrics.map((metric) => (
                <article key={metric.label} className="metric-card metric-card-on-dark">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                  <p>{metric.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-copy">
              <p className="panel-kicker">빠른 검색</p>
              <h2>지역, 유형, 예산만 정하면 급매 지도로 바로 이어집니다</h2>
              <p>홈은 탐색의 시작점이고, 본격적인 비교와 필터링은 급매 지도에서 이어집니다.</p>
            </div>

            <SearchBox />

            <div className="hero-trust-row">
              <span>AI 인증 매물만 노출</span>
              <span>시세 대비 최소 5% 이상</span>
              <span>매도 등록 심사 연동</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section preview-section">
        <div className="container">
          <div className="section-heading section-heading-row">
            <div>
              <span className="eyebrow">대표 급매 미리보기</span>
              <h2>지금 먼저 볼 만한 AI 인증 급매</h2>
              <p>홈에서는 대표 매물만 간단히 보고, 자세한 비교는 급매 지도로 넘깁니다.</p>
            </div>
            <Link to="/listings" className="text-link">
              더 많은 급매 보기
            </Link>
          </div>

          {featuredListings.length > 0 ? (
            <div className="listing-grid">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="empty-box">
              <h3>아직 공개된 급매가 없습니다</h3>
              <p>첫 승인 매물이 올라오면 이 영역에서 가장 먼저 확인할 수 있습니다.</p>
            </div>
          )}
        </div>
      </section>

      <section className="home-section feature-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">핵심 기능</span>
            <h2>신뢰와 속도를 함께 만드는 3가지 기능</h2>
            <p>설명은 짧게 줄이고, 실제 행동은 각 페이지에서 바로 이어지게 설계했습니다.</p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <span className="feature-meta">{feature.meta}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section role-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">역할별 가치</span>
            <h2>누가 쓰더라도 동선이 분명한 급매 서비스</h2>
            <p>매수인, 매도인, 파트너 중개사가 각자 필요한 페이지로 자연스럽게 이동하도록 구성했습니다.</p>
          </div>

          <div className="role-grid">
            {roleCards.map((card) => (
              <article key={card.role} className="role-card">
                <span className="role-pill">{card.role}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <Link to={card.actionTo} className="text-link">
                  {card.actionLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section comparison-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">서비스 비교</span>
            <h2>기존 탐색형 앱과 급매의 차이</h2>
            <p>정보를 길게 나열하기보다, 거래 판단과 반응 속도에 필요한 요소만 남겼습니다.</p>
          </div>

          <div className="comparison-table-shell home-comparison-shell">
            <div className="comparison-table-head">
              <span>비교 항목</span>
              <span>기존 부동산 앱</span>
              <span>급매</span>
            </div>

            {comparisonRows.map((row) => (
              <div key={row.label} className="comparison-row comparison-row-light">
                <strong>{row.label}</strong>
                <span>{row.legacy}</span>
                <span className="accent">{row.geupmae}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section alert-cta-section">
        <div className="container">
          <div className="alert-cta-shell">
            <span className="eyebrow">급매 알림</span>
            <h2>관심 지역과 가격대를 저장하고 진짜 급매를 먼저 받으세요</h2>
            <p>
              현재 {savedAlertCount}개의 알림 조건이 저장되어 있습니다. 홈에서는 큰 흐름만 보고,
              실제 저장과 관리는 급매 알림 페이지에서 이어집니다.
            </p>

            <div className="alert-cta-points">
              <span>지역·예산 조건 저장</span>
              <span>새 매물 즉시 포착</span>
              <span>계정 이력으로 계속 관리</span>
            </div>

            <div className="alert-cta-actions">
              <Link to="/alerts" className="btn btn-primary">
                급매 알림 설정하기
              </Link>
              <Link to="/sell" className="btn btn-outline btn-outline-light">
                매도 등록하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
