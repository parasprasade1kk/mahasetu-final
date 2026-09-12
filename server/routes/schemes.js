const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const { createAuditLog } = require('../services/supabaseService');

function formatScheme(s) {
  if (!s) return null;
  return {
    ...s,
    id: s.scheme_id,
    schemeId: s.scheme_id,
    name: s.name,
    nameMr: s.name_mr,
    department: s.department_name,
    departmentMr: s.department_name_mr,
    departmentKey: s.department_id,
    category: s.category,
    categoryMr: s.category_mr,
    description: s.description,
    descriptionMr: s.description_mr,
    benefits: s.benefits,
    benefitsMr: s.benefits_mr,
    disbursementMode: s.disbursement_mode,
    disbursementModeMr: s.disbursement_mode_mr,
    eligibility: s.eligibility || [],
    eligibilityMr: s.eligibility_mr || [],
    incomeCriteria: s.income_criteria || (s.income_limit ? `Up to ₹${Number(s.income_limit).toLocaleString('en-IN')}` : 'No income limit'),
    ageCriteria: s.age_criteria || (s.min_age ? `${s.min_age}+ years` : 'Any age'),
    minAge: s.min_age,
    maxAge: s.max_age,
    incomeLimit: s.income_limit ? Number(s.income_limit) : null,
    incomeOperator: s.income_operator || 'less_than_or_equal',
    allowedCategories: s.allowed_categories || [],
    educationLevels: s.education_levels || [],
    occupations: s.occupations || [],
    studentRequired: Boolean(s.student_required),
    disabilityRequired: Boolean(s.disability_required),
    residencyRequired: Boolean(s.residency_required),
    gender: s.gender || 'any',
    requiredDocuments: s.required_documents || [],
    keywords: s.keywords || [],
    problemTypes: s.problem_types || [],
    applicationRoute: s.application_route || `/apply/scheme/${s.scheme_id}`,
  };
}

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
  if (normQ.includes('student') || normQ.includes('scholarship') || normQ.includes('college') || normQ.includes('education')) {
    if (scheme.departmentKey === 'education' || scheme.category === 'Education') {
      reasons.push('Designed for students and higher education assistance');
    }
  }
  if (normQ.includes('farmer') || normQ.includes('krishi') || normQ.includes('agriculture') || normQ.includes('crop')) {
    if (scheme.departmentKey === 'agriculture' || scheme.department.includes('Agriculture')) {
      reasons.push('Provides agricultural / landholder financial support');
    }
  }
  if (normQ.includes('disability') || normQ.includes('divyang') || normQ.includes('handicap')) {
    if (scheme.disabilityRequired || scheme.category === 'Divyangjan') {
      reasons.push('Specialized assistance for Divyangjan citizens');
    }
  }

  return { score, reasons: reasons.slice(0, 3) };
}

// ─── GET /api/schemes ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { department, category, search, activeOnly } = req.query;
    let query = supabase.from('schemes').select('*');

    if (activeOnly !== 'false') {
      query = query.eq('active', true);
    }
    if (department) {
      query = query.or(`department_id.ilike.%${department}%,department_name.ilike.%${department}%`);
    }
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,department_name.ilike.%${search}%`);
    }

    const { data: schemes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch schemes error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    const formatted = (schemes || []).map(formatScheme);
    res.json({ success: true, count: formatted.length, schemes: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/schemes/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data: scheme, error } = await supabase
      .from('schemes')
      .select('*')
      .or(`scheme_id.eq.${id},id.eq.${id.match(/^[0-9a-fA-F-]{36}$/) ? id : '00000000-0000-0000-0000-000000000000'}`)
      .maybeSingle();

    if (error || !scheme) {
      return res.status(404).json({ success: false, error: 'Scheme not found.' });
    }

    res.json({ success: true, scheme: formatScheme(scheme) });
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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', req.user.userId)
        .maybeSingle();
      userProfile = data;
    }

    const { data: rawSchemes, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('active', true);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const allSchemes = (rawSchemes || []).map(formatScheme);

    const scored = allSchemes.map((s) => {
      const { score, reasons } = scoreSchemeAgainstQuery(s, query);

      let profileBonus = 0;
      if (userProfile) {
        if (s.allowedCategories && s.allowedCategories.length > 0 && userProfile.category) {
          if (s.allowedCategories.some((c) => c.toLowerCase() === userProfile.category.toLowerCase() || c === 'All')) {
            profileBonus += 10;
            reasons.push(`Based on your social category: ${userProfile.category}`);
          }
        }
        if (s.studentRequired && userProfile.student_status) {
          profileBonus += 10;
          reasons.push('Matches student education status');
        }
        if (s.incomeLimit && s.incomeLimit > 0 && userProfile.annual_family_income) {
          if (Number(userProfile.annual_family_income) <= s.incomeLimit) {
            profileBonus += 8;
            reasons.push('Income criteria satisfied based on your profile');
          }
        }
      }

      const totalScore = score + profileBonus;
      const matchPct = Math.min(98, Math.max(60, Math.round((totalScore / 120) * 100 + 45)));

      return {
        scheme: s,
        score: totalScore,
        matchPct,
        matchReasons: reasons.length > 0 ? reasons.slice(0, 3) : ['Potential Match based on stated requirements'],
      };
    });

    const results = scored
      .filter((item) => item.score >= 8)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const finalResults = results.length > 0 ? results : scored.slice(0, 4);

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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', req.user.userId)
        .maybeSingle();
      if (data) {
        profile = {
          category: data.category,
          annualIncomeAmount: data.annual_family_income ? Number(data.annual_family_income) : 0,
          age: data.age,
          occupation: data.occupation,
          isStudent: Boolean(data.student_status),
          hasDisability: Boolean(data.disability_status),
        };
      }
    }

    if (!profile) {
      return res.status(400).json({ success: false, error: 'Profile data is required for evaluation.' });
    }

    const { data: rawSchemes, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('active', true);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const schemes = (rawSchemes || []).map(formatScheme);

    // Normalize income
    let income = 0;
    if (typeof profile.annualIncomeAmount === 'number') {
      income = profile.annualIncomeAmount;
    } else if (typeof profile.annualIncomeAmount === 'string') {
      const str = profile.annualIncomeAmount.toLowerCase().replace(/,/g, '');
      if (str.includes('lakh')) {
        income = parseFloat(str) * 100000;
      } else {
        income = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
      }
    }

    const evaluations = schemes.map((s) => {
      let status = 'eligible';
      const metCriteria = [];
      const failedCriteria = [];

      // Category check
      if (s.allowedCategories && s.allowedCategories.length > 0) {
        const cat = profile.category || 'General/Open';
        const match = s.allowedCategories.some(
          (c) => c.toLowerCase() === cat.toLowerCase() || c === 'All' || c === 'Any'
        );
        if (match) {
          metCriteria.push(`Category (${cat}) matches criteria`);
        } else {
          status = 'not_eligible';
          failedCriteria.push(`Requires category: ${s.allowedCategories.join(', ')}`);
        }
      }

      // Income check
      if (s.incomeLimit && s.incomeLimit > 0) {
        if (income <= s.incomeLimit) {
          metCriteria.push(`Annual income (₹${income.toLocaleString('en-IN')}) within limit of ₹${s.incomeLimit.toLocaleString('en-IN')}`);
        } else {
          status = 'not_eligible';
          failedCriteria.push(`Exceeds maximum income ceiling of ₹${s.incomeLimit.toLocaleString('en-IN')}`);
        }
      }

      // Age check
      const age = profile.age || 0;
      if (s.minAge && s.minAge > 0 && age < s.minAge) {
        status = 'not_eligible';
        failedCriteria.push(`Minimum age required is ${s.minAge} years (Current: ${age})`);
      } else if (s.maxAge && s.maxAge < 100 && age > s.maxAge) {
        status = 'not_eligible';
        failedCriteria.push(`Maximum age limit is ${s.maxAge} years (Current: ${age})`);
      } else if (s.minAge || s.maxAge) {
        metCriteria.push(`Age (${age} years) is within permissible range`);
      }

      // Student check
      if (s.studentRequired) {
        if (profile.isStudent) {
          metCriteria.push('Active student enrollment verified');
        } else {
          status = 'not_eligible';
          failedCriteria.push('Active student enrollment required');
        }
      }

      // Disability check
      if (s.disabilityRequired) {
        if (profile.hasDisability) {
          metCriteria.push('Divyangjan criteria fulfilled');
        } else {
          status = 'not_eligible';
          failedCriteria.push('Scheme requires certified disability');
        }
      }

      if (status !== 'not_eligible' && (!income || !age)) {
        status = 'possible';
      }

      return {
        scheme: s,
        status, // 'eligible' | 'possible' | 'not_eligible'
        metCriteria,
        failedCriteria,
      };
    });

    // Rank: 1. eligible, 2. possible, 3. not_eligible
    const rankWeight = { eligible: 1, possible: 2, not_eligible: 3 };
    evaluations.sort((a, b) => (rankWeight[a.status] || 3) - (rankWeight[b.status] || 3));

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
