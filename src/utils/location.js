const DISTRICT_CENTERS = {
  전체: { latitude: 36.3504, longitude: 127.3845 },
  서울: { latitude: 37.5665, longitude: 126.978 },
  부산: { latitude: 35.1796, longitude: 129.0756 },
  대구: { latitude: 35.8714, longitude: 128.6014 },
  경기: { latitude: 37.4138, longitude: 127.5183 },
  인천: { latitude: 37.4563, longitude: 126.7052 },
  광주: { latitude: 35.1595, longitude: 126.8526 },
  대전: { latitude: 36.3504, longitude: 127.3845 },
  울산: { latitude: 35.5384, longitude: 129.3114 },
  세종: { latitude: 36.4801, longitude: 127.289 },
  강원: { latitude: 37.8228, longitude: 128.1555 },
  충북: { latitude: 36.6357, longitude: 127.4917 },
  충남: { latitude: 36.6588, longitude: 126.6728 },
  전북: { latitude: 35.7175, longitude: 127.153 },
  전남: { latitude: 34.8161, longitude: 126.463 },
  경북: { latitude: 36.576, longitude: 128.5056 },
  경남: { latitude: 35.4606, longitude: 128.2132 },
  제주: { latitude: 33.4996, longitude: 126.5312 },
};

const LOCATION_PRESETS = [
  {
    label: "공덕동",
    district: "서울",
    latitude: 37.5484,
    longitude: 126.9568,
    keywords: ["공덕", "마포", "도화"],
  },
  {
    label: "정자동",
    district: "경기",
    latitude: 37.3641,
    longitude: 127.1075,
    keywords: ["정자동", "분당", "성남"],
  },
  {
    label: "철산동",
    district: "경기",
    latitude: 37.476,
    longitude: 126.867,
    keywords: ["철산", "광명"],
  },
  {
    label: "성수동",
    district: "서울",
    latitude: 37.5446,
    longitude: 127.0557,
    keywords: ["성수", "서울숲", "성동"],
  },
  {
    label: "송도동",
    district: "인천",
    latitude: 37.3902,
    longitude: 126.6427,
    keywords: ["송도", "연수", "센트럴파크"],
  },
  {
    label: "문래동",
    district: "서울",
    latitude: 37.5178,
    longitude: 126.8944,
    keywords: ["문래", "영등포"],
  },
  {
    label: "해운대구",
    district: "부산",
    latitude: 35.1632,
    longitude: 129.1636,
    keywords: ["해운대", "센텀", "우동"],
  },
  {
    label: "범어동",
    district: "대구",
    latitude: 35.8593,
    longitude: 128.6262,
    keywords: ["범어", "수성", "대구"],
  },
  {
    label: "치평동",
    district: "광주",
    latitude: 35.1531,
    longitude: 126.8518,
    keywords: ["상무", "치평", "광주"],
  },
  {
    label: "봉명동",
    district: "대전",
    latitude: 36.355,
    longitude: 127.341,
    keywords: ["도안", "봉명", "유성"],
  },
  {
    label: "삼산동",
    district: "울산",
    latitude: 35.5387,
    longitude: 129.3352,
    keywords: ["삼산", "울산", "남구"],
  },
  {
    label: "보람동",
    district: "세종",
    latitude: 36.4788,
    longitude: 127.2891,
    keywords: ["보람", "세종", "행정타운"],
  },
  {
    label: "퇴계동",
    district: "강원",
    latitude: 37.8561,
    longitude: 127.7348,
    keywords: ["춘천", "퇴계", "강원"],
  },
  {
    label: "복대동",
    district: "충북",
    latitude: 36.6347,
    longitude: 127.4312,
    keywords: ["청주", "복대", "충북"],
  },
  {
    label: "불당동",
    district: "충남",
    latitude: 36.8145,
    longitude: 127.1071,
    keywords: ["천안", "불당", "충남"],
  },
  {
    label: "효자동",
    district: "전북",
    latitude: 35.8048,
    longitude: 127.1027,
    keywords: ["전주", "효천", "효자동"],
  },
  {
    label: "신대리",
    district: "전남",
    latitude: 34.9501,
    longitude: 127.5312,
    keywords: ["순천", "신대", "전남"],
  },
  {
    label: "장성동",
    district: "경북",
    latitude: 36.0652,
    longitude: 129.3787,
    keywords: ["포항", "장성", "경북"],
  },
  {
    label: "용호동",
    district: "경남",
    latitude: 35.2268,
    longitude: 128.681,
    keywords: ["창원", "용호", "경남"],
  },
  {
    label: "노형동",
    district: "제주",
    latitude: 33.4852,
    longitude: 126.4805,
    keywords: ["제주", "노형", "해모로"],
  },
];

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function hashSeed(seed) {
  return [...String(seed)].reduce((acc, character) => acc * 31 + character.charCodeAt(0), 7);
}

function createStableOffset(seed) {
  const hash = Math.abs(hashSeed(seed));
  const latitudeOffset = ((hash % 17) - 8) * 0.0014;
  const longitudeOffset = (((Math.floor(hash / 17) % 17) - 8) * 0.0017);

  return {
    latitudeOffset,
    longitudeOffset,
  };
}

function findPreset(listing) {
  const haystack = normalizeText(
    [listing.location, listing.neighborhood, listing.mapLabel, listing.title, listing.district].join(" "),
  );

  let bestMatch = null;

  for (const preset of LOCATION_PRESETS) {
    const score = preset.keywords.reduce((total, keyword) => {
      return haystack.includes(normalizeText(keyword)) ? total + keyword.length : total;
    }, 0);

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = {
        preset,
        score,
      };
    }
  }

  return bestMatch?.preset ?? null;
}

export function getDistrictCenter(district) {
  return DISTRICT_CENTERS[district] ?? DISTRICT_CENTERS.전체;
}

export function inferListingMapData(listing) {
  const latitude = Number(listing.latitude);
  const longitude = Number(listing.longitude);
  const label =
    listing.mapLabel?.trim() ||
    listing.neighborhood?.trim() ||
    listing.location?.trim() ||
    listing.title?.trim() ||
    "아파트";

  if (isFiniteNumber(latitude) && isFiniteNumber(longitude)) {
    return {
      latitude,
      longitude,
      mapLabel: label,
    };
  }

  const preset = findPreset(listing);
  const base = preset ?? getDistrictCenter(listing.district);
  const offset = createStableOffset([listing.id, listing.location, listing.title, listing.district].join("-"));

  return {
    latitude: Number((base.latitude + offset.latitudeOffset).toFixed(6)),
    longitude: Number((base.longitude + offset.longitudeOffset).toFixed(6)),
    mapLabel: preset?.label ?? label,
  };
}

export function summarizeMapArea(listings) {
  if (!listings.length) {
    return "아파트 급매 지도";
  }

  if (listings.length === 1) {
    return listings[0].mapLabel || listings[0].title;
  }

  const districts = [...new Set(listings.map((listing) => listing.district))];

  if (districts.length === 1) {
    return `${districts[0]} 아파트 ${listings.length}건`;
  }

  if (districts.length > 3) {
    return `전국 아파트 ${listings.length}건`;
  }

  return `${districts.join(" · ")} 아파트 ${listings.length}건`;
}
