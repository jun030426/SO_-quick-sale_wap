import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function SearchBox() {
  const navigate = useNavigate();
  const { options } = useMarketplace();
  const [district, setDistrict] = useState("전체");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (district && district !== "전체") {
      params.set("district", district);
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
    <form className="search-box search-box-compact" onSubmit={handleSubmit}>
      <input
        id="hero-keyword"
        type="text"
        className="search-input search-keyword-input"
        placeholder="지역 및 단지명 또는 키워드 입력"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <select
        id="hero-district"
        className="search-input compact-filter-input"
        value={district}
        onChange={(event) => setDistrict(event.target.value)}
        aria-label="지역"
      >
        {options.districtOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        id="hero-budget"
        className="search-input compact-filter-input"
        value={maxPrice}
        onChange={(event) => setMaxPrice(event.target.value)}
        aria-label="최대 예산"
      >
        <option value="">예산 전체</option>
        <option value="70000">7억 이하</option>
        <option value="100000">10억 이하</option>
        <option value="150000">15억 이하</option>
        <option value="250000">25억 이하</option>
      </select>

      <select
        id="hero-area"
        className="search-input compact-filter-input"
        value={minArea}
        onChange={(event) => setMinArea(event.target.value)}
        aria-label="최소 면적"
      >
        <option value="">전체 면적</option>
        <option value="59">59㎡ 이상</option>
        <option value="74">74㎡ 이상</option>
        <option value="84">84㎡ 이상</option>
        <option value="101">101㎡ 이상</option>
      </select>

      <button type="submit" className="btn btn-primary search-submit compact-submit">
        검색
      </button>

      <Link to="/alerts" className="btn btn-outline compact-link-btn">
        알림 설정
      </Link>
    </form>
  );
}

export default SearchBox;
