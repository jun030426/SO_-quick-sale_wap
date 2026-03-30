const MAN_PER_EOK = 10000;
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80";

const brokerDirectory = {
  서울: {
    name: "서울 시그널 공인중개사",
    intro: "실수요자 급매 협상과 현장 검증을 빠르게 연결하는 파트너입니다.",
    responseTime: "평균 13분",
    deals: 41,
    phone: "02-6002-1180",
  },
  경기: {
    name: "경기 패스트 공인중개사",
    intro: "수도권 실거주 수요 매칭이 빠른 파트너입니다.",
    responseTime: "평균 17분",
    deals: 34,
    phone: "031-8008-2727",
  },
  인천: {
    name: "인천 링크 공인중개사",
    intro: "송도와 연수권 급매 매칭 경험이 풍부한 파트너입니다.",
    responseTime: "평균 16분",
    deals: 26,
    phone: "032-777-1900",
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
}

function createId(prefix = "entry") {
  const randomId = globalThis.crypto?.randomUUID?.();
  return randomId ? `${prefix}-${randomId}` : `${prefix}-${Date.now()}`;
}

function createPartnerBroker(district) {
  return brokerDirectory[district] ?? brokerDirectory.서울;
}

export function formatPrice(value) {
  const amount = Math.round(toNumber(value));
  const eok = Math.floor(amount / MAN_PER_EOK);
  const man = amount % MAN_PER_EOK;

  if (eok > 0 && man > 0) {
    return `${eok}억 ${man.toLocaleString("ko-KR")}만 원`;
  }

  if (eok > 0) {
    return `${eok}억 원`;
  }

  return `${amount.toLocaleString("ko-KR")}만 원`;
}

export function formatPercent(value) {
  return `${toNumber(value).toFixed(1)}%`;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateDiscountRate(price, marketPrice) {
  const normalizedPrice = toNumber(price);
  const normalizedMarketPrice = toNumber(marketPrice);

  if (normalizedPrice <= 0 || normalizedMarketPrice <= 0) {
    return 0;
  }

  return Number(
    (((normalizedMarketPrice - normalizedPrice) / normalizedMarketPrice) * 100).toFixed(1),
  );
}

export function buildVerification(listing) {
  const discountRate =
    listing.discountRate ?? calculateDiscountRate(listing.price, listing.marketPrice);
  const approved = discountRate >= 5;
  const priceScore = clamp(Math.round(discountRate * 9 + 28), 36, 99);
  const trustScore = clamp(
    62 +
      (listing.hasVideo ? 12 : 0) +
      (listing.hasReport ? 14 : 0) +
      (listing.partnerBroker ? 8 : 0) +
      Math.round(discountRate),
    48,
    99,
  );
  const liquidityScore = clamp(
    58 + Math.round(discountRate * 2.4) + (listing.urgentReason ? 12 : 0),
    50,
    98,
  );

  const summary = [
    `최근 3개월 실거래 평균 ${formatPrice(listing.recentDealPrice ?? listing.marketPrice)} 대비 ${formatPercent(discountRate)} 저렴`,
    `현재 동일 생활권 등록 평균 ${formatPrice(listing.listingAverage ?? listing.marketPrice)} 기준으로도 가격 경쟁력이 확인됩니다.`,
    listing.hasVideo
      ? "영상 현장 자료가 등록되어 있어 발품 비용을 줄일 수 있습니다."
      : "영상 현장 자료는 아직 등록되지 않았습니다.",
    listing.hasReport
      ? "현장 리포트가 포함되어 추가 검증에 도움이 됩니다."
      : "현장 리포트는 파트너 중개사 연결 후 보완될 예정입니다.",
  ];

  return {
    discountRate,
    approved,
    priceScore,
    trustScore,
    liquidityScore,
    verificationSummary: summary,
  };
}

export function normalizeListing(rawListing) {
  const price = toNumber(rawListing.price);
  const marketPrice = toNumber(rawListing.marketPrice || rawListing.originalPrice);
  const recentDealPrice = toNumber(rawListing.recentDealPrice || marketPrice);
  const listingAverage = toNumber(rawListing.listingAverage || marketPrice);
  const areaValue =
    toNumber(rawListing.areaValue) ||
    toNumber(String(rawListing.area ?? "").replace(/[^\d.]/g, ""));

  const partnerBroker = rawListing.partnerBroker ?? createPartnerBroker(rawListing.district);
  const verification = buildVerification({
    ...rawListing,
    price,
    marketPrice,
    recentDealPrice,
    listingAverage,
    partnerBroker,
  });

  return {
    ...rawListing,
    ...verification,
    price,
    marketPrice,
    recentDealPrice,
    listingAverage,
    areaValue,
    builtYear: toNumber(rawListing.builtYear),
    area: rawListing.area ?? `${areaValue}㎡`,
    partnerBroker,
    image: rawListing.image ?? PLACEHOLDER_IMAGE,
    createdAt: rawListing.createdAt ?? new Date().toISOString(),
  };
}

export function normalizeListings(listings) {
  return listings.map(normalizeListing);
}

export function matchesListingFilters(listing, filters) {
  const keyword = String(filters.keyword ?? "").trim().toLowerCase();
  const district = filters.district ?? filters.region ?? "전체";
  const type = filters.type ?? "전체";
  const maxPrice = toNumber(filters.maxPrice);
  const minDiscount = toNumber(filters.minDiscount);
  const minArea = toNumber(filters.minArea);

  if (district && district !== "전체" && listing.district !== district) {
    return false;
  }

  if (type && type !== "전체" && listing.type !== type) {
    return false;
  }

  if (maxPrice > 0 && listing.price > maxPrice) {
    return false;
  }

  if (minDiscount > 0 && listing.discountRate < minDiscount) {
    return false;
  }

  if (minArea > 0 && listing.areaValue < minArea) {
    return false;
  }

  if (filters.hasVideo && !listing.hasVideo) {
    return false;
  }

  if (filters.hasReport && !listing.hasReport) {
    return false;
  }

  if (filters.approvedOnly && !listing.approved) {
    return false;
  }

  if (!keyword) {
    return true;
  }

  const searchableText = [
    listing.title,
    listing.location,
    listing.description,
    listing.type,
    listing.urgentReason,
    listing.sellerType,
    ...(listing.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(keyword);
}

export function sortListings(listings, sortKey) {
  const sorted = [...listings];

  sorted.sort((left, right) => {
    if (sortKey === "discount") {
      return right.discountRate - left.discountRate;
    }

    if (sortKey === "price-low") {
      return left.price - right.price;
    }

    if (sortKey === "newest") {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    const leftScore =
      left.score * 1.1 +
      left.priceScore +
      left.trustScore +
      left.discountRate * 7 +
      (left.hasVideo ? 5 : 0) +
      (left.hasReport ? 5 : 0);
    const rightScore =
      right.score * 1.1 +
      right.priceScore +
      right.trustScore +
      right.discountRate * 7 +
      (right.hasVideo ? 5 : 0) +
      (right.hasReport ? 5 : 0);

    return rightScore - leftScore;
  });

  return sorted;
}

export function createAlertMatchList(listings, alert) {
  return listings.filter((listing) => matchesListingFilters(listing, alert));
}

export function evaluateListingDraft(draft) {
  const areaValue = toNumber(draft.areaValue);
  const marketPrice = toNumber(draft.marketPrice);
  const price = toNumber(draft.price);
  const requesterLabel =
    draft.requesterType === "broker" ? "파트너 중개사 등록" : "매도인 직접 등록";

  const listing = normalizeListing({
    id: createId("listing"),
    title:
      draft.title?.trim() ||
      `${draft.location?.trim() || draft.district} ${draft.type} ${
        areaValue > 0 ? `${areaValue}㎡` : ""
      }`.trim(),
    district: draft.district,
    location: draft.location?.trim() || `${draft.district} 상세 주소 확인 필요`,
    neighborhood: draft.location?.trim() || draft.district,
    type: draft.type,
    price,
    marketPrice,
    recentDealPrice: Math.round(marketPrice * 0.985),
    listingAverage: Math.round(marketPrice * 1.012),
    score: clamp(74 + Math.round(calculateDiscountRate(price, marketPrice) * 2), 70, 97),
    hasVideo: Boolean(draft.hasVideo),
    hasReport: Boolean(draft.hasReport),
    areaValue,
    area: areaValue > 0 ? `${areaValue}㎡` : "면적 확인 필요",
    floor: draft.floor?.trim() || "층수 협의",
    builtYear: toNumber(draft.builtYear) || new Date().getFullYear(),
    urgentReason: draft.urgentReason,
    sellerType: requesterLabel,
    description:
      draft.description?.trim() ||
      "매도 등록 단계에서 입력된 기본 설명입니다. 파트너 중개사 연결 후 현장 검증과 보완 자료가 추가됩니다.",
    highlights: [
      draft.hasVideo ? "영상 현장 자료 보유" : "현장 영상 추후 등록 예정",
      draft.hasReport ? "현장 리포트 보유" : "현장 리포트 추후 등록 예정",
      `${draft.urgentReason} 사유로 빠른 거래 희망`,
    ],
    risks: [
      "실거래가 API 연동 시 최종 승인 값이 달라질 수 있습니다.",
      "등기, 대출, 세금 관련 검토는 계약 전 별도 확인이 필요합니다.",
    ],
    transit: ["세부 교통 정보는 현장 점검 후 보완됩니다."],
    tags: ["신규 등록", requesterLabel, draft.urgentReason],
    partnerBroker: createPartnerBroker(draft.district),
    image: draft.image?.trim() || PLACEHOLDER_IMAGE,
    createdAt: new Date().toISOString(),
  });

  const approved = listing.discountRate >= 5;
  const blockers = [];

  if (listing.discountRate < 5) {
    blockers.push(
      `시세 대비 할인율이 ${formatPercent(listing.discountRate)}로 기준 5%에 미달합니다.`,
    );
  }

  if (!draft.location?.trim()) {
    blockers.push("동 단위 이상의 상세 위치가 비어 있어 추가 검증이 필요합니다.");
  }

  const recommendations = [
    listing.hasVideo
      ? "영상 현장 자료가 확보되어 신뢰 점수에 반영되었습니다."
      : "영상 현장 자료를 올리면 신뢰 점수가 더 높아집니다.",
    listing.hasReport
      ? "현장 리포트가 있어 파트너 중개사 연결 전환율이 좋아집니다."
      : "현장 리포트를 추가하면 승인 후 전환율이 더 좋아집니다.",
    `현재 입력 기준 급매 할인율은 ${formatPercent(listing.discountRate)}입니다.`,
  ];

  return {
    id: createId("submission"),
    approved: approved && blockers.length === 0,
    blockers,
    recommendations,
    listing,
    submittedAt: new Date().toISOString(),
  };
}
