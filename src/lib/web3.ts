export const BASE_CHAIN = {
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
} as const;

export const ETHEREUM_CHAIN = {
  id: 1,
  name: 'Ethereum',
  network: 'homestead',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://eth.llamarpc.com'],
    },
    public: {
      http: ['https://eth.llamarpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  },
} as const;

export const SUPPORTED_CHAINS = [BASE_CHAIN, ETHEREUM_CHAIN] as const;
export const DEFAULT_CHAIN = BASE_CHAIN;
export const DEFAULT_CHAIN_ID = BASE_CHAIN.id;
export const DEFAULT_CHAIN_NAME = BASE_CHAIN.name;