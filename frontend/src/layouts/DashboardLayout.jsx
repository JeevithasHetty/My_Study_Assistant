import { useState, useContext } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Bot,
  Briefcase,
  BarChart3,
  LogOut,
  Menu
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Documents", icon: FileText, path: "/documents" },
  { name: "Planner", icon: Calendar, path: "/planner" },
  { name: "AI Chatbot", icon: Bot, path: "/chatbot" },
  { name: "Resume Analyzer", icon: Briefcase, path: "/resume" },
  { name: "Analytics", icon: BarChart3, path: "/analytics" },
];

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  const { logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex bg-primaryDark text-white">

      <motion.div
        animate={{ width: collapsed ? 90 : 260 }}
        className="glass border-r border-white/10 p-4 flex flex-col"
      >
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <h1 className="text-xl font-bold">
              StudentOS AI
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="space-y-3 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-primaryBlue transition"
              >
                <Icon size={20} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/30"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </motion.div>

      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}