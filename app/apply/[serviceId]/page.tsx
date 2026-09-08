'use client';

import React, { Suspense } from 'react';
import ServiceApplicationForm from '@/components/ServiceApplicationForm';

export default function ServiceApplicationPage({ params }: { params?: { serviceId?: string } }) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-xs">Loading Application Form...</div>}>
      <ServiceApplicationForm forcedId={params?.serviceId} />
    </Suspense>
  );
}
