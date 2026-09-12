const express = require('express');
const router = express.Router();
const { verifyToken, requireCitizen } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const { createAuditLog } = require('../services/supabaseService');

function formatProfileToCamel(p) {
  if (!p) return null;
  return {
    ...p,
    userId: p.user_id,
    fullName: p.full_name,
    fullNameMr: p.full_name_mr,
    mobile: p.mobile_number,
    dob: p.date_of_birth,
    age: p.age,
    gender: p.gender,
    maritalStatus: p.marital_status,
    state: p.state || 'Maharashtra',
    district: p.district,
    taluka: p.taluka,
    villageCity: p.village_city,
    pinCode: p.pin_code,
    annualIncomeTier: p.annual_income_tier,
    annualIncomeAmount: p.annual_family_income ? Number(p.annual_family_income) : 0,
    occupation: p.occupation,
    educationLevel: p.education_level,
    isStudent: Boolean(p.student_status),
    currentCourse: p.current_course,
    courseClass: p.course_class,
    institutionType: p.institution_type,
    academicYear: p.academic_year,
    hasDisability: Boolean(p.disability_status),
    disabilityType: p.disability_type,
    disabilityPercentage: p.disability_percentage,
    schemeInterests: p.scheme_interests || [],
    preferredLanguage: p.preferred_language || 'en',
    confirmedAccurate: Boolean(p.confirmed_accurate),
    digiLockerLinked: Boolean(p.digilocker_linked),
    digiLockerId: p.digilocker_id,
    aadhaarMasked: p.aadhaar_masked,
  };
}

// ─── GET /api/profiles/me ─────────────────────────────────────────────────────
router.get('/me', verifyToken, requireCitizen, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, profile: formatProfileToCamel(profile) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/profiles/me ─────────────────────────────────────────────────────
router.put('/me', verifyToken, requireCitizen, async (req, res) => {
  try {
    const userId = req.user.userId;
    const body = req.body || {};

    const updates = {
      full_name: body.fullName !== undefined ? body.fullName : undefined,
      full_name_mr: body.fullNameMr !== undefined ? body.fullNameMr : undefined,
      date_of_birth: body.dob !== undefined ? body.dob : undefined,
      age: body.age !== undefined ? Number(body.age) : undefined,
      gender: body.gender !== undefined ? body.gender : undefined,
      category: body.category !== undefined ? body.category : undefined,
      religion: body.religion !== undefined ? body.religion : undefined,
      marital_status: body.maritalStatus !== undefined ? body.maritalStatus : undefined,
      state: body.state !== undefined ? body.state : undefined,
      district: body.district !== undefined ? body.district : undefined,
      taluka: body.taluka !== undefined ? body.taluka : undefined,
      village_city: body.villageCity !== undefined ? body.villageCity : undefined,
      pin_code: body.pinCode !== undefined ? body.pinCode : undefined,
      annual_family_income: body.annualIncomeAmount !== undefined ? Number(body.annualIncomeAmount) : undefined,
      annual_income_tier: body.annualIncomeTier !== undefined ? body.annualIncomeTier : undefined,
      occupation: body.occupation !== undefined ? body.occupation : undefined,
      education_level: body.educationLevel !== undefined ? body.educationLevel : undefined,
      student_status: body.isStudent !== undefined ? Boolean(body.isStudent) : undefined,
      current_course: body.currentCourse !== undefined ? body.currentCourse : undefined,
      course_class: body.courseClass !== undefined ? body.courseClass : undefined,
      institution_type: body.institutionType !== undefined ? body.institutionType : undefined,
      academic_year: body.academicYear !== undefined ? body.academicYear : undefined,
      disability_status: body.hasDisability !== undefined ? Boolean(body.hasDisability) : undefined,
      disability_type: body.disabilityType !== undefined ? body.disabilityType : undefined,
      disability_percentage: body.disabilityPercentage !== undefined ? Number(body.disabilityPercentage) : undefined,
      scheme_interests: body.schemeInterests !== undefined ? body.schemeInterests : undefined,
      preferred_language: body.preferredLanguage !== undefined ? body.preferredLanguage : undefined,
      confirmed_accurate: body.confirmedAccurate !== undefined ? Boolean(body.confirmedAccurate) : undefined,
      profile_completed: body.confirmedAccurate ? true : undefined,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    await createAuditLog({
      actorId: userId,
      actorRole: 'citizen',
      action: 'PROFILE_UPDATE',
      targetResource: 'Profile',
      targetId: userId,
      metadata: { district: updated.district, category: updated.category, occupation: updated.occupation },
    });

    res.json({
      success: true,
      message: 'Citizen profile updated successfully.',
      profile: formatProfileToCamel(updated),
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile: ' + err.message });
  }
});

module.exports = router;
