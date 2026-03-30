import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";
import "../styles/account.css";

const loginInitial = {
  email: "",
  password: "",
};

function Login() {
  const navigate = useNavigate();
  const {
    demoAccounts,
    backendMode,
    isWritableBackend,
    isAuthenticated,
    isAuthLoading,
    login,
  } = useMarketplace();
  const [form, setForm] = useState(loginInitial);
  const [feedback, setFeedback] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await login(form);
      setForm(loginInitial);
      navigate("/", { replace: true });
    } catch (error) {
      setFeedback(error.message);
    }
  };

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">로그인</span>
          <h1 className="page-title">저장된 알림과 문의 기록을 이어서 확인하세요</h1>
          <p className="page-desc">
            급매 알림, 매도 등록, 문의 기록은 로그인 후 계정 단위로 계속 관리할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="container auth-layout">
          <article className="account-card auth-card">
            <div className="panel-header">
              <h2>로그인</h2>
            </div>

            <form className="account-form" onSubmit={handleSubmit}>
              <div className="filter-group">
                <label htmlFor="login-email">이메일</label>
                <input
                  id="login-email"
                  type="email"
                  className="search-input"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>

              <div className="filter-group">
                <label htmlFor="login-password">비밀번호</label>
                <input
                  id="login-password"
                  type="password"
                  className="search-input"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isAuthLoading}>
                {isAuthLoading ? "처리 중..." : "로그인"}
              </button>
            </form>

            <p className="auth-switch">
              아직 계정이 없다면 <Link to="/register" className="text-link">회원가입</Link>
            </p>

            {feedback && <div className="feedback-inline danger">{feedback}</div>}
          </article>

          <div className="auth-stack">
            <article className="account-card">
              <div className="panel-header">
                <h2>로그인 후 가능한 일</h2>
              </div>
              <ul className="plain-list">
                <li>급매 알림 조건 저장</li>
                <li>문의 내역 다시 확인</li>
                <li>매도 등록 심사 이력 관리</li>
              </ul>
            </article>

            {!isWritableBackend && (
              <article className="account-card">
                <div className="panel-header">
                  <h2>실사용 연결 필요</h2>
                </div>
                <p className="helper-copy">
                  지금 보고 있는 빌드는 읽기 전용입니다. Netlify에는{" "}
                  <code>VITE_SUPABASE_URL</code>과 <code>VITE_SUPABASE_ANON_KEY</code>를 넣어야
                  실제 로그인과 저장이 동작합니다.
                </p>
              </article>
            )}

            {backendMode === "rest" && demoAccounts.length > 0 && (
              <article className="account-card">
                <div className="panel-header">
                  <h2>테스트 계정</h2>
                </div>
                <div className="demo-account-list">
                  {demoAccounts.map((account) => (
                    <div key={account.email} className="demo-account-item">
                      <strong>{account.role === "admin" ? "관리자" : "일반 사용자"}</strong>
                      <span>{account.email}</span>
                      <span>{account.passwordHint}</span>
                    </div>
                  ))}
                </div>
              </article>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
