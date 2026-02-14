import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/arbitrator/gigs/book - Book a gig slot
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { start_time, end_time } = body;

        if (!start_time || !end_time) {
            return NextResponse.json({ error: 'Start and end time required' }, { status: 400 });
        }

        // 1. Check Eligibility (Tokens >= 3000)
        const { data: profile } = await supabase
            .from('users')
            .select('tokens')
            .eq('id', user.id)
            .single();

        if (!profile || (profile.tokens || 0) < 3000) {
            return NextResponse.json({ error: 'Insufficient tokens. You need 3000 tokens to be an arbitrator.' }, { status: 403 });
        }

        // 2. Check for Overlap
        const { data: existingGigs } = await supabase
            .from('arbitrator_gigs')
            .select('id')
            .eq('arbitrator_id', user.id)
            .or(`and(start_time.lte.${end_time},end_time.gte.${start_time})`);

        if (existingGigs && existingGigs.length > 0) {
            return NextResponse.json({ error: 'You already have a gig booked during this time.' }, { status: 409 });
        }

        // 3. Create Gig
        const { data: gig, error } = await supabase
            .from('arbitrator_gigs')
            .insert({
                arbitrator_id: user.id,
                start_time,
                end_time,
                status: 'available'
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(gig);
    } catch (error: any) {
        console.error('Error in booking gig:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
 