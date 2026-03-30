import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function SearchBox() {
  const navigate = useNavigate();
  const { options } = useMarketplace();
  const [district, setDistrict] = useState("전체");
  const [type, setType] = useState("전체");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (district && district !== "전체") {
      params.set("district", district);
    }

    if (type && type !== "전체") {
      params.set("type", type);
    }

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    }

    if (minArea) {
      params.set("minArea", minArea);
    }

    params.set("approvedOnly", "true");

    navigate(`/listings?${params.toString()}`);
  };

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <div className="search-row">
        <div className="field">
          <label htmlFor="hero-district">지역</label>
          <select
            id="hero-district"
            className="search-input"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
          >
            {options.districtOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="hero-type">유형</label>
          <select
            id="hero-type"
            className="search-input"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {options.propertyTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-row">
        <div className="field">
          <label htmlFor="hero-budget">최대 예산</label>
          <select
            id="hero-budget"
            className="search-input"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          >
            <option value="">예산 전체</option>
            <option value="70000">7억 이하</option>
            <option value="100000">10억 이하</option>
            <option value="150000">15억 이하</option>
            <option value="250000">25억 이하</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="hero-area">최소 면적</label>
          <select
            id="hero-area"
            className="search-input"
            value={minArea}
            onChange={(event) => setMinArea(event.target.value)}
          >
            <option value="">전체 면적</option>
            <option value="59">59㎡ 이하</option>
            <option value="60">60㎡ 이상</option>
            <option value="85">85㎡ 이상</option>
            <option value="116">116㎡ 이상</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="hero-keyword">키워드</label>
        <input
          id="hero-keyword"
          type="text"
          className="search-input"
          placeholder="예: 공덕, 성수, 대출 만기"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <div className="search-actions">
        <Link to="/alerts" className="btn btn-outline">
          급매 알림 설정하기
        </Link>
        <button type="submit" className="btn btn-primary search-submit">
          급매 지도 보기
        </button>
      </div>
    </form>
  );
}

export default SearchBox;
