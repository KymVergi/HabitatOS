import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const privyId = body?.privyId as string | undefined;
    const walletAddress = body?.walletAddress as string | undefined;
    const chainId = body?.chainId as number | undefined;

    if (!privyId || !walletAddress) {
      return NextResponse.json(
        { error: 'privyId and walletAddress are required' },
        { status: 400 }
      );
    }

    const normalizedWallet = walletAddress.toLowerCase();

    const { data: userRow, error: userError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          privy_id: privyId,
          wallet_address: normalizedWallet,
        },
        { onConflict: 'privy_id' }
      )
      .select('id, privy_id, wallet_address')
      .single();

    if (userError || !userRow) {
      return NextResponse.json(
        { error: userError?.message ?? 'Failed to upsert user' },
        { status: 500 }
      );
    }

    const { error: walletError } = await supabaseAdmin
      .from('user_wallets')
      .upsert(
        {
          user_id: userRow.id,
          wallet_address: normalizedWallet,
          provider: 'privy',
          chain_id: chainId,
        },
        { onConflict: 'wallet_address' }
      );

    if (walletError) {
      return NextResponse.json(
        { error: walletError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: userRow,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}