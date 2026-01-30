import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Bell,
  Settings,
  User,
} from "lucide-react";

import "./MobileBottomNav.css";

export default function MobileBottomNav() {
  const location = useLocation();

  const tabs = [
    { to: "/", icon: <Home size={20} />, label: "Home" },
    { to: "/clients", icon: <Users size={20} />, label: "Clients" },
    { to: "/invoices", icon: <FileText size={20} />, label: "Invoices" },
    { to: "/payments", icon: <CreditCard size={20} />, label: "Payments" },
    { to: "/reminders", icon: <Bell size={20} />, label: "Alerts" },
    { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
    { to: "/profile", icon: <User size={20} />, label: "Profile" },
  ];

  return (
    <div className="mobile-bottom-nav">
      {tabs.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          className={`mobile-tab ${
            location.pathname === t.to ? "active" : ""
          }`}
        >
          {t.icon}
          <span>{t.label}</span>
        </Link>
      ))}
    </div>
  );
}
