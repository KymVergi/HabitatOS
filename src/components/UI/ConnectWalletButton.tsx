'use client';

import React, { useEffect, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useHabitatStore } from '@/stores/habitatStore';
import { db } from '@/lib/supabase';

interface ConnectWalletButtonProps {
  compact?: boolean;
}

function shortAddress(address?: string | null) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectWalletButton({
  compact = false,
}: ConnectWalletButtonProps) {
  const { ready, authenticated, user, connectWallet, logout, getAccessToken } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const { setUserId } = useHabitatStore();

  const connectedWallet = useMemo(() => {
    return wallets.find((wallet) => !!wallet.address) ?? null;
  }, [wallets]);

  useEffect(() => {
    async function syncUserWallet() {
      if (!ready || !walletsReady) return;
      if (!authenticated || !user?.id || !connectedWallet?.address) return;

      setUserId(user.id);

      try {
        const accessToken = (await getAccessToken().catch(() => undefined)) ?? undefined;

        await db.upsertUserWithWallet({
          privyId: user.id,
          walletAddress: connectedWallet.address.toLowerCase(),
          provider: 'privy',
          chainId: connectedWallet.chainId ? Number(connectedWallet.chainId) : undefined,
          accessToken,
        });
      } catch (error) {
        console.error('Failed to sync Privy wallet to Supabase', error);
      }
    }

    syncUserWallet();
  }, [
    ready,
    walletsReady,
    authenticated,
    user?.id,
    connectedWallet?.address,
    connectedWallet?.chainId,
    setUserId,
    getAccessToken,
  ]);

  const buttonClass = `pixel-btn border-habitat-green text-habitat-green ${
    compact ? 'px-3 py-2 text-[9px] sm:px-4 sm:text-[10px]' : 'text-[10px]'
  }`;

  if (!ready || !walletsReady) {
    return (
      <button type="button" className={buttonClass}>
        Connect Wallet
      </button>
    );
  }

  if (!authenticated || !connectedWallet?.address) {
    return (
      <button
        type="button"
        onClick={() =>
          connectWallet({
            walletList: [
              'metamask',
              'coinbase_wallet',
              'rainbow',
              'detected_ethereum_wallets',
              'wallet_connect',
            ],
          })
        }
        className={buttonClass}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="rounded border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-white/70">
        {connectedWallet.chainId ? `Chain ${connectedWallet.chainId}` : 'EVM'}
      </div>

      <button
        type="button"
        onClick={logout}
        className={buttonClass}
        title="Disconnect wallet"
      >
        {shortAddress(connectedWallet.address)}
      </button>
    </div>
  );
}