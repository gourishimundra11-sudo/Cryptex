export type AlgorithmId =
  | 'caesar'
  | 'vigenere'
  | 'atbash'
  | 'rot13'
  | 'affine'
  | 'playfair'
  | 'hill'
  | 'railfence'
  | 'columnar'
  | 'reverse';

export type AlgorithmCategory =
  | 'Monoalphabetic Substitution'
  | 'Polyalphabetic Substitution'
  | 'Transposition / Permutation'
  | 'Polygraphic / Matrix'
  | 'Mathematical';

export interface AlgorithmMetadata {
  id: AlgorithmId;
  name: string;
  category: AlgorithmCategory;
  shortDescription: string;
  example: {
    plain: string;
    key?: string;
    cipher: string;
  };
  keyConcept: string;
  historicalUsage: string;
  modernSecurityStatus: 'Broken / Trivial' | 'Insecure / Educational Only' | 'Easily Broken via Frequency Analysis';
  formula?: string;
  defaultParams: AlgorithmParams;
}

export interface CaesarParams {
  shift: number;
}

export interface VigenereParams {
  keyword: string;
}

export interface AffineParams {
  a: number;
  b: number;
}

export interface PlayfairParams {
  keyword: string;
}

export interface HillParams {
  matrix: [[number, number], [number, number]];
}

export interface RailFenceParams {
  rails: number;
}

export interface ColumnarParams {
  keyword: string;
}

export type AlgorithmParams =
  | { type: 'caesar'; shift: number }
  | { type: 'vigenere'; keyword: string }
  | { type: 'atbash' }
  | { type: 'rot13' }
  | { type: 'affine'; a: number; b: number }
  | { type: 'playfair'; keyword: string }
  | { type: 'hill'; matrix: [[number, number], [number, number]] }
  | { type: 'railfence'; rails: number }
  | { type: 'columnar'; keyword: string }
  | { type: 'reverse' };

// Transformation Visual Details
export interface CaesarStep {
  plain: string;
  isLetter: boolean;
  shift: number;
  cipher: string;
}

export interface VigenereStep {
  plain: string;
  isLetter: boolean;
  keyChar: string;
  shift: number;
  cipher: string;
}

export interface AffineStep {
  plain: string;
  isLetter: boolean;
  x: number;
  calculation: string;
  resultNum: number;
  cipher: string;
}

export interface PlayfairStep {
  digraph: [string, string];
  transformed: [string, string];
  rule: 'same-row' | 'same-col' | 'rectangle';
  description: string;
  pos1: [number, number];
  pos2: [number, number];
  newPos1: [number, number];
  newPos2: [number, number];
}

export interface HillStep {
  pair: [string, string];
  vector: [number, number];
  resultVector: [number, number];
  cipherPair: [string, string];
  calculation: string;
}

export interface RailFenceVisual {
  rails: number;
  grid: (string | null)[][]; // rails x length
  readOrder: { char: string; rail: number; col: number }[];
}

export interface ColumnarVisual {
  keyword: string;
  colOrder: number[]; // e.g. [3, 1, 4, 2]
  grid: string[][]; // rows x columns
  readOrder: { colIndex: number; order: number; text: string }[];
}

export interface TransformationDetails {
  caesar?: { steps: CaesarStep[]; shiftMap: { [key: string]: string } };
  vigenere?: { steps: VigenereStep[] };
  atbash?: { map: { [key: string]: string }; sampleSteps: { plain: string; cipher: string }[] };
  rot13?: { sampleSteps: { plain: string; cipher: string }[] };
  affine?: { steps: AffineStep[]; a: number; b: number; aInverse?: number };
  playfair?: { matrix: string[][]; steps: PlayfairStep[]; normalizedText: string };
  hill?: { steps: HillStep[]; matrix: [[number, number], [number, number]]; determinant: number; detMod26: number };
  railFence?: RailFenceVisual;
  columnar?: ColumnarVisual;
  reverse?: { original: string; reversed: string };
}

export interface AiConversionInfo {
  isAiGenerated: boolean;
  algorithmName: string;
  keyUsed: string;
  reasoning: string;
  decryptionGuide: string;
  securityAssessment: string;
  sourceDocumentName?: string;
}

export interface CipherResult {
  ciphertext: string;
  parametersSummary: string;
  inputLength: number;
  outputLength: number;
  details: TransformationDetails;
  warningNotice?: string;
  aiInfo?: AiConversionInfo;
}

export const ADMIN_EMAIL = 'gourishimundra11@gmail.com';

export interface AdminUserRecord {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  lastLoginAt?: string;
  transformationCount?: number;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail?: string;
  userDisplayName?: string;
  eventType?: string;
  algorithmId: AlgorithmId;
  algorithmName: string;
  parametersSummary?: string;
  plaintext?: string;
  plaintextSnippet?: string;
  ciphertext: string;
  inputLength: number;
  outputLength: number;
  documentName?: string;
  isAiConverted?: boolean;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  algorithmId: AlgorithmId;
  algorithmName: string;
  plaintextSnippet: string;
  plaintext?: string;
  ciphertext: string;
  parametersSummary: string;
  inputLength: number;
  outputLength: number;
  documentName?: string;
  isAiConverted?: boolean;
  userId?: string;
  userEmail?: string;
  userDisplayName?: string;
}
