import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";
import "../styles/account.css";

const registerInitial = {
  name: "",
  email: "",
  password: "",
};

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, register } = useMarketplace();
  const [form, setForm] = useState(registerInitial);
  const [feedback, setFeedback] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await register(form);
      setForm(registerInitial);
      navigate("/", { replace: true });
    } catch (error) {
      setFeedback(error.message);
    }
  };

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">회원가입</span>
          <h1 className="page-title">계정을 만들고 급매 흐름을 계속 이어가세요</h1>
          <p className="page-desc">
            회원가입 후에는 알림 저장, 문의 이력 확인, 매도 등록 심사 결과까지 계정 기준으로
            관리할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="container auth-layout">
          <article className="account-card auth-card">
            <div className="panel-header">
              <h2>회원가입</h2>
            </div>

            <form className="account-form" onSubmit={handleSubmit}>
              <div className="filter-group">
                <label htmlFor="register-name">이름</label>
                <input
                  id="register-name"
                  type="text"
                  className="search-input"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>

              <div className="filter-group">
                <label htmlFor="register-email">이메일</label>
                <input
                  id="register-email"
                  type="email"
                  className="search-input"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>

              <div className="filter-group">
                <label htmlFor="register-password">비밀번호</label>
                <input
                  id="register-password"
                  type="password"
                  className="search-input"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isAuthLoading}>
                {isAuthLoading ? "처리 중..." : "회원가입"}
              </button>
            </form>

            <p className="auth-switch">
              이미 계정이 있다면 <Link to="/login" className="text-link">로그인</Link>
            </p>

            {feedback && <div className="feedback-inline danger">{feedback}</div>}
          </article>

          <div className="auth-stack">
            <article className="account-card">
              <div className="panel-header">
                <h2>가입 후 바로 할 수 있는 일</h2>
              </div>
              <ul className="plain-list">
                <li>급매 알림 조건 저장하기</li>
                <li>급매 상세에서 문의 남기기</li>
                <li>매도 등록 심사 요청하기</li>
              </ul>
            </article>

            <article className="account-card">
              <div className="panel-header">
                <h2>시작 가이드</h2>
              </div>
              <p className="helper-copy">
                회원가입이 끝나면 홈으로 이동합니다. 이후 `급매 알림`, `급매 지도`, `매도 등록`
                에서 바로 이어서 사용할 수 있습니다.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;
