import { startTransition, useDeferredValue, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { useMarketplace } from "../context/MarketplaceContext";
import { matchesListingFilters, sortListings } from "../utils/marketplace";
import "../styles/listings.css";

function parseBoolean(value) {
  return value === "true";
}

function readFilters(searchParams) {
  return {
    district: searchParams.get("district") || "전체",
    type: searchParams.get("type") || "전체",
    keyword: searchParams.get("keyword") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minDiscount: searchParams.get("minDiscount") || "5",
    minArea: searchParams.get("minArea") || "",
    hasVideo: parseBoolean(searchParams.get("hasVideo")),
    hasReport: parseBoolean(searchParams.get("hasReport")),
    approvedOnly: searchParams.get("approvedOnly") !== "false",
    sort: searchParams.get("sort") || "recommended",
  };
}

function buildSearchParams(filters) {
  const params = new URLSearchParams();

  if (filters.district && filters.district !== "전체") {
    params.set("district", filters.district);
  }

  if (filters.type && filters.type !== "전체") {
    params.set("type", filters.type);
  }

  if (filters.keyword.trim()) {
    params.set("keyword", filters.keyword.trim());
  }

  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice);
  }

  if (filters.minDiscount) {
    params.set("minDiscount", filters.minDiscount);
  }

  if (filters.minArea) {
    params.set("minArea", filters.minArea);
  }

  if (filters.hasVideo) {
    params.set("hasVideo", "true");
  }

  if (filters.hasReport) {
    params.set("hasReport", "true");
  }

  if (filters.approvedOnly === false) {
    params.set("approvedOnly", "false");
  }

  if (filters.sort && filters.sort !== "recommended") {
    params.set("sort", filters.sort);
  }

  return params;
}

function Listings() {
  const { listings, options } = useMarketplace();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const deferredKeyword = useDeferredValue(filters.keyword);

  const filteredListings = useMemo(() => {
    const matched = listings.filter((listing) =>
      matchesListingFilters(listing, {
        ...filters,
        keyword: deferredKeyword,
      }),
    );

    return sortListings(matched, filters.sort);
  }, [deferredKeyword, filters, listings]);

  const updateFilters = (updates) => {
    const nextFilters = {
      ...filters,
      ...updates,
    };

    startTransition(() => {
      setSearchParams(buildSearchParams(nextFilters), { replace: true });
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      setSearchParams(buildSearchParams(readFilters(new URLSearchParams())), { replace: true });
    });
  };

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Verified Search</span>
          <h1 className="page-title">조건에 맞는 검증 매물만 빠르게 찾으세요</h1>
          <p className="page-desc">
            검색은 공개 데이터로 누구나 가능하고, 로그인 후에는 이 조건을 알림으로 저장할 수
            있습니다.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="container listings-layout">
          <aside className="filter-panel">
            <div className="panel-header">
              <h2>검색 필터</h2>
              <button type="button" className="text-button" onClick={resetFilters}>
                초기화
              </button>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-district">지역</label>
              <select
                id="filter-district"
                className="search-input"
                value={filters.district}
                onChange={(event) => updateFilters({ district: event.target.value })}
              >
                {options.districtOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-type">유형</label>
              <select
                id="filter-type"
                className="search-input"
                value={filters.type}
                onChange={(event) => updateFilters({ type: event.target.value })}
              >
                {options.propertyTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-keyword">키워드</label>
              <input
                id="filter-keyword"
                type="text"
                className="search-input"
                placeholder="예: 성수, 리모델링, 대출 만기"
                value={filters.keyword}
                onChange={(event) => updateFilters({ keyword: event.target.value })}
              />
            </div>

            <div className="filter-grid-two">
              <div className="filter-group">
                <label htmlFor="filter-price">최대 가격</label>
                <input
                  id="filter-price"
                  type="number"
                  min="0"
                  className="search-input"
                  placeholder="만원 단위"
                  value={filters.maxPrice}
                  onChange={(event) => updateFilters({ maxPrice: event.target.value })}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="filter-area">최소 면적</label>
                <input
                  id="filter-area"
                  type="number"
                  min="0"
                  className="search-input"
                  placeholder="㎡"
                  value={filters.minArea}
                  onChange={(event) => updateFilters({ minArea: event.target.value })}
                />
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-discount">최소 할인율</label>
              <input
                id="filter-discount"
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={filters.minDiscount}
                onChange={(event) => updateFilters({ minDiscount: event.target.value })}
              />
              <p className="helper-copy">{filters.minDiscount}% 이상만 보기</p>
            </div>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={filters.hasVideo}
                onChange={(event) => updateFilters({ hasVideo: event.target.checked })}
              />
              <span>영상 현장 자료 포함</span>
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={filters.hasReport}
                onChange={(event) => updateFilters({ hasReport: event.target.checked })}
              />
              <span>현장 리포트 포함</span>
            </label>
          </aside>

          <div className="results-panel">
            <div className="results-toolbar">
              <div>
                <p className="results-count">검색 결과 {filteredListings.length}건</p>
                <p className="results-copy">
                  가격 경쟁력, 신뢰 점수, 매도 사유를 함께 보고 판단할 수 있습니다.
                </p>
              </div>

              <div className="toolbar-select">
                <label htmlFor="filter-sort">정렬</label>
                <select
                  id="filter-sort"
                  className="search-input"
                  value={filters.sort}
                  onChange={(event) => updateFilters({ sort: event.target.value })}
                >
                  <option value="recommended">추천순</option>
                  <option value="discount">할인율순</option>
                  <option value="price-low">가격 낮은순</option>
                  <option value="newest">최신 등록순</option>
                </select>
              </div>
            </div>

            {filteredListings.length > 0 ? (
              <div className="listing-grid">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <h2>조건에 맞는 급매가 아직 없습니다</h2>
                <p>조건을 조금 완화하거나, 알림 센터에서 저장해두면 새 매물이 뜰 때 바로 볼 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Listings;
