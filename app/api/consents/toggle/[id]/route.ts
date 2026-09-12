import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';
import { toggleConsent, createAuditLog } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Citizen authentication required.' },
        { status: 401 }
      );
    }

    let userId = '';
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.userId) {
        userId = decoded.userId;
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid session token.' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing authenticated userId.' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Consent ID is required.' },
        { status: 400 }
      );
    }

    // Try to toggle existing consent
    const { data: existing } = await supabase
      .from('consents')
      .select('*')
      .eq('consent_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    let updatedConsent: any = null;

    if (!existing) {
      // If not existing, insert as Active
      const newConsent = {
        consent_id: id,
        user_id: userId,
        requesting_dept: 'Higher & Technical Education Department',
        requesting_dept_mr: 'उच्च व तंत्रशिक्षण विभाग',
        source_dept: 'Revenue Department (e-Mahabhumi / DigiLocker)',
        source_dept_mr: 'महसूल विभाग (ई-महाभूमी / डिजिलॉकर)',
        purpose: 'Automatic income tier verification for MahaDBT scholarship disbursal',
        purpose_mr: 'महाडीबीटी शिष्यवृत्ती वितरणासाठी स्वयंचलित उत्पन्न पडताळणी',
        status: 'Active',
        granted: true,
        valid_until: '31 Mar 2027',
      };

      const { data: created, error: createErr } = await supabase
        .from('consents')
        .insert(newConsent)
        .select()
        .single();

      if (createErr) throw createErr;
      updatedConsent = created;

      await createAuditLog({
        actorId: userId,
        actorRole: 'citizen',
        action: 'CONSENT_GRANTED',
        targetResource: 'Consent',
        targetId: id,
        status: 'SUCCESS',
        metadata: { newStatus: 'Active' },
      });
    } else {
      updatedConsent = await toggleConsent(id, userId);
    }

    const mapped = {
      ...updatedConsent,
      id: updatedConsent.consent_id,
      consentId: updatedConsent.consent_id,
      requestingDept: updatedConsent.requesting_dept,
      requestingDeptMr: updatedConsent.requesting_dept_mr,
      sourceDept: updatedConsent.source_dept,
      sourceDeptMr: updatedConsent.source_dept_mr,
      purpose: updatedConsent.purpose,
      purposeMr: updatedConsent.purpose_mr,
      dataFields: updatedConsent.data_fields || [],
      status: updatedConsent.status,
      validUntil: updatedConsent.valid_until,
    };

    return NextResponse.json({
      success: true,
      message: `Consent ${mapped.consentId} is now ${mapped.status}.`,
      consent: mapped,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to toggle consent: ' + (err?.message || 'Server error') },
      { status: 500 }
    );
  }
}
