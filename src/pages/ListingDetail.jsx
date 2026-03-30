import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { useMarketplace } from "../context/MarketplaceContext";
import { formatPercent, formatPrice } from "../utils/marketplace";
import "../styles/detail.css";

function ListingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { listings, createInquiry, isAuthenticated } = useMarketplace();
  const [requestedMatch, setRequestedMatch] = useState(false);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const listing = listings.find((item) => item.id === id);

  const relatedListings = useMemo(() => {
    if (!listing) {
      return [];
    }

    return listings
      .filter((item) => item.id !== listing.id && item.district === listing.district)
      .slice(0, 3);
  }, [listing, listings]);

  const handleInquirySubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await createInquiry({
        listingId: listing.id,
        message,
      });
      setMessage("");
      setFeedback("문의가 접수되었습니다. 계정 페이지에서도 다시 확인할 수 있습니다.");
    } catch (error) {
      setFeedback(error.message);
    }
  };

  if (!listing) {
    return (
      <div className="container detail-page">
        <div className="empty-box">
          <h2>매물을 찾을 수 없습니다</h2>
          <p>삭제되었거나 아직 공개되지 않은 매물일 수 있습니다.</p>
          <Link to="/listings" className="btn btn-primary">
            급매 지도로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const broker = listing.partnerBroker;

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">홈</Link>
          <span>/</span>
          <Link to="/listings">급매 지도</Link>
          <span>/</span>
          <span>{listing.title}</span>
        </div>

        <section className="detail-hero">
          <div className="detail-visual">
            <img src={listing.image} alt={listing.title} className="detail-image" />
            <div className="detail-visual-chip">
              <strong>AI 검증 통과</strong>
              <span>등록 전 기준 충족 매물</span>
            </div>
          </div>

          <div className="detail-summary">
            <div className="detail-badges">
              <span className="pill accent">급매 지수 {listing.score}</span>
              <span className="pill">{listing.urgentReason}</span>
              {listing.hasVideo && <span className="pill">영상 현장</span>}
              {listing.hasReport && <span className="pill">현장 리포트</span>}
            </div>

            <h1>{listing.title}</h1>
            <p className="summary-location">
              {listing.location} · {listing.area} · {listing.floor}
            </p>

            <p className="summary-price">{formatPrice(listing.price)}</p>
            <p className="summary-subline">
              최근 3개월 실거래 평균 {formatPrice(listing.marketPrice)} 대비{" "}
              {formatPercent(listing.discountRate)} 저렴
            </p>

            <div className="score-grid">
              <article>
                <strong>{listing.priceScore}</strong>
                <span>가격 경쟁력</span>
              </article>
              <article>
                <strong>{listing.trustScore}</strong>
                <span>신뢰 점수</span>
              </article>
              <article>
                <strong>{listing.liquidityScore}</strong>
                <span>거래 속도</span>
              </article>
            </div>

            <div className="detail-actions">
              <button type="button" className="btn btn-primary" onClick={() => setRequestedMatch(true)}>
                파트너 중개사 정보 보기
              </button>
              <Link
                to={`/alerts?district=${encodeURIComponent(listing.district)}&type=${encodeURIComponent(
                  listing.type,
                )}&maxPrice=${listing.price}&minArea=${listing.areaValue}&minDiscount=5`}
                className="btn btn-outline"
              >
                비슷한 급매 알림 만들기
              </Link>
            </div>

            {requestedMatch && (
              <div className="match-box">
                <strong>{broker.name}</strong>
                <p>
                  {broker.intro} 평균 응답 시간은 {broker.responseTime}, 유사 거래 경험은{" "}
                  {broker.deals}건입니다.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="detail-grid">
          <article className="detail-card detail-card-wide">
            <h2>AI 검증 근거</h2>
            <div className="comparison-table">
              <div>
                <span>현재 등록가</span>
                <strong>{formatPrice(listing.price)}</strong>
              </div>
              <div>
                <span>최근 3개월 실거래 평균</span>
                <strong>{formatPrice(listing.recentDealPrice)}</strong>
              </div>
              <div>
                <span>동일 생활권 등록 평균</span>
                <strong>{formatPrice(listing.listingAverage)}</strong>
              </div>
              <div>
                <span>급매 할인율</span>
                <strong>{formatPercent(listing.discountRate)}</strong>
              </div>
            </div>

            <ul className="plain-list">
              {listing.verificationSummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="detail-card">
            <h2>매도 사유</h2>
            <p className="detail-paragraph">
              {listing.urgentReason} 이슈로 빠른 거래가 필요한 {listing.sellerType} 매물입니다.
            </p>
          </article>

          <article className="detail-card">
            <h2>생활·교통 포인트</h2>
            <ul className="plain-list">
              {listing.transit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="detail-card">
            <h2>파트너 중개사</h2>
            <p className="detail-paragraph broker-name">{broker.name}</p>
            <p className="detail-paragraph">{broker.intro}</p>
            <ul className="plain-list">
              <li>평균 응답 시간: {broker.responseTime}</li>
              <li>유사 급매 거래 경험: {broker.deals}건</li>
              <li>대표 연락처: {broker.phone}</li>
            </ul>
          </article>

          <article className="detail-card detail-card-wide">
            <h2>매물 설명</h2>
            <p className="detail-paragraph">{listing.description}</p>
            <div className="detail-columns">
              <div>
                <h3>강점</h3>
                <ul className="plain-list">
                  {listing.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>체크 포인트</h3>
                <ul className="plain-list">
                  {listing.risks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <article className="detail-card detail-card-wide">
            <h2>매물 문의</h2>
            <form className="detail-inquiry-form" onSubmit={handleInquirySubmit}>
              <textarea
                className="search-input text-area"
                placeholder={
                  isAuthenticated
                    ? "궁금한 점이나 방문 희망 일정을 남겨주세요."
                    : "로그인 후 문의를 남길 수 있습니다."
                }
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                {isAuthenticated ? "문의 보내기" : "로그인하러 가기"}
              </button>
            </form>
            {feedback && <p className="detail-feedback">{feedback}</p>}
          </article>
        </section>

        {relatedListings.length > 0 && (
          <section className="related-section">
            <div className="section-heading">
              <span className="eyebrow">{listing.district} 추천</span>
              <h2>같은 권역의 다른 급매</h2>
            </div>

            <div className="listing-grid">
              {relatedListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ListingDetail;
