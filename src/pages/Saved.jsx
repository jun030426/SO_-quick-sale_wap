import { Link } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { useMarketplace } from "../context/MarketplaceContext";
import { formatCount, formatPercent, formatPrice } from "../utils/marketplace";
import "../styles/saved.css";

function Saved() {
  const {
    favoriteListings,
    recentViewedListings,
    favoriteComplexes,
    clearRecentViewed,
    removeRecentViewed,
    toggleComplexFavorite,
  } = useMarketplace();

  const summaryItems = [
    {
      label: "찜한 매물",
      value: `${formatCount(favoriteListings.length)}건`,
    },
    {
      label: "최근 본 매물",
      value: `${formatCount(recentViewedListings.length)}건`,
    },
    {
      label: "즐겨찾기 단지",
      value: `${formatCount(favoriteComplexes.length)}곳`,
    },
  ];

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">관심목록</span>
          <h1 className="page-title">최근 본 매물과 찜한 단지를 한 곳에서 바로 관리합니다</h1>
          <p className="page-desc">
            상세 페이지에서 본 매물은 자동으로 쌓이고, 찜한 매물과 단지 즐겨찾기는 여기에서 한 번에 정리해볼
            수 있습니다.
          </p>

          <div className="saved-summary-grid">
            {summaryItems.map((item) => (
              <article key={item.label} className="saved-summary-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-body">
        <div className="container saved-layout">
          <article className="saved-panel">
            <div className="panel-header">
              <h2>즐겨찾기 단지</h2>
              <span className="pill accent">{favoriteComplexes.length}곳</span>
            </div>

            {favoriteComplexes.length > 0 ? (
              <div className="saved-complex-grid">
                {favoriteComplexes.map((complex) => (
                  <article key={complex.key} className="saved-complex-card">
                    <img src={complex.image} alt={complex.name} className="saved-complex-image" />

                    <div className="saved-complex-body">
                      <span className="saved-complex-kicker">{complex.district}</span>
                      <strong>{complex.name}</strong>
                      <p>{complex.location}</p>

                      <div className="saved-complex-metrics">
                        <span>등록 매물 {formatCount(complex.count)}건</span>
                        <span>최저가 {formatPrice(complex.lowestPrice)}</span>
                        <span>평균 할인율 {formatPercent(complex.averageDiscount)}</span>
                      </div>

                      <div className="saved-complex-actions">
                        <Link to={`/listings/${complex.listingId}`} className="text-link">
                          대표 매물 보기
                        </Link>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => toggleComplexFavorite(complex.key)}
                        >
                          단지 저장 해제
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-box compact">
                <h3>아직 저장한 단지가 없습니다</h3>
                <p>상세 페이지나 목록에서 단지를 저장해두면 이곳에 모아볼 수 있습니다.</p>
              </div>
            )}
          </article>

          <article className="saved-panel">
            <div className="panel-header">
              <h2>찜한 매물</h2>
              <span className="pill accent">{favoriteListings.length}건</span>
            </div>

            {favoriteListings.length > 0 ? (
              <div className="listing-grid">
                {favoriteListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <h3>아직 찜한 매물이 없습니다</h3>
                <p>목록이나 상세 페이지에서 매물을 찜하면 관심목록에 바로 추가됩니다.</p>
              </div>
            )}
          </article>

          <article className="saved-panel">
            <div className="panel-header">
              <h2>최근 본 매물</h2>
              <div className="saved-panel-actions">
                <span className="pill">{recentViewedListings.length}건</span>
                {recentViewedListings.length > 0 && (
                  <button type="button" className="text-button danger" onClick={clearRecentViewed}>
                    전체 비우기
                  </button>
                )}
              </div>
            </div>

            {recentViewedListings.length > 0 ? (
              <div className="saved-recent-list">
                {recentViewedListings.map((listing, index) => (
                  <article key={listing.id} className="saved-recent-item">
                    <img src={listing.image} alt={listing.title} className="saved-recent-image" />

                    <div className="saved-recent-copy">
                      <span className="saved-recent-rank">최근 본 순서 {index + 1}</span>
                      <strong>{listing.title}</strong>
                      <p>
                        {listing.mapLabel || listing.location} · {listing.area} · {listing.floor}
                      </p>
                      <b>{formatPrice(listing.price)}</b>
                    </div>

                    <div className="saved-recent-actions">
                      <Link to={`/listings/${listing.id}`} className="btn btn-outline">
                        다시 보기
                      </Link>
                      <button
                        type="button"
                        className="text-button danger"
                        onClick={() => removeRecentViewed(listing.id)}
                      >
                        목록에서 제거
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <h3>최근 본 매물이 없습니다</h3>
                <p>매물 상세를 열어보면 자동으로 최근 본 목록에 쌓이기 시작합니다.</p>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}

export default Saved;
