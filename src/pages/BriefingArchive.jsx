import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAiDigestArchive } from "../data/aiBriefings";
import "../styles/briefing.css";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function stripHtmlTags(value) {
  return String(value || "").replace(/<[^>]+>/g, "").trim();
}

function BriefingArchive() {
  const archive = useMemo(() => getAiDigestArchive(), []);
  const [newsFeed, setNewsFeed] = useState({
    loading: true,
    sourceConfigured: false,
    provider: "",
    query: "",
    articles: [],
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadNewsFeed() {
      try {
        const response = await fetch(`${API_BASE}/news-feed`);
        const payload = await response.json();

        if (!cancelled) {
          setNewsFeed({
            loading: false,
            sourceConfigured: Boolean(payload.sourceConfigured),
            provider: payload.provider || "",
            query: payload.query || "",
            articles: Array.isArray(payload.articles) ? payload.articles : [],
            error: "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setNewsFeed({
            loading: false,
            sourceConfigured: false,
            provider: "",
            query: "",
            articles: [],
            error: error.message || "실제 기사 피드를 불러오지 못했습니다.",
          });
        }
      }
    }

    loadNewsFeed();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="briefing-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">홈</Link>
          <span>/</span>
          <span>AI 기사 아카이브</span>
        </div>

        <section className="briefing-archive-hero">
          <div>
            <span className="eyebrow">Archive</span>
            <h1>지금까지 올린 AI 재구성 요약 기사 목록</h1>
            <p>
              홈에는 최신 카드뉴스만 노출하고, 이 페이지에서는 날짜별로 쌓인 기사 아카이브를 볼 수 있게
              구성했습니다.
            </p>
          </div>

          <div className="briefing-archive-summary">
            <article className="briefing-archive-summary-card">
              <strong>{archive.length}일치</strong>
              <span>누적 브리핑 날짜</span>
            </article>
            <article className="briefing-archive-summary-card">
              <strong>{archive.reduce((sum, digest) => sum + digest.articles.length, 0)}건</strong>
              <span>누적 기사 카드</span>
            </article>
          </div>
        </section>

        <section className="briefing-live-feed">
          <div className="panel-header">
            <h2>실제 기사 API 피드</h2>
            {newsFeed.provider && <span className="pill accent">{newsFeed.provider}</span>}
          </div>

          {newsFeed.loading ? (
            <p className="detail-paragraph">실제 기사 피드를 불러오는 중입니다.</p>
          ) : newsFeed.error ? (
            <div className="empty-box compact">
              <h3>실제 기사 피드를 아직 불러오지 못했습니다</h3>
              <p>{newsFeed.error}</p>
            </div>
          ) : newsFeed.sourceConfigured ? (
            <div className="briefing-live-grid">
              {newsFeed.articles.map((article) => (
                <a
                  key={article.link}
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  className="briefing-live-card"
                >
                  <span className="briefing-live-kicker">{stripHtmlTags(article.source)}</span>
                  <strong>{stripHtmlTags(article.title)}</strong>
                  <p>{stripHtmlTags(article.description)}</p>
                  <small>{article.pubDate}</small>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-box compact">
              <h3>실제 기사 API는 아직 연결되지 않았습니다</h3>
              <p>서버 환경변수에 네이버 뉴스 검색 API 키를 넣으면 이 영역에 실제 기사 목록이 함께 보입니다.</p>
            </div>
          )}
        </section>

        <div className="briefing-archive-stack">
          {archive.map((digest) => (
            <section key={digest.id} className="briefing-archive-section">
              <div className="briefing-archive-section-head">
                <div>
                  <span className="comparison-label">{digest.id}</span>
                  <h2>{digest.title}</h2>
                  <p>{digest.subtitle}</p>
                </div>
                <span className="pill accent">생성 {digest.generatedLabel}</span>
              </div>

              <div className="home-ai-card-grid">
                {digest.articles.map((article) => (
                  <Link key={article.slug} to={`/briefings/${article.slug}`} className="home-ai-card">
                    <div className="home-ai-card-image-wrap">
                      <img src={article.image} alt={article.title} className="home-ai-card-image" />
                    </div>

                    <div className="home-ai-card-body">
                      <div className="home-ai-card-meta">
                        <span className="home-ai-card-source">{article.sourceName}</span>
                        <small>{article.sourcePublishedAt}</small>
                      </div>
                      <strong>{article.title}</strong>
                      <p>{article.summary}</p>
                      <span className="text-link">기사 보기</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BriefingArchive;
