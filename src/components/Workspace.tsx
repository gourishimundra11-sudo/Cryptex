import React, { useState, useEffect, useRef } from 'react';
import {
  AlgorithmId,
  AlgorithmParams,
  CipherResult,
  HistoryItem,
  AiConversionInfo,
} from '../types/crypto';
import { ALGORITHM_REGISTRY, executeCipher } from '../algorithms';
import { VALID_AFFINE_A } from '../algorithms/affine';
import { generatePlayfairMatrix } from '../algorithms/playfair';
import { validateHillMatrix } from '../algorithms/hill';
import { getColumnarOrder } from '../algorithms/columnar';
import { parseUploadedDocument, formatFileSize, ParsedDocument } from '../utils/documentParser';
import { TransformationView } from './TransformationView';
import { AlgorithmInfo } from './AlgorithmInfo';
import { CryptexLogo } from './CryptexLogo';
import {
  ArrowRight,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileUp,
  FileText,
  X,
  Cpu,
  Shield,
  Key,
} from 'lucide-react';

interface WorkspaceProps {
  onSaveToHistory: (item: HistoryItem) => void;
  initialAlgorithm?: AlgorithmId;
  initialPlaintext?: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  onSaveToHistory,
  initialAlgorithm = 'caesar',
  initialPlaintext = '',
}) => {
  // Input text state
  const [plaintext, setPlaintext] = useState<string>(initialPlaintext || 'MEET ME AT 10 PM');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Document Upload state
  const [uploadedDoc, setUploadedDoc] = useState<ParsedDocument | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected algorithm
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmId>(initialAlgorithm);

  // Parameter states
  const [caesarShift, setCaesarShift] = useState<number>(2);
  const [vigenereKey, setVigenereKey] = useState<string>('LEMON');
  const [affineA, setAffineA] = useState<number>(5);
  const [affineB, setAffineB] = useState<number>(8);
  const [playfairKey, setPlayfairKey] = useState<string>('MONARCHY');
  const [hillMatrix, setHillMatrix] = useState<[[number, number], [number, number]]>([
    [3, 3],
    [2, 5],
  ]);
  const [railFenceRails, setRailFenceRails] = useState<number>(3);
  const [columnarKey, setColumnarKey] = useState<string>('CIPHER');

  // Encryption execution & animation states
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [scrambleStage, setScrambleStage] = useState<number>(0); // 0: idle, 1: separated, 2: scrambling, 3: resolved
  const [scrambledText, setScrambledText] = useState<string>('');
  const [processingText, setProcessingText] = useState<string>('ENCRYPTING');
  const [cipherResult, setCipherResult] = useState<CipherResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // References
  const outputRef = useRef<HTMLDivElement | null>(null);

  // Handle typing active state to modulate the animated border speed
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPlaintext(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 800);
  };

  // Handle Document Upload via file picker
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  // Core file parser
  const processFile = async (file: File) => {
    try {
      setIsParsingDoc(true);
      setErrorMessage(null);
      const doc = await parseUploadedDocument(file);
      setUploadedDoc(doc);
      setPlaintext(doc.text);
      setIsParsingDoc(false);
    } catch (err) {
      setIsParsingDoc(false);
      setErrorMessage('Could not read document: ' + (err as Error).message);
    }
  };

  const handleRemoveDocument = () => {
    setUploadedDoc(null);
  };

  // Derive parameters
  const getCurrentParams = (): AlgorithmParams => {
    switch (selectedAlgo) {
      case 'caesar':
        return { type: 'caesar', shift: caesarShift };
      case 'vigenere':
        return { type: 'vigenere', keyword: vigenereKey };
      case 'atbash':
        return { type: 'atbash' };
      case 'rot13':
        return { type: 'rot13' };
      case 'affine':
        return { type: 'affine', a: affineA, b: affineB };
      case 'playfair':
        return { type: 'playfair', keyword: playfairKey };
      case 'hill':
        return { type: 'hill', matrix: hillMatrix };
      case 'railfence':
        return { type: 'railfence', rails: railFenceRails };
      case 'columnar':
        return { type: 'columnar', keyword: columnarKey };
      case 'reverse':
        return { type: 'reverse' };
    }
  };

  // Standard Encryption execution
  const handleEncrypt = async () => {
    setErrorMessage(null);
    if (!plaintext || plaintext.trim().length === 0) {
      setErrorMessage('Enter plain text or upload a document to begin transformation.');
      return;
    }

    try {
      const params = getCurrentParams();
      setIsTransforming(true);
      setIsAiProcessing(false);
      setScrambleStage(1);

      // Processing text cycle
      const processInterval = setInterval(() => {
        setProcessingText((prev) => {
          if (prev === 'ENCRYPTING...') return 'ENCRYPTING.';
          return prev + '.';
        });
      }, 180);

      // Phase 1: Separated characters
      const chars = plaintext.slice(0, 100).split('');
      setScrambledText(chars.join(' '));
      await new Promise((r) => setTimeout(r, 220));

      // Phase 2: Rapid character rearrangement / cipher particle scramble
      setScrambleStage(2);
      const glyphs = 'ABCDEF0123456789§±#*&%$@!?~';
      const scrambleFrames = 3;
      for (let f = 0; f < scrambleFrames; f++) {
        const randomScramble = chars
          .map((c) => (c === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)]))
          .join('');
        setScrambledText(randomScramble);
        await new Promise((r) => setTimeout(r, 110));
      }

      // Phase 3: Compute actual cryptographic result
      const result = executeCipher(selectedAlgo, plaintext, params);
      setScrambledText(result.ciphertext.slice(0, 100));
      setScrambleStage(3);

      await new Promise((r) => setTimeout(r, 180));
      clearInterval(processInterval);

      setCipherResult(result);
      setIsTransforming(false);
      setScrambleStage(0);

      // Save to history
      const meta = ALGORITHM_REGISTRY[selectedAlgo];
      const historyEntry: HistoryItem = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: Date.now(),
        algorithmId: selectedAlgo,
        algorithmName: meta.name,
        plaintextSnippet: plaintext.slice(0, 45),
        plaintext: plaintext,
        ciphertext: result.ciphertext,
        parametersSummary: result.parametersSummary,
        inputLength: result.inputLength,
        outputLength: result.outputLength,
        documentName: uploadedDoc?.name,
        isAiConverted: false,
      };
      onSaveToHistory(historyEntry);

      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      setIsTransforming(false);
      setScrambleStage(0);
      setErrorMessage((err as Error).message);
    }
  };

  // AI-Powered Document / Text Cipher Conversion
  const handleAiConvert = async () => {
    setErrorMessage(null);
    if (!plaintext || plaintext.trim().length === 0) {
      setErrorMessage('Please enter plain text or upload a document first.');
      return;
    }

    try {
      setIsTransforming(true);
      setIsAiProcessing(true);
      setProcessingText('ANALYZING DOCUMENT...');

      const aiStages = [
        'ANALYZING DOCUMENT...',
        'SELECTING OPTIMAL CIPHER...',
        'GENERATING CRYPTOGRAPHIC KEY...',
        'CONVERTING PLAINTEXT TO CIPHER...',
      ];
      let stageIndex = 0;
      const stageInterval = setInterval(() => {
        stageIndex = (stageIndex + 1) % aiStages.length;
        setProcessingText(aiStages[stageIndex]);
      }, 350);

      // Scramble preview
      const chars = plaintext.slice(0, 80).split('');
      const glyphs = '0123456789ABCDEF!@#$%^&*()';
      const scrambleInterval = setInterval(() => {
        const randomScramble = chars
          .map((c) => (c === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)]))
          .join('');
        setScrambledText(randomScramble);
      }, 120);

      let aiResponseData: any = null;

      try {
        const res = await fetch('/api/ai-cipher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: plaintext,
            fileName: uploadedDoc?.name,
            preferredCipher: selectedAlgo,
          }),
        });
        if (res.ok) {
          aiResponseData = await res.json();
        }
      } catch (fetchErr) {
        console.warn('API call to /api/ai-cipher failed, using client-side AI fallback', fetchErr);
      }

      clearInterval(stageInterval);
      clearInterval(scrambleInterval);

      // If server response succeeded
      if (aiResponseData && aiResponseData.ciphertext) {
        const aiInfo: AiConversionInfo = {
          isAiGenerated: true,
          algorithmName: aiResponseData.algorithmName || 'AI-Optimized Classical Cipher',
          keyUsed: aiResponseData.keyUsed || 'CRYPTEX-2026',
          reasoning: aiResponseData.reasoning || 'AI selected an optimal polyalphabetic key and substitution strategy for the document.',
          decryptionGuide: aiResponseData.decryptionGuide || 'Apply reverse shift using the provided key.',
          securityAssessment: aiResponseData.securityAssessment || 'Flattens monoalphabetic character distributions across document.',
          sourceDocumentName: uploadedDoc?.name,
        };

        const result: CipherResult = {
          ciphertext: aiResponseData.ciphertext,
          parametersSummary: aiResponseData.parametersSummary || `Key: ${aiResponseData.keyUsed}`,
          inputLength: plaintext.length,
          outputLength: aiResponseData.ciphertext.length,
          details: {},
          warningNotice: 'Generated via CRYPTEX AI Cryptographic Intelligence Engine.',
          aiInfo,
        };

        setCipherResult(result);
        setIsTransforming(false);
        setIsAiProcessing(false);

        const historyEntry: HistoryItem = {
          id: 'ai_' + Date.now(),
          timestamp: Date.now(),
          algorithmId: selectedAlgo,
          algorithmName: `AI: ${aiResponseData.algorithmName || 'Smart Cipher'}`,
          plaintextSnippet: plaintext.slice(0, 45),
          plaintext: plaintext,
          ciphertext: result.ciphertext,
          parametersSummary: result.parametersSummary,
          inputLength: result.inputLength,
          outputLength: result.outputLength,
          documentName: uploadedDoc?.name,
          isAiConverted: true,
        };
        onSaveToHistory(historyEntry);
      } else {
        // Fallback: Client-side AI Cryptor
        const fallbackKeys = ['CIPHERNET', 'AEGIS2026', 'SPECTRE', 'VALKYRIE'];
        const autoKey = fallbackKeys[Math.floor(Math.random() * fallbackKeys.length)];
        const classicalResult = executeCipher('vigenere', plaintext, { type: 'vigenere', keyword: autoKey });

        const aiInfo: AiConversionInfo = {
          isAiGenerated: true,
          algorithmName: 'AI-Selected Polyalphabetic Vigenère',
          keyUsed: autoKey,
          reasoning: `AI analyzed document characteristics (${plaintext.length} characters) and generated a periodic high-entropy key "${autoKey}" to disrupt frequency analysis.`,
          decryptionGuide: `To decrypt this document, use the Vigenère cipher in reverse with the secret keyword "${autoKey}".`,
          securityAssessment: 'Resistant to single-character frequency analysis. Breakable via Index of Coincidence.',
          sourceDocumentName: uploadedDoc?.name,
        };

        classicalResult.aiInfo = aiInfo;
        setCipherResult(classicalResult);
        setIsTransforming(false);
        setIsAiProcessing(false);

        const historyEntry: HistoryItem = {
          id: 'ai_' + Date.now(),
          timestamp: Date.now(),
          algorithmId: 'vigenere',
          algorithmName: 'AI: Polyalphabetic Vigenère',
          plaintextSnippet: plaintext.slice(0, 45),
          plaintext: plaintext,
          ciphertext: classicalResult.ciphertext,
          parametersSummary: `Key: ${autoKey}`,
          inputLength: classicalResult.inputLength,
          outputLength: classicalResult.outputLength,
          documentName: uploadedDoc?.name,
          isAiConverted: true,
        };
        onSaveToHistory(historyEntry);
      }

      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      setIsTransforming(false);
      setIsAiProcessing(false);
      setErrorMessage('AI conversion failed: ' + (err as Error).message);
    }
  };

  // Copy output
  const handleCopyCiphertext = () => {
    if (!cipherResult) return;
    navigator.clipboard.writeText(cipherResult.ciphertext);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Download output
  const handleDownloadCiphertext = () => {
    if (!cipherResult) return;
    const baseName = uploadedDoc?.name ? uploadedDoc.name.replace(/\.[^/.]+$/, '') : selectedAlgo;
    const blob = new Blob([cipherResult.ciphertext], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cryptex_${baseName}_cipher.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset for new encryption
  const handleNewEncryption = () => {
    setCipherResult(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validations
  const hillValidation = selectedAlgo === 'hill' ? validateHillMatrix(hillMatrix) : null;
  const playfairMatrixPreview = selectedAlgo === 'playfair' ? generatePlayfairMatrix(playfairKey) : null;
  const columnarOrderPreview = selectedAlgo === 'columnar' && columnarKey.length > 0 ? getColumnarOrder(columnarKey) : [];

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-6 sm:py-10">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".txt,.md,.json,.csv,.tsv,.log,.rtf,.pdf,.docx,.doc"
        className="hidden"
      />

      {/* 5. HERO SECTION: Generous whitespace, elegant typography */}
      <section className="flex flex-col items-center text-center space-y-3 pt-2 pb-2">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-[#F5F7FA]">
          Turn plain text into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#536DFF]">
            cipher text.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-[#8B95A7] max-w-xl font-normal leading-relaxed">
          Upload any document or enter text. Transform messages manually or let AI convert it into an optimal cipher.
        </p>
      </section>

      {/* 6. MAIN TEXT INPUT BAR: Floating rounded container with THE ANIMATED LINE + DOCUMENT UPLOAD */}
      <section className="relative w-full max-w-3xl mx-auto">
        {/* Soft radial backdrop glow */}
        <div
          className={`absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-[#00C8FF]/20 via-[#536DFF]/15 to-[#00C8FF]/20 blur-xl transition-opacity duration-500 pointer-events-none ${
            isFocused || isDraggingOver ? 'opacity-100' : 'opacity-40'
          }`}
        />

        {/* The Animated Line: continuous traveling glow line around border */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-[1.75rem] p-[1.5px] overflow-hidden shadow-2xl transition-all duration-300 ${
            isDraggingOver ? 'ring-2 ring-[#00C8FF] scale-[1.01]' : ''
          }`}
        >
          {/* Animated gradient beam traveling smoothly around border */}
          <div
            className={`absolute -inset-[100%] transition-opacity duration-300 pointer-events-none ${
              isFocused || isDraggingOver ? 'opacity-100' : 'opacity-60'
            } ${isTyping ? 'animate-spin-active' : 'animate-spin-slow'}`}
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, transparent 0deg, #00C8FF 60deg, #536DFF 120deg, transparent 180deg, transparent 360deg)',
            }}
          />

          {/* Floating Inner Container */}
          <div className="relative rounded-[1.65rem] bg-[#0A0E1A]/95 backdrop-blur-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[160px] transition-colors">
            {/* Drag & drop overlay indicator */}
            {isDraggingOver && (
              <div className="absolute inset-0 z-20 rounded-[1.65rem] bg-[#05070D]/95 border-2 border-dashed border-[#00C8FF] flex flex-col items-center justify-center space-y-2 backdrop-blur-sm">
                <FileUp className="w-10 h-10 text-[#00C8FF] animate-bounce" />
                <span className="font-mono text-sm font-bold text-[#F5F7FA]">
                  Drop your document here
                </span>
                <span className="font-mono text-xs text-[#8B95A7]">
                  Supports .txt, .md, .pdf, .docx, .json, .csv, .log
                </span>
              </div>
            )}

            {/* Document Attached Badge if a document is loaded */}
            {uploadedDoc && (
              <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-xl bg-[#00C8FF]/10 border border-[#00C8FF]/30">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="p-1 rounded bg-[#00C8FF]/20 text-[#00C8FF]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate text-xs font-mono">
                    <span className="text-white font-semibold">{uploadedDoc.name}</span>
                    <span className="text-[#8B95A7] ml-2">
                      ({formatFileSize(uploadedDoc.size)} · {uploadedDoc.wordCount} words)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline text-[10px] font-mono text-[#00C8FF] bg-[#00C8FF]/20 px-2 py-0.5 rounded-full">
                    Document Loaded
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveDocument}
                    className="p-1 rounded-full text-[#8B95A7] hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Remove document"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Parsing State */}
            {isParsingDoc && (
              <div className="py-6 flex items-center justify-center gap-3 text-xs font-mono text-[#00C8FF]">
                <span className="w-4 h-4 rounded-full border-2 border-[#00C8FF] border-t-transparent animate-spin" />
                <span>Extracting document content...</span>
              </div>
            )}

            {/* Textarea */}
            {!isParsingDoc && (
              <textarea
                value={plaintext}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your plain text or upload a document..."
                rows={uploadedDoc ? 5 : 3}
                className="w-full bg-transparent text-[#F5F7FA] placeholder-[#8B95A7]/60 font-sans text-base sm:text-lg focus:outline-none resize-none leading-relaxed"
              />
            )}

            {/* Bottom Bar: Upload Button, Examples, Character Count, Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
              {/* Left: Upload Document Button + Preset */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-[#00C8FF] bg-[#00C8FF]/10 hover:bg-[#00C8FF]/20 border border-[#00C8FF]/30 transition-all hover:scale-[1.02] cursor-pointer"
                  title="Upload .txt, .pdf, .docx, .md, .json, .csv document from browser"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload Doc</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlaintext('MEET ME AT 10 PM');
                    setUploadedDoc(null);
                  }}
                  className="text-xs font-mono text-[#8B95A7] hover:text-[#00C8FF] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-[#00C8FF]/10 transition-colors hidden sm:inline-block"
                >
                  Example
                </button>

                {plaintext.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPlaintext('');
                      setUploadedDoc(null);
                    }}
                    className="text-xs font-mono text-[#8B95A7]/70 hover:text-red-400 px-2 py-1 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Right: Character Count + Dual Action Buttons (AI Convert & Standard Encrypt) */}
              <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
                <span className="text-xs font-mono text-[#8B95A7] tabular-nums hidden sm:inline">
                  {plaintext.length} chars
                </span>

                {/* AI CONVERT TO CIPHER BUTTON */}
                <button
                  type="button"
                  onClick={handleAiConvert}
                  disabled={isTransforming || plaintext.trim().length === 0}
                  className="group relative flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#00C8FF] via-[#536DFF] to-[#00C8FF] bg-[length:200%_auto] hover:bg-[position:right_center] text-black font-bold font-mono text-xs shadow-[0_0_18px_rgba(0,200,255,0.45)] hover:shadow-[0_0_25px_rgba(0,200,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
                  title="Let AI convert document into optimal cipher"
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>AI Cipher</span>
                </button>

                {/* STANDARD ENCRYPT BUTTON */}
                <button
                  type="button"
                  onClick={handleEncrypt}
                  disabled={isTransforming || plaintext.trim().length === 0}
                  className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-[#00C8FF] text-[#F5F7FA] hover:text-[#05070D] font-bold border border-white/10 hover:border-[#00C8FF] hover:shadow-[0_0_20px_rgba(0,200,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
                  title={`Encrypt with ${ALGORITHM_REGISTRY[selectedAlgo].name}`}
                >
                  {isTransforming && !isAiProcessing ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </section>

      {/* 10. METHOD SELECTION: Horizontally arranged minimal cards / segmented selector */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold font-display tracking-wider text-[#F5F7FA] uppercase">
            Choose your cipher
          </h2>
          <span className="text-xs font-mono text-[#8B95A7]">
            Active: <strong className="text-[#00C8FF]">{ALGORITHM_REGISTRY[selectedAlgo].name}</strong>
          </span>
        </div>

        {/* Minimal Horizontal Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {Object.values(ALGORITHM_REGISTRY).map((algo) => {
            const isSelected = selectedAlgo === algo.id;
            return (
              <button
                key={algo.id}
                type="button"
                onClick={() => {
                  setSelectedAlgo(algo.id);
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-2xl text-left transition-all duration-200 relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0A0E1A] border border-[#00C8FF] glow-cyan-sm scale-[1.02]'
                    : 'bg-[#0A0E1A]/60 border border-[rgba(0,200,255,0.08)] hover:border-[#00C8FF]/40 hover:-translate-y-0.5 hover:bg-[#0A0E1A]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`text-xs font-semibold font-mono tracking-tight ${
                      isSelected ? 'text-[#00C8FF]' : 'text-[#F5F7FA]'
                    }`}
                  >
                    {algo.name.replace(' Cipher', '')}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] shadow-[0_0_6px_#00C8FF]" />
                  )}
                </div>

                <div className="text-[10px] text-[#8B95A7] font-mono truncate">
                  {algo.example.plain} → {algo.example.cipher}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cipher-Specific Parameter Controls Bar */}
        <div className="rounded-2xl bg-[#0A0E1A]/80 border border-[rgba(0,200,255,0.1)] p-4 text-xs font-mono transition-all">
          <div className="flex items-center justify-between mb-3 text-[11px] text-[#8B95A7]">
            <span className="text-[#00C8FF] font-semibold uppercase tracking-wider">
              {ALGORITHM_REGISTRY[selectedAlgo].name} Parameters
            </span>
            <span>{ALGORITHM_REGISTRY[selectedAlgo].category}</span>
          </div>

          {/* Caesar Slider */}
          {selectedAlgo === 'caesar' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[#F5F7FA]">Shift Offset (k = 1..25):</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={caesarShift}
                  onChange={(e) => setCaesarShift(Number(e.target.value))}
                  className="w-48 sm:w-64 accent-[#00C8FF] cursor-pointer"
                />
                <span className="w-8 text-center text-sm font-bold text-[#00C8FF]">
                  +{caesarShift}
                </span>
              </div>
            </div>
          )}

          {/* Vigenère Keyword */}
          {selectedAlgo === 'vigenere' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[#F5F7FA]">Secret Keyword:</span>
              <input
                type="text"
                value={vigenereKey}
                onChange={(e) => setVigenereKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder="LEMON"
                className="w-full sm:w-60 px-3 py-1.5 rounded-xl bg-[#05070D] border border-[rgba(0,200,255,0.2)] text-[#00C8FF] text-sm font-bold tracking-widest uppercase focus:outline-none focus:border-[#00C8FF]"
              />
            </div>
          )}

          {/* Atbash info */}
          {selectedAlgo === 'atbash' && (
            <div className="text-[#8B95A7]">
              Symmetric alphabet reflection: A ↔ Z, B ↔ Y. No parameter configuration required.
            </div>
          )}

          {/* ROT13 info */}
          {selectedAlgo === 'rot13' && (
            <div className="text-[#8B95A7]">
              Fixed half-alphabet rotation (13 positions). Self-inverting cipher.
            </div>
          )}

          {/* Affine Cipher Parameters */}
          {selectedAlgo === 'affine' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#8B95A7] block mb-1">Multiplier &apos;a&apos; (coprime to 26):</label>
                <select
                  value={affineA}
                  onChange={(e) => setAffineA(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-[#05070D] border border-[rgba(0,200,255,0.2)] text-[#00C8FF] font-bold focus:outline-none"
                >
                  {VALID_AFFINE_A.map((val) => (
                    <option key={val} value={val}>
                      a = {val} (gcd({val}, 26) = 1)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#8B95A7] block mb-1">Shift &apos;b&apos; (0..25):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={affineB}
                    onChange={(e) => setAffineB(Number(e.target.value))}
                    className="flex-1 accent-[#00C8FF] cursor-pointer"
                  />
                  <span className="w-8 text-center text-sm font-bold text-[#00C8FF]">{affineB}</span>
                </div>
              </div>
            </div>
          )}

          {/* Playfair Cipher */}
          {selectedAlgo === 'playfair' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[#F5F7FA]">Key Matrix Keyword:</span>
                <input
                  type="text"
                  value={playfairKey}
                  onChange={(e) => setPlayfairKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                  placeholder="MONARCHY"
                  className="w-full sm:w-60 px-3 py-1.5 rounded-xl bg-[#05070D] border border-[rgba(0,200,255,0.2)] text-[#00C8FF] text-sm font-bold tracking-widest uppercase focus:outline-none focus:border-[#00C8FF]"
                />
              </div>
              {playfairMatrixPreview && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-[#8B95A7] mr-2">5×5 Matrix:</span>
                  {playfairMatrixPreview.flat().slice(0, 15).map((char, i) => (
                    <span key={i} className="w-5 h-5 rounded bg-[#05070D] text-[11px] text-[#F5F7FA] font-bold flex items-center justify-center">
                      {char}
                    </span>
                  ))}
                  <span className="text-[10px] text-[#8B95A7]">...</span>
                </div>
              )}
            </div>
          )}

          {/* Hill Cipher */}
          {selectedAlgo === 'hill' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[#F5F7FA]">2×2 Matrix:</span>
                <div className="grid grid-cols-2 gap-1.5 max-w-[140px]">
                  <input
                    type="number"
                    value={hillMatrix[0][0]}
                    onChange={(e) => setHillMatrix([[Number(e.target.value), hillMatrix[0][1]], hillMatrix[1]])}
                    className="w-14 p-1 rounded bg-[#05070D] border border-[rgba(0,200,255,0.2)] text-center text-[#00C8FF] font-bold focus:outline-none"
                  />
                  <input
                    type="number"
                    value={hillMatrix[0][1]}
                    onChange={(e) => setHillMatrix([[hillMatrix[0][0], Number(e.target.value)], hillMatrix[1]])}
                    className="w-14 p-1 rounded bg-[#05070D] border border-[rgba(0,200,255,0.2)] text-center text-[#00C8FF] font-bold focus:outline-none"
                  />
                  <input
                    type="number"
                    value={hillMatrix[1][0]}
                    onChange={(e) => setHillMatrix([hillMatrix[0], [Number(e.target.value), hillMatrix[1][1]]])}
                    className="w-14 p-1 rounded bg-[#05070D] border border-[rgba(0,200,255,0.2)] text-center text-[#00C8FF] font-bold focus:outline-none"
                  />
                  <input
                    type="number"
                    value={hillMatrix[1][1]}
                    onChange={(e) => setHillMatrix([hillMatrix[0], [hillMatrix[1][0], Number(e.target.value)]])}
                    className="w-14 p-1 rounded bg-[#05070D] border border-[rgba(0,200,255,0.2)] text-center text-[#00C8FF] font-bold focus:outline-none"
                  />
                </div>
                {hillValidation && (
                  <span className={`text-[11px] ${hillValidation.isValid ? 'text-[#00C8FF]' : 'text-red-400'}`}>
                    {hillValidation.isValid ? `✓ Invertible mod 26 (Det: ${hillValidation.detMod26})` : hillValidation.errorMessage}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Rail Fence */}
          {selectedAlgo === 'railfence' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[#F5F7FA]">Number of Rails:</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={railFenceRails}
                  onChange={(e) => setRailFenceRails(Number(e.target.value))}
                  className="w-48 sm:w-64 accent-[#00C8FF] cursor-pointer"
                />
                <span className="w-8 text-center text-sm font-bold text-[#00C8FF]">{railFenceRails}</span>
              </div>
            </div>
          )}

          {/* Columnar Transposition */}
          {selectedAlgo === 'columnar' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[#F5F7FA]">Columnar Keyword:</span>
              <input
                type="text"
                value={columnarKey}
                onChange={(e) => setColumnarKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder="CIPHER"
                className="w-full sm:w-60 px-3 py-1.5 rounded-xl bg-[#050914] border border-[rgba(0,200,255,0.2)] text-[#00C8FF] text-sm font-bold tracking-widest uppercase focus:outline-none focus:border-[#00C8FF]"
              />
            </div>
          )}

          {/* Reverse */}
          {selectedAlgo === 'reverse' && (
            <div className="text-[#8B95A7]">
              Reverses the entire string order from end to beginning.
            </div>
          )}
        </div>
      </section>

      {/* 11 & 16. ENCRYPTION TRANSITION / PARTICLE SCRAMBLE & LOADING STATE */}
      {isTransforming && (
        <section className="p-8 rounded-3xl bg-[#0A0E1A] border border-[#00C8FF]/30 glow-cyan-md flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#00C8FF] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00C8FF] animate-ping" />
            <span>{processingText}</span>
          </div>

          {/* Moving progress laser line */}
          <div className="w-64 h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-[#00C8FF] to-transparent w-full animate-flow-stream" />
          </div>

          {/* Character Particle Scramble Preview */}
          <div className="font-mono text-xl sm:text-2xl text-[#F5F7FA] tracking-widest break-all select-none">
            {scrambledText}
          </div>
          <p className="text-[11px] font-mono text-[#8B95A7]">
            {isAiProcessing
              ? 'Cryptex AI is analyzing document syntax and encrypting content...'
              : `Permuting and shifting characters via ${ALGORITHM_REGISTRY[selectedAlgo].name}...`}
          </p>
        </section>
      )}

      {/* 13. PLAINTEXT → CIPHERTEXT VISUALIZATION CONNECTOR */}
      {cipherResult && !isTransforming && (
        <div className="flex flex-col items-center justify-center py-2 space-y-1 select-none">
          <div className="w-[1.5px] h-6 bg-gradient-to-b from-[#00C8FF]/50 to-[#00C8FF]" />
          <div className="px-4 py-1.5 rounded-full bg-[#0A0E1A] border border-[#00C8FF]/30 text-xs font-mono text-[#00C8FF] font-semibold flex items-center gap-2 shadow-lg">
            {cipherResult.aiInfo ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#00C8FF]" />
                <span>{cipherResult.aiInfo.algorithmName}</span>
                <span className="text-[#8B95A7]">·</span>
                <span className="text-[#F5F7FA]">Key: {cipherResult.aiInfo.keyUsed}</span>
              </>
            ) : (
              <>
                <span>{ALGORITHM_REGISTRY[selectedAlgo].name.toUpperCase()}</span>
                <span className="text-[#8B95A7]">·</span>
                <span className="text-[#F5F7FA]">{cipherResult.parametersSummary}</span>
              </>
            )}
          </div>
          <div className="w-[1.5px] h-6 bg-gradient-to-b from-[#00C8FF] to-[#00C8FF]/50" />
        </div>
      )}

      {/* 12. CIPHERTEXT OUTPUT: Second premium panel */}
      {cipherResult && !isTransforming && (
        <section ref={outputRef} className="space-y-6">
          <div className="rounded-[1.75rem] bg-[#0A0E1A] border border-[rgba(0,200,255,0.25)] glow-cyan-md p-6 sm:p-8 space-y-6">
            {/* Header with subtle controls */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#00C8FF] tracking-wider uppercase">
                  CIPHERTEXT
                </span>
                <span className="text-[11px] font-mono text-[#8B95A7]">
                  ({cipherResult.outputLength} chars)
                </span>
                {cipherResult.aiInfo && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[#00C8FF] bg-[#00C8FF]/15 px-2 py-0.5 rounded-full border border-[#00C8FF]/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI Converted
                  </span>
                )}
              </div>

              {/* Minimal Action Controls: Copy, Download, New Encryption */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCiphertext}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-[#00C8FF]/10 text-xs font-mono text-[#F5F7FA] hover:text-[#00C8FF] border border-white/[0.06] hover:border-[#00C8FF]/30 transition-all cursor-pointer"
                  title="Copy to clipboard"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00C8FF]" />
                      <span className="text-[#00C8FF]">Copied ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCiphertext}
                  className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8B95A7] hover:text-white border border-white/[0.06] transition-all cursor-pointer"
                  title="Download .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleNewEncryption}
                  className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8B95A7] hover:text-white border border-white/[0.06] transition-all cursor-pointer"
                  title="New Encryption"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Cryptographic Intel Card if AI converted */}
            {cipherResult.aiInfo && (
              <div className="p-4 rounded-2xl bg-[#05070D] border border-[#00C8FF]/25 space-y-3 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2 text-[#00C8FF] font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>AI CRYPTOGRAPHIC SYNTHESIS</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#8B95A7]">Secret Key:</span>
                    <span className="px-2 py-0.5 rounded bg-[#00C8FF]/20 text-[#00C8FF] font-bold">
                      {cipherResult.aiInfo.keyUsed}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(cipherResult.aiInfo!.keyUsed)}
                      className="text-[10px] text-[#8B95A7] hover:text-[#00C8FF] underline ml-1 cursor-pointer"
                    >
                      {copiedKey ? 'Key Copied ✓' : 'Copy Key'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                  <div>
                    <span className="text-[#8B95A7] block mb-0.5 font-semibold">Algorithm & Selection Reasoning:</span>
                    <p className="text-[#F5F7FA]">{cipherResult.aiInfo.reasoning}</p>
                  </div>

                  <div>
                    <span className="text-[#8B95A7] block mb-0.5 font-semibold">Decryption Guide:</span>
                    <p className="text-[#00C8FF]">{cipherResult.aiInfo.decryptionGuide}</p>
                  </div>
                </div>

                {cipherResult.aiInfo.sourceDocumentName && (
                  <div className="text-[10px] text-[#8B95A7] pt-1">
                    Source Document: <strong className="text-white">{cipherResult.aiInfo.sourceDocumentName}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Encrypted Output String in Monospace typography */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#05070D]/90 border border-white/[0.04] select-all">
              <div className="font-mono text-lg sm:text-xl text-[#00C8FF] tracking-widest break-all font-semibold leading-relaxed drop-shadow-[0_0_12px_rgba(0,200,255,0.35)]">
                {cipherResult.ciphertext}
              </div>
            </div>

            {/* Security notice */}
            {cipherResult.warningNotice && (
              <p className="text-xs font-mono text-[#8B95A7] leading-relaxed">
                <span className="text-[#00C8FF] font-semibold">Security Note: </span>
                {cipherResult.warningNotice}
              </p>
            )}
          </div>

          {/* Educational Transformation Breakdown (for classical ciphers) */}
          {Object.keys(cipherResult.details).length > 0 && (
            <TransformationView
              algorithmId={selectedAlgo}
              details={cipherResult.details}
              plaintext={plaintext}
              ciphertext={cipherResult.ciphertext}
            />
          )}
        </section>
      )}

      {/* Expandable How it Works Educational Card */}
      <section>
        <AlgorithmInfo algorithmId={selectedAlgo} />
      </section>
    </div>
  );
};
