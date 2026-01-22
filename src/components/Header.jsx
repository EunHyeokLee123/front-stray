import { Link, useLocation } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const tabs = [
    { id: "stray", label: "유기동물 정보", path: "/stray/list" },
    { id: "festival", label: "반려동물 행사정보", path: "/festival/list" },
    { id: "facility", label: "반려동물 관련 시설 정보", path: "/map" },
  ];

  const isActive = (path) => {
    if (path === "/stray/list") {
      return location.pathname.startsWith("/stray");
    }
    if (path === "/festival/list") {
      return location.pathname.startsWith("/festival");
    }
    if (path === "/map") {
      return location.pathname === "/map";
    }
    return false;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/stray/list">
            <img src="/nukki.png" alt="냥몽 로고" className="logo-img" />
          </Link>
        </div>
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
      </div>
    </header>
  );
};

export default Header;
