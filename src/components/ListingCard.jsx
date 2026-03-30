import { Link } from "react-router-dom";
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
  const engagement = getListingEngagement(listing);
  const deadline = getListingDeadline(listing);
  const savings = getListingSavings(listing);
  const rankLabel = getListingRankLabel(listing);

  return (
    <article className="listing-card">
      <div className="listing-card-image-wrap">
        <img src={listing.image} alt={listing.title} className="listing-card-image" />
        <div className="listing-card-topline">
          <span className="listing-badge hot">타임딜 {deadline}</span>
          <span className="listing-badge">AI 인증</span>
        </div>
      </div>

      <div className="listing-card-body">
        <p className="listing-kicker">{listing.district} · {listing.type} · {listing.urgentReason}</p>
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-location">
          {listing.location} · {listing.floor} · {listing.area}
        </p>

        <div className="listing-score-line">
          <strong>AI 급매 지수 {rankLabel}</strong>
          <span>시세 대비 {formatPercent(listing.discountRate)} 저렴</span>
        </div>

        <div className="listing-price-rail">
          <div className="listing-price-block muted">
            <span>시세</span>
            <strong>{formatCompactPrice(listing.marketPrice)}</strong>
          </div>
          <div className="listing-price-block accent">
            <span>타임딜가</span>
            <strong>{formatCompactPrice(listing.price)}</strong>
          </div>
        </div>

        <p className="listing-price-meta">
          최근 3개월 동일 생활권 평균 대비 {formatPrice(savings)} 저렴
        </p>

        <div className="listing-statline">
          <span>{formatCount(engagement.views)}회 조회</span>
          <span>❤ {formatCount(engagement.likes)}</span>
          <span>{listing.hasReport ? "현장 리포트" : "파트너 상담"}</span>
        </div>

        <div className="listing-tags market">
          <span className="tag">급매 지수 {listing.score}</span>
          <span className="tag">신뢰 점수 {listing.trustScore}</span>
          <span className="tag">{listing.sellerType}</span>
          {listing.hasVideo && <span className="tag">영상 현장</span>}
          {listing.hasReport && <span className="tag">현장 리포트</span>}
        </div>

        <div className="listing-cta-row">
          <Link to={`/listings/${listing.id}`} className="btn btn-dark card-btn">
            리포트 보기
          </Link>
          <Link to={`/listings/${listing.id}`} className="btn btn-outline card-btn secondary">
            상담 신청
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ListingCard;
