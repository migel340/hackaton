import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n";
import logoSvg from "@/logo.svg";

const MainMenu = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDark]);

  const menuItems = [
    { path: "/", label: "Radar", icon: "📡" },
    { path: "/signals/add", label: "Dodaj sygnał", icon: "➕" },
    { path: "/profile", label: "Profil", icon: "👤" },
  ];

  return (
    <div className="flex flex-col bg-base-200 w-64 min-h-screen">
      {/* Logo */}
      <div className="border-b border-base-300 flex items-center">
        <Link to="/" className="flex items-center group">
          <img 
            src={logoSvg} 
            alt="Echo logo" 
            className="w-21 h-21 group-hover:scale-105 transition-transform"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              echo
            </h1>
            <p className="text-xs text-base-content/50 -mt-1">find your match</p>
          </div>
        </Link>
      </div>

      <ul className="menu p-4 flex-1">
        <li className="menu-title">
          <span>{t.navigation}</span>
        </li>
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={
                location.pathname === item.path ? "bg-base-content/10" : ""
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-base-300 space-y-2">
        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === "pl" ? "en" : "pl")}
          className="btn btn-ghost w-full justify-start gap-2"
        >
          <span className="text-xl">{language === "pl" ? "🇬🇧" : "🇵🇱"}</span>
          {language === "pl" ? "English" : "Polski"}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="btn btn-ghost w-full justify-start gap-2"
        >
          <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
          {isDark ? t.lightMode : t.darkMode}
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
