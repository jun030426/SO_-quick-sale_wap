import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ApartmentMap from "../components/ApartmentMap";
import { useMarketplace } from "../context/MarketplaceContext";
import {
  formatCompactPrice,
  formatCount,
  formatPercent,
  formatPrice,
  matchesListingFilters,
  sortListings,
} from "../utils/marketplace";
import { summarizeMapArea } from "../utils/location.js";
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

function isListingInViewport(listing, viewport) {
  if (!viewport) {
    return true;
  }

  return (
    listing.latitude >= viewport.south &&
    listing.latitude <= viewport.north &&
    listing.longitude >= viewport.west &&
    listing.longitude <= viewport.east
  );
}

function Listings() {
  const {
    listings,
    options,
    isListingFavorited,
    isComplexFavorited,
    toggleListingFavorite,
    toggleComplexFavorite,
  } = useMarketplace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedListingId, setSelectedListingId] = useState("");
  const [mapViewport, setMapViewport] = useState(null);
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
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

  const visibleListings = useMemo(
    () => filteredListings.filter((listing) => isListingInViewport(listing, mapViewport)),
    [filteredListings, mapViewport],
  );

  useEffect(() => {
    if (visibleListings.some((listing) => listing.id === selectedListingId)) {
      return;
    }

    if (visibleListings.length > 0) {
      setSelectedListingId(visibleListings[0].id);
      return;
    }

    if (filteredListings.some((listing) => listing.id === selectedListingId)) {
      return;
    }

    setSelectedListingId(filteredListings[0]?.id ?? "");
  }, [filteredListings, selectedListingId, visibleListings]);

  const selectedListing =
    visibleListings.find((listing) => listing.id === selectedListingId) ??
    filteredListings.find((listing) => listing.id === selectedListingId) ??
    visibleListings[0] ??
    filteredListings[0] ??
    null;

  const districtBoards = useMemo(() => {
    return options.districtOptions
      .filter((district) => district !== "전체")
      .map((district) => {
        const districtListings = filteredListings.filter((listing) => listing.district === district);

        return {
          district,
          count: districtListings.length,
        };
      })
      .filter((board) => board.count > 0)
      .sort((left, right) => right.count - left.count);
  }, [filteredListings, options.districtOptions]);

  const highestDiscount =
    filteredListings.length > 0 ? Math.max(...filteredListings.map((listing) => listing.discountRate)) : 0;

  const marketSummary = [
    {
      label: "현재 화면 매물",
      value: `${formatCount(visibleListings.length)}건`,
    },
    {
      label: "전체 검색 결과",
      value: `${formatCount(filteredListings.length)}건`,
    },
    {
      label: "활성 권역",
      value: `${formatCount(districtBoards.length)}곳`,
    },
    {
      label: "최대 할인율",
      value: formatPercent(highestDiscount),
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
    setMapViewport(null);

    startTransition(() => {
      setSearchParams(buildSearchParams(readFilters(new URLSearchParams())), { replace: true });
    });
  };

  return (
    <div className="page-shell">
      <section className="listings-hero">
        <div className="container listings-toolbar">
          <div className="listings-toolbar-copy">
            <span className="eyebrow">급매 지도</span>
            <strong>아파트 지도 탐색</strong>
          </div>

          <div className="listings-toolbar-stats">
            {marketSummary.map((item) => (
              <article key={item.label} className="market-summary-card compact">
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

              <div className="filter-group wide">
                <label htmlFor="filter-keyword">단지명 또는 키워드</label>
                <input
                  id="filter-keyword"
                  type="text"
                  className="search-input"
                  placeholder="예: 해운대, 동탄, 노형, 대출 만기"
                  value={filters.keyword}
                  onChange={(event) => updateFilters({ keyword: event.target.value })}
                />
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
                  placeholder="m²"
                  value={filters.minArea}
                  onChange={(event) => updateFilters({ minArea: event.target.value })}
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
                  <option value="discount">할인율 높은 순</option>
                  <option value="price-low">가격 낮은 순</option>
                  <option value="newest">최신 등록 순</option>
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

          <div className="map-explorer-shell">
            <aside className="map-results-sidebar">
              <div className="map-results-sidebar-head">
                <div>
                  <p className="comparison-label">현재 지도 범위</p>
                  <h2>{formatCount(visibleListings.length)}건</h2>
                  <p className="results-copy">
                    지도를 이동하거나 확대·축소하면 현재 화면 안에 들어오는 매물만 좌측 목록에서 바로 비교할 수
                    있습니다.
                  </p>
                </div>
                <span className="pill accent">전체 {filteredListings.length}건</span>
              </div>

              <div className="district-chip-row sidebar-chip-row">
                <button
                  type="button"
                  className={`district-chip${filters.district === "전체" ? " active" : ""}`}
                  onClick={() => updateFilters({ district: "전체" })}
                >
                  전체
                </button>
                {districtBoards.map((board) => (
                  <button
                    key={board.district}
                    type="button"
                    className={`district-chip${filters.district === board.district ? " active" : ""}`}
                    onClick={() => updateFilters({ district: board.district })}
                  >
                    {board.district} {board.count}
                  </button>
                ))}
              </div>

              {visibleListings.length > 0 ? (
                <div className="visible-listing-scroll">
                  {visibleListings.map((listing) => (
                    <article
                      key={listing.id}
                      className={`visible-listing-item${selectedListing?.id === listing.id ? " active" : ""}`}
                    >
                      <button
                        type="button"
                        className="visible-listing-button"
                        onClick={() => setSelectedListingId(listing.id)}
                      >
                        <img src={listing.image} alt={listing.title} className="visible-listing-image" />

                        <div className="visible-listing-copy">
                          <div className="visible-listing-topline">
                            <span className="pill accent">{listing.district}</span>
                            <span className="visible-listing-price">{formatCompactPrice(listing.price)}</span>
                          </div>
                          <strong>{listing.title}</strong>
                          <p>
                            {listing.mapLabel || listing.location} · {listing.area}
                          </p>
                          <small>
                            {listing.floor} · 시세 대비 {formatPercent(listing.discountRate)} 할인
                          </small>
                        </div>
                      </button>

                      <div className="visible-listing-actions">
                        <div className="visible-listing-action-copy">
                          <span>{listing.urgentReason}</span>
                          <div className="visible-listing-interest-row">
                            <button
                              type="button"
                              className={`interest-chip-button small${isListingFavorited(listing.id) ? " active" : ""}`}
                              onClick={() => toggleListingFavorite(listing.id)}
                            >
                              {isListingFavorited(listing.id) ? "찜됨" : "매물 찜"}
                            </button>
                            <button
                              type="button"
                              className={`interest-chip-button small${isComplexFavorited(listing) ? " active" : ""}`}
                              onClick={() => toggleComplexFavorite(listing)}
                            >
                              {isComplexFavorited(listing) ? "단지 저장됨" : "단지 저장"}
                            </button>
                          </div>
                        </div>
                        <Link to={`/listings/${listing.id}`} className="text-link">
                          상세 보기
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-box compact">
                  <h3>현재 지도 범위 안에는 매물이 없습니다</h3>
                  <p>지도를 조금 더 넓게 보거나 다른 권역으로 이동해보세요.</p>
                </div>
              )}
            </aside>

            <div className="map-canvas-panel">
              <div className="map-stage-head">
                <div>
                  <p className="comparison-label">지도 보기</p>
                  <h2>{summarizeMapArea(visibleListings.length > 0 ? visibleListings : filteredListings)}</h2>
                  <p className="results-copy">
                    지도 위에는 전체 검색 결과를 유지하고, 좌측 리스트에는 현재 화면 범위 안의 매물만 표시합니다.
                  </p>
                </div>
                {selectedListing && (
                  <div className="map-stage-selection">
                    <span className="pill accent">선택된 매물</span>
                    <strong>{selectedListing.title}</strong>
                    <b>{formatPrice(selectedListing.price)}</b>
                  </div>
                )}
              </div>

              <ApartmentMap
                listings={filteredListings}
                selectedListingId={selectedListing?.id ?? ""}
                onSelectListing={setSelectedListingId}
                onBoundsChange={setMapViewport}
                fallbackDistrict={selectedListing?.district || "전체"}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Listings;
