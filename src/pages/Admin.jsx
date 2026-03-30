import { useEffect, useState } from "react";
import { useMarketplace } from "../context/MarketplaceContext";
import { formatDate, formatPrice } from "../utils/marketplace";
import "../styles/admin.css";

function Admin() {
  const { isAdmin, adminOverview, refreshAdminOverview, isBootstrapping } = useMarketplace();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    refreshAdminOverview().catch((currentError) => {
      setError(currentError.message);
    });
  }, [isAdmin]);

  if (isBootstrapping) {
    return (
      <div className="container page-shell">
        <div className="empty-box">
          <h2>운영 데이터를 불러오는 중입니다</h2>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container page-shell">
        <div className="empty-box">
          <h2>관리자 전용 페이지입니다</h2>
          <p>관리자 계정으로 로그인하면 제출된 매도 등록과 문의 내역을 볼 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Admin</span>
          <h1 className="page-title">운영 대시보드</h1>
          <p className="page-desc">
            등록 심사와 사용자 문의를 한 화면에서 확인할 수 있는 운영용 페이지입니다.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="container admin-layout">
          {error && (
            <div className="empty-box compact">
              <p>{error}</p>
            </div>
          )}

          {adminOverview && (
            <>
              <div className="admin-metrics">
                <article className="metric-card">
                  <strong>{adminOverview.stats.listingsCount}</strong>
                  <span>공개 매물</span>
                </article>
                <article className="metric-card">
                  <strong>{adminOverview.stats.usersCount}</strong>
                  <span>가입 사용자</span>
                </article>
                <article className="metric-card">
                  <strong>{adminOverview.stats.alertsCount}</strong>
                  <span>저장된 알림</span>
                </article>
                <article className="metric-card">
                  <strong>{adminOverview.stats.inquiriesCount}</strong>
                  <span>누적 문의</span>
                </article>
              </div>

              <article className="admin-card">
                <div className="panel-header">
                  <h2>최근 매도 등록 심사</h2>
                </div>
                <div className="admin-list">
                  {adminOverview.submissions.map((item) => (
                    <article key={item.id} className="admin-list-item">
                      <div>
                        <strong>{item.title}</strong>
                        <span>
                          {item.userName} · {item.userEmail}
                        </span>
                        <span>
                          {item.district} · {formatPrice(item.price)} · {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <b className={item.approved ? "tone-success" : "tone-danger"}>
                        {item.approved ? "승인" : "보완"}
                      </b>
                    </article>
                  ))}
                </div>
              </article>

              <article className="admin-card">
                <div className="panel-header">
                  <h2>최근 사용자 문의</h2>
                </div>
                <div className="admin-list">
                  {adminOverview.inquiries.map((item) => (
                    <article key={item.id} className="admin-list-item">
                      <div>
                        <strong>{item.listingTitle}</strong>
                        <span>
                          {item.userName} · {item.userEmail}
                        </span>
                        <p>{item.message}</p>
                      </div>
                      <span>{formatDate(item.createdAt)}</span>
                    </article>
                  ))}
                </div>
              </article>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Admin;
