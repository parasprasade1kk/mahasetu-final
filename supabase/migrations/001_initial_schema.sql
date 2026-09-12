-- ==============================================================================
-- MahaSetu PostgreSQL Schema Migration for Supabase
-- Unified Citizen Services & Schemes Portal, Government of Maharashtra
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_mr TEXT,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ADMIN USERS
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    admin_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    full_name_mr TEXT,
    mobile_number TEXT NOT NULL,
    email TEXT,
    aadhaar_hash TEXT,
    aadhaar_masked TEXT,
    aadhaar_consent_given BOOLEAN DEFAULT false,
    aadhaar_consent_at TIMESTAMPTZ,
    date_of_birth DATE,
    age INT,
    gender TEXT,
    state TEXT DEFAULT 'Maharashtra',
    district TEXT,
    taluka TEXT,
    village_city TEXT,
    pin_code TEXT,
    category TEXT,
    religion TEXT,
    annual_family_income NUMERIC,
    annual_income_tier TEXT,
    occupation TEXT,
    education_level TEXT,
    student_status BOOLEAN DEFAULT false,
    current_course TEXT,
    course_class TEXT,
    institution_type TEXT,
    academic_year TEXT,
    disability_status BOOLEAN DEFAULT false,
    disability_type TEXT,
    disability_percentage INT,
    marital_status TEXT,
    scheme_interests TEXT[] DEFAULT '{}',
    preferred_language TEXT DEFAULT 'en',
    confirmed_accurate BOOLEAN DEFAULT false,
    digilocker_linked BOOLEAN DEFAULT false,
    digilocker_linked_at TIMESTAMPTZ,
    digilocker_id TEXT,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile_number);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_aadhaar_hash ON public.profiles(aadhaar_hash);

-- 4. SCHEMES
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_mr TEXT,
    department_id TEXT NOT NULL,
    department_name TEXT NOT NULL,
    department_name_mr TEXT,
    category TEXT,
    category_mr TEXT,
    description TEXT,
    description_mr TEXT,
    benefits TEXT,
    benefits_mr TEXT,
    disbursement_mode TEXT,
    disbursement_mode_mr TEXT,
    eligibility TEXT[] DEFAULT '{}',
    eligibility_mr TEXT[] DEFAULT '{}',
    income_criteria TEXT,
    age_criteria TEXT,
    min_age INT,
    max_age INT,
    income_limit NUMERIC,
    income_operator TEXT,
    min_income NUMERIC,
    max_income NUMERIC,
    allowed_categories TEXT[] DEFAULT '{}',
    education_levels TEXT[] DEFAULT '{}',
    occupations TEXT[] DEFAULT '{}',
    disability_required BOOLEAN DEFAULT false,
    residency_required BOOLEAN DEFAULT true,
    student_required BOOLEAN DEFAULT false,
    gender TEXT DEFAULT 'any',
    required_documents JSONB DEFAULT '[]'::jsonb,
    keywords TEXT[] DEFAULT '{}',
    problem_types TEXT[] DEFAULT '{}',
    application_route TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schemes_scheme_id ON public.schemes(scheme_id);
CREATE INDEX IF NOT EXISTS idx_schemes_department ON public.schemes(department_id);

-- 5. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_mr TEXT,
    department_id TEXT NOT NULL,
    department_name TEXT NOT NULL,
    department_name_mr TEXT,
    description TEXT,
    description_mr TEXT,
    eligibility TEXT,
    eligibility_mr TEXT,
    required_documents JSONB DEFAULT '[]'::jsonb,
    application_route TEXT,
    processing_days INT DEFAULT 7,
    fee_inr NUMERIC DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_service_id ON public.services(service_id);

-- 6. DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    auth_user_id UUID,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    document_name_mr TEXT,
    source TEXT NOT NULL DEFAULT 'Uploaded',
    external_document_id TEXT,
    storage_path TEXT,
    verification_status TEXT DEFAULT 'Verified',
    file_size TEXT,
    file_name TEXT,
    mime_type TEXT,
    issued_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_id ON public.documents(document_id);

-- 7. APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    auth_user_id UUID,
    type TEXT NOT NULL DEFAULT 'scheme',
    scheme_id TEXT,
    service_id TEXT,
    scheme_name TEXT,
    service_name TEXT,
    service_name_mr TEXT,
    department_id TEXT,
    department TEXT NOT NULL,
    department_mr TEXT,
    applicant_name TEXT NOT NULL,
    applicant_mobile TEXT,
    applicant_aadhaar_masked TEXT,
    district TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Submitted',
    status_color TEXT DEFAULT 'bg-blue-100 text-blue-800 border-blue-300',
    applied_date TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    last_updated TIMESTAMPTZ DEFAULT now(),
    remarks TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    download_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_app_id ON public.applications(application_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- 8. APPLICATION TIMELINE
CREATE TABLE IF NOT EXISTS public.application_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT NOT NULL REFERENCES public.applications(application_id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    changed_by TEXT NOT NULL DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_app_id ON public.application_timeline(application_id);

-- 9. CONSENTS
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    auth_user_id UUID,
    consent_type TEXT,
    requesting_dept TEXT NOT NULL,
    requesting_dept_mr TEXT,
    source_dept TEXT NOT NULL,
    source_dept_mr TEXT,
    purpose TEXT NOT NULL,
    purpose_mr TEXT,
    data_fields TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Active',
    granted BOOLEAN DEFAULT true,
    valid_until TEXT,
    granted_at TIMESTAMPTZ DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consents_user_id ON public.consents(user_id);

-- 10. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id TEXT UNIQUE NOT NULL,
    actor_id TEXT NOT NULL,
    auth_user_id UUID,
    actor_role TEXT NOT NULL DEFAULT 'citizen',
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    target_id TEXT,
    status TEXT DEFAULT 'SUCCESS',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    auth_user_id UUID,
    title TEXT NOT NULL,
    title_mr TEXT,
    message TEXT NOT NULL,
    message_mr TEXT,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE (admin_users.auth_user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'email' LIKE 'admin.%@admin.mahasetu.gov.in')
        AND admin_users.active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read for schemes, services, departments
DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read schemes" ON public.schemes;
CREATE POLICY "Public read schemes" ON public.schemes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);

-- Admin full access on catalogs
DROP POLICY IF EXISTS "Admin modify departments" ON public.departments;
CREATE POLICY "Admin modify departments" ON public.departments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin modify schemes" ON public.schemes;
CREATE POLICY "Admin modify schemes" ON public.schemes FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin modify services" ON public.services;
CREATE POLICY "Admin modify services" ON public.services FOR ALL USING (public.is_admin());

-- Admin users table
DROP POLICY IF EXISTS "Admin users viewable by admins" ON public.admin_users;
CREATE POLICY "Admin users viewable by admins" ON public.admin_users FOR SELECT USING (public.is_admin() OR auth.uid() = auth_user_id);

-- Profiles RLS
DROP POLICY IF EXISTS "Citizen view own profile" ON public.profiles;
CREATE POLICY "Citizen view own profile" ON public.profiles FOR SELECT USING (auth.uid() = auth_user_id OR public.is_admin() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Citizen update own profile" ON public.profiles;
CREATE POLICY "Citizen update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = auth_user_id OR public.is_admin());

DROP POLICY IF EXISTS "Citizen insert own profile" ON public.profiles;
CREATE POLICY "Citizen insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- Documents RLS
DROP POLICY IF EXISTS "Citizen view own documents" ON public.documents;
CREATE POLICY "Citizen view own documents" ON public.documents FOR SELECT USING (auth.uid() = auth_user_id OR public.is_admin() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Citizen insert own documents" ON public.documents;
CREATE POLICY "Citizen insert own documents" ON public.documents FOR INSERT WITH CHECK (true);

-- Applications RLS
DROP POLICY IF EXISTS "Citizen view own applications" ON public.applications;
CREATE POLICY "Citizen view own applications" ON public.applications FOR SELECT USING (auth.uid() = auth_user_id OR public.is_admin() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Citizen insert own applications" ON public.applications;
CREATE POLICY "Citizen insert own applications" ON public.applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update applications" ON public.applications;
CREATE POLICY "Admin update applications" ON public.applications FOR UPDATE USING (public.is_admin() OR auth.uid() = auth_user_id);

-- Timeline RLS
DROP POLICY IF EXISTS "View timeline" ON public.application_timeline;
CREATE POLICY "View timeline" ON public.application_timeline FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert timeline" ON public.application_timeline;
CREATE POLICY "Insert timeline" ON public.application_timeline FOR INSERT WITH CHECK (true);

-- Consents RLS
DROP POLICY IF EXISTS "Citizen view own consents" ON public.consents;
CREATE POLICY "Citizen view own consents" ON public.consents FOR SELECT USING (auth.uid() = auth_user_id OR public.is_admin() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Citizen modify own consents" ON public.consents;
CREATE POLICY "Citizen modify own consents" ON public.consents FOR ALL USING (auth.uid() = auth_user_id OR public.is_admin());

-- Notifications RLS
DROP POLICY IF EXISTS "Citizen view own notifications" ON public.notifications;
CREATE POLICY "Citizen view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = auth_user_id OR public.is_admin());

-- Audit logs RLS
DROP POLICY IF EXISTS "View audit logs" ON public.audit_logs;
CREATE POLICY "View audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin() OR auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Insert audit logs" ON public.audit_logs;
CREATE POLICY "Insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
