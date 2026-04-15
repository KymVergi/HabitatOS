'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#39FF14',
          walletChainType: 'ethereum-only',
          walletList: [
            'metamask',
            'coinbase_wallet',
            'rainbow',
            'detected_ethereum_wallets',
            'wallet_connect',
          ],
        },
        loginMethods: ['wallet'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'off',
          },
        },
        defaultChain: {
          id: 8453,
          name: 'Base',
          network: 'base',
          nativeCurrency: {
            decimals: 18,
            name: 'Ether',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: ['https://mainnet.base.org'],
            },
            public: {
              http: ['https://mainnet.base.org'],
            },
          },
          blockExplorers: {
            default: {
              name: 'Basescan',
              url: 'https://basescan.org',
            },
          },
        },
        supportedChains: [
          {
            id: 8453,
            name: 'Base',
            network: 'base',
            nativeCurrency: {
              decimals: 18,
              name: 'Ether',
              symbol: 'ETH',
            },
            rpcUrls: {
              default: {
                http: ['https://mainnet.base.org'],
              },
              public: {
                http: ['https://mainnet.base.org'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Basescan',
                url: 'https://basescan.org',
              },
            },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}