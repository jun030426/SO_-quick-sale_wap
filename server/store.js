import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import listingsSeed from "../src/data/listings.js";
import {
  districtOptions,
  propertyTypes,
  urgentReasonOptions,
} from "../src/data/listings.js";
import {
  createAlertMatchList,
  evaluateListingDraft,
  matchesListingFilters,
  normalizeListing,
  sortListings,
} from "../src/utils/marketplace.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "quick-sale.db");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

function toJson(value) {
  return JSON.stringify(value ?? null);
}

function fromJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
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
    marketPrice: row.market_price,
    recentDealPrice: row.recent_deal_price,
    listingAverage: row.listing_average,
    score: row.score,
    hasVideo: Boolean(row.has_video),
    hasReport: Boolean(row.has_report),
    areaValue: row.area_value,
    area: row.area,
    floor: row.floor,
    builtYear: row.built_year,
    urgentReason: row.urgent_reason,
    sellerType: row.seller_type,
    description: row.description,
    highlights: fromJson(row.highlights, []),
    risks: fromJson(row.risks, []),
    transit: fromJson(row.transit, []),
    tags: fromJson(row.tags, []),
    partnerBroker: fromJson(row.partner_broker, null),
    image: row.image,
    createdAt: row.created_at,
    source: row.source,
    ownerUserId: row.owner_user_id,
    status: row.status,
  });
}

function insertListing(listing, metadata = {}) {
  const normalized = normalizeListing(listing);

  db.prepare(
    `
      INSERT OR REPLACE INTO listings (
        id, title, district, location, neighborhood, type, price, market_price,
        recent_deal_price, listing_average, score, has_video, has_report,
        area_value, area, floor, built_year, urgent_reason, seller_type,
        description, highlights, risks, transit, tags, partner_broker, image,
        created_at, source, owner_user_id, status
      ) VALUES (
        @id, @title, @district, @location, @neighborhood, @type, @price, @marketPrice,
        @recentDealPrice, @listingAverage, @score, @hasVideo, @hasReport,
        @areaValue, @area, @floor, @builtYear, @urgentReason, @sellerType,
        @description, @highlights, @risks, @transit, @tags, @partnerBroker, @image,
        @createdAt, @source, @ownerUserId, @status
      )
    `,
  ).run({
    id: normalized.id,
    title: normalized.title,
    district: normalized.district,
    location: normalized.location,
    neighborhood: normalized.neighborhood,
    type: normalized.type,
    price: normalized.price,
    marketPrice: normalized.marketPrice,
    recentDealPrice: normalized.recentDealPrice,
    listingAverage: normalized.listingAverage,
    score: normalized.score,
    hasVideo: normalized.hasVideo ? 1 : 0,
    hasReport: normalized.hasReport ? 1 : 0,
    areaValue: normalized.areaValue,
    area: normalized.area,
    floor: normalized.floor,
    builtYear: normalized.builtYear,
    urgentReason: normalized.urgentReason,
    sellerType: normalized.sellerType,
    description: normalized.description,
    highlights: toJson(normalized.highlights),
    risks: toJson(normalized.risks),
    transit: toJson(normalized.transit),
    tags: toJson(normalized.tags),
    partnerBroker: toJson(normalized.partnerBroker),
    image: normalized.image,
    createdAt: normalized.createdAt,
    source: metadata.source || normalized.source || "seed",
    ownerUserId: metadata.ownerUserId ?? normalized.ownerUserId ?? null,
    status: metadata.status || normalized.status || "approved",
  });

  return getListingById(normalized.id);
}

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      district TEXT NOT NULL,
      location TEXT NOT NULL,
      neighborhood TEXT,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      market_price INTEGER NOT NULL,
      recent_deal_price INTEGER NOT NULL,
      listing_average INTEGER NOT NULL,
      score INTEGER NOT NULL,
      has_video INTEGER NOT NULL DEFAULT 0,
      has_report INTEGER NOT NULL DEFAULT 0,
      area_value REAL NOT NULL,
      area TEXT NOT NULL,
      floor TEXT NOT NULL,
      built_year INTEGER NOT NULL,
      urgent_reason TEXT NOT NULL,
      seller_type TEXT NOT NULL,
      description TEXT NOT NULL,
      highlights TEXT NOT NULL,
      risks TEXT NOT NULL,
      transit TEXT NOT NULL,
      tags TEXT NOT NULL,
      partner_broker TEXT NOT NULL,
      image TEXT NOT NULL,
      created_at TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'seed',
      owner_user_id INTEGER,
      status TEXT NOT NULL DEFAULT 'approved'
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      district TEXT NOT NULL,
      type TEXT NOT NULL,
      keyword TEXT NOT NULL,
      max_price INTEGER NOT NULL DEFAULT 0,
      min_area REAL NOT NULL DEFAULT 0,
      min_discount REAL NOT NULL DEFAULT 5,
      has_video INTEGER NOT NULL DEFAULT 0,
      approved_only INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      listing_id TEXT,
      requester_type TEXT NOT NULL,
      title TEXT,
      district TEXT NOT NULL,
      location TEXT,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      market_price INTEGER NOT NULL,
      area_value REAL NOT NULL DEFAULT 0,
      floor TEXT,
      built_year INTEGER,
      urgent_reason TEXT NOT NULL,
      description TEXT,
      image TEXT,
      has_video INTEGER NOT NULL DEFAULT 0,
      has_report INTEGER NOT NULL DEFAULT 0,
      approved INTEGER NOT NULL DEFAULT 0,
      blockers TEXT NOT NULL,
      recommendations TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(listing_id) REFERENCES listings(id)
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      listing_id TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(listing_id) REFERENCES listings(id)
    );
  `);
}

function seedDatabase() {
  const usersCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;

  if (usersCount === 0) {
    const now = new Date().toISOString();

    db.prepare(
      `
        INSERT INTO users (name, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
    ).run("관리자", "admin@geupmae.kr", bcrypt.hashSync("admin1234", 10), "admin", now);

    db.prepare(
      `
        INSERT INTO users (name, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
    ).run("테스트 사용자", "user@geupmae.kr", bcrypt.hashSync("user1234", 10), "user", now);
  }

  const listingsCount = db.prepare("SELECT COUNT(*) AS count FROM listings").get().count;

  if (listingsCount === 0) {
    listingsSeed.forEach((listing) => {
      insertListing(listing, { source: "seed", status: "approved" });
    });
  }
}

initializeSchema();
seedDatabase();

export function getOptionSets() {
  return {
    districtOptions,
    propertyTypes,
    urgentReasonOptions,
  };
}

export function sanitizeUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function getUserById(id) {
  return sanitizeUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id));
}

export function getUserRecordByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
}

export function createUser({ name, email, password }) {
  const trimmedEmail = email.trim().toLowerCase();

  if (getUserRecordByEmail(trimmedEmail)) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }

  const result = db
    .prepare(
      `
        INSERT INTO users (name, email, password_hash, role, created_at)
        VALUES (?, ?, ?, 'user', ?)
      `,
    )
    .run(name.trim(), trimmedEmail, bcrypt.hashSync(password, 10), new Date().toISOString());

  return getUserById(result.lastInsertRowid);
}

export function verifyUser(email, password) {
  const user = getUserRecordByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  return sanitizeUser(user);
}

export function listApprovedListings(filters = {}) {
  const rows = db.prepare("SELECT * FROM listings WHERE status = 'approved'").all();
  const listings = rows.map(mapListingRow).filter((listing) => matchesListingFilters(listing, filters));
  return sortListings(listings, filters.sort || "recommended");
}

export function getListingById(id) {
  return mapListingRow(db.prepare("SELECT * FROM listings WHERE id = ?").get(id));
}

export function createAlert(userId, alert) {
  const entry = {
    id: alert.id ?? `alert-${Date.now()}`,
    name: alert.name?.trim() || "새 급매 알림",
    district: alert.district || "전체",
    type: alert.type || "전체",
    keyword: alert.keyword?.trim() || "",
    maxPrice: Number(alert.maxPrice) || 0,
    minArea: Number(alert.minArea) || 0,
    minDiscount: Number(alert.minDiscount) || 5,
    hasVideo: alert.hasVideo ? 1 : 0,
    approvedOnly: alert.approvedOnly === false ? 0 : 1,
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    `
      INSERT OR REPLACE INTO alerts (
        id, user_id, name, district, type, keyword, max_price,
        min_area, min_discount, has_video, approved_only, created_at
      ) VALUES (
        @id, @userId, @name, @district, @type, @keyword, @maxPrice,
        @minArea, @minDiscount, @hasVideo, @approvedOnly, @createdAt
      )
    `,
  ).run({
    ...entry,
    userId,
  });

  return listAlertsForUser(userId).find((item) => item.id === entry.id);
}

export function listAlertsForUser(userId) {
  return db
    .prepare("SELECT * FROM alerts WHERE user_id = ? ORDER BY datetime(created_at) DESC")
    .all(userId)
    .map((row) => ({
      id: row.id,
      name: row.name,
      district: row.district,
      type: row.type,
      keyword: row.keyword,
      maxPrice: row.max_price,
      minArea: row.min_area,
      minDiscount: row.min_discount,
      hasVideo: Boolean(row.has_video),
      approvedOnly: Boolean(row.approved_only),
      createdAt: row.created_at,
    }));
}

export function deleteAlert(userId, alertId) {
  return db.prepare("DELETE FROM alerts WHERE id = ? AND user_id = ?").run(alertId, userId).changes > 0;
}

export function createSubmission(userId, draft) {
  const evaluation = evaluateListingDraft(draft);
  let listingId = null;

  if (evaluation.approved) {
    const insertedListing = insertListing(evaluation.listing, {
      source: "user",
      ownerUserId: userId,
      status: "approved",
    });
    listingId = insertedListing.id;
    evaluation.listing = insertedListing;
  }

  db.prepare(
    `
      INSERT INTO submissions (
        id, user_id, listing_id, requester_type, title, district, location, type,
        price, market_price, area_value, floor, built_year, urgent_reason,
        description, image, has_video, has_report, approved, blockers,
        recommendations, created_at
      ) VALUES (
        @id, @userId, @listingId, @requesterType, @title, @district, @location, @type,
        @price, @marketPrice, @areaValue, @floor, @builtYear, @urgentReason,
        @description, @image, @hasVideo, @hasReport, @approved, @blockers,
        @recommendations, @createdAt
      )
    `,
  ).run({
    id: evaluation.id,
    userId,
    listingId,
    requesterType: draft.requesterType,
    title: draft.title ?? "",
    district: draft.district,
    location: draft.location ?? "",
    type: draft.type,
    price: Number(draft.price) || 0,
    marketPrice: Number(draft.marketPrice) || 0,
    areaValue: Number(draft.areaValue) || 0,
    floor: draft.floor ?? "",
    builtYear: Number(draft.builtYear) || null,
    urgentReason: draft.urgentReason,
    description: draft.description ?? "",
    image: draft.image ?? "",
    hasVideo: draft.hasVideo ? 1 : 0,
    hasReport: draft.hasReport ? 1 : 0,
    approved: evaluation.approved ? 1 : 0,
    blockers: toJson(evaluation.blockers),
    recommendations: toJson(evaluation.recommendations),
    createdAt: evaluation.submittedAt,
  });

  return evaluation;
}

export function listSubmissionsForUser(userId) {
  return db
    .prepare(
      `
        SELECT submissions.*, listings.title AS listing_title
        FROM submissions
        LEFT JOIN listings ON listings.id = submissions.listing_id
        WHERE submissions.user_id = ?
        ORDER BY datetime(submissions.created_at) DESC
      `,
    )
    .all(userId)
    .map((row) => ({
      id: row.id,
      listingId: row.listing_id,
      approved: Boolean(row.approved),
      submittedAt: row.created_at,
      blockers: fromJson(row.blockers, []),
      recommendations: fromJson(row.recommendations, []),
      listing: row.listing_id
        ? getListingById(row.listing_id)
        : {
            title: row.title || row.listing_title || "등록 심사 매물",
          },
    }));
}

export function createInquiry(userId, listingId, message) {
  const listing = getListingById(listingId);

  if (!listing || listing.status === "rejected") {
    throw new Error("문의할 수 없는 매물입니다.");
  }

  const inquiry = {
    id: `inquiry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    listingId,
    message: message.trim(),
    status: "new",
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    `
      INSERT INTO inquiries (id, user_id, listing_id, message, status, created_at)
      VALUES (@id, @userId, @listingId, @message, @status, @createdAt)
    `,
  ).run(inquiry);

  return listInquiriesForUser(userId).find((item) => item.id === inquiry.id);
}

export function listInquiriesForUser(userId) {
  return db
    .prepare(
      `
        SELECT inquiries.*, listings.title AS listing_title, listings.location AS listing_location
        FROM inquiries
        INNER JOIN listings ON listings.id = inquiries.listing_id
        WHERE inquiries.user_id = ?
        ORDER BY datetime(inquiries.created_at) DESC
      `,
    )
    .all(userId)
    .map((row) => ({
      id: row.id,
      listingId: row.listing_id,
      listingTitle: row.listing_title,
      listingLocation: row.listing_location,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
    }));
}

export function getPlatformStats() {
  const listings = listApprovedListings();
  const users = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  const alerts = db.prepare("SELECT COUNT(*) AS count FROM alerts").get().count;
  const inquiries = db.prepare("SELECT COUNT(*) AS count FROM inquiries").get().count;

  const averageDiscount =
    listings.length > 0
      ? Number(
          (listings.reduce((total, listing) => total + listing.discountRate, 0) / listings.length).toFixed(1),
        )
      : 0;

  return {
    listingsCount: listings.length,
    averageDiscount,
    usersCount: users,
    alertsCount: alerts,
    inquiriesCount: inquiries,
  };
}

export function getAdminOverview() {
  const submissions = db
    .prepare(
      `
        SELECT submissions.*, users.name AS user_name, users.email AS user_email
        FROM submissions
        INNER JOIN users ON users.id = submissions.user_id
        ORDER BY datetime(submissions.created_at) DESC
        LIMIT 20
      `,
    )
    .all()
    .map((row) => ({
      id: row.id,
      title: row.title || "등록 심사 매물",
      requesterType: row.requester_type,
      district: row.district,
      location: row.location,
      price: row.price,
      marketPrice: row.market_price,
      urgentReason: row.urgent_reason,
      approved: Boolean(row.approved),
      createdAt: row.created_at,
      userName: row.user_name,
      userEmail: row.user_email,
    }));

  const inquiries = db
    .prepare(
      `
        SELECT inquiries.*, users.name AS user_name, users.email AS user_email, listings.title AS listing_title
        FROM inquiries
        INNER JOIN users ON users.id = inquiries.user_id
        INNER JOIN listings ON listings.id = inquiries.listing_id
        ORDER BY datetime(inquiries.created_at) DESC
        LIMIT 20
      `,
    )
    .all()
    .map((row) => ({
      id: row.id,
      listingId: row.listing_id,
      listingTitle: row.listing_title,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
      userName: row.user_name,
      userEmail: row.user_email,
    }));

  return {
    stats: getPlatformStats(),
    submissions,
    inquiries,
  };
}

export function buildBootstrapPayload(user = null) {
  const listings = listApprovedListings({ approvedOnly: true, sort: "recommended" });
  const payload = {
    listings,
    stats: getPlatformStats(),
    options: getOptionSets(),
  };

  if (user) {
    payload.user = user;
    payload.alerts = listAlertsForUser(user.id).map((alert) => ({
      ...alert,
      matches: createAlertMatchList(listings, alert),
    }));
    payload.submissions = listSubmissionsForUser(user.id);
    payload.inquiries = listInquiriesForUser(user.id);

    if (user.role === "admin") {
      payload.admin = getAdminOverview();
    }
  }

  return payload;
}
