import "../styles/home.css";
import SearchBox from "../components/SearchBox";
import ListingCard from "../components/ListingCard";
import listings from "../data/listings";

function Home() {
  const featuredListings = listings.filter((item) => item.discountRate >= 5).slice(0, 3);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-badge">진짜 급매만 선별하는 MVP</span>
            <h1 className="hero-title">
              부동산 앱에 널린 급매 말고,
              <br />
              데이터로 검증된 급매만 보여줍니다.
            </h1>
            <p className="hero-desc">
              최근 실거래가와 현재 매물 시세를 비교해 가격 경쟁력을 보여주고,
              영상 임장과 리포트 정보까지 한 번에 확인하는 부동산 타임딜 서비스입니다.
            </p>

            <div className="hero-buttons">
              <a href="#featured" className="btn btn-primary">
                추천 급매 보기
              </a>
              <a href="#features" className="btn btn-outline">
                핵심 기능 보기
              </a>
            </div>
          </div>

          <div className="hero-search">
            <h2 className="search-title">AI 급매 탐색기</h2>
            <p className="search-desc">
              지역과 키워드를 입력해서 급매 매물을 찾아보세요.
            </p>
            <SearchBox />
          </div>
        </div>
      </section>

      <section id="features" className="home-section">
        <div className="container">
          <div className="section-heading">
            <p className="section-label">핵심 기능</p>
            <h2>신뢰와 속도를 만드는 3가지 기능</h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <h3>AI 가격 검증</h3>
              <p>
                최근 실거래가와 현재 등록 매물 평균가를 비교해
                시세 대비 얼마나 저렴한지 수치로 보여줍니다.
              </p>
            </div>

            <div className="feature-card">
              <h3>영상 임장</h3>
              <p>
                직접 방문 전에도 공간감과 내부 상태를 먼저 확인할 수 있어
                탐색 피로를 줄여줍니다.
              </p>
            </div>

            <div className="feature-card">
              <h3>즉시 알림</h3>
              <p>
                내가 원하는 지역과 조건의 급매가 등록되면
                빠르게 확인할 수 있는 구조를 목표로 합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="home-section">
        <div className="container">
          <div className="section-heading">
            <p className="section-label">추천 급매</p>
            <h2>오늘 바로 확인할 수 있는 검증 매물</h2>
          </div>

          <div className="listing-grid">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="trust-box">
            <div>
              <p className="section-label">급매 판단 기준</p>
              <h2>사용자가 납득할 수 있는 기준부터 보여줍니다</h2>
            </div>

            <ul className="trust-list">
              <li>최근 90일 실거래 평균과 비교</li>
              <li>동일 생활권 내 현재 등록 매물 평균가와 비교</li>
              <li>시세 대비 5% 이상 저렴한 매물 우선 노출</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;