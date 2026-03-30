import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function SearchBox() {
  const navigate = useNavigate();
  const { options } = useMarketplace();
  const [district, setDistrict] = useState("전체");
  const [type, setType] = useState("전체");
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

      <div className="field">
        <label htmlFor="hero-keyword">키워드</label>
        <input
          id="hero-keyword"
          type="text"
          className="search-input"
          placeholder="예: 공덕 84㎡, 성수 리모델링"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-primary search-submit">
        AI 검증 매물 찾기
      </button>
    </form>
  );
}

export default SearchBox;
