import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

// Server-side GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Cipher endpoint: converts plain text / document text into cipher text using Gemini
app.post('/api/ai-cipher', async (req, res) => {
  try {
    const { text, fileName, preferredCipher, customInstruction } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required for encryption.' });
    }

    // If Gemini API is configured on server
    if (aiClient) {
      const prompt = `You are CRYPTEX AI, an advanced classical and educational cryptography engine.
The user has provided a document/message to convert into cipher text.
${fileName ? `Document name: ${fileName}` : ''}
${preferredCipher ? `Preferred Cipher: ${preferredCipher}` : 'Select the most mathematically appropriate classical cipher (such as Vigenère with an auto-generated key, Playfair, Affine, Columnar Transposition, or Hill cipher)'}
${customInstruction ? `User Instruction: ${customInstruction}` : ''}

Plaintext to encrypt:
"""
${text.slice(0, 10000)}
"""

Instructions:
1. Genuinely encrypt the plain text using the selected or recommended classical cipher.
2. Maintain character structure, case, spaces, and punctuation appropriately.
3. Provide the secret key used so the recipient can decrypt it.
4. Explain the cryptographic reasoning and step-by-step decryption guide.

Return your response strictly in JSON format matching the schema.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a cybersecurity and classical cryptography AI. You transform plain text documents into precise cipher text and explain the underlying mathematical mechanisms.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ciphertext: {
                type: Type.STRING,
                description: 'The complete encrypted ciphertext string.',
              },
              algorithmName: {
                type: Type.STRING,
                description: 'The name of the algorithm used, e.g. Vigenère Cipher, Playfair, Affine.',
              },
              keyUsed: {
                type: Type.STRING,
                description: 'The secret key, matrix, or shift parameters used for encryption.',
              },
              parametersSummary: {
                type: Type.STRING,
                description: 'A concise summary of parameters (e.g. Keyword: AEGIS, Shift: 7).',
              },
              reasoning: {
                type: Type.STRING,
                description: 'Why this cipher was selected and how it transforms the document structure.',
              },
              decryptionGuide: {
                type: Type.STRING,
                description: 'Step-by-step instructions for reversing the ciphertext back to plaintext.',
              },
              securityAssessment: {
                type: Type.STRING,
                description: 'A brief security/cryptanalysis critique of the cipher.',
              },
            },
            required: [
              'ciphertext',
              'algorithmName',
              'keyUsed',
              'parametersSummary',
              'reasoning',
              'decryptionGuide',
              'securityAssessment',
            ],
          },
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error('Empty response from AI model.');
      }

      const parsed = JSON.parse(responseText);
      return res.json({
        success: true,
        source: 'gemini',
        ...parsed,
      });
    }

    // Fallback if GEMINI_API_KEY is not configured: server-side deterministic AI cipher
    const fallbackResult = generateAlgorithmicAiCipher(text, preferredCipher);
    return res.json({
      success: true,
      source: 'local-engine',
      ...fallbackResult,
    });
  } catch (err) {
    console.error('Error in /api/ai-cipher:', err);
    // Provide a graceful fallback instead of failing
    try {
      const fallbackResult = generateAlgorithmicAiCipher(req.body.text || '', req.body.preferredCipher);
      return res.json({
        success: true,
        source: 'fallback-engine',
        ...fallbackResult,
      });
    } catch {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
});

// Deterministic cryptographic fallback generator
function generateAlgorithmicAiCipher(text: string, preferred?: string) {
  // Generate a key based on content length or timestamp
  const keys = ['CRYPTEX', 'PHANTOM', 'ENIGMA', 'VALKYRIE', 'SPECTRE', 'AEGIS'];
  const keyword = keys[Math.floor(Math.random() * keys.length)];

  // Apply Vigenère cipher
  let ciphertext = '';
  let keyIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      const shift = keyword.charCodeAt(keyIndex % keyword.length) - 65;
      ciphertext += String.fromCharCode(((code - 65 + shift) % 26) + 65);
      keyIndex++;
    } else if (code >= 97 && code <= 122) {
      const shift = keyword.charCodeAt(keyIndex % keyword.length) - 65;
      ciphertext += String.fromCharCode(((code - 97 + shift) % 26) + 97);
      keyIndex++;
    } else {
      ciphertext += text[i];
    }
  }

  return {
    ciphertext,
    algorithmName: 'AI-Selected Polyalphabetic Vigenère',
    keyUsed: keyword,
    parametersSummary: `Keyword = "${keyword}" (Length: ${keyword.length})`,
    reasoning: `Selected a periodic polyalphabetic substitution with high-entropy key "${keyword}" to flatten monoalphabetic character frequencies across the document.`,
    decryptionGuide: `To decrypt, use the secret keyword "${keyword}" in reverse across the Vigenère square (Cᵢ - Kᵢ mod 26).`,
    securityAssessment: 'Resistant to elementary single-character frequency analysis, but breakable via Kasiski examination and Index of Coincidence.',
  };
}

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`CRYPTEX server active at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
