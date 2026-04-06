import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function Header() {
  const { user, isAdmin, isAuthenticated } = useMarketplace();
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const [isVisible, setIsVisible] = useState(() => isAuthPage);

  useEffect(() => {
    if (isAuthPage) {
      setIsVisible(true);
      return undefined;
    }

    const handleScroll = () => {
      setIsVisible(window.scrollY > 120);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAuthPage, pathname]);

  const navItems = [
    { to: "/listings", label: "급매 지도" },
    { to: "/sell", label: "매도 등록" },
    { to: "/saved", label: "관심목록" },
    { to: "/alerts", label: "급매 알림" },
  ];

  if (isAdmin) {
    navItems.push({ to: "/admin", label: "운영" });
  }

  return (
    <header
      className={`site-header ${isAuthPage ? "site-header-auth" : "site-header-floating"}${
        isVisible ? " is-visible" : ""
      }`}
    >
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="급매 홈으로 이동">
          <span className="logo-mark" aria-hidden="true">
            <img src="/quick-sale-logo.svg" alt="" className="logo-icon" />
          </span>
          <span className="logo-lockup">
            <strong>급매</strong>
            <span>아파트 매도·매수 전용 플랫폼</span>
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
          <Link to={isAuthenticated ? "/account" : "/login"} className="btn btn-outline header-cta header-cta-light">
            {isAuthenticated ? `${user.name}님` : "로그인"}
          </Link>
          <Link to="/listings" className="btn btn-outline header-cta header-cta-light">
            문의하기
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
