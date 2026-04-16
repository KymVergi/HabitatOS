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
  // usePrivy hooks
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
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

  const buttonClass = `pixel-btn border-habitat-green text-habitat-green hover:bg-habitat-green/10 transition-colors ${
    compact ? 'px-3 py-2 text-[9px] sm:px-4 sm:text-[10px]' : 'text-[10px]'
  }`;

  // Loading state
  if (!ready) {
    return (
      <button type="button" disabled className={`${buttonClass} opacity-50 cursor-wait`}>
        Loading...
      </button>
    );
  }

  // Not authenticated - show connect button
  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={() => login()}
        className={buttonClass}
      >
        Connect Wallet
      </button>
    );
  }

  // Authenticated but no wallet yet (waiting for wallets to load)
  if (!walletsReady || !connectedWallet?.address) {
    return (
      <button type="button" disabled className={`${buttonClass} opacity-50`}>
        Loading wallet...
      </button>
    );
  }

  // Connected - show address and logout
  return (
    <div className="flex items-center gap-2">
      <div className="rounded border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-white/70">
        Base
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