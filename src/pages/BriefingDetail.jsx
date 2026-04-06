import { Link, useParams } from "react-router-dom";
import { getAiDigestArticleBySlug } from "../data/aiBriefings";
import "../styles/briefing.css";

function BriefingDetail() {
  const { slug } = useParams();
  const article = getAiDigestArticleBySlug(slug);

  if (!article) {
    return (
      <div className="container detail-page">
        <div className="empty-box">
          <h2>기사 요약을 찾을 수 없습니다</h2>
          <p>삭제되었거나 아직 공개되지 않은 카드뉴스일 수 있습니다.</p>
          <Link to="/" className="btn btn-primary">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="briefing-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">홈</Link>
          <span>/</span>
          <Link to="/briefings">AI 기사 아카이브</Link>
          <span>/</span>
          <span>{article.title}</span>
        </div>

        <section className="briefing-hero">
          <div className="briefing-hero-media">
            <img src={article.image} alt={article.title} className="briefing-hero-image" />
          </div>

          <div className="briefing-hero-copy">
            <span className="eyebrow">AI News Card</span>
            <h1>{article.title}</h1>
            <p>{article.summary}</p>

            <div className="briefing-meta-strip">
              <span className="pill accent">브리핑 날짜 {article.digestId}</span>
              <span className="pill">생성 {article.digestGeneratedLabel}</span>
              <span className="pill">
                출처 {article.sourceName} · {article.sourcePublishedAt}
              </span>
            </div>

            <div className="briefing-cta-row">
              <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                원문 기사 보기
              </a>
              <Link to="/briefings" className="btn btn-outline">
                목록
              </Link>
            </div>
          </div>
        </section>

        <section className="briefing-grid">
          {article.sections.map((section, index) => (
            <article key={section.heading} className="briefing-card">
              <span className="briefing-card-index">0{index + 1}</span>
              <strong>{section.heading}</strong>
              <p>{section.body}</p>
            </article>
          ))}
        </section>

        <section className="briefing-source-card">
          <div>
            <span className="comparison-label">출처 안내</span>
            <h2>우리 사이트 안에서 보는 AI 재구성 요약 기사</h2>
            <p>{article.sourceNote}</p>
          </div>

          <div className="briefing-source-actions">
            <p>
              원문 출처: {article.sourceName} · {article.sourcePublishedAt}
            </p>
            <div className="briefing-source-link-row">
              <Link to="/briefings" className="text-link">
                목록으로 가기
              </Link>
              <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="text-link">
                원문 링크 열기
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default BriefingDetail;
