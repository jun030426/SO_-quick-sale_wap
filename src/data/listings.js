export const districtOptions = [
  "전체",
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

export const propertyTypes = ["전체", "아파트"];

export const urgentReasonOptions = [
  "양도세 일정 대응",
  "사업 자금 확보",
  "대출 만기 대응",
  "상속 정리",
  "이사 일정 확정",
];

const sellerTypeOptions = [
  "실거주 매도인",
  "갈아타기 매도인",
  "대출 상환 목적 매도",
  "상속 매도인",
  "개인 사업자",
];

const areaCodeMap = {
  서울: "02",
  부산: "051",
  대구: "053",
  인천: "032",
  광주: "062",
  대전: "042",
  울산: "052",
  세종: "044",
  경기: "031",
  강원: "033",
  충북: "043",
  충남: "041",
  전북: "063",
  전남: "061",
  경북: "054",
  경남: "055",
  제주: "064",
};

const imagePool = [
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1400&q=80",
];

const areaVariants = [
  { areaValue: 59, factor: 0.74, stack: "소형", minFloor: 4 },
  { areaValue: 74, factor: 0.88, stack: "중형", minFloor: 6 },
  { areaValue: 84, factor: 1, stack: "국민평형", minFloor: 8 },
  { areaValue: 94, factor: 1.11, stack: "확장형", minFloor: 10 },
  { areaValue: 101, factor: 1.2, stack: "대형", minFloor: 12 },
];

const communityPresets = [
  {
    slug: "gongdeok-classic",
    mapLabel: "공덕 더클래식",
    district: "서울",
    location: "서울 마포구 공덕동",
    neighborhood: "공덕동",
    latitude: 37.5484,
    longitude: 126.9568,
    base84Price: 118000,
    builtYear: 2018,
    totalFloors: 22,
    subway: "공덕역 도보 7분",
    commute: "여의도 12분",
    feature: "마포 생활권",
  },
  {
    slug: "seongsu-riverview",
    mapLabel: "서울숲 리버뷰",
    district: "서울",
    location: "서울 성동구 성수동",
    neighborhood: "성수동",
    latitude: 37.5446,
    longitude: 127.0557,
    base84Price: 104000,
    builtYear: 2011,
    totalFloors: 18,
    subway: "성수역 도보 9분",
    commute: "강남 20분",
    feature: "서울숲 생활권",
  },
  {
    slug: "haeundae-centum",
    mapLabel: "센텀 더에이치",
    district: "부산",
    location: "부산 해운대구 우동",
    neighborhood: "우동",
    latitude: 35.1692,
    longitude: 129.1326,
    base84Price: 111000,
    builtYear: 2017,
    totalFloors: 28,
    subway: "센텀시티역 도보 8분",
    commute: "해운대 10분",
    feature: "센텀 업무지구",
  },
  {
    slug: "dongnae-prime",
    mapLabel: "동래 프라임시티",
    district: "부산",
    location: "부산 동래구 명륜동",
    neighborhood: "명륜동",
    latitude: 35.2041,
    longitude: 129.0789,
    base84Price: 84500,
    builtYear: 2015,
    totalFloors: 24,
    subway: "동래역 도보 7분",
    commute: "서면 18분",
    feature: "동래 학군권",
  },
  {
    slug: "beomeo-summit",
    mapLabel: "범어 서밋",
    district: "대구",
    location: "대구 수성구 범어동",
    neighborhood: "범어동",
    latitude: 35.8593,
    longitude: 128.6262,
    base84Price: 103000,
    builtYear: 2019,
    totalFloors: 29,
    subway: "범어역 도보 6분",
    commute: "동성로 15분",
    feature: "수성 학군권",
  },
  {
    slug: "songdo-center",
    mapLabel: "더샵 센터포레",
    district: "인천",
    location: "인천 연수구 송도동",
    neighborhood: "송도동",
    latitude: 37.3902,
    longitude: 126.6427,
    base84Price: 89200,
    builtYear: 2019,
    totalFloors: 33,
    subway: "인천대입구역 차량 7분",
    commute: "공항 30분",
    feature: "송도 국제도시",
  },
  {
    slug: "cheongna-xi",
    mapLabel: "청라 자이",
    district: "인천",
    location: "인천 서구 청라동",
    neighborhood: "청라동",
    latitude: 37.5376,
    longitude: 126.6534,
    base84Price: 79800,
    builtYear: 2014,
    totalFloors: 24,
    subway: "청라국제도시역 차량 8분",
    commute: "여의도 40분",
    feature: "호수공원 접근성",
  },
  {
    slug: "sangmu-central",
    mapLabel: "상무 센트럴리움",
    district: "광주",
    location: "광주 서구 치평동",
    neighborhood: "치평동",
    latitude: 35.1531,
    longitude: 126.8518,
    base84Price: 68800,
    builtYear: 2018,
    totalFloors: 23,
    subway: "상무역 도보 8분",
    commute: "광주송정역 20분",
    feature: "상무 업무지구",
  },
  {
    slug: "doan-first",
    mapLabel: "도안 퍼스트뷰",
    district: "대전",
    location: "대전 유성구 봉명동",
    neighborhood: "봉명동",
    latitude: 36.355,
    longitude: 127.341,
    base84Price: 73500,
    builtYear: 2017,
    totalFloors: 25,
    subway: "유성온천역 차량 7분",
    commute: "대전역 22분",
    feature: "도안 신도시",
  },
  {
    slug: "samsan-hill",
    mapLabel: "삼산 힐스테이트",
    district: "울산",
    location: "울산 남구 삼산동",
    neighborhood: "삼산동",
    latitude: 35.5387,
    longitude: 129.3352,
    base84Price: 81200,
    builtYear: 2016,
    totalFloors: 27,
    subway: "울산시외버스터미널 8분",
    commute: "현대자동차 20분",
    feature: "삼산 중심 상권",
  },
  {
    slug: "sejong-boram",
    mapLabel: "보람 더센트럴",
    district: "세종",
    location: "세종특별자치시 보람동",
    neighborhood: "보람동",
    latitude: 36.4788,
    longitude: 127.2891,
    base84Price: 64800,
    builtYear: 2020,
    totalFloors: 20,
    subway: "정부세종청사 12분",
    commute: "오송역 25분",
    feature: "행정타운 접근성",
  },
  {
    slug: "jeongja-central",
    mapLabel: "정자 센트럴파크",
    district: "경기",
    location: "경기 성남시 분당구 정자동",
    neighborhood: "정자동",
    latitude: 37.3641,
    longitude: 127.1075,
    base84Price: 137000,
    builtYear: 2016,
    totalFloors: 25,
    subway: "정자역 도보 11분",
    commute: "판교 10분",
    feature: "분당 선호 입지",
  },
  {
    slug: "gwanggyo-nature",
    mapLabel: "광교 자연앤힐스",
    district: "경기",
    location: "경기 수원시 영통구 이의동",
    neighborhood: "이의동",
    latitude: 37.2865,
    longitude: 127.0505,
    base84Price: 128000,
    builtYear: 2018,
    totalFloors: 28,
    subway: "광교중앙역 도보 8분",
    commute: "판교 25분",
    feature: "광교 신도시",
  },
  {
    slug: "chuncheon-river",
    mapLabel: "춘천 레이크뷰",
    district: "강원",
    location: "강원 춘천시 퇴계동",
    neighborhood: "퇴계동",
    latitude: 37.8561,
    longitude: 127.7348,
    base84Price: 47200,
    builtYear: 2014,
    totalFloors: 18,
    subway: "남춘천역 차량 7분",
    commute: "서울 75분",
    feature: "의암호 생활권",
  },
  {
    slug: "cheongju-bokdae",
    mapLabel: "복대 센트럴시티",
    district: "충북",
    location: "충북 청주시 흥덕구 복대동",
    neighborhood: "복대동",
    latitude: 36.6347,
    longitude: 127.4312,
    base84Price: 55800,
    builtYear: 2015,
    totalFloors: 22,
    subway: "오송역 차량 20분",
    commute: "청주터미널 10분",
    feature: "복대 생활권",
  },
  {
    slug: "cheonan-buldang",
    mapLabel: "불당 더샵레이크",
    district: "충남",
    location: "충남 천안시 서북구 불당동",
    neighborhood: "불당동",
    latitude: 36.8145,
    longitude: 127.1071,
    base84Price: 62500,
    builtYear: 2019,
    totalFloors: 27,
    subway: "천안아산역 차량 10분",
    commute: "오송 25분",
    feature: "불당 신도시",
  },
  {
    slug: "jeonju-hyocheon",
    mapLabel: "효천 대방노블랜드",
    district: "전북",
    location: "전북 전주시 완산구 효자동",
    neighborhood: "효자동",
    latitude: 35.8048,
    longitude: 127.1027,
    base84Price: 49800,
    builtYear: 2018,
    totalFloors: 20,
    subway: "전주역 차량 20분",
    commute: "신시가지 10분",
    feature: "신시가지 인접",
  },
  {
    slug: "suncheon-sindae",
    mapLabel: "신대 지웰",
    district: "전남",
    location: "전남 순천시 해룡면 신대리",
    neighborhood: "신대리",
    latitude: 34.9501,
    longitude: 127.5312,
    base84Price: 46800,
    builtYear: 2017,
    totalFloors: 19,
    subway: "순천역 차량 18분",
    commute: "여수 35분",
    feature: "신대지구 생활권",
  },
  {
    slug: "pohang-jangseong",
    mapLabel: "장성 푸르지오",
    district: "경북",
    location: "경북 포항시 북구 장성동",
    neighborhood: "장성동",
    latitude: 36.0652,
    longitude: 129.3787,
    base84Price: 43800,
    builtYear: 2016,
    totalFloors: 21,
    subway: "포항역 차량 15분",
    commute: "영일대 12분",
    feature: "포항 북구 생활권",
  },
  {
    slug: "changwon-yongho",
    mapLabel: "용호 더샵",
    district: "경남",
    location: "경남 창원시 성산구 용호동",
    neighborhood: "용호동",
    latitude: 35.2268,
    longitude: 128.681,
    base84Price: 61200,
    builtYear: 2018,
    totalFloors: 24,
    subway: "창원중앙역 차량 12분",
    commute: "창원시청 8분",
    feature: "창원 중심 생활권",
  },
  {
    slug: "jeju-nohyeong",
    mapLabel: "노형 해모로",
    district: "제주",
    location: "제주 제주시 노형동",
    neighborhood: "노형동",
    latitude: 33.4852,
    longitude: 126.4805,
    base84Price: 79200,
    builtYear: 2020,
    totalFloors: 18,
    subway: "제주공항 차량 12분",
    commute: "연동 8분",
    feature: "노형 중심 상권",
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundToHundred(value) {
  return Math.round(value / 100) * 100;
}

function createPhoneNumber(district, presetIndex, variantIndex) {
  const areaCode = areaCodeMap[district] ?? "02";
  const middle = String(3100 + presetIndex * 19 + variantIndex * 7).padStart(4, "0");
  const end = String(1200 + presetIndex * 31 + variantIndex * 13).padStart(4, "0");
  return `${areaCode}-${middle}-${end}`;
}

function createCreatedAt(presetIndex, variantIndex) {
  const offsetDays = (presetIndex * 2 + variantIndex) % 8;
  const offsetHours = (presetIndex * 3 + variantIndex * 5) % 21;
  const timestamp = Date.now() - offsetDays * 24 * 60 * 60 * 1000 - offsetHours * 60 * 60 * 1000;
  return new Date(timestamp).toISOString();
}

function createAreaLabel(areaValue) {
  return `${areaValue}㎡`;
}

function createListing(preset, presetIndex, variant, variantIndex) {
  const marketPriceBase = preset.base84Price * variant.factor;
  const marketSwing = 1 + (((presetIndex + variantIndex) % 5) - 2) * 0.008;
  const marketPrice = roundToHundred(marketPriceBase * marketSwing);
  const discountRate = Number((5.4 + ((presetIndex * 7 + variantIndex * 5) % 39) * 0.1).toFixed(1));
  const price = roundToHundred(marketPrice * (1 - discountRate / 100));
  const recentDealPrice = roundToHundred(marketPrice * (0.982 + ((variantIndex + presetIndex) % 3) * 0.004));
  const listingAverage = roundToHundred(marketPrice * (1.014 + (presetIndex % 4) * 0.004));
  const score = clamp(84 + Math.round(discountRate * 1.25) + (variant.areaValue >= 84 ? 2 : 0), 84, 96);
  const currentFloor = Math.min(
    preset.totalFloors - 2,
    variant.minFloor + ((presetIndex * 3 + variantIndex * 4) % Math.max(6, preset.totalFloors - 4)),
  );
  const urgentReason = urgentReasonOptions[(presetIndex + variantIndex) % urgentReasonOptions.length];
  const sellerType = sellerTypeOptions[(presetIndex + variantIndex * 2) % sellerTypeOptions.length];
  const hasVideo = (presetIndex + variantIndex) % 2 === 0;
  const hasReport = (presetIndex + variantIndex) % 3 !== 1;
  const image = imagePool[(presetIndex + variantIndex) % imagePool.length];
  const latitudeOffset = ((variantIndex % 3) - 1) * 0.0032 + ((presetIndex % 2 ? 1 : -1) * 0.0008);
  const longitudeOffset = (((variantIndex + 1) % 3) - 1) * 0.0036 + ((presetIndex % 3) - 1) * 0.0009;

  return {
    id: `${preset.slug}-${variant.areaValue}`,
    title: `${preset.mapLabel} ${variant.areaValue}㎡ 급매`,
    district: preset.district,
    location: preset.location,
    neighborhood: preset.neighborhood,
    mapLabel: preset.mapLabel,
    type: "아파트",
    price,
    marketPrice,
    recentDealPrice,
    listingAverage,
    score,
    hasVideo,
    hasReport,
    areaValue: variant.areaValue,
    area: createAreaLabel(variant.areaValue),
    floor: `${currentFloor}층 / ${preset.totalFloors}층`,
    builtYear: preset.builtYear,
    urgentReason,
    sellerType,
    latitude: Number((preset.latitude + latitudeOffset).toFixed(6)),
    longitude: Number((preset.longitude + longitudeOffset).toFixed(6)),
    description: `${preset.neighborhood} 생활권에서 ${variant.stack} 수요가 꾸준한 아파트입니다. ${urgentReason} 사유로 가격을 빠르게 조정해 실거주와 갈아타기 문의가 함께 들어오는 타입입니다.`,
    highlights: [preset.subway, preset.feature, `${variant.stack} 수요 꾸준`],
    risks: [
      "잔금 일정과 옵션 범위는 계약 전 재확인 필요",
      "관리비와 주차 배정 조건은 단지별로 확인 권장",
    ],
    transit: [preset.subway, preset.commute, `${preset.feature} 중심 이동 편리`],
    tags: [
      preset.feature,
      urgentReason,
      hasVideo ? "영상 현장" : "상담 연결",
      hasReport ? "현장 리포트" : "실거주 추천",
    ],
    partnerBroker: {
      name: `${preset.neighborhood} 시그널 공인중개사`,
      intro: `${preset.neighborhood} 아파트 급매 협상과 실거주 수요 연결이 빠른 파트너입니다.`,
      responseTime: `평균 ${9 + ((presetIndex + variantIndex) % 8)}분`,
      deals: 20 + presetIndex * 2 + variantIndex * 3,
      phone: createPhoneNumber(preset.district, presetIndex, variantIndex),
    },
    image,
    createdAt: createCreatedAt(presetIndex, variantIndex),
  };
}

const listings = communityPresets.flatMap((preset, presetIndex) =>
  areaVariants.map((variant, variantIndex) => createListing(preset, presetIndex, variant, variantIndex)),
);

export default listings;
