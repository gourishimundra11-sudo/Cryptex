import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HistoryItem, AdminUserRecord, ADMIN_EMAIL } from '../types/crypto';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Users,
  Terminal,
  Clock,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Filter,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Key,
  Cpu,
  UserCheck,
} from 'lucide-react';

interface AdminAuditPanelProps {
  onLoadEntry?: (entry: HistoryItem) => void;
}

export const AdminAuditPanel: React.FC<AdminAuditPanelProps> = ({ onLoadEntry }) => {
  const { user, isAdmin, fetchAllUsers, fetchAllTransformations } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'users'>('feed');

  // Loaded data
  const [allTransformations, setAllTransformations] = useState<HistoryItem[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUserRecord[]>([]);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [selectedAlgoFilter, setSelectedAlgoFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Copy states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setRefreshing(true);
      const [usersList, txList] = await Promise.all([
        fetchAllUsers(),
        fetchAllTransformations(),
      ]);

      // Calculate transformation counts per user
      const counts: Record<string, number> = {};
      txList.forEach((tx) => {
        const uid = tx.userId || tx.userEmail || 'unknown';
        counts[uid] = (counts[uid] || 0) + 1;
      });

      const enrichedUsers = usersList.map((u) => ({
        ...u,
        transformationCount: counts[u.userId] || counts[u.email] || 0,
      }));

      setAllUsers(enrichedUsers);
      setAllTransformations(txList);
    } catch (err) {
      console.error('Failed to load admin audit data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(
        {
          auditExportTime: new Date().toISOString(),
          requestedBy: user?.email,
          totalUsers: allUsers.length,
          totalConversions: allTransformations.length,
          conversions: allTransformations,
          users: allUsers,
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cryptex-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // If user is not gourishimundra11@gmail.com
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-[#0A0E1A] border border-red-500/30 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white tracking-wide">
          RESTRICTED ADMIN CONSOLE
        </h2>
        <p className="text-sm font-mono text-red-400">
          PERMISSION_DENIED · ACCESS RESTRICTED
        </p>
        <p className="text-xs text-[#8B95A7] max-w-md mx-auto leading-relaxed">
          This security telemetry and plain text conversion audit dashboard is cryptographically locked exclusively to the authorized administrator identity:
        </p>
        <div className="inline-block px-3 py-1.5 rounded-lg bg-[#05070D] border border-red-500/40 text-xs font-mono text-white">
          {ADMIN_EMAIL}
        </div>
        <p className="text-[11px] text-[#8B95A7]/60 pt-2">
          {user ? `Currently authenticated as: ${user.email}` : 'Please authenticate with the admin account to access.'}
        </p>
      </div>
    );
  }

  // Filtered transformations
  const filteredTransformations = allTransformations.filter((tx) => {
    // User filter
    if (selectedUserFilter !== 'all') {
      if (tx.userId !== selectedUserFilter && tx.userEmail !== selectedUserFilter) {
        return false;
      }
    }

    // Algorithm filter
    if (selectedAlgoFilter !== 'all') {
      if (tx.algorithmId !== selectedAlgoFilter) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchPlain = (tx.plaintext || tx.plaintextSnippet || '').toLowerCase().includes(q);
      const matchCipher = tx.ciphertext.toLowerCase().includes(q);
      const matchEmail = (tx.userEmail || '').toLowerCase().includes(q);
      const matchAlgo = tx.algorithmName.toLowerCase().includes(q);
      const matchDoc = (tx.documentName || '').toLowerCase().includes(q);
      return matchPlain || matchCipher || matchEmail || matchAlgo || matchDoc;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#00C8FF]/20">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              <span>ADMIN DISPATCH AUDIT</span>
              <span className="text-[10px] font-mono uppercase bg-[#00C8FF]/20 text-[#00C8FF] px-2 py-0.5 rounded-full border border-[#00C8FF]/40">
                Live Firestore Telemetry
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8B95A7]">
            Active supervisor view for <strong className="text-white font-mono">{ADMIN_EMAIL}</strong>. Real-time stream of all user plain text search inputs, document uploads, and cipher outputs persisted directly to the Firestore <code className="text-[#00C8FF] bg-[#00C8FF]/10 px-1.5 py-0.5 rounded border border-[#00C8FF]/30">/audit_logs</code> collection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAdminData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-[#00C8FF] bg-[#00C8FF]/10 border border-[#00C8FF]/30 hover:bg-[#00C8FF]/20 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Firestore Database Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-[#F5F7FA] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
            title="Export complete audit record as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.15)] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B95A7]">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-[#00C8FF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {allUsers.length}
          </div>
          <p className="text-[10px] text-[#8B95A7]">Logged-in accounts in Firestore</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.15)] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B95A7]">
            <span>Total Conversions</span>
            <Terminal className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {allTransformations.length}
          </div>
          <p className="text-[10px] text-[#8B95A7]">Plain text to cipher transformations</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.15)] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B95A7]">
            <span>AI Conversions</span>
            <Cpu className="w-4 h-4 text-[#39FF88]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#39FF88]">
            {allTransformations.filter((t) => t.isAiConverted).length}
          </div>
          <p className="text-[10px] text-[#8B95A7]">AI-processed documents/text</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.15)] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B95A7]">
            <span>Super Admin</span>
            <span className="w-2 h-2 rounded-full bg-[#00C8FF] animate-pulse" />
          </div>
          <div className="text-xs font-mono font-bold text-white truncate" title={ADMIN_EMAIL}>
            {ADMIN_EMAIL.split('@')[0]}
          </div>
          <p className="text-[10px] text-[#00C8FF]">Full Read Permissions Active</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveSubTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeSubTab === 'feed'
              ? 'bg-[#00C8FF]/15 text-[#00C8FF] border border-[#00C8FF]/30 font-semibold'
              : 'text-[#8B95A7] hover:text-white hover:bg-white/5'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>User Conversions Feed ({filteredTransformations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeSubTab === 'users'
              ? 'bg-[#00C8FF]/15 text-[#00C8FF] border border-[#00C8FF]/30 font-semibold'
              : 'text-[#8B95A7] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users ({allUsers.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: LIVE USER CONVERSIONS FEED */}
      {activeSubTab === 'feed' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#0A0E1A] border border-white/5">
            {/* Search Input */}
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 text-[#8B95A7] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plain text or output..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#05070D] border border-white/10 text-xs font-mono text-white placeholder-[#8B95A7]/60 focus:outline-none focus:border-[#00C8FF]"
              />
            </div>

            {/* Filter by User */}
            <div>
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#00C8FF]"
              >
                <option value="all">Filter: All Users ({allUsers.length})</option>
                {allUsers.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.displayName || u.email} ({u.transformationCount || 0} conversions)
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Algorithm */}
            <div>
              <select
                value={selectedAlgoFilter}
                onChange={(e) => setSelectedAlgoFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#00C8FF]"
              >
                <option value="all">Filter: All Ciphers</option>
                <option value="caesar">Caesar Cipher</option>
                <option value="vigenere">Vigenère Cipher</option>
                <option value="atbash">Atbash Cipher</option>
                <option value="rot13">ROT13</option>
                <option value="affine">Affine Cipher</option>
                <option value="playfair">Playfair Cipher</option>
                <option value="hill">Hill Cipher</option>
                <option value="railfence">Rail Fence Cipher</option>
                <option value="columnar">Columnar Transposition</option>
                <option value="reverse">Reverse Cipher</option>
              </select>
            </div>
          </div>

          {/* List of Conversions */}
          {loading ? (
            <div className="p-12 text-center rounded-2xl bg-[#0A0E1A] border border-white/5 space-y-3">
              <RefreshCw className="w-8 h-8 text-[#00C8FF] animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#8B95A7]">Connecting to Firestore collectionGroup audit...</p>
            </div>
          ) : filteredTransformations.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0A0E1A] border border-white/5 space-y-3">
              <FileText className="w-10 h-10 text-[#8B95A7]/40 mx-auto" />
              <h3 className="text-base font-mono font-medium text-white">No Conversions Matched</h3>
              <p className="text-xs text-[#8B95A7] max-w-sm mx-auto">
                {allTransformations.length === 0
                  ? 'No users have converted plain text while logged in yet. Any text converted by authenticated users will appear here automatically.'
                  : 'No transformations matched your current search or filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransformations.map((item) => {
                const isExpanded = expandedId === item.id;
                const plainToDisplay = item.plaintext || item.plaintextSnippet || '(No plain text stored)';

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0A0E1A] border border-[rgba(0,200,255,0.18)] hover:border-[#00C8FF]/50 transition-all space-y-4"
                  >
                    {/* Header Row: User Info + Timestamp + Algorithm */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* User Identity Pill */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white">
                          <UserCheck className="w-3.5 h-3.5 text-[#00C8FF]" />
                          <span className="font-semibold text-white">
                            {item.userDisplayName || 'User'}
                          </span>
                          <span className="text-[#8B95A7] text-[11px]">
                            ({item.userEmail || item.userId || 'Authenticated'})
                          </span>
                        </div>

                        {/* Algorithm Pill */}
                        <span className="text-xs font-mono font-bold text-[#00C8FF] px-2.5 py-1 rounded-full bg-[#00C8FF]/10 border border-[#00C8FF]/20">
                          {item.algorithmName}
                        </span>

                        {/* Parameter Summary */}
                        {item.parametersSummary && (
                          <span className="text-[11px] font-mono text-[#8B95A7] px-2 py-0.5 rounded bg-[#05070D] border border-white/5">
                            {item.parametersSummary}
                          </span>
                        )}

                        {/* Document Name if uploaded */}
                        {item.documentName && (
                          <span className="text-[10px] font-mono text-[#39FF88] px-2 py-0.5 rounded bg-[#39FF88]/10 border border-[#39FF88]/30 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{item.documentName}</span>
                          </span>
                        )}

                        {item.isAiConverted && (
                          <span className="text-[10px] font-mono text-[#00C8FF] px-2 py-0.5 rounded-full bg-[#00C8FF]/20 border border-[#00C8FF]/40">
                            AI Engine
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-[#8B95A7]">
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        {onLoadEntry && (
                          <button
                            onClick={() => onLoadEntry(item)}
                            className="flex items-center gap-1 text-[#00C8FF] hover:underline"
                            title="Load text into workspace"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dual Box: Plain Text Entered VS Cipher Text Output */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                      {/* 1. PLAIN TEXT ENTERED */}
                      <div className="p-3.5 rounded-xl bg-[#05070D] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#8B95A7] font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            01 / PLAIN TEXT ENTERED ({item.inputLength} chars)
                          </span>
                          <button
                            onClick={() => handleCopy(plainToDisplay, item.id + '_plain')}
                            className="text-[#8B95A7] hover:text-white flex items-center gap-1 text-[11px]"
                            title="Copy plain text"
                          >
                            {copiedKey === item.id + '_plain' ? (
                              <Check className="w-3.5 h-3.5 text-[#00C8FF]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>Copy</span>
                          </button>
                        </div>
                        <div className="font-mono text-xs text-[#F5F7FA] whitespace-pre-wrap break-words bg-[#080D18] p-3 rounded-lg border border-white/5 max-h-48 overflow-y-auto selection:bg-[#00C8FF]/30">
                          {plainToDisplay}
                        </div>
                      </div>

                      {/* 2. CIPHER TEXT OUTPUT */}
                      <div className="p-3.5 rounded-xl bg-[#05070D] border border-[#00C8FF]/20 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#00C8FF] font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00C8FF]" />
                            02 / CIPHER TEXT OUTPUT ({item.outputLength} chars)
                          </span>
                          <button
                            onClick={() => handleCopy(item.ciphertext, item.id + '_cipher')}
                            className="text-[#8B95A7] hover:text-[#00C8FF] flex items-center gap-1 text-[11px]"
                            title="Copy cipher text"
                          >
                            {copiedKey === item.id + '_cipher' ? (
                              <Check className="w-3.5 h-3.5 text-[#00C8FF]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>Copy</span>
                          </button>
                        </div>
                        <div className="font-mono text-xs text-[#00C8FF] whitespace-pre-wrap break-words bg-[#080D18] p-3 rounded-lg border border-[#00C8FF]/10 max-h-48 overflow-y-auto selection:bg-[#00C8FF]/30">
                          {item.ciphertext}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: REGISTERED USERS DIRECTORY */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-white/5 flex items-center justify-between text-xs font-mono text-[#8B95A7]">
            <span>Total Registered Firestore User Profiles: <strong className="text-white">{allUsers.length}</strong></span>
            <span>All profiles secured with Firebase Auth UID boundaries</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {allUsers.map((u) => {
              const isCurrentUser = u.email === user.email;

              return (
                <div
                  key={u.userId}
                  className="p-4 rounded-2xl bg-[#0A0E1A] border border-white/10 hover:border-[#00C8FF]/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.displayName || 'Avatar'}
                          className="w-10 h-10 rounded-full border border-[#00C8FF]/40 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#00C8FF]/15 border border-[#00C8FF]/30 flex items-center justify-center font-bold font-mono text-[#00C8FF]">
                          {u.displayName?.charAt(0) || u.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-bold text-sm text-white flex items-center gap-1.5 truncate">
                          <span>{u.displayName || 'Anonymous User'}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-mono text-[#00C8FF] bg-[#00C8FF]/10 px-1.5 py-0.2 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-[#8B95A7] truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        {u.transformationCount || 0} conversions
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#8B95A7]">
                    <span>
                      Last Active:{' '}
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Unknown'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedUserFilter(u.userId);
                        setActiveSubTab('feed');
                      }}
                      className="text-[#00C8FF] hover:underline flex items-center gap-1"
                    >
                      <span>View Conversions</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
