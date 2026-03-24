import { Link } from "react-router-dom";

function formatPrice(value) {
  const eok = Math.floor(value / 10000);
  const man = value % 10000;

  if (eok > 0 && man > 0) {
    return `${eok}억 ${man.toLocaleString()}만 원`;
  }

  if (eok > 0) {
    return `${eok}억 원`;
  }

  return `${value.toLocaleString()}만 원`;
}

function ListingCard({ listing }) {
  return (
    <article className="listing-card">
      <div className="listing-card-image-wrap">
        <img
          src={listing.image}
          alt={listing.title}
          className="listing-card-image"
        />
        <span className="listing-badge">AI 검증</span>
      </div>

      <div className="listing-card-body">
        <p className="listing-location">{listing.location}</p>
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-price">{formatPrice(listing.price)}</p>

        <div className="listing-meta">
          <span>급매지수 {listing.score}점</span>
          <span>시세 대비 {listing.discountRate}%↓</span>
        </div>

        <div className="listing-tags">
          <span className="tag">{listing.area}</span>
          <span className="tag">{listing.type}</span>
          {listing.hasVideo && <span className="tag">영상 있음</span>}
          {listing.hasReport && <span className="tag">리포트 제공</span>}
        </div>

        <Link to={`/listings/${listing.id}`} className="btn btn-dark card-btn">
          상세 보기
        </Link>
      </div>
    </article>
  );
}

export default ListingCard;