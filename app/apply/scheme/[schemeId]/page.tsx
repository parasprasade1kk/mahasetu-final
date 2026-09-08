'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ServiceApplicationForm from '@/components/ServiceApplicationForm';

function SchemeAppContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const schemeId = (params?.schemeId as string) || searchParams?.get('scheme') || searchParams?.get('id') || 'post-matric-scholarship';
  return <ServiceApplicationForm forcedId={schemeId} />;
}

export default function SchemeApplicationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-xs">Loading Scheme Application...</div>}>
      <SchemeAppContent />
    </Suspense>
  );
}
