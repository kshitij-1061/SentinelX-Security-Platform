"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";
import { ShieldCheck, User as UserIcon, Search, X, Server, Bug, AlertTriangle, Siren } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    assets: any[];
    vulnerabilities: any[];
    alerts: any[];
    incidents: any[];
  }>({ assets: [], vulnerabilities: [], alerts: [], incidents: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults({ assets: [], vulnerabilities: [], alerts: [], incidents: [] });
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
      if (res.data.success) {
        setSearchResults(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-slate-300">SYSTEM MONITOR: ONLINE</span>
        </div>

        {/* Global Search Trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center space-x-2 bg-slate-900 border border-slate-700/80 hover:border-blue-500/50 text-slate-400 px-3 py-1.5 rounded-lg text-xs w-64 justify-between transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search assets, CVEs, alerts...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
            <UserIcon className="w-4 h-4 text-blue-400" />
            <div className="text-left">
              <div className="text-xs font-semibold text-white">{user.full_name}</div>
              <div className="text-[10px] text-blue-400 font-mono tracking-wider">{user.role.name}</div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono">SOC ANALYST SESSION</div>
        )}
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
          <div className="bg-[#131b2e] border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
              <Search className="w-5 h-5 text-blue-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search across entire SOC platform (IP, Hostname, CVE, Alert ID, Incident)..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-500 font-mono"
              />
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {isSearching && <div className="text-xs text-slate-400 font-mono">Searching platform indices...</div>}

              {!isSearching && searchQuery && 
               searchResults.assets.length === 0 && 
               searchResults.vulnerabilities.length === 0 && 
               searchResults.alerts.length === 0 && 
               searchResults.incidents.length === 0 && (
                <div className="text-xs text-slate-500 font-mono py-4 text-center">No matching records found across SOC database.</div>
              )}

              {/* Assets */}
              {searchResults.assets.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Server className="w-3.5 h-3.5 text-blue-400" />
                    <span>Assets ({searchResults.assets.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.assets.map((a: any) => (
                      <Link
                        key={a.id}
                        href={`/dashboard/assets/${a.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="block p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white">{a.hostname}</span>
                          <span className="ml-2 font-mono text-slate-400">({a.ipAddress})</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{a.assetType}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Vulnerabilities */}
              {searchResults.vulnerabilities.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Bug className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vulnerabilities ({searchResults.vulnerabilities.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.vulnerabilities.map((v: any) => (
                      <Link
                        key={v.id}
                        href={`/dashboard/vulnerabilities/${v.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="block p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-amber-400 font-mono">{v.vulnerabilityIdentifier}</span>
                          <span className="ml-2 text-slate-300">{v.title}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">CVSS {v.cvssScore}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Incidents */}
              {searchResults.incidents.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Siren className="w-3.5 h-3.5 text-rose-400" />
                    <span>Incidents ({searchResults.incidents.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.incidents.map((inc: any) => (
                      <Link
                        key={inc.id}
                        href="/dashboard/incidents"
                        onClick={() => setSearchOpen(false)}
                        className="block p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white">{inc.title}</span>
                          <span className="ml-2 text-slate-400 text-[11px]">{inc.description?.substring(0, 50)}...</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">{inc.severity}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
