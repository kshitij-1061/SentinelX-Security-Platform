import { Construction, ShieldCheck } from "lucide-react";

interface ModulePlaceholderProps {
  moduleName: string;
  modulePhase: string;
  description: string;
}

export default function ModulePlaceholder({ moduleName, modulePhase, description }: ModulePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#131b2e] border border-slate-800 rounded-2xl p-8 text-center">
      <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 mb-4">
        <Construction className="w-12 h-12" />
      </div>
      <span className="text-xs font-mono px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full mb-3">
        DEVELOPMENT PHASE: {modulePhase}
      </span>
      <h2 className="text-2xl font-bold text-white mb-2">{moduleName}</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center space-x-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>Module coming in a later development phase. Phase 1 authentication, security, and database foundation are fully operational.</span>
      </div>
    </div>
  );
}
