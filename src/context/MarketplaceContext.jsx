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
import { getComplexKey, getComplexLabel } from "../utils/interests";

const MarketplaceContext = createContext(null);
const favoriteListingsStorageKey = "quick-sale.favorite-listings";
const recentViewedStorageKey = "quick-sale.recent-viewed";
const favoriteComplexesStorageKey = "quick-sale.favorite-complexes";

function readStoredIds(storageKey) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item) => typeof item === "string" && item.trim().length > 0)
      : [];
  } catch (error) {
    console.warn("Failed to read local interest state", error);
    return [];
  }
}

function writeStoredIds(storageKey, value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

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
  const [favoriteListingIds, setFavoriteListingIds] = useState(() => readStoredIds(favoriteListingsStorageKey));
  const [recentViewedIds, setRecentViewedIds] = useState(() => readStoredIds(recentViewedStorageKey));
  const [favoriteComplexKeys, setFavoriteComplexKeys] = useState(() => readStoredIds(favoriteComplexesStorageKey));

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

  useEffect(() => {
    writeStoredIds(favoriteListingsStorageKey, favoriteListingIds);
  }, [favoriteListingIds]);

  useEffect(() => {
    writeStoredIds(recentViewedStorageKey, recentViewedIds);
  }, [recentViewedIds]);

  useEffect(() => {
    writeStoredIds(favoriteComplexesStorageKey, favoriteComplexKeys);
  }, [favoriteComplexKeys]);

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

  function toggleListingFavorite(listingId) {
    if (!listingId) {
      return;
    }

    setFavoriteListingIds((current) =>
      current.includes(listingId) ? current.filter((item) => item !== listingId) : [listingId, ...current].slice(0, 100),
    );
  }

  function addRecentViewed(listingId) {
    if (!listingId) {
      return;
    }

    setRecentViewedIds((current) => [listingId, ...current.filter((item) => item !== listingId)].slice(0, 20));
  }

  function removeRecentViewed(listingId) {
    setRecentViewedIds((current) => current.filter((item) => item !== listingId));
  }

  function clearRecentViewed() {
    setRecentViewedIds([]);
  }

  function toggleComplexFavorite(listing) {
    const complexKey = typeof listing === "string" ? listing : getComplexKey(listing);

    setFavoriteComplexKeys((current) =>
      current.includes(complexKey) ? current.filter((item) => item !== complexKey) : [complexKey, ...current].slice(0, 100),
    );
  }

  function isListingFavorited(listingId) {
    return favoriteListingIds.includes(listingId);
  }

  function isComplexFavorited(listing) {
    const complexKey = typeof listing === "string" ? listing : getComplexKey(listing);
    return favoriteComplexKeys.includes(complexKey);
  }

  const favoriteListings = useMemo(
    () => favoriteListingIds.map((id) => listings.find((listing) => listing.id === id)).filter(Boolean),
    [favoriteListingIds, listings],
  );

  const recentViewedListings = useMemo(
    () => recentViewedIds.map((id) => listings.find((listing) => listing.id === id)).filter(Boolean),
    [listings, recentViewedIds],
  );

  const favoriteComplexes = useMemo(() => {
    return favoriteComplexKeys
      .map((complexKey) => {
        const matches = listings.filter((listing) => getComplexKey(listing) === complexKey);

        if (matches.length === 0) {
          return null;
        }

        const primaryListing = [...matches].sort((left, right) => left.price - right.price)[0];
        const averageDiscount =
          matches.reduce((sum, listing) => sum + listing.discountRate, 0) / Math.max(matches.length, 1);

        return {
          key: complexKey,
          name: getComplexLabel(primaryListing),
          district: primaryListing.district,
          location: primaryListing.location,
          listingId: primaryListing.id,
          image: primaryListing.image,
          count: matches.length,
          lowestPrice: Math.min(...matches.map((listing) => listing.price)),
          averageDiscount,
        };
      })
      .filter(Boolean);
  }, [favoriteComplexKeys, listings]);

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
      favoriteListingIds,
      recentViewedIds,
      favoriteComplexKeys,
      favoriteListings,
      recentViewedListings,
      favoriteComplexes,
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
      toggleListingFavorite,
      addRecentViewed,
      removeRecentViewed,
      clearRecentViewed,
      toggleComplexFavorite,
      isListingFavorited,
      isComplexFavorited,
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
      favoriteListingIds,
      recentViewedIds,
      favoriteComplexKeys,
      favoriteListings,
      recentViewedListings,
      favoriteComplexes,
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
