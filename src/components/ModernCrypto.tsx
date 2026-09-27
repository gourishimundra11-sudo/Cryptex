import React, { useState } from 'react';
import {
  hashSHA256,
  encodeBase64,
  decodeBase64,
  encryptAesGcm,
  decryptAesGcm,
  AesGcmResult,
} from '../algorithms/modern';
import { Shield, Lock, FileCode, Hash, Key, Check, Copy, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const ModernCrypto: React.FC = () => {
  // Encoding testbench state
  const [encodingInput, setEncodingInput] = useState<string>('Cryptographic Integrity 2026');
  const [base64Output, setBase64Output] = useState<string>(() => encodeBase64('Cryptographic Integrity 2026'));
  const [base64Error, setBase64Error] = useState<string | null>(null);

  // Hashing testbench state
  const [hashInput, setHashInput] = useState<string>('PassphraseOrSecretMessage');
  const [sha256Output, setSha256Output] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);

  // Encryption testbench state (Web Crypto AES-GCM)
  const [aesInput, setAesInput] = useState<string>('Top secret intelligence dispatch payload.');
  const [aesPassphrase, setAesPassphrase] = useState<string>('SecureCipherKey987!');
  const [aesResult, setAesResult] = useState<AesGcmResult | null>(null);
  const [aesDecryptOutput, setAesDecryptOutput] = useState<string | null>(null);
  const [aesError, setAesError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Initialize hash
  React.useEffect(() => {
    hashSHA256(hashInput).then(setSha256Output);
  }, []);

  const handleHashChange = async (text: string) => {
    setHashInput(text);
    setIsHashing(true);
    const hash = await hashSHA256(text);
    setSha256Output(hash);
    setIsHashing(false);
  };

  const handleBase64Encode = (text: string) => {
    setEncodingInput(text);
    try {
      setBase64Output(encodeBase64(text));
      setBase64Error(null);
    } catch (e) {
      setBase64Error((e as Error).message);
    }
  };

  const handleBase64Decode = (text: string) => {
    try {
      const decoded = decodeBase64(text);
      setEncodingInput(decoded);
      setBase64Output(text);
      setBase64Error(null);
    } catch (e) {
      setBase64Error((e as Error).message);
    }
  };

  const handleAesEncrypt = async () => {
    try {
      setAesError(null);
      setAesDecryptOutput(null);
      const res = await encryptAesGcm(aesInput, aesPassphrase);
      setAesResult(res);
    } catch (err) {
      setAesError((err as Error).message);
    }
  };

  const handleAesDecrypt = async () => {
    if (!aesResult) return;
    try {
      setAesError(null);
      const decrypted = await decryptAesGcm(aesResult.combinedBase64, aesResult.keyHex);
      setAesDecryptOutput(decrypted);
    } catch (err) {
      setAesError((err as Error).message);
    }
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#00BFFF]/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-[#00BFFF]/10 text-[#00E5FF]">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
            MODERN CRYPTOGRAPHY
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#7D91A8]">
          Real-world authenticated encryption, hashing, and encoding powered by the browser&apos;s native Web Crypto API
        </p>
      </div>

      {/* The Fundamental Distinction: Encoding ≠ Encryption ≠ Hashing */}
      <div className="p-6 rounded-2xl bg-[#0A1224] border border-[#00BFFF]/30 space-y-4">
        <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-sm font-bold tracking-wider uppercase">
          <AlertCircle className="w-4 h-4 text-[#39FF88]" />
          <span>Core Principle: Encoding ≠ Encryption ≠ Hashing</span>
        </div>
        <p className="text-xs sm:text-sm text-[#EAF6FF]/90 leading-relaxed">
          A common misconception among beginner engineers is confusing encoding, hashing, and encryption. Each solves an entirely distinct problem:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Encoding */}
          <div className="p-4 rounded-xl bg-[#050914] border border-[#00BFFF]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#00E5FF] font-bold">
              <FileCode className="w-4 h-4" />
              <span>ENCODING (Base64)</span>
            </div>
            <p className="text-[#7D91A8] text-[11px] leading-relaxed">
              <strong>Purpose:</strong> Data representation and transmission across ASCII channels.
            </p>
            <p className="text-[#EAF6FF]/80 text-[11px]">
              <strong>Security:</strong> ZERO. No secret key exists. Anyone can instantly decode it.
            </p>
            <div className="text-[10px] text-[#00E5FF] bg-black/40 p-1.5 rounded">
              Base64 is NOT encryption!
            </div>
          </div>

          {/* Encryption */}
          <div className="p-4 rounded-xl bg-[#050914] border border-[#39FF88]/30 space-y-2">
            <div className="flex items-center gap-2 text-[#39FF88] font-bold">
              <Lock className="w-4 h-4" />
              <span>ENCRYPTION (AES-GCM)</span>
            </div>
            <p className="text-[#7D91A8] text-[11px] leading-relaxed">
              <strong>Purpose:</strong> Confidentiality and authentication.
            </p>
            <p className="text-[#EAF6FF]/80 text-[11px]">
              <strong>Security:</strong> Reversible ONLY with the secret cryptographic key. Protects against eavesdropping and tampering.
            </p>
            <div className="text-[10px] text-[#39FF88] bg-black/40 p-1.5 rounded">
              Provides confidentiality & integrity
            </div>
          </div>

          {/* Hashing */}
          <div className="p-4 rounded-xl bg-[#050914] border border-[#00BFFF]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#00E5FF] font-bold">
              <Hash className="w-4 h-4" />
              <span>HASHING (SHA-256)</span>
            </div>
            <p className="text-[#7D91A8] text-[11px] leading-relaxed">
              <strong>Purpose:</strong> Integrity verification and password storage.
            </p>
            <p className="text-[#EAF6FF]/80 text-[11px]">
              <strong>Security:</strong> Strictly one-way (irreversible). Deterministic fixed-size digest (256 bits).
            </p>
            <div className="text-[10px] text-[#00E5FF] bg-black/40 p-1.5 rounded">
              One-way mathematical fingerprint
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Web Crypto Testbenches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Base64 Encoding Testbench */}
        <div className="p-5 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <FileCode className="w-4 h-4 text-[#00E5FF]" />
                <span>1. BASE64 ENCODING</span>
              </div>
              <span className="text-[10px] font-mono text-[#7D91A8]">Reversible (No Key)</span>
            </div>
            <p className="text-xs text-[#7D91A8] mb-3">
              Converts 8-bit binary data into 6-bit ASCII radix-64 representation for safe transport.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-[#7D91A8] block mb-1">Plain Text:</label>
                <input
                  type="text"
                  value={encodingInput}
                  onChange={(e) => handleBase64Encode(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#050914] border border-[#00BFFF]/20 text-white focus:outline-none focus:border-[#00BFFF]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] text-[#00E5FF]">Base64 Output:</label>
                  <button
                    onClick={() => handleCopy(base64Output, 'b64')}
                    className="text-[10px] text-[#7D91A8] hover:text-white flex items-center gap-1"
                  >
                    {copiedField === 'b64' ? <Check className="w-3 h-3 text-[#39FF88]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'b64' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={base64Output}
                  onChange={(e) => handleBase64Decode(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#050914] border border-[#00BFFF]/30 text-[#00E5FF] font-mono text-xs focus:outline-none resize-none"
                />
              </div>
              {base64Error && <p className="text-[11px] text-red-400">{base64Error}</p>}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#050914] text-[10px] font-mono text-[#7D91A8]">
            Notice: No secret key is required. Anyone receiving this Base64 payload can decode it instantly.
          </div>
        </div>

        {/* 2. AES-256-GCM Web Crypto Testbench */}
        <div className="p-5 rounded-xl bg-[#0A1224] border border-[#39FF88]/30 flex flex-col justify-between space-y-4 shadow-[0_0_20px_-5px_rgba(57,255,136,0.15)]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <Lock className="w-4 h-4 text-[#39FF88]" />
                <span>2. AES-256-GCM (ENCRYPTION)</span>
              </div>
              <span className="text-[10px] font-mono text-[#39FF88]">Web Crypto API</span>
            </div>
            <p className="text-xs text-[#7D91A8] mb-3">
              Authenticated Encryption with Associated Data (AEAD) with 96-bit random IV and 128-bit authentication tag.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-[#7D91A8] block mb-1">Plaintext:</label>
                <input
                  type="text"
                  value={aesInput}
                  onChange={(e) => setAesInput(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#050914] border border-[#00BFFF]/20 text-white focus:outline-none focus:border-[#39FF88]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#7D91A8] block mb-1">Secret Key / Passphrase:</label>
                <input
                  type="text"
                  value={aesPassphrase}
                  onChange={(e) => setAesPassphrase(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#050914] border border-[#00BFFF]/20 text-[#39FF88] focus:outline-none focus:border-[#39FF88]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAesEncrypt}
                  className="flex-1 py-2 px-3 rounded bg-[#39FF88] text-black font-bold font-mono text-xs hover:bg-[#39FF88]/90 transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypt (AES-GCM)</span>
                </button>
                {aesResult && (
                  <button
                    onClick={handleAesDecrypt}
                    className="py-2 px-3 rounded bg-[#0A1224] border border-[#39FF88]/50 text-[#39FF88] font-mono text-xs hover:bg-white/5 transition-all"
                  >
                    Decrypt
                  </button>
                )}
              </div>

              {aesResult && (
                <div className="p-2.5 rounded bg-[#050914] border border-[#39FF88]/30 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#7D91A8]">IV (96-bit):</span>
                    <span className="text-[#00E5FF] truncate max-w-[150px]">{aesResult.ivHex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D91A8]">Combined:</span>
                    <span className="text-[#39FF88] truncate max-w-[150px]">{aesResult.combinedBase64}</span>
                  </div>
                  {aesDecryptOutput && (
                    <div className="pt-1 border-t border-[#39FF88]/20 text-[#39FF88]">
                      Decrypted: &quot;{aesDecryptOutput}&quot; ✓
                    </div>
                  )}
                </div>
              )}

              {aesError && <p className="text-[11px] text-red-400">{aesError}</p>}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#050914] text-[10px] font-mono text-[#7D91A8]">
            Executed in your browser via window.crypto.subtle.encrypt(). Protects secrecy and detects tampering.
          </div>
        </div>

        {/* 3. SHA-256 Hashing Testbench */}
        <div className="p-5 rounded-xl bg-[#0A1224] border border-[#00BFFF]/20 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <Hash className="w-4 h-4 text-[#00E5FF]" />
                <span>3. SHA-256 (HASHING)</span>
              </div>
              <span className="text-[10px] font-mono text-[#00E5FF]">One-Way Digest</span>
            </div>
            <p className="text-xs text-[#7D91A8] mb-3">
              Fixed 256-bit (64 hex characters) cryptographic digest exhibiting the avalanche effect.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-[#7D91A8] block mb-1">Input Text:</label>
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => handleHashChange(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#050914] border border-[#00BFFF]/20 text-white focus:outline-none focus:border-[#00BFFF]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] text-[#00E5FF]">SHA-256 Hash Digest:</label>
                  <button
                    onClick={() => handleCopy(sha256Output, 'hash')}
                    className="text-[10px] text-[#7D91A8] hover:text-white flex items-center gap-1"
                  >
                    {copiedField === 'hash' ? <Check className="w-3 h-3 text-[#39FF88]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'hash' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded bg-[#050914] border border-[#00BFFF]/20 text-[#00E5FF] text-[11px] break-all leading-relaxed font-mono">
                  {sha256Output || 'Generating...'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#050914] text-[10px] font-mono text-[#7D91A8]">
            Avalanche Effect: Changing even 1 character in the input completely alters all 64 hex characters of the output.
          </div>
        </div>
      </div>

      {/* Modern Cryptographic Primitives Reference */}
      <div className="p-6 rounded-2xl bg-[#0A1224] border border-[#00BFFF]/20 space-y-4">
        <h3 className="text-base font-semibold font-mono text-white">
          MODERN CRYPTOGRAPHIC PRIMITIVES (REAL-WORLD PRODUCTION STANDARDS)
        </h3>
        <p className="text-xs text-[#7D91A8]">
          Real-world security protocols (TLS 1.3, Signal Protocol, SSH, WireGuard) rely on these standardized primitives:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-[#050914] border border-[#00BFFF]/15 space-y-1">
            <span className="text-[#00E5FF] font-bold block">AES-256 (GCM Mode)</span>
            <p className="text-[#7D91A8] text-[11px]">
              Symmetric block cipher with Galois Counter Mode providing hardware-accelerated authenticated encryption (AEAD).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050914] border border-[#00BFFF]/15 space-y-1">
            <span className="text-[#00E5FF] font-bold block">ChaCha20-Poly1305</span>
            <p className="text-[#7D91A8] text-[11px]">
              High-performance stream cipher coupled with Poly1305 authenticator, designed by Daniel J. Bernstein. Immune to timing attacks.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050914] border border-[#00BFFF]/15 space-y-1">
            <span className="text-[#00E5FF] font-bold block">RSA (2048 - 4096 bit)</span>
            <p className="text-[#7D91A8] text-[11px]">
              Asymmetric public-key cipher founded on integer factorization. Used in PKI certificates and key encapsulation.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050914] border border-[#00BFFF]/15 space-y-1">
            <span className="text-[#39FF88] font-bold block">Elliptic Curve (ECC)</span>
            <p className="text-[#7D91A8] text-[11px]">
              Curves like Curve25519 (ECDH key exchange) and Ed25519 (signatures) offering 128-bit security with compact 32-byte keys.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050914] border border-[#00BFFF]/15 space-y-1">
            <span className="text-[#39FF88] font-bold block">SHA-256 / SHA-3</span>
            <p className="text-[#7D91A8] text-[11px]">
              Cryptographic hash functions offering pre-image resistance and collision resistance for digital signatures and blockchain.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050914] border border-[#39FF88]/30 space-y-1">
            <span className="text-[#39FF88] font-bold block">HMAC (Hash MAC)</span>
            <p className="text-[#7D91A8] text-[11px]">
              Keyed-Hash Message Authentication Code ensuring message integrity and authenticity across API webhooks and tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
