import { Link } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import SearchBox from "../components/SearchBox";
import { useMarketplace } from "../context/MarketplaceContext";
import {
  formatCompactPrice,
  formatPercent,
  getListingDeadline,
  getListingRankLabel,
} from "../utils/marketplace";
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

  const featuredListings = listings.slice(0, 6);
  const heroListing = listings[0];

  const metrics = [
    {
      label: "현재 급매 등록",
      value: `${stats.listingsCount}건`,
      detail: "AI 인증 통과 매물",
    },
    {
      label: "오늘 거래 집중도",
      value: `${Math.max(3, Math.round(stats.inquiriesCount * 0.35))}건`,
      detail: "문의 발생 기준",
    },
    {
      label: "평균 할인율",
      value: formatPercent(stats.averageDiscount),
      detail: "최근 3개월 비교",
    },
    {
      label: "저장된 알림",
      value: `${isAuthenticated ? alertProfiles.length : stats.alertsCount}개`,
      detail: isAuthenticated ? "내 계정 기준" : "플랫폼 전체",
    },
  ];

  const features = [
    {
      title: "시세를 데이터로 증명합니다",
      body: "최근 실거래 평균과 현재 등록 평균을 교차 비교해 시세 대비 5% 이상 저렴한 매물만 상단에 노출합니다.",
      stats: ["AI 급매 지수 산정", "동일 생활권 비교", "허위 급매 필터"],
    },
    {
      title: "거실에서 임장의 절반을 끝냅니다",
      body: "영상 현장 자료와 체크포인트를 함께 보여줘 탐색 피로를 줄이고, 상담 전 판단 속도를 높입니다.",
      stats: ["영상 현장 확인", "리포트 제공", "파트너 중개사 연결"],
    },
    {
      title: "관심 조건을 먼저 붙잡습니다",
      body: "지역, 예산, 면적, 할인율을 저장하면 새 매물이 등장하는 순간 같은 조건의 사용자보다 먼저 반응할 수 있습니다.",
      stats: ["조건 알림 저장", "새 급매 즉시 포착", "매물별 문의 이력 유지"],
    },
  ];

  const roleCards = [
    {
      role: "매수인",
      headline: "광고성 급매가 아니라 진짜 가격 메리트만 보세요",
      bullets: [
        "급매 지수와 할인율로 빠르게 판단",
        "영상 현장과 파트너 상담으로 검증",
        "관심 조건 저장 후 새 매물 선점",
      ],
    },
    {
      role: "매도인",
      headline: "할인 근거를 데이터로 제시하고 빠르게 현금화하세요",
      bullets: [
        "매도 등록 즉시 심사",
        "조건 맞는 실수요자에게 우선 노출",
        "보완 포인트까지 기록으로 확인",
      ],
    },
    {
      role: "파트너 중개사",
      headline: "광고비보다 전환율에 집중하는 매칭 구조",
      bullets: [
        "실제 문의가 붙은 급매에 집중",
        "관리자 화면에서 최근 흐름 확인",
        "신뢰 자료가 많은 매물 우선 대응",
      ],
    },
  ];

  const comparisonRows = [
    {
      label: "정보의 성격",
      legacy: "광고성 매물의 단순 나열",
      geupmae: "AI 검증을 통과한 타임딜형 급매만 노출",
    },
    {
      label: "핵심 가치",
      legacy: "비교와 탐색 중심",
      geupmae: "즉각적인 거래 판단과 선점",
    },
    {
      label: "거래 속도",
      legacy: "사용자 개별 연락과 수동 검증",
      geupmae: "조건 알림과 파트너 연결 중심",
    },
    {
      label: "신뢰 검증",
      legacy: "텍스트와 사진 의존",
      geupmae: "가격 데이터와 현장 자료 중심",
    },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-shell">
          <div className="hero-copy-block">
            <span className="hero-live">LIVE · AI 급매 지수 산정 중</span>
            <h1 className="hero-title">
              진짜 아파트 급매만
              <br />
              모았습니다
            </h1>
            <p className="hero-description">
              시세 대비 의미 있게 저렴한 매물만 골라 보여주는 타임딜형 거래소입니다. 검증 근거,
              알림, 문의, 매도 등록이 한 흐름으로 연결됩니다.
            </p>

            <div className="hero-actions">
              <Link to="/alerts" className="btn btn-primary">
                급매 알림 설정
              </Link>
              <Link to="/listings" className="btn btn-outline">
                아파트 둘러보기
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
              <p className="panel-kicker">급매 검색</p>
              <h2>관심 지역과 예산을 넣으면 검증된 매물만 좁혀집니다</h2>
              <p>앱 같은 탐색 경험 대신, 거래에 가까운 매물만 빠르게 걸러냅니다.</p>
            </div>

            <SearchBox />

            <div className="hero-status-list">
              <div>
                <strong>데이터 계층</strong>
                <span>{backendLabel}</span>
              </div>
              <div>
                <strong>노출 기준</strong>
                <span>시세 대비 최소 5% 이상</span>
              </div>
              <div>
                <strong>상담 연결</strong>
                <span>파트너 중개사 매칭</span>
              </div>
            </div>

            {!isWritableBackend && (
              <p className="helper-copy">
                현재 미리보기 빌드에서는 저장이 제한될 수 있습니다. 실배포에서는 Supabase 연결 후
                회원가입과 문의가 실제로 유지됩니다.
              </p>
            )}
          </div>
        </div>
      </section>

      {heroListing && (
        <section className="home-section marquee-section">
          <div className="container">
            <article className="marquee-card">
              <div className="marquee-labels">
                <span className="pill accent">타임딜 {getListingDeadline(heroListing)}</span>
                <span className="pill">AI 인증</span>
              </div>

              <div className="marquee-copy">
                <div>
                  <p className="comparison-label">오늘 가장 반응이 빠른 매물</p>
                  <h2>{heroListing.title}</h2>
                  <p>
                    {heroListing.location} · {heroListing.area} · {heroListing.floor}
                  </p>
                </div>

                <div className="marquee-price">
                  <strong>{formatCompactPrice(heroListing.price)}</strong>
                  <span>
                    {getListingRankLabel(heroListing)} · 시세 대비{" "}
                    {formatPercent(heroListing.discountRate)}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">AI 인증 급매</span>
            <h2>지금 바로 선점할 수 있는 진짜 아파트 급매</h2>
            <p>가격, 신뢰 자료, 상담 전환 가능성을 한 카드 안에서 바로 판단할 수 있게 구성했습니다.</p>
          </div>

          <div className="listing-grid">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section feature-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">핵심 기능</span>
            <h2>신뢰와 속도를 담보하는 3대 기능</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <ul className="plain-list">
                  {feature.stats.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section role-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">이해관계자별 가치</span>
            <h2>당신의 역할에 맞는 급매 전략</h2>
          </div>

          <div className="role-grid">
            {roleCards.map((card) => (
              <article key={card.role} className="role-card">
                <span>{card.role}</span>
                <h3>{card.headline}</h3>
                <ul className="plain-list">
                  {card.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section comparison-section">
        <div className="container comparison-shell">
          <div className="section-heading">
            <span className="eyebrow">서비스 비교</span>
            <h2>기존 탐색형 앱과 급매의 차이</h2>
            <p>정보의 양보다 거래 성사 가능성과 가격 경쟁력 선점에 초점을 맞췄습니다.</p>
          </div>

          <div className="comparison-table-shell">
            {comparisonRows.map((row) => (
              <div key={row.label} className="comparison-row">
                <strong>{row.label}</strong>
                <span>{row.legacy}</span>
                <span className="accent">{row.geupmae}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container dual-cta">
          <article className="cta-card">
            <span className="eyebrow">For Buyers</span>
            <h2>관심 단지와 예산을 저장해두세요</h2>
            <p>새 급매가 올라오는 순간 가장 먼저 반응할 수 있도록 조건 알림을 계정에 저장합니다.</p>
            <Link to="/alerts" className="btn btn-dark">
              알림 센터 가기
            </Link>
          </article>

          <article className="cta-card accent">
            <span className="eyebrow">For Sellers</span>
            <h2>가격 근거를 통과한 매물만 빠르게 노출됩니다</h2>
            <p>등록 즉시 심사하고, 승인되면 바로 매물 목록과 관리자 흐름에 반영됩니다.</p>
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
