import { Link } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import SearchBox from "../components/SearchBox";
import { useMarketplace } from "../context/MarketplaceContext";
import "../styles/home.css";

function Home() {
  const {
    listings,
    alertProfiles,
    stats,
    isAuthenticated,
    backendLabel,
    isWritableBackend,
  } = useMarketplace();

  const featuredListings = listings.slice(0, 3);

  const metrics = [
    {
      label: "검증 완료 매물",
      value: `${stats.listingsCount}건`,
      detail: "등록 전 AI 필터 통과",
    },
    {
      label: "평균 할인율",
      value: `${stats.averageDiscount.toFixed(1)}%`,
      detail: "최근 3개월 실거래 기준",
    },
    {
      label: "저장된 알림",
      value: `${isAuthenticated ? alertProfiles.length : stats.alertsCount}개`,
      detail: isAuthenticated ? "내 계정 기준 저장 수" : "플랫폼 전체 누적 수",
    },
    {
      label: "누적 문의",
      value: `${stats.inquiriesCount}건`,
      detail: "파트너 중개사 연결 요청",
    },
  ];

  const problems = [
    {
      title: "가짜 급매가 너무 많습니다",
      body: "광고비 기반 플랫폼은 매물 수를 늘리는 데 유리하지만, 급매의 진짜 여부를 검증할 이유가 약합니다. 그래서 실수요자는 수많은 매물 속에서 다시 발품을 팔게 됩니다.",
    },
    {
      title: "검증 비용이 사람마다 다릅니다",
      body: "정보력이 있는 사람은 네트워크와 시간을 써서 좋은 매물을 먼저 잡지만, 첫 구매자와 맞벌이 부부는 같은 기회를 갖기 어렵습니다.",
    },
    {
      title: "사후 단속만으로는 느립니다",
      body: "허위매물은 등록되고 난 뒤 신고와 조사를 거치기 때문에 느립니다. 급매는 등록 전에 기준을 통과해야 공개되는 구조로 접근합니다.",
    },
  ];

  const flow = [
    {
      step: "01",
      title: "매도인 또는 파트너 중개사 등록",
      body: "매도 사유, 가격, 면적, 설명을 입력하면 즉시 심사가 시작됩니다.",
    },
    {
      step: "02",
      title: "AI 가격 검증",
      body: "최근 3개월 실거래 평균과 현재 등록 평균을 교차 비교해 5% 이상 저렴한 매물만 공개합니다.",
    },
    {
      step: "03",
      title: "조건 맞춤 알림",
      body: "사용자 계정에 저장된 지역, 가격, 면적, 유형 조건과 맞으면 바로 노출됩니다.",
    },
    {
      step: "04",
      title: "파트너 중개사 연결",
      body: "매물 문의가 들어오면 파트너 중개사와 연결되어 실제 거래 상담으로 이어집니다.",
    },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy-block">
            <span className="eyebrow">실사용형 부동산 급매 서비스</span>
            <h1 className="hero-title">
              등록 전에 AI가 걸러내는
              <br />
              진짜 급매 플랫폼
            </h1>
            <p className="hero-description">
              이제 이 사이트는 단순 소개 화면이 아니라 실제 계정, 실제 저장, 실제 문의가 가능한
              서비스 구조로 바뀌었습니다. 실수요자는 조건을 저장하고, 매도인은 등록 심사를 받고,
              운영자는 대시보드에서 흐름을 확인할 수 있습니다.
            </p>

            <div className="hero-actions">
              <Link to="/listings" className="btn btn-primary">
                검증 매물 보기
              </Link>
              <Link to="/account" className="btn btn-outline">
                계정 만들기
              </Link>
            </div>

            <div className="metric-grid">
              {metrics.map((metric) => (
                <article key={metric.label} className="metric-card">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                  <p>{metric.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-copy">
              <p className="panel-kicker">실시간 탐색</p>
              <h2>조건만 넣으면 검증된 매물만 골라드립니다</h2>
              <p>
                검색은 누구나 할 수 있고, 로그인 후에는 알림 저장과 문의, 매도 등록까지 이어집니다.
              </p>
            </div>

            <SearchBox />

            <div className="hero-status-list">
              <div>
                <strong>검증 기준</strong>
                <span>실거래 평균 대비 5% 이상 할인</span>
              </div>
              <div>
                <strong>데이터 저장</strong>
                <span>{backendLabel}</span>
              </div>
              <div>
                <strong>운영 관리</strong>
                <span>관리자 대시보드 제공</span>
              </div>
            </div>

            {!isWritableBackend && (
              <p className="helper-copy">
                이 미리보기 빌드는 읽기 전용입니다. 실제 회원가입과 저장은 Supabase 환경변수가
                연결된 배포본에서 동작합니다.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Problem</span>
            <h2>왜 여전히 진짜 급매는 찾기 어려운가</h2>
          </div>

          <div className="problem-grid">
            {problems.map((problem) => (
              <article key={problem.title} className="story-card">
                <h3>{problem.title}</h3>
                <p>{problem.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section flow-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Flow</span>
            <h2>서비스는 이렇게 작동합니다</h2>
          </div>

          <div className="flow-grid">
            {flow.map((item) => (
              <article key={item.step} className="flow-card">
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Verified Listings</span>
            <h2>지금 바로 확인할 수 있는 매물</h2>
            <p>기본 시드 데이터와 승인된 사용자 등록 매물이 함께 노출됩니다.</p>
          </div>

          <div className="listing-grid">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container dual-cta">
          <article className="cta-card">
            <span className="eyebrow">For Buyers</span>
            <h2>조건 알림과 문의를 계정에 저장하세요</h2>
            <p>이제 알림과 문의 기록이 계정 단위로 저장되어 다른 브라우저에서도 이어집니다.</p>
            <Link to="/alerts" className="btn btn-dark">
              알림 센터 가기
            </Link>
          </article>

          <article className="cta-card accent">
            <span className="eyebrow">For Sellers</span>
            <h2>매도 등록 후 즉시 심사 결과를 확인하세요</h2>
            <p>
              승인되면 바로 매물에 반영되고, 미달이면 어떤 점을 보완해야 하는지 기록으로 남습니다.
            </p>
            <Link to="/sell" className="btn btn-primary">
              매도 등록 시작
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Home;
