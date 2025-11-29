import { Link, useLocation } from "react-router";

const MainMenu = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Radar", icon: "🎯" },
    { path: "/signals/add", label: "Dodaj sygnał", icon: "➕" },
  ];

  return (
    <ul className="menu bg-base-200 w-64 min-h-screen p-4">
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
  );
};

export default MainMenu;
