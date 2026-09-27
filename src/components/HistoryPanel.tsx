import React, { useState } from 'react';
import { HistoryItem } from '../types/crypto';
import { useAuth } from '../context/AuthContext';
import { Clock, Trash2, Copy, Check, ArrowUpRight, ShieldCheck, FileText, Cloud, CloudCheck, LogIn } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onLoadEntry: (entry: HistoryItem) => void;
  onOpenAuth: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClearHistory,
  onLoadEntry,
  onOpenAuth,
}) => {
  const { user, cloudTransformations, clearCloudTransformations } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // If user is authenticated, prioritize cloud transformations merged with local
  const displayHistory = user && cloudTransformations.length > 0 ? cloudTransformations : history;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return (
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' · ' +
      d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    );
  };

  const handleClearAll = async () => {
    onClearHistory();
    if (user) {
      await clearCloudTransformations();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#00BFFF]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#00BFFF]/10 text-[#00E5FF]">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
              TRANSFORMATION HISTORY
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8B95A7]">
            {user
              ? 'Synchronized with Firebase Firestore (Database: cryptex-76051)'
              : 'Local session audit log of your generated ciphertexts'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!user && (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#00C8FF] bg-[#00C8FF]/10 border border-[#00C8FF]/30 hover:bg-[#00C8FF]/20 transition-all cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Sync to Cloud</span>
            </button>
          )}

          {displayHistory.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR HISTORY</span>
            </button>
          )}
        </div>
      </div>

      {/* Cloud Sync Status Banner */}
      {user ? (
        <div className="p-3.5 rounded-xl bg-[#00C8FF]/10 border border-[#00C8FF]/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-white">
            <Cloud className="w-4 h-4 text-[#00C8FF]" />
            <span>Cloud Sync Active:</span>
            <span className="text-[#00C8FF] font-semibold">{user.email}</span>
          </div>
          <span className="text-[11px] text-[#8B95A7] hidden sm:inline">
            Project: <strong className="text-white">cryptex-76051</strong>
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-[#0A0E1A] border border-white/5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#8B95A7]">
            <Cloud className="w-4 h-4 text-[#8B95A7]" />
            <span>Currently saving to local browser storage only.</span>
          </div>
          <button
            onClick={onOpenAuth}
            className="text-[#00C8FF] hover:underline font-semibold"
          >
            Sign in to sync with Firestore →
          </button>
        </div>
      )}

      {/* History Items List */}
      {displayHistory.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.12)] space-y-3">
          <FileText className="w-10 h-10 text-[#8B95A7]/40 mx-auto" />
          <h3 className="text-base font-mono font-medium text-white">No Transformations Recorded Yet</h3>
          <p className="text-xs text-[#8B95A7] max-w-sm mx-auto">
            Generate your first ciphertext or convert a document in the Encrypt workspace. Each transformation will be saved here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.15)] hover:border-[#00C8FF]/40 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">
                    {item.algorithmName}
                  </span>
                  <span className="text-[11px] font-mono text-[#00C8FF] px-2 py-0.5 rounded bg-[#00C8FF]/10 border border-[#00C8FF]/20">
                    {item.parametersSummary}
                  </span>
                  {item.documentName && (
                    <span className="text-[10px] font-mono text-[#8B95A7] px-2 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[#00C8FF]" />
                      <span>{item.documentName}</span>
                    </span>
                  )}
                  {item.isAiConverted && (
                    <span className="text-[10px] font-mono text-[#00C8FF] px-1.5 py-0.2 rounded-full bg-[#00C8FF]/15 border border-[#00C8FF]/30">
                      AI Converted
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#8B95A7]">
                  <span>Input: {item.inputLength} chars</span>
                  <span>·</span>
                  <span>Output: {item.outputLength} chars</span>
                  <span>·</span>
                  <span>{formatDate(item.timestamp)}</span>
                </div>
              </div>

              {/* Ciphertext Preview */}
              <div className="p-3 rounded-lg bg-[#05070D] border border-white/5 flex items-center justify-between gap-3">
                <div className="font-mono text-xs text-[#00C8FF] break-all select-all font-semibold">
                  {item.ciphertext}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(item.ciphertext, item.id)}
                    className="p-1.5 rounded text-[#8B95A7] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Copy Ciphertext"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-[#00C8FF]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onLoadEntry(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00C8FF]/15 border border-[#00C8FF]/30 text-[#00C8FF] hover:bg-[#00C8FF]/25 text-xs font-mono font-medium transition-colors cursor-pointer"
                    title="Load into Encrypt Workspace"
                  >
                    <span>Load</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Guarantee Note */}
      <div className="p-4 rounded-xl bg-[#05070D] border border-[rgba(0,200,255,0.12)] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#00C8FF] shrink-0 mt-0.5" />
        <div className="text-xs text-[#8B95A7] space-y-0.5">
          <span className="font-mono font-bold text-white block">Security & Cloud Isolation</span>
          <p>
            When authenticated, transformations are securely stored in your private Firestore collection under <code>users/{'{userId}'}/transformations</code>. Firestore Security Rules enforce that only you can read or delete your encrypted records.
          </p>
        </div>
      </div>
    </div>
  );
};
