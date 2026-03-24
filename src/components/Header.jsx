import { Link, NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          급매
        </Link>

        <nav className="nav">
          <NavLink to="/" className="nav-link">
            홈
          </NavLink>
          <NavLink to="/listings" className="nav-link">
            급매 매물
          </NavLink>
        </nav>

        <div className="header-actions">
          <button className="btn btn-outline">로그인</button>
          <button className="btn btn-primary">알림 설정</button>
        </div>
      </div>
    </header>
  );
}

export default Header;