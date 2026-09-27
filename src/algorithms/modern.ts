// Real browser-native Web Crypto API implementations for Modern Cryptography

export async function hashSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function encodeBase64(text: string): string {
  try {
    const bytes = new TextEncoder().encode(text);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    return btoa(binString);
  } catch (err) {
    throw new Error('Base64 encoding failed: ' + (err as Error).message);
  }
}

export function decodeBase64(encoded: string): string {
  try {
    const binString = atob(encoded);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error('Invalid Base64 string format.');
  }
}

export interface AesGcmResult {
  ciphertextHex: string;
  ivHex: string;
  keyHex: string;
  combinedBase64: string;
}

export async function encryptAesGcm(text: string, secretPassphrase?: string): Promise<AesGcmResult> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit standard GCM IV

  let key: CryptoKey;
  let rawKeyBytes: Uint8Array;

  if (secretPassphrase && secretPassphrase.trim().length > 0) {
    // Derive key using SHA-256 of passphrase
    const passHash = await crypto.subtle.digest('SHA-256', enc.encode(secretPassphrase));
    rawKeyBytes = new Uint8Array(passHash);
    key = await crypto.subtle.importKey(
      'raw',
      rawKeyBytes as BufferSource,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  } else {
    // Generate fresh ephemeral 256-bit key
    key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const exported = await crypto.subtle.exportKey('raw', key);
    rawKeyBytes = new Uint8Array(exported);
  }

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(text)
  );

  const cipherBytes = new Uint8Array(encryptedBuffer);

  // Hex strings
  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('');
  const keyHex = Array.from(rawKeyBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const ciphertextHex = Array.from(cipherBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

  // Combined [IV (12 bytes) + Ciphertext + Tag] in Base64
  const combined = new Uint8Array(iv.length + cipherBytes.length);
  combined.set(iv, 0);
  combined.set(cipherBytes, iv.length);
  const combinedBin = Array.from(combined, (b) => String.fromCharCode(b)).join('');
  const combinedBase64 = btoa(combinedBin);

  return {
    ciphertextHex,
    ivHex,
    keyHex,
    combinedBase64,
  };
}

export async function decryptAesGcm(combinedBase64: string, keyHex: string): Promise<string> {
  try {
    const binString = atob(combinedBase64);
    const combined = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    if (combined.length < 12 + 16) {
      throw new Error('Payload too short for AES-GCM (needs 12-byte IV + 16-byte Auth Tag).');
    }

    const iv = combined.slice(0, 12);
    const cipherBytes = combined.slice(12);

    // Reconstruct key from hex
    const keyBytes = new Uint8Array(
      keyHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes as BufferSource,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBytes as BufferSource
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    throw new Error('Decryption / Authentication failed: ' + (err as Error).message);
  }
}
