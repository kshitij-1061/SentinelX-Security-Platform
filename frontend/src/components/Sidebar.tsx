"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldAlert, 
  Server, 
  Bug, 
  Radar, 
  Flame, 
  Network, 
  GitBranch, 
  Siren, 
  FileText, 
  Settings, 
  LayoutDashboard,
  LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Asset Inventory", href: "/dashboard/assets", icon: Server },
  { name: "Vulnerabilities", href: "/dashboard/vulnerabilities", icon: Bug },
  { name: "Threat Detection", href: "/dashboard/threats", icon: Radar },
  { name: "Honeypots & Decoys", href: "/dashboard/honeypots", icon: Flame },
  { name: "Alert Correlation", href: "/dashboard/alerts", icon: Network },
  { name: "Attack Paths", href: "/dashboard/attack-paths", icon: GitBranch },
  { name: "Incidents & Response", href: "/dashboard/incidents", icon: Siren },
  { name: "Threat Intelligence", href: "/dashboard/threat-intel", icon: FileText },
  { name: "Administration", href: "/dashboard/admin", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-[#131b2e] border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white">CYBER DEFENSE</h1>
          <p className="text-[10px] text-slate-400 font-mono">SOC PLATFORM v1.0</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
