import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";

const MainMenu = () => {
  const location = useLocation();
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
    { path: "/", label: "Radar", icon: "🎯" },
    { path: "/signals/add", label: "Dodaj sygnał", icon: "➕" },
  ];

  return (
    <div className="flex flex-col bg-base-200 w-64 min-h-screen">
      <ul className="menu p-4 flex-1">
        <li className="menu-title">
          <span>Navigation</span>
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
      
      <div className="p-4 border-t border-base-300">
        <button
          onClick={() => setIsDark(!isDark)}
          className="btn btn-ghost w-full justify-start gap-2"
        >
          <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
          {isDark ? "Tryb jasny" : "Tryb ciemny"}
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
