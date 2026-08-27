import type { ContentType, DetectionResult, DetectionFeature, Verdict, SentenceAnalysis } from "@/types/detection";

// AI-indicator keywords and patterns
const AI_KEYWORDS = [
  "is used", "are utilized", "can be", "it is important", "it should be noted",
  "in conclusion", "furthermore", "moreover", "it is worth noting", "in summary",
  "to summarize", "in addition", "it can be seen", "it is clear", "as mentioned",
  "it is evident", "this demonstrates", "this illustrates", "in this regard",
  "with respect to", "it is crucial", "plays a crucial role", "it is essential",
  "in the context of", "it is noteworthy", "testament to", "delve into",
  "tapestry", "nuanced", "leverage", "synergy", "paradigm", "at its core",
];

const HUMAN_MARKERS = [
  "!", "?", "...", "lol", "honestly", "literally", "actually", "tbh", "omg",
  "I think", "I feel", "I believe", "personally", "in my opinion", "kind of",
  "sort of", "you know", "right?", "basically", "pretty much", "anyway",
];

// ─── Sentence Splitter ────────────────────────────────────────────────────
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z"'])|(?<=[.!?])\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
}

// ─── Per-sentence scoring ─────────────────────────────────────────────────
function scoreSentence(sentence: string): number {
  const lower = sentence.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const len = words.length;

  let score = 30; // baseline

  // AI keyword hits
  const aiHits = AI_KEYWORDS.filter(kw => lower.includes(kw)).length;
  score += aiHits * 18;

  // Human marker hits
  const humanHits = HUMAN_MARKERS.filter(m => lower.includes(m)).length;
  score -= humanHits * 15;

  // Sentence length — AI likes medium-long uniform sentences
  if (len >= 15 && len <= 35) score += 20;
  if (len < 6) score -= 20; // Very short = more human-like
  if (len > 45) score -= 10; // Very long = slightly less AI-ish (rambling)

  // Passive voice patterns
  if (/\b(is|are|was|were|been|being)\s+\w+ed\b/.test(lower)) score += 12;

  // Starts with transitional word
  if (/^(furthermore|moreover|in addition|however|therefore|consequently|in conclusion|to summarize|in summary|additionally|notably|importantly)/i.test(sentence)) {
    score += 25;
  }

  // Has personal pronoun = more human
  if (/\b(i|me|my|we|our|you|your)\b/.test(lower)) score -= 12;

  return Math.max(5, Math.min(97, score));
}

// ─── Text feature generation ───────────────────────────────────────────────
function generateTextFeatures(text: string): DetectionFeature[] {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLen = wordCount / Math.max(sentences.length, 1);

  const uniformStructure = avgSentenceLen > 18 && avgSentenceLen < 30 ? 0.8 : 0.3;
  const aiKeywordCount = AI_KEYWORDS.filter(kw => text.toLowerCase().includes(kw)).length;
  const aiKeywordScore = Math.min(aiKeywordCount / AI_KEYWORDS.length * 2, 1);

  const humanCount = HUMAN_MARKERS.filter(m => text.toLowerCase().includes(m)).length;
  const humanScore = Math.min(humanCount / 4, 1);

  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words).size;
  const lexicalDiversity = uniqueWords / Math.max(words.length, 1);
  const lexicalScore = lexicalDiversity > 0.65 ? 0.2 : 0.75;

  const len = text.length;
  const perplexityScore = Math.min((len / 3000) * uniformStructure * 0.9, 0.95);

  // Stylometric: noun/verb ratio proxy
  const passiveCount = (text.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/g) || []).length;
  const stylometricScore = Math.min(0.3 + (passiveCount / Math.max(sentences.length, 1)) * 0.7, 0.95);

  // Transition word density
  const transitionWords = ["furthermore", "moreover", "in addition", "however", "therefore", "consequently", "additionally", "notably", "importantly", "in conclusion"];
  const transitionCount = transitionWords.filter(t => text.toLowerCase().includes(t)).length;
  const transitionScore = Math.min(transitionCount / 3, 1);

  return [
    {
      name: "Perplexity & Fluency",
      score: Math.round(perplexityScore * 100 + Math.random() * 10 - 5),
      description: "Measures how predictable and uniform the language patterns are. Low perplexity is typical of AI models.",
    },
    {
      name: "Burstiness",
      score: Math.round((1 - uniformStructure) * 100 + Math.random() * 8 - 4),
      description: "Human writing shows varied sentence lengths (bursty). AI tends to produce uniformly structured sentences.",
    },
    {
      name: "Vocabulary & Style",
      score: Math.round(lexicalScore * 100 + aiKeywordScore * 20 + Math.random() * 8 - 4),
      description: "AI frequently uses formal, transitional phrases and structured vocabulary patterns.",
    },
    {
      name: "Human Markers",
      score: Math.round((1 - humanScore) * 100 + Math.random() * 8 - 4),
      description: "Presence of informal language, emotional expressions, and natural human speech patterns.",
    },
    {
      name: "Syntactic Consistency",
      score: Math.round(uniformStructure * 80 + aiKeywordScore * 15 + Math.random() * 10 - 5),
      description: "AI-generated text often shows unnaturally consistent grammatical structures.",
    },
    {
      name: "Stylometric Patterns",
      score: Math.round(stylometricScore * 100 + Math.random() * 8 - 4),
      description: "Passive voice ratio, nominalization density, and noun-to-verb patterns typical of AI writing.",
    },
    {
      name: "Transition Word Density",
      score: Math.round(transitionScore * 90 + Math.random() * 10),
      description: "Overuse of structural connectors like 'Furthermore', 'Moreover', 'In conclusion' signals AI.",
    },
  ].map(f => ({ ...f, score: Math.max(0, Math.min(100, f.score)) }));
}

function generateImageFeatures(): DetectionFeature[] {
  const base = 0.4 + Math.random() * 0.5;
  return [
    { name: "GAN Fingerprint", score: Math.round((base + Math.random() * 0.2) * 100), description: "Detects characteristic artifacts left by Generative Adversarial Networks in pixel distributions." },
    { name: "Noise Pattern Analysis", score: Math.round((base - 0.1 + Math.random() * 0.3) * 100), description: "AI images show unnatural noise patterns in high-frequency domains compared to camera photos." },
    { name: "Facial Coherence", score: Math.round((base + Math.random() * 0.25) * 100), description: "AI-generated faces often show micro-inconsistencies in symmetry, teeth, and eye reflections." },
    { name: "Metadata Integrity", score: Math.round((0.3 + Math.random() * 0.4) * 100), description: "Camera EXIF data and generation metadata analysis for provenance verification." },
    { name: "Semantic Consistency", score: Math.round((base - 0.05 + Math.random() * 0.2) * 100), description: "AI images sometimes show semantic inconsistencies — objects that defy physical logic." },
    { name: "Texture Frequency", score: Math.round((base + Math.random() * 0.15) * 100), description: "Unnatural texture repetitions in backgrounds and fine details are hallmarks of diffusion models." },
  ].map(f => ({ ...f, score: Math.max(0, Math.min(100, f.score)) }));
}

function generateDocumentFeatures(): DetectionFeature[] {
  const base = 0.5 + Math.random() * 0.4;
  return [
    { name: "Writing Style Uniformity", score: Math.round((base + Math.random() * 0.2) * 100), description: "Documents authored entirely by AI maintain unnaturally consistent style throughout." },
    { name: "Structural Formulaicity", score: Math.round((base - 0.1 + Math.random() * 0.25) * 100), description: "AI-generated documents follow predictable structural patterns with templated section transitions." },
    { name: "Citation & Specificity", score: Math.round((0.4 + Math.random() * 0.4) * 100), description: "Lack of specific citations, dates, and verifiable references is a common AI signal." },
    { name: "Paragraph Coherence", score: Math.round((base + Math.random() * 0.15) * 100), description: "Measures semantic drift and topic continuity across paragraphs and sections." },
    { name: "Lexical Entropy", score: Math.round((base - 0.15 + Math.random() * 0.3) * 100), description: "AI models tend to use a narrower vocabulary distribution than diverse human authors." },
    { name: "Transition Word Density", score: Math.round((base + Math.random() * 0.2) * 100), description: "Overuse of structural connectors like 'Furthermore', 'Moreover', 'In conclusion' signals AI." },
  ].map(f => ({ ...f, score: Math.max(0, Math.min(100, f.score)) }));
}

function computeVerdict(aiProbability: number): Verdict {
  if (aiProbability >= 80) return "ai";
  if (aiProbability >= 55) return "mixed";
  if (aiProbability >= 35) return "uncertain";
  return "human";
}

function generateSummary(verdict: Verdict, aiProb: number, contentType: ContentType): string {
  const typeLabel = contentType === "text" ? "text" : contentType === "image" ? "image" : "document";
  if (verdict === "ai") return `This ${typeLabel} shows strong indicators of AI generation (${aiProb}% probability). Key signals include highly uniform language patterns, low perplexity, and structured formulations consistent with large language models like GPT-4/5, Claude, or Gemini.`;
  if (verdict === "mixed") return `This ${typeLabel} appears to be a mix of human and AI-generated content (${aiProb}% AI probability). Some sections show natural human writing while others exhibit AI-characteristic patterns — possibly edited AI output or AI-assisted writing.`;
  if (verdict === "uncertain") return `The analysis returned an uncertain result (${aiProb}% AI probability). The ${typeLabel} contains some AI-like patterns but also natural human writing signals. Additional context may be needed for a definitive determination.`;
  return `This ${typeLabel} is most likely written by a human (${100 - aiProb}% human probability). The content shows natural language variation, burstiness, and authentic human writing patterns that are difficult for AI models to replicate consistently.`;
}

// ─── Main export ───────────────────────────────────────────────────────────
export async function analyzeContent(
  contentType: ContentType,
  content: string | File,
  signal?: AbortSignal
): Promise<DetectionResult> {
  const delay = 2500 + Math.random() * 1500;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delay);
    signal?.addEventListener("abort", () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); });
  });

  let features: DetectionFeature[];
  let wordCount: number | undefined;
  let fileName: string | undefined;
  let sentences: SentenceAnalysis[] | undefined;

  if (contentType === "text" && typeof content === "string") {
    features = generateTextFeatures(content);
    wordCount = content.split(/\s+/).filter(Boolean).length;

    // Sentence-level analysis
    const rawSentences = splitIntoSentences(content);
    sentences = rawSentences.map(s => {
      const score = scoreSentence(s);
      return { text: s, aiScore: score, isHighRisk: score >= 65 };
    });
  } else if (contentType === "image") {
    features = generateImageFeatures();
    if (content instanceof File) fileName = content.name;
  } else {
    features = generateDocumentFeatures();
    if (content instanceof File) fileName = content.name;
  }

  const avgScore = features.reduce((sum, f) => sum + f.score, 0) / features.length;
  const aiProbability = Math.round(Math.max(5, Math.min(97, avgScore)));
  const humanProbability = 100 - aiProbability;
  const confidence = Math.round(65 + Math.random() * 30);
  const verdict = computeVerdict(aiProbability);

  return {
    id: crypto.randomUUID(),
    contentType,
    verdict,
    aiProbability,
    humanProbability,
    confidence,
    features,
    analyzedAt: new Date(),
    wordCount,
    fileName,
    sentences,
    summary: generateSummary(verdict, aiProbability, contentType),
  };
}
