const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const Profile = require('../models/Profile');
const { optionalAuth, verifyToken } = require('../middleware/auth');
const { createAuditLog } = require('../utils/auditLogger');

// ─── Scoring Engine Helper ──────────────────────────────────────────────────
function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreSchemeAgainstQuery(scheme, query) {
  const normQ = normalize(query);
  if (!normQ) return { score: 0, reasons: [] };

  let score = 0;
  const reasons = [];

  // Keywords
  const matchedKeywords = [];
  for (const kw of scheme.keywords || []) {
    const normKw = normalize(kw);
    if (!normKw || normKw.length <= 2) continue;
    if (normQ.includes(normKw)) {
      score += 15;
      matchedKeywords.push(kw);
    } else {
      const words = normKw.split(' ');
      if (words.some((w) => w.length > 2 && normQ.includes(w))) {
        score += 7;
        matchedKeywords.push(kw);
      }
    }
  }

  if (matchedKeywords.length > 0) {
    reasons.push(`Mentions relevant terms: ${matchedKeywords.slice(0, 2).join(', ')}`);
  }

  // Problem types
  const matchedProblems = [];
  for (const pt of scheme.problemTypes || []) {
    const normPt = normalize(pt);
    if (normQ.includes(normPt)) {
      score += 18;
      matchedProblems.push(pt);
    }
  }
  if (matchedProblems.length > 0) {
    reasons.push(`Matches requirement: ${matchedProblems.slice(0, 2).join(', ')}`);
  }

  // Scheme name words
  const nameWords = normalize(scheme.name).split(' ').filter((w) => w.length > 3);
  if (nameWords.some((w) => normQ.includes(w))) {
    score += 12;
    reasons.push(`Matches scheme title: ${scheme.name}`);
  }

  // Department match
  const deptWords = normalize(scheme.department).split(' ').filter((w) => w.length > 3);
  if (deptWords.some((w) => normQ.includes(w))) {
    score += 6;
  }

  // General query contextual reasons
  if (normQ.includes('student') || normQ.includes('scholarship') || normQ.includes('college')) {
    if (scheme.departmentKey === 'education' || scheme.category === 'Scholarship') {
      reasons.push('Designed for students and higher education assistance');
    }
  }
  if (normQ.includes('farmer') || normQ.includes('krishi') || normQ.includes('agriculture') || normQ.includes('crop')) {
    if (scheme.departmentKey === 'revenue' || scheme.department === 'Agriculture Department') {
      reasons.push('Provides agricultural / landholder financial support');
    }
  }
  if (normQ.includes('income') || normQ.includes('poor') || normQ.includes('weaker') || normQ.includes('money')) {
    if (scheme.incomeCriteria && scheme.incomeCriteria !== 'No income limit') {
      reasons.push(`Targeted at income criteria (${scheme.incomeCriteria})`);
    }
  }

  return { score, reasons: reasons.slice(0, 3) };
}

// ─── GET /api/schemes ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { department, category, search, activeOnly } = req.query;
    const filter = {};

    if (activeOnly !== 'false') {
      filter.active = true;
    }
    if (department) {
      filter.department = new RegExp(department, 'i');
    }
    if (category) {
      filter.category = new RegExp(category, 'i');
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { keywords: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') },
      ];
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: schemes.length, schemes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/schemes/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findOne({
      $or: [{ schemeId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });
    if (!scheme) {
      return res.status(404).json({ success: false, error: 'Scheme not found.' });
    }
    res.json({ success: true, scheme });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/schemes/match (AI Smart Scheme Finder) ─────────────────────────
router.post('/match', optionalAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter a search query.' });
    }

    let userProfile = null;
    if (req.user && req.user.userId) {
      userProfile = await Profile.findOne({ userId: req.user.userId });
    }

    // Load active schemes from MongoDB
    const allSchemes = await Scheme.find({ active: true });

    const scored = allSchemes.map((s) => {
      const { score, reasons } = scoreSchemeAgainstQuery(s, query);

      // Boost score if userProfile matches scheme eligibility
      let profileBonus = 0;
      if (userProfile) {
        if (s.allowedCategories && s.allowedCategories.length > 0 && userProfile.category) {
          if (s.allowedCategories.some((c) => c.toLowerCase() === userProfile.category.toLowerCase())) {
            profileBonus += 10;
            reasons.push(`Matches your category: ${userProfile.category}`);
          }
        }
        if (s.studentRequired && userProfile.isStudent) {
          profileBonus += 10;
        }
        if (s.incomeLimit && s.incomeLimit > 0 && userProfile.annualIncomeAmount) {
          if (userProfile.annualIncomeAmount <= s.incomeLimit) {
            profileBonus += 8;
          }
        }
      }

      const totalScore = score + profileBonus;
      const matchPct = Math.min(98, Math.max(60, Math.round((totalScore / 120) * 100 + 45)));

      return {
        scheme: s,
        score: totalScore,
        matchPct,
        matchReasons: reasons.length > 0 ? reasons.slice(0, 3) : ['Potentially relevant to your stated needs'],
      };
    });

    const results = scored
      .filter((item) => item.score >= 8)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // If query is broad, return top 3 default schemes
    const finalResults = results.length > 0 ? results : scored.slice(0, 3);

    if (req.user) {
      await createAuditLog({
        actorId: req.user.userId,
        actorRole: 'citizen',
        action: 'AI_SCHEME_SEARCH',
        targetResource: 'SchemeFinder',
        metadata: { query, resultsCount: finalResults.length },
      });
    }

    res.json({
      success: true,
      query,
      count: finalResults.length,
      results: finalResults,
    });
  } catch (err) {
    console.error('Scheme match error:', err);
    res.status(500).json({ success: false, error: 'Scheme matching failed: ' + err.message });
  }
});

// ─── POST /api/schemes/evaluate (Eligibility Checker) ─────────────────────────
router.post('/evaluate', optionalAuth, async (req, res) => {
  try {
    let profile = req.body.profile;

    if (!profile && req.user && req.user.userId) {
      profile = await Profile.findOne({ userId: req.user.userId });
    }

    if (!profile) {
      return res.status(400).json({ success: false, error: 'Profile data is required for evaluation.' });
    }

    const schemes = await Scheme.find({ active: true });

    const evaluations = schemes.map((s) => {
      let status = 'eligible';
      const metCriteria = [];
      const failedCriteria = [];

      // Category check
      if (s.allowedCategories && s.allowedCategories.length > 0) {
        const cat = profile.category || 'General/Open';
        const match = s.allowedCategories.some(
          (c) => c.toLowerCase() === cat.toLowerCase() || c === 'ALL' || c === 'Any'
        );
        if (match) {
          metCriteria.push(`Category (${cat}) matches criteria`);
        } else {
          status = 'not_eligible';
          failedCriteria.push(`Requires category: ${s.allowedCategories.join(', ')}`);
        }
      }

      // Income check
      const income = profile.annualIncomeAmount || 0;
      if (s.incomeLimit && s.incomeLimit > 0) {
        if (s.incomeOperator === 'less_than_or_equal' || s.incomeOperator === 'none') {
          if (income <= s.incomeLimit) {
            metCriteria.push(`Annual income (₹${income.toLocaleString()}) within limit of ₹${s.incomeLimit.toLocaleString()}`);
          } else {
            status = 'not_eligible';
            failedCriteria.push(`Exceeds maximum income ceiling of ₹${s.incomeLimit.toLocaleString()}`);
          }
        }
      }

      // Age check
      const age = profile.age || 0;
      if (s.minAge && s.minAge > 0 && age < s.minAge) {
        status = 'not_eligible';
        failedCriteria.push(`Minimum age required is ${s.minAge} years (Current age: ${age})`);
      } else if (s.maxAge && s.maxAge < 100 && age > s.maxAge) {
        status = 'not_eligible';
        failedCriteria.push(`Maximum age limit is ${s.maxAge} years (Current age: ${age})`);
      } else if (s.minAge || s.maxAge) {
        metCriteria.push(`Age (${age} years) is within permissible range`);
      }

      // Student check
      if (s.studentRequired) {
        if (profile.isStudent) {
          metCriteria.push('Currently enrolled as active student');
        } else {
          status = 'not_eligible';
          failedCriteria.push('Active student enrollment required');
        }
      }

      // Disability check
      if (s.disabilityRequired) {
        if (profile.hasDisability) {
          metCriteria.push('Disability verification criteria fulfilled');
        } else {
          status = 'not_eligible';
          failedCriteria.push('Scheme requires disability / Divyang certification');
        }
      }

      // If missing some fields or borderline
      if (status !== 'not_eligible' && (!profile.annualIncomeAmount || !profile.age)) {
        status = 'possible';
      }

      return {
        scheme: s,
        status, // 'eligible' | 'possible' | 'not_eligible'
        metCriteria,
        failedCriteria,
      };
    });

    if (req.user) {
      await createAuditLog({
        actorId: req.user.userId,
        actorRole: 'citizen',
        action: 'ELIGIBILITY_EVALUATION',
        targetResource: 'EligibilityChecker',
        metadata: { evaluatedCount: evaluations.length },
      });
    }

    res.json({
      success: true,
      profile,
      evaluations,
    });
  } catch (err) {
    console.error('Evaluation error:', err);
    res.status(500).json({ success: false, error: 'Eligibility check failed: ' + err.message });
  }
});

module.exports = router;
