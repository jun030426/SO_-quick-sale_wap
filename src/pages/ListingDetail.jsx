import { Link, useParams } from "react-router-dom";
import "../styles/detail.css";
import listings from "../data/listings";

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

function ListingDetail() {
  const { id } = useParams();
  const listing = listings.find((item) => String(item.id) === id);

  if (!listing) {
    return (
      <div className="container detail-page">
        <div className="empty-box">
          <h2>매물을 찾을 수 없습니다</h2>
          <Link to="/listings" className="btn btn-primary">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">홈</Link> <span>/</span>
          <Link to="/listings">급매 매물</Link> <span>/</span>
          <span>{listing.title}</span>
        </div>

        <div className="detail-top">
          <div className="detail-image-wrap">
            <img src={listing.image} alt={listing.title} className="detail-image" />
          </div>

          <div className="detail-summary">
            <span className="detail-badge">AI 검증 급매</span>
            <h1 className="detail-title">{listing.title}</h1>
            <p className="detail-location">{listing.location}</p>
            <p className="detail-price">{formatPrice(listing.price)}</p>
            <p className="detail-sub-price">
              비교 기준가 {formatPrice(listing.originalPrice)} · 시세 대비 {listing.discountRate}% 저렴
            </p>

            <div className="detail-score-box">
              <div className="score-card">
                <strong>{listing.score}점</strong>
                <span>급매지수</span>
              </div>
              <div className="score-card">
                <strong>{listing.hasVideo ? "있음" : "없음"}</strong>
                <span>영상 임장</span>
              </div>
              <div className="score-card">
                <strong>{listing.hasReport ? "제공" : "기본"}</strong>
                <span>신뢰 리포트</span>
              </div>
            </div>

            <div className="detail-actions">
              <button className="btn btn-primary">문의하기</button>
              <button className="btn btn-outline">알림 설정</button>
            </div>
          </div>
        </div>

        <div className="detail-content-grid">
          <section className="detail-section">
            <h2>매물 설명</h2>
            <p>{listing.description}</p>
          </section>

          <section className="detail-section">
            <h2>기본 정보</h2>
            <ul className="info-list">
              <li>
                <span>유형</span>
                <strong>{listing.type}</strong>
              </li>
              <li>
                <span>면적</span>
                <strong>{listing.area}</strong>
              </li>
              <li>
                <span>층수</span>
                <strong>{listing.floor}</strong>
              </li>
              <li>
                <span>준공연도</span>
                <strong>{listing.builtYear}</strong>
              </li>
            </ul>
          </section>

          <section className="detail-section">
            <h2>급매 판단 기준</h2>
            <ul className="point-list">
              <li>최근 90일 실거래 평균과 비교</li>
              <li>동일 생활권 등록 매물과 비교</li>
              <li>영상 및 현장 리포트 여부 반영</li>
            </ul>
          </section>

          <section className="detail-section">
            <h2>MVP 안내</h2>
            <p>
              현재 화면은 급매 서비스의 핵심 경험을 보여주는 예시입니다.
              이후 실거래 데이터 API, 찜 기능, 푸시 알림, 중개사 등록 기능 등을
              확장할 수 있습니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;