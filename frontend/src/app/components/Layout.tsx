import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  Calendar,
  PartyPopper,
  Search as SearchIcon,
  GraduationCap,
  LogOut,
  User,
  ClipboardCheck,
  Megaphone,
  Settings,
  History as LogsIcon,
} from "lucide-react";
import { cn } from "./ui/utils";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Faculty", href: "/faculty", icon: UserCog },
  { name: "Instruction", href: "/instruction", icon: BookOpen },
  { name: "Scheduling", href: "/scheduling", icon: Calendar },
  { name: "Events", href: "/events", icon: PartyPopper },
  { name: "Search & Reports", href: "/search", icon: SearchIcon },
  { name: "System Logs", href: "/logs", icon: LogsIcon },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#FF7F11] via-orange-600 to-orange-700 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-6 border-b border-orange-600/30 bg-gradient-to-r from-orange-500/20 to-transparent">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">CCS Profiling</h1>
              <p className="text-xs text-orange-100">
                Management System
              </p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="px-4 py-4 mx-2 my-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-white to-orange-100 rounded-full flex items-center justify-center text-[#FF7F11] font-bold text-lg shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-orange-100 capitalize bg-orange-500/30 px-2 py-0.5 rounded-full inline-block">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" &&
                  location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white text-[#FF7F11] shadow-lg font-medium"
                      : "text-white hover:bg-white/10 hover:translate-x-1",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-4 pb-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-white/10 text-white hover:bg-white hover:text-[#FF7F11] border-white/30 transition-all duration-200 backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/20 bg-gradient-to-r from-orange-900/20 to-transparent">
            <p className="text-xs text-orange-100 font-medium">
              CCS v1.0.0
            </p>
            <p className="text-xs text-orange-200">
              © 2026 All Rights Reserved
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}