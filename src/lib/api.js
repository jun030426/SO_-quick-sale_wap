import listingsSeed, {
  districtOptions,
  propertyTypes,
  urgentReasonOptions,
} from "../data/listings";
import {
  createAlertMatchList,
  normalizeListing,
  normalizeListings,
  sortListings,
} from "../utils/marketplace";
import { getSupabaseClient, hasSupabaseConfig } from "./supabase";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const REST_TOKEN_KEY = "quick-sale-auth-token";
const READONLY_ERROR =
  "이 배포본에는 아직 실제 인증/데이터 백엔드가 연결되지 않았습니다. Netlify 환경변수에 Supabase 값을 넣어주세요.";

export const defaultStats = {
  listingsCount: 0,
  averageDiscount: 0,
  usersCount: 0,
  alertsCount: 0,
  inquiriesCount: 0,
};

export const defaultOptions = {
  districtOptions,
  propertyTypes,
  urgentReasonOptions,
};

function resolveBackendMode() {
  const explicitMode = String(import.meta.env.VITE_BACKEND_MODE || "")
    .trim()
    .toLowerCase();

  if (explicitMode === "supabase") {
    return hasSupabaseConfig ? "supabase" : "readonly";
  }

  if (explicitMode === "rest" || explicitMode === "readonly") {
    return explicitMode;
  }

  if (hasSupabaseConfig) {
    return "supabase";
  }

  return import.meta.env.DEV ? "rest" : "readonly";
}

export const backendMode = resolveBackendMode();
export const isWritableBackend = backendMode !== "readonly";
export const backendLabel =
  backendMode === "supabase"
    ? "Supabase Auth + Postgres"
    : backendMode === "rest"
      ? "로컬 API 서버"
      : "읽기 전용 미리보기";

function createFriendlyError(error, fallback = "요청 처리 중 오류가 발생했습니다.") {
  const message = String(error?.message || fallback);

  if (message.includes("Invalid login credentials")) {
    return new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  if (message.includes("User already registered")) {
    return new Error("이미 사용 중인 이메일입니다.");
  }

  if (message.includes("Email not confirmed")) {
    return new Error("이메일 인증을 완료한 뒤 로그인해 주세요.");
  }

  if (message.includes("Password should be")) {
    return new Error("비밀번호는 최소 6자 이상이어야 합니다.");
  }

  if (message.includes("duplicate key value")) {
    return new Error("이미 같은 정보가 저장되어 있습니다.");
  }

  if (message.includes("fetch")) {
    return new Error("서버에 연결하지 못했습니다. 네트워크 상태를 확인해 주세요.");
  }

  return new Error(message || fallback);
}

function throwIfError(error, fallback) {
  if (error) {
    throw createFriendlyError(error, fallback);
  }
}

function calculateAverageDiscount(listings) {
  if (!listings.length) {
    return 0;
  }

  return Number(
    (
      listings.reduce((total, listing) => total + Number(listing.discountRate || 0), 0) /
      listings.length
    ).toFixed(1),
  );
}

function buildReadonlyBootstrap() {
  const listings = sortListings(normalizeListings(listingsSeed), "recommended");

  return {
    listings,
    stats: {
      ...defaultStats,
      listingsCount: listings.length,
      averageDiscount: calculateAverageDiscount(listings),
    },
    options: defaultOptions,
    user: null,
    alerts: [],
    submissions: [],
    inquiries: [],
    admin: null,
  };
}

function buildHeaders(token, headers = {}) {
  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  return finalHeaders;
}

async function request(path, options = {}, token = "") {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: buildHeaders(token, options.headers),
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createFriendlyError(data, "요청 처리 중 오류가 발생했습니다.");
  }

  return data;
}

function getStoredRestToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(REST_TOKEN_KEY) || "";
}

function setStoredRestToken(token) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REST_TOKEN_KEY, token);
  }
}

export function clearPersistedAuth() {
  if (backendMode === "rest" && typeof window !== "undefined") {
    window.localStorage.removeItem(REST_TOKEN_KEY);
  }
}

export function getInitialAuthState() {
  if (backendMode === "rest") {
    return getStoredRestToken();
  }

  return "";
}

export function subscribeAuthState(callback) {
  if (backendMode !== "supabase") {
    return () => {};
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return () => {};
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    callback();
  });

  return () => subscription.unsubscribe();
}

function mapUserRow(row, fallbackUser = null) {
  if (row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at ?? row.createdAt,
    };
  }

  if (!fallbackUser) {
    return null;
  }

  return {
    id: fallbackUser.id,
    name:
      fallbackUser.user_metadata?.name ||
      fallbackUser.email?.split("@")[0] ||
      "사용자",
    email: fallbackUser.email || "",
    role: "user",
    createdAt: fallbackUser.created_at || new Date().toISOString(),
  };
}

function mapListingRow(row) {
  if (!row) {
    return null;
  }

  return normalizeListing({
    id: row.id,
    title: row.title,
    district: row.district,
    location: row.location,
    neighborhood: row.neighborhood,
    type: row.type,
    price: row.price,
    marketPrice: row.market_price ?? row.marketPrice,
    recentDealPrice: row.recent_deal_price ?? row.recentDealPrice,
    listingAverage: row.listing_average ?? row.listingAverage,
    score: row.score,
    hasVideo: row.has_video ?? row.hasVideo,
    hasReport: row.has_report ?? row.hasReport,
    areaValue: row.area_value ?? row.areaValue,
    area: row.area,
    floor: row.floor,
    builtYear: row.built_year ?? row.builtYear,
    urgentReason: row.urgent_reason ?? row.urgentReason,
    sellerType: row.seller_type ?? row.sellerType,
    description: row.description,
    highlights: row.highlights ?? [],
    risks: row.risks ?? [],
    transit: row.transit ?? [],
    tags: row.tags ?? [],
    partnerBroker: row.partner_broker ?? row.partnerBroker,
    image: row.image,
    createdAt: row.created_at ?? row.createdAt,
    source: row.source,
    ownerUserId: row.owner_user_id ?? row.ownerUserId,
    status: row.status ?? "approved",
    latitude: row.latitude,
    longitude: row.longitude,
    mapLabel: row.map_label ?? row.mapLabel,
    approved: (row.status ?? "approved") === "approved",
  });
}

function mapAlertRow(row) {
  return {
    id: row.id,
    name: row.name,
    district: row.district,
    type: row.type,
    keyword: row.keyword,
    maxPrice: row.max_price ?? row.maxPrice ?? 0,
    minArea: row.min_area ?? row.minArea ?? 0,
    minDiscount: row.min_discount ?? row.minDiscount ?? 5,
    hasVideo: Boolean(row.has_video ?? row.hasVideo),
    approvedOnly: row.approved_only ?? row.approvedOnly ?? true,
    createdAt: row.created_at ?? row.createdAt,
  };
}

function mapSubmissionResult(row) {
  return {
    id: row.id,
    listingId: row.listingId ?? row.listing_id ?? null,
    approved: Boolean(row.approved),
    submittedAt: row.submittedAt ?? row.submitted_at ?? row.created_at,
    blockers: Array.isArray(row.blockers) ? row.blockers : [],
    recommendations: Array.isArray(row.recommendations) ? row.recommendations : [],
    listing: row.listing ? mapListingRow(row.listing) : { title: row.title || "등록 심사 매물" },
  };
}

function mapSubmissionRow(row) {
  return mapSubmissionResult({
    ...row,
    listing: row.listing,
    submittedAt: row.created_at,
    listingId: row.listing_id,
  });
}

function mapInquiryRow(row) {
  const listing = row.listing ?? {};

  return {
    id: row.id,
    listingId: row.listingId ?? row.listing_id,
    listingTitle: row.listingTitle ?? listing.title ?? "급매 매물",
    listingLocation: row.listingLocation ?? listing.location ?? "",
    message: row.message,
    status: row.status,
    createdAt: row.createdAt ?? row.created_at,
  };
}

async function getSupabaseSessionUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  throwIfError(error, "로그인 정보를 불러오지 못했습니다.");

  if (!data.user) {
    throw new Error("로그인이 필요합니다.");
  }

  return data.user;
}

async function bootstrapFromSupabase() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return buildReadonlyBootstrap();
  }

  const [listingsResult, statsResult, sessionResult] = await Promise.all([
    supabase.from("listings").select("*").eq("status", "approved"),
    supabase.rpc("get_platform_stats"),
    supabase.auth.getSession(),
  ]);

  throwIfError(listingsResult.error, "매물 데이터를 불러오지 못했습니다.");
  throwIfError(statsResult.error, "플랫폼 지표를 불러오지 못했습니다.");
  throwIfError(sessionResult.error, "로그인 상태를 확인하지 못했습니다.");

  const listings = sortListings((listingsResult.data ?? []).map(mapListingRow), "recommended");
  const payload = {
    listings,
    stats: statsResult.data ?? {
      ...defaultStats,
      listingsCount: listings.length,
      averageDiscount: calculateAverageDiscount(listings),
    },
    options: defaultOptions,
    user: null,
    alerts: [],
    submissions: [],
    inquiries: [],
    admin: null,
  };

  const sessionUser = sessionResult.data.session?.user;

  if (!sessionUser) {
    return payload;
  }

  const [profileResult, alertsResult, submissionsResult, inquiriesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, email, role, created_at")
      .eq("id", sessionUser.id)
      .maybeSingle(),
    supabase.from("alerts").select("*").order("created_at", { ascending: false }),
    supabase
      .from("submissions")
      .select("id, listing_id, approved, blockers, recommendations, created_at, title, listing:listings(*)")
      .order("created_at", { ascending: false }),
    supabase
      .from("inquiries")
      .select("id, listing_id, message, status, created_at, listing:listings(title, location)")
      .order("created_at", { ascending: false }),
  ]);

  throwIfError(profileResult.error, "계정 정보를 불러오지 못했습니다.");
  throwIfError(alertsResult.error, "저장된 알림을 불러오지 못했습니다.");
  throwIfError(submissionsResult.error, "매도 등록 이력을 불러오지 못했습니다.");
  throwIfError(inquiriesResult.error, "문의 내역을 불러오지 못했습니다.");

  payload.user = mapUserRow(profileResult.data, sessionUser);
  payload.alerts = (alertsResult.data ?? [])
    .map(mapAlertRow)
    .map((alert) => ({
      ...alert,
      matches: createAlertMatchList(listings, alert),
    }));
  payload.submissions = (submissionsResult.data ?? []).map(mapSubmissionRow);
  payload.inquiries = (inquiriesResult.data ?? []).map(mapInquiryRow);

  if (payload.user?.role === "admin") {
    const adminResult = await supabase.rpc("get_admin_overview");
    throwIfError(adminResult.error, "관리자 대시보드를 불러오지 못했습니다.");
    payload.admin = adminResult.data ?? null;
  }

  return payload;
}

async function loginWithSupabase(credentials) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  });

  throwIfError(error, "로그인에 실패했습니다.");

  return {
    user: mapUserRow(null, data.user),
  };
}

async function registerWithSupabase(payload) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim(),
    password: payload.password,
    options: {
      data: {
        name: payload.name.trim(),
      },
    },
  });

  throwIfError(error, "회원가입에 실패했습니다.");

  return {
    user: mapUserRow(null, data.user),
    message: data.session
      ? "회원가입이 완료되었습니다."
      : "회원가입이 완료되었습니다. 인증 메일을 확인한 뒤 로그인해 주세요.",
  };
}

async function logoutFromSupabase() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  throwIfError(error, "로그아웃에 실패했습니다.");
}

async function createAlertInSupabase(alert) {
  const supabase = getSupabaseClient();
  const sessionUser = await getSupabaseSessionUser();
  const payload = {
    user_id: sessionUser.id,
    name: alert.name?.trim() || "내 급매 알림",
    district: alert.district || "전체",
    type: alert.type || "전체",
    keyword: alert.keyword?.trim() || "",
    max_price: Number(alert.maxPrice) || 0,
    min_area: Number(alert.minArea) || 0,
    min_discount: Number(alert.minDiscount) || 5,
    has_video: Boolean(alert.hasVideo),
    approved_only: alert.approvedOnly !== false,
  };

  const { data, error } = await supabase.from("alerts").insert(payload).select("*").single();

  throwIfError(error, "알림 저장에 실패했습니다.");

  return {
    alert: mapAlertRow(data),
  };
}

async function deleteAlertInSupabase(alertId) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("alerts").delete().eq("id", alertId);
  throwIfError(error, "알림 삭제에 실패했습니다.");
  return null;
}

async function createSubmissionInSupabase(draft) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_submission", {
    payload_input: draft,
  });

  throwIfError(error, "매도 등록 심사에 실패했습니다.");

  return {
    submission: mapSubmissionResult(data ?? {}),
  };
}

async function createInquiryInSupabase(payload) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_inquiry", {
    listing_id_input: payload.listingId,
    message_input: payload.message,
  });

  throwIfError(error, "문의 접수에 실패했습니다.");

  return {
    inquiry: mapInquiryRow(data ?? {}),
  };
}

async function fetchSupabaseAdminOverview() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_admin_overview");

  throwIfError(error, "관리자 대시보드를 불러오지 못했습니다.");

  return {
    admin: data ?? null,
  };
}

function createReadonlyFailure() {
  return Promise.reject(new Error(READONLY_ERROR));
}

export const api = {
  async bootstrap(token = "") {
    if (backendMode === "supabase") {
      return bootstrapFromSupabase();
    }

    if (backendMode === "rest") {
      return request("/bootstrap", { method: "GET" }, token);
    }

    return buildReadonlyBootstrap();
  },

  async register(payload) {
    if (backendMode === "supabase") {
      return registerWithSupabase(payload);
    }

    if (backendMode === "rest") {
      const response = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStoredRestToken(response.token);
      return response;
    }

    return createReadonlyFailure();
  },

  async login(payload) {
    if (backendMode === "supabase") {
      return loginWithSupabase(payload);
    }

    if (backendMode === "rest") {
      const response = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStoredRestToken(response.token);
      return response;
    }

    return createReadonlyFailure();
  },

  async logout() {
    if (backendMode === "supabase") {
      return logoutFromSupabase();
    }

    if (backendMode === "rest") {
      clearPersistedAuth();
      return null;
    }

    return null;
  },

  async createAlert(payload, token = "") {
    if (backendMode === "supabase") {
      return createAlertInSupabase(payload);
    }

    if (backendMode === "rest") {
      return request(
        "/alerts",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token,
      );
    }

    return createReadonlyFailure();
  },

  async deleteAlert(alertId, token = "") {
    if (backendMode === "supabase") {
      return deleteAlertInSupabase(alertId);
    }

    if (backendMode === "rest") {
      return request(`/alerts/${alertId}`, { method: "DELETE" }, token);
    }

    return createReadonlyFailure();
  },

  async createSubmission(payload, token = "") {
    if (backendMode === "supabase") {
      return createSubmissionInSupabase(payload);
    }

    if (backendMode === "rest") {
      return request(
        "/submissions",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token,
      );
    }

    return createReadonlyFailure();
  },

  async createInquiry(payload, token = "") {
    if (backendMode === "supabase") {
      return createInquiryInSupabase(payload);
    }

    if (backendMode === "rest") {
      return request(
        "/inquiries",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token,
      );
    }

    return createReadonlyFailure();
  },

  async fetchAdminOverview(token = "") {
    if (backendMode === "supabase") {
      return fetchSupabaseAdminOverview();
    }

    if (backendMode === "rest") {
      return request("/admin/overview", { method: "GET" }, token);
    }

    return {
      admin: null,
    };
  },

  async fetchDemoAccounts() {
    if (backendMode === "rest") {
      return request("/meta/demo-accounts", { method: "GET" });
    }

    return {
      accounts: [],
    };
  },
};
