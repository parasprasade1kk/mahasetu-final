'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ServiceApplicationForm from '@/components/ServiceApplicationForm';

function ScholarshipAppContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('scheme') || searchParams.get('service') || searchParams.get('serviceId') || 'post-matric-scholarship';
  return <ServiceApplicationForm forcedId={serviceId} />;
}

export default function LegacyScholarshipApplicationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-xs">Loading Scholarship Application...</div>}>
      <ScholarshipAppContent />
    </Suspense>
  );
}
