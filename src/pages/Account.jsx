import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";
import { formatDate } from "../utils/marketplace";
import "../styles/account.css";

const loginInitial = {
  email: "",
  password: "",
};

const registerInitial = {
  name: "",
  email: "",
  password: "",
};

function Account() {
  const navigate = useNavigate();
  const {
    user,
    inquiries,
    submissions,
    demoAccounts,
    backendMode,
    backendLabel,
    isWritableBackend,
    isAuthenticated,
    isAuthLoading,
    login,
    register,
    logout,
  } = useMarketplace();
  const [loginForm, setLoginForm] = useState(loginInitial);
  const [registerForm, setRegisterForm] = useState(registerInitial);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("");

  const applyFeedback = (message, tone = "") => {
    setFeedback(message);
    setFeedbackTone(tone);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      await login(loginForm);
      setLoginForm(loginInitial);
      navigate("/", { replace: true });
    } catch (error) {
      applyFeedback(error.message, "danger");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      await register(registerForm);
      setRegisterForm(registerInitial);
      navigate("/", { replace: true });
    } catch (error) {
      applyFeedback(error.message, "danger");
    }
  };

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">내 계정</span>
          <h1 className="page-title">계정으로 저장하고, 문의하고, 다시 돌아오세요</h1>
          <p className="page-desc">
            이제 알림, 매도 등록, 문의 기록이 브라우저 임시 상태가 아니라 계정 단위로 유지됩니다.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="container account-layout">
          {isAuthenticated ? (
            <>
              <article className="account-card">
                <div className="panel-header">
                  <h2>내 계정</h2>
                </div>
                <div className="profile-block">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <span>{user.role === "admin" ? "운영 관리자" : "일반 사용자"}</span>
                  <span>{backendLabel}</span>
                </div>
                <div className="account-actions">
                  <Link to="/alerts" className="btn btn-outline">
                    알림 관리
                  </Link>
                  <Link to="/sell" className="btn btn-primary">
                    매도 등록하기
                  </Link>
                  <button type="button" className="btn btn-outline" onClick={logout}>
                    로그아웃
                  </button>
                </div>
              </article>

              <article className="account-card">
                <div className="panel-header">
                  <h2>최근 문의</h2>
                </div>
                {inquiries.length > 0 ? (
                  <div className="history-list">
                    {inquiries.slice(0, 5).map((item) => (
                      <article key={item.id} className="history-item">
                        <div>
                          <strong>{item.listingTitle}</strong>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        <p>{item.message}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-box compact">
                    <h3>아직 문의한 매물이 없습니다</h3>
                    <p>상세 페이지에서 파트너 중개사 연결 문의를 남길 수 있습니다.</p>
                  </div>
                )}
              </article>

              <article className="account-card">
                <div className="panel-header">
                  <h2>최근 매도 등록</h2>
                </div>
                {submissions.length > 0 ? (
                  <div className="history-list">
                    {submissions.slice(0, 5).map((item) => (
                      <article key={item.id} className="history-item">
                        <div>
                          <strong>{item.listing.title}</strong>
                          <span>{formatDate(item.submittedAt)}</span>
                        </div>
                        <b className={item.approved ? "tone-success" : "tone-danger"}>
                          {item.approved ? "승인" : "보완 필요"}
                        </b>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-box compact">
                    <h3>아직 등록한 매물이 없습니다</h3>
                    <p>매도 등록 페이지에서 실제 심사와 저장이 가능합니다.</p>
                  </div>
                )}
              </article>
            </>
          ) : (
            <>
              <article className="account-card">
                <div className="panel-header">
                  <h2>로그인</h2>
                </div>
                <form className="account-form" onSubmit={handleLogin}>
                  <div className="filter-group">
                    <label htmlFor="login-email">이메일</label>
                    <input
                      id="login-email"
                      type="email"
                      className="search-input"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                  </div>
                  <div className="filter-group">
                    <label htmlFor="login-password">비밀번호</label>
                    <input
                      id="login-password"
                      type="password"
                      className="search-input"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isAuthLoading}>
                    {isAuthLoading ? "처리 중..." : "로그인"}
                  </button>
                </form>
              </article>

              <article className="account-card">
                <div className="panel-header">
                  <h2>회원가입</h2>
                </div>
                <form className="account-form" onSubmit={handleRegister}>
                  <div className="filter-group">
                    <label htmlFor="register-name">이름</label>
                    <input
                      id="register-name"
                      type="text"
                      className="search-input"
                      value={registerForm.name}
                      onChange={(event) =>
                        setRegisterForm((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                  </div>
                  <div className="filter-group">
                    <label htmlFor="register-email">이메일</label>
                    <input
                      id="register-email"
                      type="email"
                      className="search-input"
                      value={registerForm.email}
                      onChange={(event) =>
                        setRegisterForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                  </div>
                  <div className="filter-group">
                    <label htmlFor="register-password">비밀번호</label>
                    <input
                      id="register-password"
                      type="password"
                      className="search-input"
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isAuthLoading}>
                    {isAuthLoading ? "처리 중..." : "회원가입"}
                  </button>
                </form>
              </article>

              {!isWritableBackend && (
                <article className="account-card">
                  <div className="panel-header">
                    <h2>실사용 연결 필요</h2>
                  </div>
                  <p className="helper-copy">
                    지금 보고 있는 빌드는 읽기 전용입니다. Netlify에는{" "}
                    <code>VITE_SUPABASE_URL</code>과 <code>VITE_SUPABASE_ANON_KEY</code>를
                    넣어야 실제 회원가입과 저장이 동작합니다.
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
                  <p className="helper-copy">
                    로컬 API 서버에만 제공되는 테스트 계정입니다. 실배포에서는 Supabase 계정을
                    직접 생성해 사용하세요.
                  </p>
                </article>
              )}
            </>
          )}
        </div>
      </section>

      {feedback && (
        <div className={`feedback-toast ${feedbackTone === "danger" ? "danger" : "success"}`}>
          {feedback}
        </div>
      )}
    </div>
  );
}

export default Account;
