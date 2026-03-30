import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";
import { matchesListingFilters, formatDate, formatPrice } from "../utils/marketplace";
import "../styles/alerts.css";

function readInitialForm(searchParams) {
  return {
    name: "",
    district: searchParams.get("district") || "전체",
    type: searchParams.get("type") || "전체",
    keyword: searchParams.get("keyword") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    minDiscount: searchParams.get("minDiscount") || "5",
    hasVideo: false,
  };
}

function Alerts() {
  const [searchParams] = useSearchParams();
  const {
    listings,
    options,
    alertProfiles,
    saveAlertProfile,
    removeAlertProfile,
    isAuthenticated,
  } = useMarketplace();
  const [form, setForm] = useState(() => readInitialForm(searchParams));
  const [feedback, setFeedback] = useState("");

  const previewMatches = useMemo(() => {
    return listings.filter((listing) =>
      matchesListingFilters(listing, {
        ...form,
        approvedOnly: true,
      }),
    );
  }, [form, listings]);

  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await saveAlertProfile(form);
      setFeedback("알림이 저장되었습니다.");
      setForm((current) => ({
        ...current,
        name: "",
        keyword: "",
      }));
    } catch (error) {
      setFeedback(error.message);
    }
  };

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Alert Center</span>
          <h1 className="page-title">조건을 저장해두면 새 급매를 놓치지 않습니다</h1>
          <p className="page-desc">
            검색은 누구나 가능하지만, 알림 저장은 계정에 연결되어야 실제로 이어서 사용할 수
            있습니다.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="container alerts-layout">
          <article className="alerts-card">
            <div className="panel-header">
              <h2>새 알림 만들기</h2>
            </div>

            {!isAuthenticated && (
              <div className="empty-box compact">
                <h3>로그인 후 저장할 수 있습니다</h3>
                <p>아래 조건 미리보기는 가능하고, 저장은 계정 페이지에서 로그인 후 이어집니다.</p>
                <Link to="/account" className="btn btn-primary">
                  로그인하러 가기
                </Link>
              </div>
            )}

            <form className="alerts-form" onSubmit={handleSubmit}>
              <div className="filter-group">
                <label htmlFor="alert-name">알림 이름</label>
                <input
                  id="alert-name"
                  type="text"
                  className="search-input"
                  placeholder="예: 성수 실거주 7억대"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                />
              </div>

              <div className="filter-grid-two">
                <div className="filter-group">
                  <label htmlFor="alert-district">지역</label>
                  <select
                    id="alert-district"
                    className="search-input"
                    value={form.district}
                    onChange={(event) => handleChange("district", event.target.value)}
                  >
                    {options.districtOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="alert-type">유형</label>
                  <select
                    id="alert-type"
                    className="search-input"
                    value={form.type}
                    onChange={(event) => handleChange("type", event.target.value)}
                  >
                    {options.propertyTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter-grid-two">
                <div className="filter-group">
                  <label htmlFor="alert-price">최대 가격</label>
                  <input
                    id="alert-price"
                    type="number"
                    min="0"
                    className="search-input"
                    placeholder="만원 단위"
                    value={form.maxPrice}
                    onChange={(event) => handleChange("maxPrice", event.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="alert-area">최소 면적</label>
                  <input
                    id="alert-area"
                    type="number"
                    min="0"
                    className="search-input"
                    placeholder="㎡"
                    value={form.minArea}
                    onChange={(event) => handleChange("minArea", event.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label htmlFor="alert-keyword">키워드</label>
                <input
                  id="alert-keyword"
                  type="text"
                  className="search-input"
                  placeholder="예: 공덕, 상속 정리, 영상 현장"
                  value={form.keyword}
                  onChange={(event) => handleChange("keyword", event.target.value)}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="alert-discount">최소 할인율</label>
                <input
                  id="alert-discount"
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={form.minDiscount}
                  onChange={(event) => handleChange("minDiscount", event.target.value)}
                />
                <p className="helper-copy">{form.minDiscount}% 이상 급매만 알림</p>
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={form.hasVideo}
                  onChange={(event) => handleChange("hasVideo", event.target.checked)}
                />
                <span>영상 현장 자료가 있는 매물만</span>
              </label>

              <button type="submit" className="btn btn-primary">
                알림 저장하기
              </button>

              {feedback && <p className="success-copy">{feedback}</p>}
            </form>
          </article>

          <div className="alerts-stack">
            <article className="alerts-card">
              <div className="panel-header">
                <h2>현재 조건으로 잡히는 매물</h2>
                <span className="pill accent">{previewMatches.length}건</span>
              </div>

              {previewMatches.length > 0 ? (
                <div className="preview-list">
                  {previewMatches.slice(0, 3).map((listing) => (
                    <Link key={listing.id} to={`/listings/${listing.id}`} className="preview-item">
                      <div>
                        <strong>{listing.title}</strong>
                        <span>
                          {listing.location} · {listing.area}
                        </span>
                      </div>
                      <b>{formatPrice(listing.price)}</b>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="detail-paragraph">
                  아직 맞는 매물이 없지만, 지금 조건을 저장해두면 다음 급매를 잡는 데 유리합니다.
                </p>
              )}
            </article>

            <article className="alerts-card">
              <div className="panel-header">
                <h2>저장된 알림</h2>
                <span className="pill">{alertProfiles.length}개</span>
              </div>

              {alertProfiles.length > 0 ? (
                <div className="saved-alert-list">
                  {alertProfiles.map((alert) => (
                    <article key={alert.id} className="saved-alert-item">
                      <div className="saved-alert-head">
                        <div>
                          <strong>{alert.name}</strong>
                          <span>{formatDate(alert.createdAt)} 저장</span>
                        </div>
                        <button
                          type="button"
                          className="text-button danger"
                          onClick={() => removeAlertProfile(alert.id)}
                        >
                          삭제
                        </button>
                      </div>

                      <div className="saved-alert-meta">
                        <span>{alert.district}</span>
                        <span>{alert.type}</span>
                        <span>{alert.minDiscount}% 이상</span>
                        {alert.maxPrice > 0 && <span>{formatPrice(alert.maxPrice)} 이하</span>}
                      </div>

                      <p className="detail-paragraph">현재 매칭 {alert.matches.length}건</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-box">
                  <h3>아직 저장된 알림이 없습니다</h3>
                  <p>관심 지역과 예산을 저장해두면 새 급매를 바로 포착하기 쉬워집니다.</p>
                </div>
              )}
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Alerts;
