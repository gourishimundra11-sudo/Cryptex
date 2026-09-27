import React from 'react';
import { CryptexLogo } from './CryptexLogo';
import { useAuth } from '../context/AuthContext';
import { Terminal, Cpu, Clock, BookOpen, Shield, Info, User as UserIcon, LogIn, Cloud } from 'lucide-react';

interface TopNavProps {
  activeTab: 'workspace' | 'algorithms' | 'cryptolab' | 'modern' | 'history' | 'about' | 'admin';
  setActiveTab: (tab: 'workspace' | 'algorithms' | 'cryptolab' | 'modern' | 'history' | 'about' | 'admin') => void;
  onReplayIntro: () => void;
  onOpenAuth: () => void;
  historyCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onReplayIntro,
  onOpenAuth,
  historyCount,
}) => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(0,200,255,0.1)] bg-[#05070D]/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone: wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('workspace')}
            className="flex items-center gap-2.5 group focus:outline-none text-left"
            title="Go to Encrypt Workspace"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-display tracking-widest text-[#F5F7FA] group-hover:text-[#00C8FF] transition-colors">
                CRYPTEX
              </span>
            </div>
          </button>
        </div>

        {/* Minimal Navigation: AI-workspace clean tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === 'workspace'
                ? 'text-[#00C8FF] bg-[#00C8FF]/10 font-semibold'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-white/[0.04]'
            }`}
          >
            Encrypt
            {activeTab === 'workspace' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_#00C8FF]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('algorithms')}
            className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === 'algorithms'
                ? 'text-[#00C8FF] bg-[#00C8FF]/10 font-semibold'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-white/[0.04]'
            }`}
          >
            Algorithms
            {activeTab === 'algorithms' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_#00C8FF]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cryptolab')}
            className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 hidden md:block ${
              activeTab === 'cryptolab'
                ? 'text-[#00C8FF] bg-[#00C8FF]/10 font-semibold'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-white/[0.04]'
            }`}
          >
            Crypto Lab
            {activeTab === 'cryptolab' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_#00C8FF]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'text-[#00C8FF] bg-[#00C8FF]/10 font-semibold'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-white/[0.04]'
            }`}
          >
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-[#00C8FF]/20 text-[#00C8FF]">
                {historyCount}
              </span>
            )}
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_#00C8FF]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === 'about'
                ? 'text-[#00C8FF] bg-[#00C8FF]/10 font-semibold'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-white/[0.04]'
            }`}
          >
            About
            {activeTab === 'about' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_#00C8FF]" />
            )}
          </button>

          {/* Admin Audit Console Tab: exclusively shown to gourishimundra11@gmail.com */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`relative px-3 py-1.5 text-xs sm:text-sm font-mono rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'text-[#00C8FF] bg-[#00C8FF]/20 border border-[#00C8FF]/40 font-semibold shadow-[0_0_12px_rgba(0,200,255,0.25)]'
                  : 'text-[#00C8FF] hover:bg-[#00C8FF]/10 border border-[#00C8FF]/25'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#00C8FF]" />
              <span className="font-semibold">Audit Log</span>
              {activeTab === 'admin' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_#00C8FF]" />
              )}
            </button>
          )}
        </nav>

        {/* Minimal Controls: Cryptex Logo & Firebase Authentication Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onReplayIntro}
            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-white/5 transition-transform duration-200 hover:scale-105 focus:outline-none"
            title="Replay Cryptex Intro"
          >
            <CryptexLogo size={26} glow={true} />
          </button>

          {/* Authentication & User Status */}
          {user ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#00C8FF]/10 border border-[#00C8FF]/30 hover:border-[#00C8FF] hover:bg-[#00C8FF]/15 transition-all text-xs font-mono"
              title="View Firebase Account & Cloud Sync"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover border border-[#00C8FF]"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#00C8FF]/20 text-[#00C8FF] flex items-center justify-center font-bold text-[10px]">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-white max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
                {user.displayName?.split(' ')[0] || 'Account'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] animate-pulse" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#00C8FF] text-[#F5F7FA] hover:text-black border border-white/10 hover:border-[#00C8FF] transition-all text-xs font-mono font-medium shadow-sm hover:shadow-[0_0_15px_rgba(0,200,255,0.4)] cursor-pointer"
              title="Sign in with Firebase"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
