import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CryptexLogo } from './CryptexLogo';
import { X, Shield, Lock, Cloud, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, signInWithGoogle, logout, error, loading } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // Error handled in AuthContext
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-[1.75rem] bg-[#0A0E1A] border border-[#00C8FF]/30 glow-cyan-md text-[#F5F7FA] shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#8B95A7] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <CryptexLogo size={44} glow={true} />
          <div>
            <h2 className="text-xl font-bold font-display tracking-wider text-white">
              {user ? 'CRYPTEX ACCOUNT' : 'AUTHENTICATE'}
            </h2>
            <p className="text-xs font-mono text-[#00C8FF] mt-0.5">
              Firebase & Firestore Cloud Integration
            </p>
          </div>
          <p className="text-xs text-[#8B95A7] max-w-xs leading-relaxed">
            {user
              ? 'Your cipher dispatches and transformed documents are synchronized with Cloud Firestore.'
              : 'Sign in to sync your encrypted messages, documents, and history across all devices securely.'}
          </p>
        </div>

        {/* Status Card */}
        <div className="p-3.5 rounded-xl bg-[#05070D] border border-[rgba(0,200,255,0.15)] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C8FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C8FF]"></span>
            </span>
            <span className="text-[#8B95A7]">Database:</span>
            <span className="text-white font-semibold">cryptex-76051</span>
          </div>
          <span className="text-[#00C8FF] text-[10px] bg-[#00C8FF]/10 px-2 py-0.5 rounded-full border border-[#00C8FF]/20">
            Firestore Connected
          </span>
        </div>

        {/* User state if logged in */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#05070D] border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-10 h-10 rounded-full border border-[#00C8FF]/40 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#00C8FF]/15 border border-[#00C8FF]/40 flex items-center justify-center text-[#00C8FF] font-bold font-mono">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="truncate">
                  <div className="font-semibold text-sm text-white truncate flex items-center gap-1.5">
                    <span>{user.displayName || 'Cryptographer'}</span>
                    {user.email === 'gourishimundra11@gmail.com' && (
                      <span className="text-[10px] font-mono text-[#00C8FF] bg-[#00C8FF]/15 border border-[#00C8FF]/30 px-1.5 py-0.2 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-[#8B95A7] truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#8B95A7]">
                <span>Cloud Sync Active</span>
                <span className="text-[#00C8FF]">
                  {user.email === 'gourishimundra11@gmail.com' ? '★ Super Admin Access' : '✓ Online'}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-medium transition-all"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Sign In Action */
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl bg-white text-black hover:bg-[#F5F7FA] font-bold font-sans text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="space-y-1.5 text-center">
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#8B95A7]">
                <Shield className="w-3.5 h-3.5 text-[#00C8FF]" />
                <span>Protected by Firebase Authentication</span>
              </div>
              <p className="text-[10px] text-[#8B95A7]/60">
                Your credentials are never exposed or shared with third parties.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
