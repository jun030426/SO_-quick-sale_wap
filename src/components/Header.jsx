import { Link, NavLink } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function Header() {
  const { user, isAdmin, isAuthenticated } = useMarketplace();

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
            급매
          </span>
          <span className="logo-lockup">
            <strong>대한민국 아파트 타임딜 거래소</strong>
            <span>AI가 검증한 진짜 급매만 빠르게 연결합니다</span>
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
          {isAuthenticated && (
            <Link to="/account" className="header-user">
              {user.name}님
            </Link>
          )}
          <Link to="/alerts" className="btn btn-primary header-cta">
            급매 알림 신청
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
