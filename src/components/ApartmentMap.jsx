import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatCompactPrice } from "../utils/marketplace";
import { getDistrictCenter } from "../utils/location.js";

const NAVER_MAP_CLIENT_ID = String(import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "").trim();
let naverMapsSdkPromise = null;

function createPriceMarker(listing, selected) {
  return L.divIcon({
    className: "map-price-marker-shell",
    html: `<div class="map-price-marker${selected ? " is-selected" : ""}"><span>${formatCompactPrice(listing.price)}</span></div>`,
    iconSize: [84, 34],
    iconAnchor: [42, 34],
  });
}

function createNaverPriceMarker(mapsApi, listing, selected) {
  return {
    content: `<div class="map-price-marker${selected ? " is-selected" : ""}"><span>${formatCompactPrice(listing.price)}</span></div>`,
    size: new mapsApi.Size(84, 34),
    anchor: new mapsApi.Point(42, 34),
  };
}

function getLeafletBounds(listings) {
  return L.latLngBounds(listings.map((listing) => [listing.latitude, listing.longitude]));
}

function getNaverBounds(listings, mapsApi) {
  const latitudes = listings.map((listing) => listing.latitude);
  const longitudes = listings.map((listing) => listing.longitude);

  return new mapsApi.LatLngBounds(
    new mapsApi.LatLng(Math.min(...latitudes), Math.min(...longitudes)),
    new mapsApi.LatLng(Math.max(...latitudes), Math.max(...longitudes)),
  );
}

function createLeafletViewportPayload(map) {
  const bounds = map.getBounds();
  const center = map.getCenter();

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
    centerLat: center.lat,
    centerLng: center.lng,
    zoom: map.getZoom(),
  };
}

function createNaverViewportPayload(map) {
  const bounds = map.getBounds();
  const center = map.getCenter();

  return {
    north: bounds.north(),
    south: bounds.south(),
    east: bounds.east(),
    west: bounds.west(),
    centerLat: center.lat(),
    centerLng: center.lng(),
    zoom: map.getZoom(),
  };
}

function scheduleLeafletMapSync(map, onBoundsChange) {
  const sync = () => {
    map.invalidateSize(false);
    onBoundsChange?.(createLeafletViewportPayload(map));
  };

  sync();
  window.setTimeout(sync, 180);
  window.setTimeout(sync, 520);
}

function scheduleNaverMapSync(map, onBoundsChange) {
  const sync = () => {
    map.autoResize?.();
    map.refresh?.(true);
    onBoundsChange?.(createNaverViewportPayload(map));
  };

  sync();
  window.setTimeout(sync, 180);
  window.setTimeout(sync, 520);
}

function loadNaverMapsSdk() {
  if (!NAVER_MAP_CLIENT_ID) {
    return Promise.reject(new Error("Missing VITE_NAVER_MAP_CLIENT_ID"));
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("NAVER Maps SDK requires a browser environment"));
  }

  if (window.naver?.maps) {
    return Promise.resolve(window.naver);
  }

  if (naverMapsSdkPromise) {
    return naverMapsSdkPromise;
  }

  naverMapsSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-map-sdk="naver"]');

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          if (window.naver?.maps) {
            resolve(window.naver);
            return;
          }

          reject(new Error("NAVER Maps SDK loaded without window.naver.maps"));
        },
        { once: true },
      );
      existingScript.addEventListener("error", () => reject(new Error("Failed to load NAVER Maps SDK")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.mapSdk = "naver";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(
      NAVER_MAP_CLIENT_ID,
    )}&language=ko`;

    script.onload = () => {
      if (window.naver?.maps) {
        resolve(window.naver);
        return;
      }

      reject(new Error("NAVER Maps SDK loaded without window.naver.maps"));
    };

    script.onerror = () => {
      reject(new Error("Failed to load NAVER Maps SDK"));
    };

    document.head.appendChild(script);
  }).catch((error) => {
    naverMapsSdkPromise = null;
    throw error;
  });

  return naverMapsSdkPromise;
}

function ApartmentMap({
  listings,
  selectedListingId = "",
  onSelectListing,
  onBoundsChange,
  className = "",
  baseZoom = 11,
  fallbackDistrict = "전체",
  focusSelected = false,
}) {
  const containerRef = useRef(null);
  const mapStateRef = useRef({
    provider: "",
    map: null,
    mapsApi: null,
  });
  const markersRef = useRef([]);
  const markerListenersRef = useRef([]);
  const previousListingsKeyRef = useRef("");
  const [mapProvider, setMapProvider] = useState(NAVER_MAP_CLIENT_ID ? "loading" : "leaflet");

  const fallbackCenter = useMemo(() => getDistrictCenter(fallbackDistrict), [fallbackDistrict]);
  const listingsKey = useMemo(
    () => listings.map((listing) => `${listing.id}:${listing.latitude}:${listing.longitude}`).join("|"),
    [listings],
  );

  useEffect(() => {
    let cancelled = false;

    if (!NAVER_MAP_CLIENT_ID) {
      setMapProvider("leaflet");
      return undefined;
    }

    loadNaverMapsSdk()
      .then(() => {
        if (!cancelled) {
          setMapProvider("naver");
        }
      })
      .catch((error) => {
        console.warn("NAVER Maps SDK fallback:", error);

        if (!cancelled) {
          setMapProvider("leaflet");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const clearMarkers = () => {
    const { provider } = mapStateRef.current;

    markerListenersRef.current.forEach((listener) => {
      if (provider === "naver" && window.naver?.maps) {
        window.naver.maps.Event.removeListener(listener);
      }
    });
    markerListenersRef.current = [];

    markersRef.current.forEach((marker) => {
      if (provider === "naver") {
        marker.setMap(null);
        return;
      }

      marker.remove();
    });
    markersRef.current = [];
  };

  useEffect(() => {
    if (!containerRef.current || mapProvider === "loading") {
      return undefined;
    }

    clearMarkers();
    previousListingsKeyRef.current = "";
    containerRef.current.innerHTML = "";

    if (mapProvider === "naver") {
      const mapsApi = window.naver.maps;
      const map = new mapsApi.Map(containerRef.current, {
        center: new mapsApi.LatLng(fallbackCenter.latitude, fallbackCenter.longitude),
        zoom: baseZoom,
        mapTypeControl: false,
        scaleControl: false,
        logoControl: true,
        zoomControl: true,
        scrollWheel: true,
      });

      mapStateRef.current = {
        provider: "naver",
        map,
        mapsApi,
      };

      const idleListener = mapsApi.Event.addListener(map, "idle", () => {
        onBoundsChange?.(createNaverViewportPayload(map));
      });

      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(() => {
              scheduleNaverMapSync(map, onBoundsChange);
            });

      resizeObserver?.observe(containerRef.current);
      window.setTimeout(() => {
        scheduleNaverMapSync(map, onBoundsChange);
      }, 0);
      onBoundsChange?.(createNaverViewportPayload(map));

      return () => {
        clearMarkers();
        mapsApi.Event.removeListener(idleListener);
        resizeObserver?.disconnect();
        map.destroy();
        mapStateRef.current = {
          provider: "",
          map: null,
          mapsApi: null,
        };

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      };
    }

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    map.setView([fallbackCenter.latitude, fallbackCenter.longitude], baseZoom);
    mapStateRef.current = {
      provider: "leaflet",
      map,
      mapsApi: null,
    };

    const reportBounds = () => {
      onBoundsChange?.(createLeafletViewportPayload(map));
    };

    map.on("moveend zoomend", reportBounds);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            map.invalidateSize(false);
          });

    resizeObserver?.observe(containerRef.current);
    window.setTimeout(() => {
      scheduleLeafletMapSync(map, onBoundsChange);
    }, 0);
    reportBounds();

    return () => {
      clearMarkers();
      map.off("moveend zoomend", reportBounds);
      resizeObserver?.disconnect();
      map.remove();
      mapStateRef.current = {
        provider: "",
        map: null,
        mapsApi: null,
      };
    };
  }, [baseZoom, fallbackCenter.latitude, fallbackCenter.longitude, mapProvider, onBoundsChange]);

  useEffect(() => {
    const { map, mapsApi, provider } = mapStateRef.current;

    if (!map) {
      return;
    }

    clearMarkers();

    if (!listings.length) {
      if (provider === "naver") {
        map.setCenter(new mapsApi.LatLng(fallbackCenter.latitude, fallbackCenter.longitude));
        map.setZoom(baseZoom);
        scheduleNaverMapSync(map, onBoundsChange);
        return;
      }

      map.setView([fallbackCenter.latitude, fallbackCenter.longitude], baseZoom);
      scheduleLeafletMapSync(map, onBoundsChange);
      return;
    }

    if (provider === "naver") {
      listings.forEach((listing) => {
        const marker = new mapsApi.Marker({
          position: new mapsApi.LatLng(listing.latitude, listing.longitude),
          map,
          title: listing.mapLabel || listing.title,
          zIndex: listing.id === selectedListingId ? 200 : 100,
          icon: createNaverPriceMarker(mapsApi, listing, listing.id === selectedListingId),
        });

        const listener = mapsApi.Event.addListener(marker, "click", () => {
          onSelectListing?.(listing.id);
        });

        markersRef.current.push(marker);
        markerListenersRef.current.push(listener);
      });

      return;
    }

    listings.forEach((listing) => {
      const marker = L.marker([listing.latitude, listing.longitude], {
        icon: createPriceMarker(listing, listing.id === selectedListingId),
      }).addTo(map);

      marker.on("click", () => {
        onSelectListing?.(listing.id);
      });

      marker.bindTooltip(
        `<strong>${listing.mapLabel || listing.title}</strong><br/>${listing.location}`,
        {
          direction: "top",
          offset: [0, -24],
        },
      );

      markersRef.current.push(marker);
    });
  }, [
    baseZoom,
    fallbackCenter.latitude,
    fallbackCenter.longitude,
    listings,
    onBoundsChange,
    onSelectListing,
    selectedListingId,
  ]);

  useEffect(() => {
    const { map, mapsApi, provider } = mapStateRef.current;

    if (!map) {
      return;
    }

    if (!listings.length) {
      if (provider === "naver") {
        map.setCenter(new mapsApi.LatLng(fallbackCenter.latitude, fallbackCenter.longitude));
        map.setZoom(baseZoom);
        onBoundsChange?.(createNaverViewportPayload(map));
      } else {
        map.setView([fallbackCenter.latitude, fallbackCenter.longitude], baseZoom);
        onBoundsChange?.(createLeafletViewportPayload(map));
      }

      previousListingsKeyRef.current = "";
      return;
    }

    if (previousListingsKeyRef.current === listingsKey) {
      return;
    }

    previousListingsKeyRef.current = listingsKey;

    if (provider === "naver") {
      if (listings.length === 1) {
        map.setCenter(new mapsApi.LatLng(listings[0].latitude, listings[0].longitude));
        map.setZoom(13);
        scheduleNaverMapSync(map, onBoundsChange);
        return;
      }

      map.fitBounds(getNaverBounds(listings, mapsApi), {
        top: 24,
        right: 24,
        bottom: 24,
        left: 24,
        maxZoom: 13,
      });
      scheduleNaverMapSync(map, onBoundsChange);
      return;
    }

    if (listings.length === 1) {
      map.setView([listings[0].latitude, listings[0].longitude], 13);
      scheduleLeafletMapSync(map, onBoundsChange);
      return;
    }

    map.fitBounds(getLeafletBounds(listings).pad(0.18), {
      maxZoom: 13,
      padding: [24, 24],
    });
    scheduleLeafletMapSync(map, onBoundsChange);
  }, [baseZoom, fallbackCenter.latitude, fallbackCenter.longitude, listings, listingsKey, onBoundsChange]);

  useEffect(() => {
    const { map, mapsApi, provider } = mapStateRef.current;

    if (!map || !focusSelected) {
      return;
    }

    const selectedListing = listings.find((listing) => listing.id === selectedListingId);

    if (!selectedListing) {
      return;
    }

    if (provider === "naver") {
      map.setCenter(new mapsApi.LatLng(selectedListing.latitude, selectedListing.longitude));
      map.setZoom(13);
      scheduleNaverMapSync(map, onBoundsChange);
      return;
    }

    map.setView([selectedListing.latitude, selectedListing.longitude], 13, {
      animate: true,
    });
    scheduleLeafletMapSync(map, onBoundsChange);
  }, [focusSelected, listings, onBoundsChange, selectedListingId]);

  return (
    <div
      ref={containerRef}
      className={`apartment-map${mapProvider === "naver" ? " is-naver" : ""} ${className}`.trim()}
      aria-label="아파트 급매 지도"
    />
  );
}

export default ApartmentMap;
