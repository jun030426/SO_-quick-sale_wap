import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  api,
  backendLabel,
  backendMode,
  clearPersistedAuth,
  defaultOptions,
  defaultStats,
  getInitialAuthState,
  isWritableBackend,
  subscribeAuthState,
} from "../lib/api";

const MarketplaceContext = createContext(null);

export function MarketplaceProvider({ children }) {
  const [authState, setAuthState] = useState(() => getInitialAuthState());
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [bootstrapError, setBootstrapError] = useState("");
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [options, setOptions] = useState(defaultOptions);
  const [alertProfiles, setAlertProfiles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [adminOverview, setAdminOverview] = useState(null);
  const [demoAccounts, setDemoAccounts] = useState([]);

  async function refreshData(activeAuthState = authState) {
    const [bootstrapPayload, demoPayload] = await Promise.all([
      api.bootstrap(activeAuthState),
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
    setBootstrapError("");
  }

  useEffect(() => {
    return subscribeAuthState(() => {
      setAuthState(`${Date.now()}`);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsBootstrapping(true);

      try {
        await refreshData(authState);
      } catch (error) {
        console.error(error);

        if (backendMode === "rest" && authState) {
          clearPersistedAuth();

          if (!cancelled) {
            setAuthState("");
          }

          try {
            await refreshData("");
          } catch (fallbackError) {
            console.error(fallbackError);

            if (!cancelled) {
              setBootstrapError(fallbackError.message);
            }
          }
        } else if (!cancelled) {
          setBootstrapError(error.message);
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
  }, [authState]);

  async function login(credentials) {
    setIsAuthLoading(true);

    try {
      const response = await api.login(credentials);
      const nextAuthState = getInitialAuthState() || `${Date.now()}`;
      setAuthState(nextAuthState);
      await refreshData(nextAuthState);
      return response;
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function register(payload) {
    setIsAuthLoading(true);

    try {
      const response = await api.register(payload);
      const nextAuthState = getInitialAuthState() || `${Date.now()}`;
      setAuthState(nextAuthState);
      await refreshData(nextAuthState);
      return response;
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function logout() {
    await api.logout();
    setUser(null);
    setAlertProfiles([]);
    setSubmissions([]);
    setInquiries([]);
    setAdminOverview(null);

    const nextAuthState = getInitialAuthState() || `${Date.now()}`;
    setAuthState(nextAuthState);
    await refreshData(nextAuthState);
  }

  async function saveAlertProfile(alert) {
    const response = await api.createAlert(alert, authState);
    await refreshData(getInitialAuthState() || `${Date.now()}`);
    return response.alert;
  }

  async function removeAlertProfile(id) {
    await api.deleteAlert(id, authState);
    await refreshData(getInitialAuthState() || `${Date.now()}`);
  }

  async function submitListing(draft) {
    const response = await api.createSubmission(draft, authState);
    await refreshData(getInitialAuthState() || `${Date.now()}`);
    return response.submission;
  }

  async function createInquiry(payload) {
    const response = await api.createInquiry(payload, authState);
    await refreshData(getInitialAuthState() || `${Date.now()}`);
    return response.inquiry;
  }

  async function refreshAdminOverview() {
    if (!user || user.role !== "admin") {
      throw new Error("관리자 권한이 필요합니다.");
    }

    const response = await api.fetchAdminOverview(authState);
    setAdminOverview(response.admin);
    return response.admin;
  }

  const value = useMemo(
    () => ({
      authState,
      user,
      listings,
      stats,
      options,
      alertProfiles,
      submissions,
      inquiries,
      adminOverview,
      demoAccounts,
      backendMode,
      backendLabel,
      isWritableBackend,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isBootstrapping,
      isAuthLoading,
      bootstrapError,
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
      authState,
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
      bootstrapError,
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
