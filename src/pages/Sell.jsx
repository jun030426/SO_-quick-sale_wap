import { useState } from "react";
import { Link } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";
import { formatDate, formatPercent, formatPrice } from "../utils/marketplace";
import "../styles/sell.css";

function createInitialForm(options) {
  return {
    requesterType: "seller",
    title: "",
    district: options.districtOptions.find((item) => item !== "전체") || "서울",
    location: "",
    type: options.propertyTypes.find((item) => item !== "전체") || "아파트",
    price: "",
    marketPrice: "",
    areaValue: "",
    floor: "",
    builtYear: "",
    urgentReason: options.urgentReasonOptions[0] || "양도세 일정 대응",
    description: "",
    image: "",
    hasVideo: true,
    hasReport: false,
  };
}

function Sell() {
  const { submitListing, submissions, options, isAuthenticated } = useMarketplace();
  const [form, setForm] = useState(() => createInitialForm(options));
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState("");

  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const evaluation = await submitListing(form);
      setResult(evaluation);
      setFeedback(
        evaluation.approved
          ? "심사가 완료되어 공개 매물 목록에 반영되었습니다."
          : "심사는 저장되었고, 보완이 필요한 항목이 함께 기록되었습니다.",
      );
    } catch (error) {
      setFeedback(error.message);
    }
  };

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">매도 등록</span>
          <h1 className="page-title">매도 등록 단계에서 바로 급매 여부를 심사합니다</h1>
          <p className="page-desc">
            로그인한 사용자는 등록 심사 결과와 승인 이력을 계정에 남길 수 있습니다.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="container sell-layout">
          <article className="sell-card">
            <div className="panel-header">
              <h2>급매 등록 신청</h2>
            </div>

            {!isAuthenticated && (
              <div className="empty-box compact">
                <h3>로그인 후 등록할 수 있습니다</h3>
                <p>실제 저장과 이력 관리는 계정이 필요합니다.</p>
                <Link to="/account" className="btn btn-primary">
                  로그인하러 가기
                </Link>
              </div>
            )}

            <form className="sell-form" onSubmit={handleSubmit}>
              <div className="filter-group">
                <label htmlFor="requester-type">등록 주체</label>
                <select
                  id="requester-type"
                  className="search-input"
                  value={form.requesterType}
                  onChange={(event) => handleChange("requesterType", event.target.value)}
                >
                  <option value="seller">매도인</option>
                  <option value="broker">파트너 중개사</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="sell-title">매물 제목</label>
                <input
                  id="sell-title"
                  type="text"
                  className="search-input"
                  placeholder="예: 성수동 올수리 74㎡"
                  value={form.title}
                  onChange={(event) => handleChange("title", event.target.value)}
                />
              </div>

              <div className="filter-grid-two">
                <div className="filter-group">
                  <label htmlFor="sell-district">광역 권역</label>
                  <select
                    id="sell-district"
                    className="search-input"
                    value={form.district}
                    onChange={(event) => handleChange("district", event.target.value)}
                  >
                    {options.districtOptions
                      .filter((item) => item !== "전체")
                      .map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="sell-type">유형</label>
                  <select
                    id="sell-type"
                    className="search-input"
                    value={form.type}
                    onChange={(event) => handleChange("type", event.target.value)}
                  >
                    {options.propertyTypes
                      .filter((item) => item !== "전체")
                      .map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="filter-group">
                <label htmlFor="sell-location">상세 위치</label>
                <input
                  id="sell-location"
                  type="text"
                  className="search-input"
                  placeholder="예: 서울 성동구 성수동"
                  value={form.location}
                  onChange={(event) => handleChange("location", event.target.value)}
                />
              </div>

              <div className="filter-grid-two">
                <div className="filter-group">
                  <label htmlFor="sell-price">현재 등록가</label>
                  <input
                    id="sell-price"
                    type="number"
                    min="0"
                    className="search-input"
                    placeholder="만원 단위"
                    value={form.price}
                    onChange={(event) => handleChange("price", event.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="sell-market-price">최근 3개월 평균 시세</label>
                  <input
                    id="sell-market-price"
                    type="number"
                    min="0"
                    className="search-input"
                    placeholder="만원 단위"
                    value={form.marketPrice}
                    onChange={(event) => handleChange("marketPrice", event.target.value)}
                  />
                </div>
              </div>

              <div className="filter-grid-two">
                <div className="filter-group">
                  <label htmlFor="sell-area">면적</label>
                  <input
                    id="sell-area"
                    type="number"
                    min="0"
                    className="search-input"
                    placeholder="㎡"
                    value={form.areaValue}
                    onChange={(event) => handleChange("areaValue", event.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="sell-floor">층수</label>
                  <input
                    id="sell-floor"
                    type="text"
                    className="search-input"
                    placeholder="예: 8층 / 20층"
                    value={form.floor}
                    onChange={(event) => handleChange("floor", event.target.value)}
                  />
                </div>
              </div>

              <div className="filter-grid-two">
                <div className="filter-group">
                  <label htmlFor="sell-year">준공 연도</label>
                  <input
                    id="sell-year"
                    type="number"
                    min="1900"
                    max="2100"
                    className="search-input"
                    placeholder="예: 2018"
                    value={form.builtYear}
                    onChange={(event) => handleChange("builtYear", event.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="sell-reason">급매 사유</label>
                  <select
                    id="sell-reason"
                    className="search-input"
                    value={form.urgentReason}
                    onChange={(event) => handleChange("urgentReason", event.target.value)}
                  >
                    {options.urgentReasonOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter-group">
                <label htmlFor="sell-image">대표 이미지 URL</label>
                <input
                  id="sell-image"
                  type="text"
                  className="search-input"
                  placeholder="없으면 기본 이미지 사용"
                  value={form.image}
                  onChange={(event) => handleChange("image", event.target.value)}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="sell-description">설명</label>
                <textarea
                  id="sell-description"
                  className="search-input text-area"
                  placeholder="매도 사정, 내부 상태, 빠른 거래 가능 여부 등을 적어주세요."
                  value={form.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                />
              </div>

              <div className="checkbox-row">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={form.hasVideo}
                    onChange={(event) => handleChange("hasVideo", event.target.checked)}
                  />
                  <span>영상 현장 자료 있음</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={form.hasReport}
                    onChange={(event) => handleChange("hasReport", event.target.checked)}
                  />
                  <span>현장 리포트 있음</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary">
                AI 심사 실행
              </button>

              {feedback && <p className="success-copy">{feedback}</p>}
            </form>
          </article>

          <div className="sell-stack">
            <article className="sell-card">
              <div className="panel-header">
                <h2>심사 기준</h2>
              </div>

              <ul className="plain-list">
                <li>최근 3개월 실거래 평균 대비 5% 이상 할인</li>
                <li>동일 생활권 등록 평균과 교차 비교</li>
                <li>영상 현장과 리포트 유무를 신뢰 점수에 반영</li>
              </ul>
            </article>

            <article className={`sell-card ${result ? (result.approved ? "approved" : "rejected") : ""}`}>
              <div className="panel-header">
                <h2>심사 결과</h2>
              </div>

              {result ? (
                <div className="result-body">
                  <p className="result-status">{result.approved ? "승인 완료" : "보완 필요"}</p>
                  <p className="detail-paragraph">
                    현재 입력 기준 등록가는 {formatPrice(result.listing.price)}이고, 급매 할인율은{" "}
                    {formatPercent(result.listing.discountRate)}입니다.
                  </p>

                  {result.blockers.length > 0 ? (
                    <ul className="plain-list">
                      {result.blockers.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="plain-list">
                      {result.recommendations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {result.approved && (
                    <Link to={`/listings/${result.listing.id}`} className="btn btn-dark">
                      승인된 매물 보기
                    </Link>
                  )}
                </div>
              ) : (
                <p className="detail-paragraph">
                  등록 전 심사를 실행하면 결과가 계정 이력에 저장되고, 승인된 경우 바로 목록에
                  반영됩니다.
                </p>
              )}
            </article>

            <article className="sell-card">
              <div className="panel-header">
                <h2>최근 심사 이력</h2>
              </div>

              {submissions.length > 0 ? (
                <div className="history-list">
                  {submissions.slice(0, 4).map((item) => (
                    <article key={item.id} className="history-item">
                      <div>
                        <strong>{item.listing.title}</strong>
                        <span>{formatDate(item.submittedAt)}</span>
                      </div>
                      <b className={item.approved ? "tone-success" : "tone-danger"}>
                        {item.approved ? "승인" : "보완"}
                      </b>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-box compact">
                  <h3>아직 심사 이력이 없습니다</h3>
                  <p>첫 등록을 실행하면 최근 결과가 이 영역에 표시됩니다.</p>
                </div>
              )}
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Sell;
