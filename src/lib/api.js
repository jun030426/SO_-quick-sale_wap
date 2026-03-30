const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const TOKEN_KEY = "quick-sale-auth-token";

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
    throw new Error(data.message || "요청 처리 중 오류가 발생했습니다.");
  }

  return data;
}

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setStoredToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export const api = {
  bootstrap(token) {
    return request("/bootstrap", { method: "GET" }, token);
  },
  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createAlert(payload, token) {
    return request(
      "/alerts",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    );
  },
  deleteAlert(alertId, token) {
    return request(`/alerts/${alertId}`, { method: "DELETE" }, token);
  },
  createSubmission(payload, token) {
    return request(
      "/submissions",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    );
  },
  createInquiry(payload, token) {
    return request(
      "/inquiries",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    );
  },
  fetchAdminOverview(token) {
    return request("/admin/overview", { method: "GET" }, token);
  },
  fetchDemoAccounts() {
    return request("/meta/demo-accounts", { method: "GET" });
  },
};
