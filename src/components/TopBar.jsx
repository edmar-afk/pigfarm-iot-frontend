import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList } from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Ledger",
    path: "/ledger",
    icon: ClipboardList,
  },
];

function Topbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-green-400 bg-green-900 py-4">
      <nav
        aria-label="Main navigation"
        className="flex h-14 w-full flex-row items-center gap-2 px-3"
      >
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              [
                "flex h-10 min-w-0 flex-1 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-xl px-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-[#173B2F] text-white"
                  : "bg-slate-100 text-slate-600 active:bg-slate-200",
              ].join(" ")
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Topbar;
