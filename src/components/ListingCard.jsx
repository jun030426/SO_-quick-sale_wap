import { Link } from "react-router-dom";
import { formatPercent, formatPrice } from "../utils/marketplace";

function ListingCard({ listing }) {
  return (
    <article className="listing-card">
      <div className="listing-card-image-wrap">
        <img src={listing.image} alt={listing.title} className="listing-card-image" />
        <div className="listing-card-topline">
          <span className="listing-badge">AI 검증 완료</span>
          <span className="listing-badge muted">{listing.urgentReason}</span>
        </div>
      </div>

      <div className="listing-card-body">
        <p className="listing-location">
          {listing.location} · {listing.type}
        </p>
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-price">{formatPrice(listing.price)}</p>
        <p className="listing-price-meta">
          실거래 평균 {formatPrice(listing.marketPrice)} 대비 {formatPercent(listing.discountRate)} 할인
        </p>

        <div className="listing-meta">
          <span>급매 지수 {listing.score}</span>
          <span>신뢰 점수 {listing.trustScore}</span>
          <span>{listing.area}</span>
        </div>

        <div className="listing-tags">
          <span className="tag">{listing.sellerType}</span>
          {listing.hasVideo && <span className="tag">영상 현장</span>}
          {listing.hasReport && <span className="tag">현장 리포트</span>}
        </div>

        <Link to={`/listings/${listing.id}`} className="btn btn-dark card-btn">
          검증 근거 보기
        </Link>
      </div>
    </article>
  );
}

export default ListingCard;
