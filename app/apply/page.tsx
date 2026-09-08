'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ServiceApplicationForm from '@/components/ServiceApplicationForm';

function ApplyContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('scheme') || searchParams.get('schemeId') || searchParams.get('service') || searchParams.get('serviceId') || searchParams.get('id') || 'income-certificate';
  return <ServiceApplicationForm forcedId={serviceId} />;
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-xs">Loading Application Form...</div>}>
      <ApplyContent />
    </Suspense>
  );
}
