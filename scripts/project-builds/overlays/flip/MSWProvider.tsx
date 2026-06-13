'use client';

import { handlers } from './handlers';
import { Suspense, use } from 'react';

const mockingEnabledPromise =
  typeof window !== 'undefined'
    ? import('./browser').then(async ({ worker }) => {
        const useMock =
          process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
          process.env.NODE_ENV !== 'production';
        if (!useMock) return;
        await worker.start({
          onUnhandledRequest(request, print) {
            if (request.url.includes('_next')) return;
            print.warning();
          },
        });
        worker.use(...handlers);
      })
    : Promise.resolve();

export function MSWProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <MSWProviderWrapper>{children}</MSWProviderWrapper>
    </Suspense>
  );
}

function MSWProviderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  use(mockingEnabledPromise);
  return children;
}
