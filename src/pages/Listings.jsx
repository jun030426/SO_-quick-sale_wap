import { startTransition, useDeferredValue, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { useMarketplace } from "../context/MarketplaceContext";
import {
  formatCount,
  formatPercent,
  formatPrice,
  matchesListingFilters,
  sortListings,
} from "../utils/marketplace";
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
  const { listings, options, stats } = useMarketplace();
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

  const districtBoards = useMemo(() => {
    return options.districtOptions
      .filter((district) => district !== "전체")
      .map((district) => {
        const districtListings = filteredListings.filter((listing) => listing.district === district);
        const fallbackTop = listings.find((listing) => listing.district === district) ?? null;
        const topListing = districtListings[0] ?? fallbackTop;
        const averageDiscount =
          districtListings.length > 0
            ? Number(
                (
                  districtListings.reduce((total, listing) => total + listing.discountRate, 0) /
                  districtListings.length
                ).toFixed(1),
              )
            : 0;

        return {
          district,
          count: districtListings.length,
          averageDiscount,
          topListing,
        };
      })
      .sort((left, right) => right.count - left.count || right.averageDiscount - left.averageDiscount);
  }, [filteredListings, listings, options.districtOptions]);

  const activeDistrict =
    filters.district !== "전체"
      ? filters.district
      : districtBoards.find((item) => item.count > 0)?.district || districtBoards[0]?.district || "서울";

  const spotlightListings = filteredListings
    .filter((listing) => listing.district === activeDistrict)
    .slice(0, 3);

  const highestDiscount =
    filteredListings.length > 0 ? Math.max(...filteredListings.map((listing) => listing.discountRate)) : 0;

  const marketSummary = [
    {
      label: "AI 인증 매물",
      value: `${stats.listingsCount}건`,
    },
    {
      label: "실시간 권역",
      value: `${districtBoards.filter((item) => item.count > 0).length}곳`,
    },
    {
      label: "최고 할인율",
      value: formatPercent(highestDiscount),
    },
    {
      label: "현재 검색 결과",
      value: `${filteredListings.length}건`,
    },
  ];

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
      <section className="page-hero listings-hero">
        <div className="container">
          <span className="eyebrow">급매 지도</span>
          <h1 className="page-title">권역 흐름과 급매 밀도를 함께 보는 화면</h1>
          <p className="page-desc">
            단순 목록이 아니라, 어느 지역에 지금 기회가 몰려 있는지부터 보고 그다음 매물로
            내려가는 구조로 바꿨습니다.
          </p>

          <div className="market-summary-grid">
            {marketSummary.map((item) => (
              <article key={item.label} className="market-summary-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-body">
        <div className="container listings-shell">
          <article className="map-filter-dock">
            <div className="map-filter-grid">
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

              <div className="filter-group wide">
                <label htmlFor="filter-keyword">키워드</label>
                <input
                  id="filter-keyword"
                  type="text"
                  className="search-input"
                  placeholder="예: 성수, 상속 정리, 영상 현장"
                  value={filters.keyword}
                  onChange={(event) => updateFilters({ keyword: event.target.value })}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="filter-sort">정렬</label>
                <select
                  id="filter-sort"
                  className="search-input"
                  value={filters.sort}
                  onChange={(event) => updateFilters({ sort: event.target.value })}
                >
                  <option value="recommended">추천순</option>
                  <option value="discount">할인율 높은순</option>
                  <option value="price-low">가격 낮은순</option>
                  <option value="newest">최신 등록순</option>
                </select>
              </div>
            </div>

            <div className="map-filter-foot">
              <div className="filter-inline">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={filters.hasVideo}
                    onChange={(event) => updateFilters({ hasVideo: event.target.checked })}
                  />
                  <span>영상 현장</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={filters.hasReport}
                    onChange={(event) => updateFilters({ hasReport: event.target.checked })}
                  />
                  <span>현장 리포트</span>
                </label>
              </div>

              <div className="discount-box">
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
                <span>{filters.minDiscount}% 이상</span>
              </div>

              <button type="button" className="btn btn-outline reset-btn" onClick={resetFilters}>
                필터 초기화
              </button>
            </div>
          </article>

          <div className="map-layout">
            <aside className="map-stage">
              <div className="map-stage-head">
                <div>
                  <p className="comparison-label">실시간 권역 보드</p>
                  <h2>{activeDistrict} 급매 흐름</h2>
                </div>
                <span className="pill accent">{formatCount(spotlightListings.length)}건 표시</span>
              </div>

              <div className="map-stage-canvas">
                {districtBoards.map((board) => (
                  <button
                    key={board.district}
                    type="button"
                    className={`district-hotspot${activeDistrict === board.district ? " active" : ""}`}
                    onClick={() =>
                      updateFilters({
                        district: activeDistrict === board.district ? "전체" : board.district,
                      })
                    }
                  >
                    <strong>{board.district}</strong>
                    <span>{board.count}건</span>
                    <small>{formatPercent(board.averageDiscount)} 평균 할인</small>
                    {board.topListing && <p>{board.topListing.title}</p>}
                  </button>
                ))}
              </div>

              <div className="map-stage-note">
                <p>
                  권역 버튼을 누르면 해당 지역만 바로 좁혀집니다. 지금은 실제 지도 대신 거래 밀도판
                  형태로 먼저 배치했습니다.
                </p>
              </div>
            </aside>

            <div className="results-panel map-results-panel">
              <div className="results-toolbar">
                <div>
                  <p className="results-count">검색 결과 {filteredListings.length}건</p>
                  <p className="results-copy">
                    권역 보드에서 지역을 고르고, 오른쪽 피드에서 바로 매물 판단까지 이어집니다.
                  </p>
                </div>
              </div>

              {spotlightListings.length > 0 && (
                <div className="spotlight-grid">
                  {spotlightListings.map((listing) => (
                    <Link key={listing.id} to={`/listings/${listing.id}`} className="spotlight-card">
                      <span className="pill accent">{listing.district}</span>
                      <strong>{listing.title}</strong>
                      <p>
                        {listing.location} · {listing.area}
                      </p>
                      <b>{formatPrice(listing.price)}</b>
                    </Link>
                  ))}
                </div>
              )}

              {filteredListings.length > 0 ? (
                <div className="listing-grid">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="empty-box">
                  <h2>조건에 맞는 급매가 아직 없습니다</h2>
                  <p>필터를 조금 완화하거나 급매 알림으로 저장해두면 다음 등록분을 더 빨리 포착할 수 있습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Listings;
