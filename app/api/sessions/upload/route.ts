import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing Supabase environment variables' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { bay, shots, summary } = await req.json();

    if (!bay || !shots || shots.length === 0) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Find the most recent pending session for this bay
    const { data: pending } = await supabase
      .from('sessions')
      .select('id')
      .eq('bay', bay)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (!pending) {
      return NextResponse.json({ error: 'No pending session found for this bay' }, { status: 404 });
    }

    // Mark the session as ended and save the summary
    await supabase
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        summary,
      })
      .eq('id', pending.id);

    // Insert the individual shots
    const shotsWithSession = shots.map((shot: any) => ({
      ...shot,
      session_id: pending.id,
    }));

    await supabase.from('shots').insert(shotsWithSession);

    return NextResponse.json({ success: true, session_id: pending.id });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}