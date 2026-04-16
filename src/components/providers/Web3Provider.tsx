'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { base } from 'viem/chains';

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.warn('NEXT_PUBLIC_PRIVY_APP_ID not set - wallet connection disabled');
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#39FF14',
        },
        loginMethods: ['wallet'],
        defaultChain: base,
        supportedChains: [base],
      }}
    >
      {children}
    </PrivyProvider>
  );
}