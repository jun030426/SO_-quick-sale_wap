import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/listings.css";
import listings from "../data/listings";
import ListingCard from "../components/ListingCard";

function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialRegion = searchParams.get("region") || "전체";
  const initialKeyword = searchParams.get("keyword") || "";

  const [region, setRegion] = useState(initialRegion);
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    const params = {};

    if (region) {
      params.region = region;
    }

    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    setSearchParams(params);
  }, [region, keyword, setSearchParams]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const regionMatch = region === "전체" || item.district === region;
      const keywordMatch =
        keyword.trim() === "" ||
        item.title.includes(keyword) ||
        item.location.includes(keyword) ||
        item.area.includes(keyword) ||
        item.type.includes(keyword);

      return regionMatch && keywordMatch;
    });
  }, [region, keyword]);

  return (
    <div className="listings-page">
      <section className="listings-hero">
        <div className="container">
          <p className="section-label">급매 매물 탐색</p>
          <h1 className="page-title">데이터 기준으로 선별한 급매 매물</h1>
          <p className="page-desc">
            지역과 키워드 조건으로 원하는 매물을 빠르게 찾아볼 수 있습니다.
          </p>
        </div>
      </section>

      <section className="listings-filter-section">
        <div className="container">
          <div className="filter-box">
            <div className="filter-row">
              <select
                className="search-input"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="전체">전체 지역</option>
                <option value="서울">서울</option>
                <option value="경기">경기</option>
                <option value="인천">인천</option>
              </select>

              <input
                type="text"
                className="search-input"
                placeholder="지역, 평형, 타입 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <p className="result-count">검색 결과 {filteredListings.length}건</p>
          </div>
        </div>
      </section>

      <section className="listings-result-section">
        <div className="container">
          {filteredListings.length > 0 ? (
            <div className="listing-grid">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="empty-box">
              <h3>조건에 맞는 매물이 없습니다</h3>
              <p>다른 지역이나 키워드로 다시 검색해보세요.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Listings;