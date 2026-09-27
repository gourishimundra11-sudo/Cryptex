// Document extraction utility for browser file uploads

export interface ParsedDocument {
  name: string;
  size: number;
  type: string;
  text: string;
  charCount: number;
  wordCount: number;
  lineCount: number;
}

export async function parseUploadedDocument(file: File): Promise<ParsedDocument> {
  const name = file.name;
  const size = file.size;
  const type = file.type || 'text/plain';

  let rawText = '';

  // 1. Text-based formats (.txt, .md, .json, .csv, .log, .tsv, .html, .xml)
  if (
    type.startsWith('text/') ||
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    name.endsWith('.json') ||
    name.endsWith('.csv') ||
    name.endsWith('.tsv') ||
    name.endsWith('.log') ||
    name.endsWith('.xml')
  ) {
    rawText = await file.text();
  }
  // 2. PDF Document text extraction (basic text stream / object parser)
  else if (type === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    rawText = extractTextFromPdfBuffer(arrayBuffer);
    if (!rawText.trim()) {
      // Fallback: extract ASCII printable strings from buffer
      rawText = extractPrintableStrings(new Uint8Array(arrayBuffer));
    }
  }
  // 3. Word Document (.docx is a ZIP containing word/document.xml)
  else if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.toLowerCase().endsWith('.docx')
  ) {
    const arrayBuffer = await file.arrayBuffer();
    rawText = extractTextFromDocxBuffer(arrayBuffer);
    if (!rawText.trim()) {
      rawText = extractPrintableStrings(new Uint8Array(arrayBuffer));
    }
  }
  // 4. Fallback for other files: try text(), then printable strings
  else {
    try {
      rawText = await file.text();
    } catch {
      const buffer = await file.arrayBuffer();
      rawText = extractPrintableStrings(new Uint8Array(buffer));
    }
  }

  // Clean and normalize text
  const cleanText = rawText.replace(/\r\n/g, '\n').trim();
  const charCount = cleanText.length;
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const lines = cleanText ? cleanText.split('\n') : [];

  return {
    name,
    size,
    type,
    text: cleanText,
    charCount,
    wordCount: words.length,
    lineCount: lines.length,
  };
}

// Basic PDF text extractor without heavyweight external libraries
function extractTextFromPdfBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const rawString = textDecoder.decode(bytes);

  // Look for PDF text objects inside BT (Begin Text) ... ET (End Text) blocks
  const textChunks: string[] = [];
  const regex = /BT[\s\S]*?ET/g;
  let match;

  while ((match = regex.exec(rawString)) !== null) {
    const block = match[0];
    // Extract strings inside parentheses like (Hello World) Tj or TJ
    const strRegex = /\((.*?)\)\s*(?:Tj|TJ|'|")/g;
    let strMatch;
    while ((strMatch = strRegex.exec(block)) !== null) {
      const decoded = unescapePdfString(strMatch[1]);
      if (decoded.trim()) {
        textChunks.push(decoded);
      }
    }
  }

  return textChunks.join(' ');
}

function unescapePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

// DOCX simple XML text extractor from raw binary chunks
function extractTextFromDocxBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const rawString = textDecoder.decode(bytes);

  // DOCX XML tags look like <w:t>Text</w:t>
  const textChunks: string[] = [];
  const wtRegex = /<w:t(?:\s+[^>]*)?>([^<]+)<\/w:t>/g;
  let match;

  while ((match = wtRegex.exec(rawString)) !== null) {
    if (match[1]) {
      textChunks.push(match[1]);
    }
  }

  return textChunks.join(' ');
}

// Fallback: extract readable ASCII / UTF-8 character sequences
function extractPrintableStrings(bytes: Uint8Array): string {
  let result = '';
  let currentWord = '';

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    // Printable ASCII or newline / tab
    if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
      currentWord += String.fromCharCode(byte);
    } else {
      if (currentWord.length >= 4) {
        result += currentWord + ' ';
      }
      currentWord = '';
    }
  }
  if (currentWord.length >= 4) {
    result += currentWord;
  }

  return result.trim();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
