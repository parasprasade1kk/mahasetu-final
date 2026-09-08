'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ServiceApplicationPage from './[serviceId]/page';

function ApplyContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service') || searchParams.get('serviceId') || 'income-certificate';

  // Render ServiceApplicationPage
  return <ServiceApplicationPage />;
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-xs">Loading Application Form...</div>}>
      <ApplyContent />
    </Suspense>
  );
}
