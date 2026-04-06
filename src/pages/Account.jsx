import { Link, Navigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";
import { formatDate } from "../utils/marketplace";
import "../styles/account.css";

function Account() {
  const {
    user,
    inquiries,
    submissions,
    backendLabel,
    isAuthenticated,
    logout,
  } = useMarketplace();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">내 계정</span>
          <h1 className="page-title">아파트 급매 흐름을 계정으로 계속 이어가세요</h1>
          <p className="page-desc">
            이제 알림, 매도 등록, 문의 기록이 브라우저 임시 상태가 아니라 계정 단위로 유지됩니다.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="container account-layout">
          <article className="account-card">
            <div className="panel-header">
              <h2>내 계정</h2>
            </div>
            <div className="profile-block">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span>{user.role === "admin" ? "운영 관리자" : "일반 사용자"}</span>
              <span>{backendLabel}</span>
            </div>
            <div className="account-actions">
              <Link to="/alerts" className="btn btn-outline">
                알림 관리
              </Link>
              <Link to="/sell" className="btn btn-primary">
                아파트 매도 등록
              </Link>
              <button type="button" className="btn btn-outline" onClick={logout}>
                로그아웃
              </button>
            </div>
          </article>

          <article className="account-card">
            <div className="panel-header">
              <h2>최근 문의</h2>
            </div>
            {inquiries.length > 0 ? (
              <div className="history-list">
                {inquiries.slice(0, 5).map((item) => (
                  <article key={item.id} className="history-item">
                    <div>
                      <strong>{item.listingTitle}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <p>{item.message}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-box compact">
                <h3>아직 문의한 매물이 없습니다</h3>
                <p>상세 페이지에서 파트너 중개사 연결 문의를 남길 수 있습니다.</p>
              </div>
            )}
          </article>

          <article className="account-card">
            <div className="panel-header">
              <h2>최근 매도 등록</h2>
            </div>
            {submissions.length > 0 ? (
              <div className="history-list">
                {submissions.slice(0, 5).map((item) => (
                  <article key={item.id} className="history-item">
                    <div>
                      <strong>{item.listing.title}</strong>
                      <span>{formatDate(item.submittedAt)}</span>
                    </div>
                    <b className={item.approved ? "tone-success" : "tone-danger"}>
                      {item.approved ? "승인" : "보완 필요"}
                    </b>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-box compact">
                <h3>아직 등록한 매물이 없습니다</h3>
                <p>매도 등록 페이지에서 실제 심사와 저장이 가능합니다.</p>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}

export default Account;
