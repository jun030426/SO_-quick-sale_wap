import { useMemo } from "react";
import { Link } from "react-router-dom";
import SearchBox from "../components/SearchBox";
import { useMarketplace } from "../context/MarketplaceContext";
import { getLatestAiDigest } from "../data/aiBriefings";
import { formatCount, formatPercent, formatPrice } from "../utils/marketplace";
import "../styles/home.css";

function Home() {
  const {
    user,
    listings,
    alertProfiles,
    inquiries,
    stats,
    isAuthenticated,
    favoriteListingIds,
    recentViewedListings,
    toggleListingFavorite,
    isListingFavorited,
  } = useMarketplace();

  const featuredListings = useMemo(() => listings.slice(0, 8), [listings]);
  const savedAlertCount = isAuthenticated ? alertProfiles.length : stats.alertsCount;
  const myInquiryCount = isAuthenticated ? inquiries.length : 0;
  const accountTitle = isAuthenticated ? `${user.name}님` : "로그인 / 회원가입";
  const accountMeta = isAuthenticated ? "계정 연동" : "계정";
  const accountBody = isAuthenticated
    ? "저장한 알림과 문의 내역을 바로 확인"
    : "로그인 후 알림 저장과 문의 내역 관리";
  const aiDigest = useMemo(() => getLatestAiDigest(), []);
  const promoListing = useMemo(() => {
    if (!listings.length) {
      return null;
    }

    return [...listings].sort((left, right) => {
      if (right.discountRate !== left.discountRate) {
        return right.discountRate - left.discountRate;
      }

      return left.price - right.price;
    })[0];
  }, [listings]);

  return (
    <div className="home-page">
      <section className="home-hub">
        <div className="container home-hub-shell">
          <div className="home-search-strip">
            <SearchBox />
          </div>

          <div className="home-table-grid">
            <Link to="/listings" className="home-dashboard-card">
              <span>{formatCount(stats.listingsCount)}건 지도 보기</span>
              <strong>급매 지도</strong>
              <p>현재 등록된 아파트 급매 확인</p>
            </Link>

            <Link to="/saved" className="home-dashboard-card">
              <span>찜 {formatCount(favoriteListingIds.length)}건 · 최근 본 {formatCount(recentViewedListings.length)}건</span>
              <strong>관심목록</strong>
              <p>찜한 매물과 최근 본 매물을 한 번에 확인</p>
            </Link>

            <article className="home-dashboard-card home-dashboard-card-action">
              <span>{accountMeta}</span>
              <strong>{accountTitle}</strong>
              <p>{accountBody}</p>
              <Link to={isAuthenticated ? "/account" : "/login"} className="btn btn-outline">
                {isAuthenticated ? "내 계정 보기" : "로그인"}
              </Link>
            </article>

            <Link to="/alerts" className="home-dashboard-card">
              <span>{formatCount(savedAlertCount)}개 저장</span>
              <strong>급매 알림</strong>
              <p>지역과 예산 조건별 알림 저장</p>
            </Link>

            <Link to={isAuthenticated ? "/account" : "/login"} className="home-dashboard-card">
              <span>{isAuthenticated ? `문의 ${formatCount(myInquiryCount)}건` : "로그인 후 확인"}</span>
              <strong>내 문의</strong>
              <p>문의 내역과 등록 이력을 계정에서 바로 확인</p>
            </Link>

            <article className="home-dashboard-card home-dashboard-card-action">
              <span>문의</span>
              <strong>문의 상담</strong>
              <p>지도에서 매물을 보고 바로 문의 연결</p>
              <Link to="/listings" className="btn btn-primary">
                문의 가능한 매물 보기
              </Link>
            </article>

            <section className="home-promo-panel" aria-label="광고 배너 영역">
              <article className="home-promo-banner">
                <span className="comparison-label">광고 배너</span>
                <h2>메인에서 바로 노출할 배너나 추천 매물을 깔끔하게 배치하는 영역</h2>
                <p>
                  실제 운영 단계에서는 광고 배너 이미지나 제휴 프로모션을 넣고, 지금은 대표 매물 한 건이 자연스럽게
                  보이도록 단순하게 구성했습니다.
                </p>
                <div className="home-promo-banner-actions">
                  <Link to="/listings" className="btn btn-primary">
                    전체 급매 보기
                  </Link>
                  <Link to="/saved" className="btn btn-outline">
                    관심목록 보기
                  </Link>
                </div>
              </article>

              {promoListing && (
                <Link to={`/listings/${promoListing.id}`} className="home-promo-highlight">
                  <img src={promoListing.image} alt={promoListing.title} className="home-promo-highlight-image" />

                  <div className="home-promo-highlight-copy">
                    <span className="home-promo-highlight-kicker">오늘 눈여겨볼 매물</span>
                    <strong>{promoListing.title}</strong>
                    <p>
                      {promoListing.mapLabel || promoListing.location} · {promoListing.area}
                    </p>
                    <b>{formatPrice(promoListing.price)}</b>
                    <small>시세 대비 {formatPercent(promoListing.discountRate)} 할인</small>
                  </div>
                </Link>
              )}
            </section>

            <section className="home-recommend-panel">
              <div className="home-recommend-head">
                <div>
                  <span className="comparison-label">추천 매물</span>
                  <h2>지금 바로 비교해볼 수 있는 아파트 급매</h2>
                </div>
                <Link to="/listings" className="text-link">
                  전체 매물 보기
                </Link>
              </div>

              {featuredListings.length > 0 ? (
                <div className="home-recommend-grid">
                  {featuredListings.map((listing) => {
                    const isFavorited = isListingFavorited(listing.id);

                    return (
                      <article key={listing.id} className="home-recommend-card">
                        <button
                          type="button"
                          className={`home-recommend-save${isFavorited ? " active" : ""}`}
                          aria-label={isFavorited ? "찜한 매물에서 제거" : "매물 찜하기"}
                          aria-pressed={isFavorited}
                          onClick={() => toggleListingFavorite(listing.id)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="home-recommend-save-icon"
                          >
                            <path d="M12 20.4 4.9 13.9a4.8 4.8 0 0 1 0-6.9 4.9 4.9 0 0 1 7-.1L12 7.1l.1-.2a4.9 4.9 0 0 1 7 .1 4.8 4.8 0 0 1 0 6.9L12 20.4Z" />
                          </svg>
                        </button>

                        <Link to={`/listings/${listing.id}`} className="home-recommend-card-link">
                          <div className="home-recommend-image-wrap">
                            <img src={listing.image} alt={listing.title} className="home-recommend-image" />
                            <span className="home-recommend-badge">{listing.district}</span>
                          </div>

                          <div className="home-recommend-body">
                            <strong>{listing.title}</strong>
                            <p>
                              {listing.mapLabel || listing.location} · {listing.area}
                            </p>
                            <b>{formatPrice(listing.price)}</b>
                            <small>시세 대비 {formatPercent(listing.discountRate)} 할인</small>
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-box compact">
                  <h3>아직 공개된 급매가 없습니다</h3>
                  <p>승인된 아파트 매물이 생기면 이 영역부터 채워집니다.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      <section className="home-ai-section home-section">
        <div className="container home-ai-layout">
          <div className="home-section-head">
            <div>
              <span className="comparison-label">AI 기사 요약</span>
              <h2>{aiDigest.title}</h2>
              <p className="home-ai-section-copy">{aiDigest.subtitle}</p>
            </div>

            <span className="pill accent">업데이트 {aiDigest.generatedLabel}</span>
          </div>

          <div className="home-ai-card-grid">
            {aiDigest.articles.map((article) => (
              <Link key={article.slug} to={`/briefings/${article.slug}`} className="home-ai-card">
                <div className="home-ai-card-image-wrap">
                  <img src={article.image} alt={article.title} className="home-ai-card-image" />
                </div>

                <div className="home-ai-card-body">
                  <div className="home-ai-card-meta">
                    <span className="home-ai-card-source">{article.sourceName}</span>
                    <small>{article.sourcePublishedAt}</small>
                  </div>

                  <strong>{article.title}</strong>
                  <p>{article.summary}</p>

                  <span className="text-link">AI 요약 기사 보기</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
