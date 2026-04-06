import { Link } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";
import {
  formatCompactPrice,
  formatCount,
  formatPercent,
  formatPrice,
  getListingDeadline,
  getListingEngagement,
  getListingRankLabel,
  getListingSavings,
} from "../utils/marketplace";

function ListingCard({ listing }) {
  const {
    isListingFavorited,
    isComplexFavorited,
    toggleListingFavorite,
    toggleComplexFavorite,
  } = useMarketplace();
  const engagement = getListingEngagement(listing);
  const deadline = getListingDeadline(listing);
  const savings = getListingSavings(listing);
  const rankLabel = getListingRankLabel(listing);
  const isFavorited = isListingFavorited(listing.id);
  const isComplexSaved = isComplexFavorited(listing);

  return (
    <article className="listing-card">
      <div className="listing-card-image-wrap">
        <img src={listing.image} alt={listing.title} className="listing-card-image" />
        <div className="listing-card-topline">
          <span className="listing-badge hot">급매 {deadline}</span>
          <span className="listing-badge">아파트</span>
        </div>

        <button
          type="button"
          className={`listing-save-button${isFavorited ? " active" : ""}`}
          onClick={() => toggleListingFavorite(listing.id)}
        >
          {isFavorited ? "찜됨" : "찜"}
        </button>
      </div>

      <div className="listing-card-body">
        <div className="listing-card-headline">
          <p className="listing-kicker">
            {listing.district} · {listing.urgentReason}
          </p>
          <h3 className="listing-title">{listing.title}</h3>
          <p className="listing-location">
            {listing.mapLabel || listing.location} · {listing.floor} · {listing.area}
          </p>
        </div>

        <div className="listing-price-focus">
          <strong>{formatPrice(listing.price)}</strong>
          <span>
            최근 시세 {formatCompactPrice(listing.marketPrice)} · {formatPercent(listing.discountRate)} 할인
          </span>
        </div>

        <div className="listing-score-line">
          <strong>AI 급매 지수 {rankLabel}</strong>
          <span>{formatPrice(savings)} 절감</span>
        </div>

        <div className="listing-point-row">
          <span>{listing.area}</span>
          <span>{listing.floor}</span>
          <span>{listing.builtYear}년 준공</span>
        </div>

        <div className="listing-statline">
          <span>약 {formatCount(engagement.views)}회 조회</span>
          <span>찜 {formatCount(engagement.likes)}</span>
          <span>{listing.hasReport ? "현장 리포트" : "상담 연결"}</span>
        </div>

        <div className="listing-tags market">
          <span className="tag">급매 지수 {listing.score}</span>
          <span className="tag">신뢰 점수 {listing.trustScore}</span>
          <span className="tag">{listing.sellerType}</span>
          {listing.hasVideo && <span className="tag">영상 현장</span>}
          {listing.hasReport && <span className="tag">현장 리포트</span>}
        </div>

        <div className="listing-interest-row">
          <button
            type="button"
            className={`interest-chip-button${isFavorited ? " active" : ""}`}
            onClick={() => toggleListingFavorite(listing.id)}
          >
            {isFavorited ? "찜한 매물" : "매물 찜"}
          </button>
          <button
            type="button"
            className={`interest-chip-button${isComplexSaved ? " active" : ""}`}
            onClick={() => toggleComplexFavorite(listing)}
          >
            {isComplexSaved ? "단지 저장됨" : "단지 저장"}
          </button>
        </div>

        <div className="listing-cta-row">
          <Link to={`/listings/${listing.id}`} className="btn btn-primary card-btn">
            상세 보기
          </Link>
          <Link to={`/listings/${listing.id}`} className="btn btn-outline card-btn secondary">
            상담 요청
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ListingCard;
