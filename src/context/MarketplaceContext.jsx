import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredToken,
  api,
  getStoredToken,
  setStoredToken,
} from "../lib/api";

const MarketplaceContext = createContext(null);

const defaultStats = {
  listingsCount: 0,
  averageDiscount: 0,
  usersCount: 0,
  alertsCount: 0,
  inquiriesCount: 0,
};

const defaultOptions = {
  districtOptions: ["전체", "서울", "경기", "인천"],
  propertyTypes: ["전체", "아파트", "주상복합", "오피스텔", "빌라"],
  urgentReasonOptions: [
    "양도세 일정 대응",
    "사업 자금 확보",
    "대출 만기 압박",
    "상속 정리",
    "이사 일정 압박",
  ],
};

export function MarketplaceProvider({ children }) {
  const [token, setToken] = useState(() =>
    typeof window === "undefined" ? "" : getStoredToken(),
  );
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [options, setOptions] = useState(defaultOptions);
  const [alertProfiles, setAlertProfiles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [adminOverview, setAdminOverview] = useState(null);
  const [demoAccounts, setDemoAccounts] = useState([]);

  async function refreshData(activeToken = token) {
    const [bootstrapPayload, demoPayload] = await Promise.all([
      api.bootstrap(activeToken),
      api.fetchDemoAccounts(),
    ]);

    setListings(bootstrapPayload.listings ?? []);
    setStats(bootstrapPayload.stats ?? defaultStats);
    setOptions(bootstrapPayload.options ?? defaultOptions);
    setUser(bootstrapPayload.user ?? null);
    setAlertProfiles(bootstrapPayload.alerts ?? []);
    setSubmissions(bootstrapPayload.submissions ?? []);
    setInquiries(bootstrapPayload.inquiries ?? []);
    setAdminOverview(bootstrapPayload.admin ?? null);
    setDemoAccounts(demoPayload.accounts ?? []);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsBootstrapping(true);

      try {
        await refreshData(token);
      } catch (error) {
        if (token) {
          clearStoredToken();
          if (!cancelled) {
            setToken("");
          }
        }

        if (!cancelled) {
          try {
            await refreshData("");
          } catch (fallbackError) {
            console.error(fallbackError);
          }
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(credentials) {
    setIsAuthLoading(true);

    try {
      const response = await api.login(credentials);
      setStoredToken(response.token);
      setToken(response.token);
      return response.user;
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function register(payload) {
    setIsAuthLoading(true);

    try {
      const response = await api.register(payload);
      setStoredToken(response.token);
      setToken(response.token);
      return response.user;
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function logout() {
    clearStoredToken();
    setToken("");
    setUser(null);
    setAlertProfiles([]);
    setSubmissions([]);
    setInquiries([]);
    setAdminOverview(null);
  }

  async function saveAlertProfile(alert) {
    if (!token) {
      throw new Error("알림 저장은 로그인 후 이용할 수 있습니다.");
    }

    const response = await api.createAlert(alert, token);
    await refreshData(token);
    return response.alert;
  }

  async function removeAlertProfile(id) {
    if (!token) {
      throw new Error("알림 삭제는 로그인 후 이용할 수 있습니다.");
    }

    await api.deleteAlert(id, token);
    await refreshData(token);
  }

  async function submitListing(draft) {
    if (!token) {
      throw new Error("매도 등록은 로그인 후 이용할 수 있습니다.");
    }

    const response = await api.createSubmission(draft, token);
    await refreshData(token);
    return response.submission;
  }

  async function createInquiry(payload) {
    if (!token) {
      throw new Error("매물 문의는 로그인 후 이용할 수 있습니다.");
    }

    const response = await api.createInquiry(payload, token);
    await refreshData(token);
    return response.inquiry;
  }

  async function refreshAdminOverview() {
    if (!token || user?.role !== "admin") {
      throw new Error("관리자 권한이 필요합니다.");
    }

    const response = await api.fetchAdminOverview(token);
    setAdminOverview(response.admin);
    return response.admin;
  }

  const value = useMemo(
    () => ({
      token,
      user,
      listings,
      stats,
      options,
      alertProfiles,
      submissions,
      inquiries,
      adminOverview,
      demoAccounts,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isBootstrapping,
      isAuthLoading,
      login,
      register,
      logout,
      saveAlertProfile,
      removeAlertProfile,
      submitListing,
      createInquiry,
      refreshData,
      refreshAdminOverview,
    }),
    [
      token,
      user,
      listings,
      stats,
      options,
      alertProfiles,
      submissions,
      inquiries,
      adminOverview,
      demoAccounts,
      isBootstrapping,
      isAuthLoading,
    ],
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);

  if (!context) {
    throw new Error("useMarketplace must be used within MarketplaceProvider");
  }

  return context;
}
