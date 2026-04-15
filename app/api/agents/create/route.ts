import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const INCUBATOR_SLOTS = [
  { x: 1, y: 1 },
  { x: 3, y: 1 },
  { x: 5, y: 1 },
  { x: 1, y: 3 },
  { x: 3, y: 3 },
  { x: 5, y: 3 },
  { x: 1, y: 5 },
  { x: 3, y: 5 },
  { x: 5, y: 5 },
];

function getNextIncubatorSlot(existing: Array<{ x: number; y: number }>) {
  const used = new Set(existing.map((p) => `${p.x},${p.y}`));
  return (
    INCUBATOR_SLOTS.find((slot) => !used.has(`${slot.x},${slot.y}`)) ?? {
      x: 1,
      y: 1,
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const privyId = body?.privyId as string | undefined;
    const walletAddress = body?.walletAddress as string | undefined;
    const name = body?.name as string | undefined;
    const role = body?.role as string | undefined;

    if (!privyId || !walletAddress || !name || !role) {
      return NextResponse.json(
        { error: 'privyId, walletAddress, name and role are required' },
        { status: 400 }
      );
    }

    const normalizedWallet = walletAddress.toLowerCase();

    const { data: userRow, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('privy_id', privyId)
      .single();

    if (userError || !userRow) {
      return NextResponse.json(
        { error: 'User not found. Sync wallet first.' },
        { status: 404 }
      );
    }

    const { data: existingAgents, error: existingError } = await supabaseAdmin
      .from('agents')
      .select('x, y')
      .eq('district', 'incubator');

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    const slot = getNextIncubatorSlot(existingAgents ?? []);

    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .insert({
        user_id: userRow.id,
        owner_wallet_address: normalizedWallet,
        privy_id: privyId,
        name,
        role,
        district: 'incubator',
        level: 1,
        status: 'online',
        x: slot.x,
        y: slot.y,
        revenue: 0,
      })
      .select('*')
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: agentError?.message ?? 'Failed to create agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, agent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}