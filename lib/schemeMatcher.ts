// ─── Scheme Matching Engine ───────────────────────────────────────────────────
// Scores and ranks schemes against the user's natural language query.
// Returns results sorted by relevance with match reasons.

import { Scheme, ALL_SCHEMES } from './schemeDatabase';

export interface ScoredScheme {
  scheme: Scheme;
  score: number;
  matchPct: number;       // 0–100 for display
  matchReasons: string[]; // Human-readable reasons shown to user
}

// ─── Score weights ─────────────────────────────────────────────────────────────
const WEIGHTS = {
  EXACT_KEYWORD: 15,
  PARTIAL_KEYWORD: 7,
  PROBLEM_TYPE: 18,
  SCHEME_NAME_WORD: 12,
  CATEGORY_MATCH: 8,
  DEPARTMENT_WORD: 6,
  DESCRIPTION_WORD: 3,
  ELIGIBILITY_WORD: 4,
};

// Maximum theoretical score used to normalize matchPct
const MAX_THEORETICAL_SCORE = 120;

// Minimum score to include a scheme in results
const MIN_SCORE_THRESHOLD = 8;

// Maximum number of results to return
const MAX_RESULTS = 6;

// ─── Utility ───────────────────────────────────────────────────────────────────

/** Normalize a string: lowercase, strip punctuation, collapse whitespace */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Check if any word from `phrase` appears in `text` */
function phraseInText(phrase: string, text: string): boolean {
  const words = normalize(phrase).split(' ').filter(w => w.length > 2);
  return words.some(word => text.includes(word));
}

/** Check if the full phrase (as a substring) appears in text */
function exactPhraseInText(phrase: string, text: string): boolean {
  return text.includes(normalize(phrase));
}

// ─── Core Scoring Function ────────────────────────────────────────────────────

function scoreScheme(scheme: Scheme, normalizedQuery: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Keyword matching (most important signal)
  const matchedKeywords: string[] = [];
  for (const keyword of scheme.keywords) {
    const normKeyword = normalize(keyword);
    if (normKeyword.length <= 2) continue;

    if (exactPhraseInText(normKeyword, normalizedQuery)) {
      score += WEIGHTS.EXACT_KEYWORD;
      matchedKeywords.push(keyword);
    } else if (phraseInText(normKeyword, normalizedQuery)) {
      score += WEIGHTS.PARTIAL_KEYWORD;
      matchedKeywords.push(keyword);
    }
  }

  if (matchedKeywords.length > 0) {
    const topKw = matchedKeywords.slice(0, 2).map(k =>
      k.charAt(0).toUpperCase() + k.slice(1)
    ).join(', ');
    reasons.push(`Your query mentions: ${topKw}`);
  }

  // 2. Problem type matching
  const matchedProblemTypes: string[] = [];
  for (const pt of scheme.problemTypes) {
    if (exactPhraseInText(normalize(pt), normalizedQuery) ||
        phraseInText(normalize(pt), normalizedQuery)) {
      score += WEIGHTS.PROBLEM_TYPE;
      matchedProblemTypes.push(pt);
    }
  }
  if (matchedProblemTypes.length > 0) {
    const topPt = matchedProblemTypes.slice(0, 2)
      .map(pt => pt.charAt(0).toUpperCase() + pt.slice(1))
      .join(', ');
    reasons.push(`Matches need type: ${topPt}`);
  }

  // 3. Scheme name word match
  const schemeNameWords = normalize(scheme.name).split(' ').filter(w => w.length > 3);
  const nameMatches = schemeNameWords.filter(w => normalizedQuery.includes(w));
  if (nameMatches.length > 0) {
    score += nameMatches.length * WEIGHTS.SCHEME_NAME_WORD;
    reasons.push(`Scheme name relates to your query`);
  }

  // 4. Category match
  if (phraseInText(normalize(scheme.category), normalizedQuery)) {
    score += WEIGHTS.CATEGORY_MATCH;
    reasons.push(`Category matches: ${scheme.category}`);
  }

  // 5. Department word match
  const deptWords = normalize(scheme.department).split(' ').filter(w => w.length > 4);
  if (deptWords.some(w => normalizedQuery.includes(w))) {
    score += WEIGHTS.DEPARTMENT_WORD;
    reasons.push(`Relevant to ${scheme.department}`);
  }

  // 6. Description word match (lower signal)
  const descWords = normalize(scheme.description).split(' ')
    .filter(w => w.length > 5 && !STOP_WORDS.has(w));
  const descMatches = descWords.filter(w => normalizedQuery.includes(w));
  if (descMatches.length >= 2) {
    score += Math.min(descMatches.length, 5) * WEIGHTS.DESCRIPTION_WORD;
    if (!reasons.some(r => r.includes('description'))) {
      reasons.push(`Description aligns with your situation`);
    }
  }

  // 7. Eligibility word match
  const eligText = scheme.eligibility.join(' ');
  const eligWords = normalize(eligText).split(' ')
    .filter(w => w.length > 5 && !STOP_WORDS.has(w));
  const eligMatches = eligWords.filter(w => normalizedQuery.includes(w));
  if (eligMatches.length >= 2) {
    score += Math.min(eligMatches.length, 3) * WEIGHTS.ELIGIBILITY_WORD;
    if (!reasons.some(r => r.includes('eligib'))) {
      reasons.push(`Eligibility criteria may apply to you`);
    }
  }

  return { score, reasons };
}

// Common words to exclude from description matching
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'from', 'that', 'this', 'with', 'are', 'have',
  'been', 'will', 'their', 'which', 'under', 'about', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'each', 'other', 'such',
  'between', 'both', 'only', 'must', 'also', 'than', 'then', 'when',
  'where', 'does', 'those', 'these', 'they', 'them', 'being', 'should',
  'either', 'every', 'many', 'some', 'any', 'all', 'more', 'most',
  'including', 'maharashtra', 'government', 'citizen', 'resident',
]);

// ─── Generate User-Facing Match Reasons ──────────────────────────────────────

function generateMatchReasons(scheme: Scheme, normalizedQuery: string, rawReasons: string[]): string[] {
  const finalReasons: string[] = [];

  // Add specific contextual reasons based on the query
  if (normalizedQuery.includes('student') || normalizedQuery.includes('college') ||
      normalizedQuery.includes('school') || normalizedQuery.includes('education')) {
    if (scheme.departmentKey === 'education' || scheme.category === 'Scholarship') {
      finalReasons.push('You mentioned being a student or needing education support');
    }
  }

  if (normalizedQuery.includes('income') || normalizedQuery.includes('poor') ||
      normalizedQuery.includes('financial') || normalizedQuery.includes('money') ||
      normalizedQuery.includes('low income') || normalizedQuery.includes('family income')) {
    if (scheme.incomeCriteria && scheme.incomeCriteria !== 'No income limit') {
      finalReasons.push('You mentioned financial hardship or low income');
    }
  }

  if (normalizedQuery.includes('senior') || normalizedQuery.includes('elderly') ||
      normalizedQuery.includes('old age') || normalizedQuery.includes('aged') ||
      normalizedQuery.includes('60') || normalizedQuery.includes('grandfather') ||
      normalizedQuery.includes('grandmother') || normalizedQuery.includes('father') ||
      normalizedQuery.includes('mother')) {
    if (scheme.ageCriteria.includes('60')) {
      finalReasons.push('You mentioned a senior citizen who may need support');
    }
  }

  if (normalizedQuery.includes('disab') || normalizedQuery.includes('handicap') ||
      normalizedQuery.includes('divyang') || normalizedQuery.includes('pwd')) {
    if (scheme.keywords.some(k => k.includes('disab'))) {
      finalReasons.push('You mentioned disability or physical impairment');
    }
  }

  if (normalizedQuery.includes('scholarship') || normalizedQuery.includes('fees') ||
      normalizedQuery.includes('tuition')) {
    if (scheme.category === 'Scholarship' || scheme.category === 'Fee Concession') {
      finalReasons.push('You need financial help for education fees or scholarship');
    }
  }

  if (normalizedQuery.includes('land') || normalizedQuery.includes('7/12') ||
      normalizedQuery.includes('property') || normalizedQuery.includes('farm') ||
      normalizedQuery.includes('agricultural') || normalizedQuery.includes('khet')) {
    if (scheme.departmentKey === 'revenue' && scheme.category === 'Land Records') {
      finalReasons.push('You mentioned land records or agricultural property');
    }
  }

  if (normalizedQuery.includes('certificate') || normalizedQuery.includes('proof') ||
      normalizedQuery.includes('document')) {
    if (scheme.category === 'Certificate') {
      finalReasons.push('You need an official government certificate');
    }
  }

  // Add from raw reasons (deduplicated)
  for (const r of rawReasons) {
    if (!finalReasons.some(f => f === r)) {
      finalReasons.push(r);
    }
  }

  // Ensure at least one reason
  if (finalReasons.length === 0) {
    finalReasons.push(`Potentially relevant to your stated needs`);
  }

  return finalReasons.slice(0, 3);
}

// ─── Main Export: findMatchingSchemes ─────────────────────────────────────────

/**
 * Score all schemes against the user query and return the top matches.
 * @param query  Raw user input text
 * @param maxResults  Max number of results (default MAX_RESULTS)
 * @returns  Array of ScoredScheme sorted by score descending
 */
export function findMatchingSchemes(query: string, maxResults: number = MAX_RESULTS): ScoredScheme[] {
  if (!query || query.trim().length < 3) return [];

  const normalizedQuery = normalize(query);

  // Score every scheme
  const scored: ScoredScheme[] = ALL_SCHEMES.map(scheme => {
    const { score, reasons } = scoreScheme(scheme, normalizedQuery);
    const matchReasons = generateMatchReasons(scheme, normalizedQuery, reasons);
    const matchPct = Math.min(99, Math.round((score / MAX_THEORETICAL_SCORE) * 100 + 45));

    return { scheme, score, matchPct, matchReasons };
  });

  // Filter by minimum threshold, sort descending, cap results
  const results = scored
    .filter(s => s.score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  // Normalize match percentages: top result gets highest, last gets lowest
  if (results.length > 0) {
    const topScore = results[0].score;
    const bottomScore = results[results.length - 1].score;
    const scoreRange = Math.max(topScore - bottomScore, 1);

    return results.map((r, i) => {
      // Scale from 95% down to 65% based on relative score
      const normalizedPct = Math.round(95 - ((r.score - bottomScore) / scoreRange) * 0 + (i * -4));
      const clampedPct = Math.max(60, Math.min(97, 97 - i * Math.max(3, Math.round(30 / results.length))));
      return { ...r, matchPct: clampedPct };
    });
  }

  return results;
}
