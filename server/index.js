import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { readBearerToken, signToken, verifyToken } from "./auth.js";
import {
  buildBootstrapPayload,
  createAlert,
  createInquiry,
  createSubmission,
  createUser,
  deleteAlert,
  getAdminOverview,
  getListingById,
  getUserById,
  getUserRecordByEmail,
  listApprovedListings,
  sanitizeUser,
  verifyUser,
} from "./store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT) || 4000;
const naverSearchClientId = String(process.env.NAVER_SEARCH_CLIENT_ID || "").trim();
const naverSearchClientSecret = String(process.env.NAVER_SEARCH_CLIENT_SECRET || "").trim();

const app = express();

app.use(express.json({ limit: "1mb" }));

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtmlTags(value) {
  return decodeHtmlEntities(String(value || "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function getRequestUser(req) {
  const token = readBearerToken(req);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload?.sub) {
    return null;
  }

  return getUserById(payload.sub);
}

function requireAuth(req, res, next) {
  const user = getRequestUser(req);

  if (!user) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }

  req.user = user;
  return next();
}

function requireAdmin(req, res, next) {
  const user = getRequestUser(req);

  if (!user) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }

  req.user = user;
  return next();
}

app.get("/api/bootstrap", (req, res) => {
  const user = getRequestUser(req);
  return res.json(buildBootstrapPayload(user));
});

app.get("/api/listings", (req, res) => {
  const listings = listApprovedListings(req.query);
  return res.json({ listings });
});

app.get("/api/listings/:id", (req, res) => {
  const listing = getListingById(req.params.id);

  if (!listing || listing.status !== "approved") {
    return res.status(404).json({ message: "매물을 찾을 수 없습니다." });
  }

  return res.json({ listing });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "이름, 이메일, 비밀번호를 모두 입력해주세요." });
  }

  if (password.trim().length < 6) {
    return res.status(400).json({ message: "비밀번호는 6자 이상이어야 합니다." });
  }

  try {
    const user = createUser({
      name,
      email,
      password: password.trim(),
    });

    return res.status(201).json({
      token: signToken(user),
      user,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || "회원가입에 실패했습니다." });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
  }

  const user = verifyUser(email.trim(), password.trim());

  if (!user) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  return res.json({
    token: signToken(user),
    user,
  });
});

app.get("/api/auth/me", (req, res) => {
  const user = getRequestUser(req);

  if (!user) {
    return res.status(401).json({ message: "세션이 만료되었거나 로그인 정보가 없습니다." });
  }

  return res.json({ user });
});

app.post("/api/alerts", requireAuth, (req, res) => {
  const savedAlert = createAlert(req.user.id, req.body ?? {});
  return res.status(201).json({ alert: savedAlert });
});

app.delete("/api/alerts/:id", requireAuth, (req, res) => {
  const deleted = deleteAlert(req.user.id, req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "삭제할 알림을 찾지 못했습니다." });
  }

  return res.status(204).end();
});

app.post("/api/submissions", requireAuth, (req, res) => {
  const draft = req.body ?? {};

  if (!draft.district || !draft.type || !draft.urgentReason) {
    return res.status(400).json({ message: "필수 매물 정보가 부족합니다." });
  }

  const evaluation = createSubmission(req.user.id, draft);
  return res.status(201).json({ submission: evaluation });
});

app.post("/api/inquiries", requireAuth, (req, res) => {
  const { listingId, message } = req.body ?? {};

  if (!listingId || !message?.trim()) {
    return res.status(400).json({ message: "매물과 문의 내용을 입력해주세요." });
  }

  try {
    const inquiry = createInquiry(req.user.id, listingId, message);
    return res.status(201).json({ inquiry });
  } catch (error) {
    return res.status(400).json({ message: error.message || "문의 접수에 실패했습니다." });
  }
});

app.get("/api/admin/overview", requireAdmin, (req, res) => {
  return res.json({ admin: getAdminOverview() });
});

app.get("/api/meta/demo-accounts", (req, res) => {
  const admin = sanitizeUser(getUserRecordByEmail("admin@geupmae.kr"));
  const user = sanitizeUser(getUserRecordByEmail("user@geupmae.kr"));

  return res.json({
    accounts: [
      {
        ...admin,
        passwordHint: "admin1234",
      },
      {
        ...user,
        passwordHint: "user1234",
      },
    ],
  });
});

app.get("/api/news-feed", async (req, res) => {
  if (!naverSearchClientId || !naverSearchClientSecret) {
    return res.json({
      sourceConfigured: false,
      provider: "naver-search-news",
      query: String(req.query.q || "부동산 아파트 급매"),
      articles: [],
    });
  }

  try {
    const query = String(req.query.q || "부동산 아파트 급매").trim() || "부동산 아파트 급매";
    const display = Math.max(1, Math.min(Number(req.query.limit) || 6, 10));
    const requestUrl = new URL("https://openapi.naver.com/v1/search/news.json");
    requestUrl.searchParams.set("query", query);
    requestUrl.searchParams.set("display", String(display));
    requestUrl.searchParams.set("start", "1");
    requestUrl.searchParams.set("sort", "date");

    const response = await fetch(requestUrl, {
      headers: {
        "X-Naver-Client-Id": naverSearchClientId,
        "X-Naver-Client-Secret": naverSearchClientSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({
        message: "네이버 뉴스 검색 API 응답을 불러오지 못했습니다.",
        detail: errorText,
      });
    }

    const payload = await response.json();
    const articles = Array.isArray(payload.items)
      ? payload.items.map((item) => ({
          title: stripHtmlTags(item.title),
          description: stripHtmlTags(item.description),
          link: item.link,
          originallink: item.originallink,
          source: "네이버 뉴스 검색",
          pubDate: item.pubDate,
        }))
      : [];

    return res.json({
      sourceConfigured: true,
      provider: "naver-search-news",
      query,
      articles,
    });
  } catch (error) {
    return res.status(500).json({
      message: "실제 기사 피드를 불러오지 못했습니다.",
      detail: error.message,
    });
  }
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    return res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`quick-sale server listening on http://localhost:${port}`);
});
