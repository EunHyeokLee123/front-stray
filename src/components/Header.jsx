import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "../hooks/use-mobile";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = [
    {
      id: "stray",
      label: "유기동물 정보",
      path: "/stray/list?region=전체&category=개&page=0",
    },
    { id: "festival", label: "반려동물 행사정보", path: "/festival/list" },
    { id: "facility", label: "반려동물 관련 시설 정보", path: "/map/culture?cate=12&region=1" },
  ];

  const isActive = (path) => {
    if (path === "/stray/list?region=전체&category=개&page=0") {
      return location.pathname.startsWith("/stray");
    }
    if (path === "/festival/list") {
      return location.pathname.startsWith("/festival");
    }
    if (path === "/map/culture?cate=12&region=1") {
      return location.pathname.startsWith("/map");
    }
    return false;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/stray/list?region=전체&category=개&page=0">
            <img src="/nukki.png" alt="냥몽 로고" className="logo-img" />
          </Link>
        </div>

        {/* PC/태블릿: 기존처럼 헤더 우측에 메뉴 노출 */}
        {!isMobile && (
          <nav className="nav-buttons">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`nav-button ${isActive(tab.path) ? "active" : ""}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        )}

        {/* 모바일: 햄버거 버튼 */}
        {isMobile && (
          <button
            type="button"
            className="hamburger-button"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="header-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`hamburger-icon ${menuOpen ? "open" : ""}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        )}
      </div>

      {/* 모바일에서만 펼쳐지는 메뉴 */}
      {isMobile && (
        <nav
          id="header-nav"
          className={`nav-buttons mobile ${menuOpen ? "open" : ""}`}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`nav-button ${isActive(tab.path) ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
