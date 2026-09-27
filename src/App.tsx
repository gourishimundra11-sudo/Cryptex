import React, { useState, useEffect } from 'react';
import { AlgorithmId, HistoryItem } from './types/crypto';
import { OpeningAnimation } from './components/OpeningAnimation';
import { TopNav } from './components/TopNav';
import { Workspace } from './components/Workspace';
import { AlgorithmsLibrary } from './components/AlgorithmsLibrary';
import { CryptoLab } from './components/CryptoLab';
import { ModernCrypto } from './components/ModernCrypto';
import { HistoryPanel } from './components/HistoryPanel';
import { AboutPanel } from './components/AboutPanel';
import { AdminAuditPanel } from './components/AdminAuditPanel';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, cloudTransformations, saveTransformationToCloud } = useAuth();

  // Opening animation state: show on first load, remember in sessionStorage
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('cryptex_intro_seen') !== 'true';
    } catch {
      return true;
    }
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<
    'workspace' | 'algorithms' | 'cryptolab' | 'modern' | 'history' | 'about' | 'admin'
  >('workspace');

  // Auth modal dialog state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Workspace parameters state
  const [workspaceAlgo, setWorkspaceAlgo] = useState<AlgorithmId>('caesar');
  const [workspacePlaintext, setWorkspacePlaintext] = useState<string>('MEET ME AT 10 PM');

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('cryptex_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleCompleteIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('cryptex_intro_seen', 'true');
    } catch {
      // ignore
    }
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  const handleSaveToHistory = (item: HistoryItem) => {
    // 1. Update local history
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 50);
      try {
        localStorage.setItem('cryptex_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // 2. If logged in, save to Firestore in cloud
    if (user) {
      saveTransformationToCloud(item).catch((err) => {
        console.warn('Could not sync transformation to Firebase:', err);
      });
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('cryptex_history');
    } catch {
      // ignore
    }
  };

  const handleSelectAlgorithm = (id: AlgorithmId) => {
    setWorkspaceAlgo(id);
    setActiveTab('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadHistoryEntry = (entry: HistoryItem) => {
    setWorkspaceAlgo(entry.algorithmId);
    if (entry.plaintextSnippet) {
      setWorkspacePlaintext(entry.plaintextSnippet);
    }
    setActiveTab('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const effectiveHistory = user && cloudTransformations.length > 0 ? cloudTransformations : history;
  const latestCiphertext = effectiveHistory[0]?.ciphertext || 'JGNNQ MEET ME AT 10 PM';

  return (
    <div className="min-h-screen flex flex-col bg-[#05070D] text-[#F5F7FA] subtle-grid selection:bg-[#00C8FF]/25 selection:text-[#00C8FF]">
      {/* 2. Opening Animation */}
      {showIntro && <OpeningAnimation onComplete={handleCompleteIntro} />}

      {/* 14. Background: subtle ambient lighting, very faint radial glow, clean & calm */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#00C8FF]/[0.035] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-10 w-[450px] h-[450px] bg-[#536DFF]/[0.025] rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReplayIntro={handleReplayIntro}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        historyCount={effectiveHistory.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 relative z-10">
        {activeTab === 'workspace' && (
          <Workspace
            onSaveToHistory={handleSaveToHistory}
            initialAlgorithm={workspaceAlgo}
            initialPlaintext={workspacePlaintext}
          />
        )}

        {activeTab === 'algorithms' && (
          <AlgorithmsLibrary onSelectAlgorithm={handleSelectAlgorithm} />
        )}

        {activeTab === 'cryptolab' && (
          <CryptoLab
            currentPlaintext={workspacePlaintext}
            currentCiphertext={latestCiphertext}
          />
        )}

        {activeTab === 'modern' && <ModernCrypto />}

        {activeTab === 'history' && (
          <HistoryPanel
            history={history}
            onClearHistory={handleClearHistory}
            onLoadEntry={handleLoadHistoryEntry}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'about' && <AboutPanel />}

        {activeTab === 'admin' && (
          <AdminAuditPanel onLoadEntry={handleLoadHistoryEntry} />
        )}
      </main>

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="w-full border-t border-[rgba(0,200,255,0.06)] bg-[#05070D]/90 px-4 sm:px-8 py-5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#8B95A7]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#F5F7FA] font-display tracking-wider">CRYPTEX</span>
            <span>·</span>
            <span>Plain Text → Cipher Text</span>
            <span>·</span>
            <span className="text-[#00C8FF]">Client-Side Sandboxed</span>
          </div>

          <div className="text-[11px] text-[#8B95A7]/70">
            LOCAL PROCESSING • EDUCATIONAL CRYPTOGRAPHY WORKSPACE
          </div>
        </div>
      </footer>
    </div>
  );
}
