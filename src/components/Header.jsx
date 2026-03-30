import { Link, NavLink } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function Header() {
  const { user, isAdmin, isAuthenticated, logout } = useMarketplace();

  const navItems = [
    { to: "/", label: "홈" },
    { to: "/listings", label: "급매 지도" },
    { to: "/alerts", label: "급매 알림" },
    { to: "/sell", label: "매도 등록" },
    { to: "/account", label: isAuthenticated ? "내 계정" : "로그인" },
  ];

  if (isAdmin) {
    navItems.splice(4, 0, { to: "/admin", label: "운영 대시보드" });
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="급매 홈으로 이동">
          <span className="logo-mark" aria-hidden="true">
            G
          </span>
          <span className="logo-lockup">
            <strong>급매</strong>
            <span>대한민국 아파트 타임딜 거래소</span>
          </span>
        </Link>

        <nav className="nav" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <span className="header-user">{user.name}</span>
              <button type="button" className="btn btn-outline" onClick={logout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/account" className="btn btn-outline">
                로그인
              </Link>
              <Link to="/account" className="btn btn-primary">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
