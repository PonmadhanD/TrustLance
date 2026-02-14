import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// POST /api/arbitrator/apply - Apply to become arbitrator
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        const body = await request.json();
        const { user_id, specializations } = body;

        if (!user_id || !specializations || specializations.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify eligibility
        const { data: profile } = await supabase
            .from('profiles')
            .select('tokens, is_verified')
            .eq('id', user_id)
            .single();

        if (!profile || profile.tokens < 3000 || !profile.is_verified) {
            return NextResponse.json(
                { error: 'Not eligible. Need 3000 tokens and verified profile' },
                { status: 400 }
            );
        }

        // Create arbitrator profile
        const { data: arbitrator, error } = await supabase
            .from('arbitrators')
            .insert({
                user_id,
                specializations,
                total_earnings: 0,
                accuracy_score: 100,
                completed_arbitrations: 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating arbitrator:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(arbitrator, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/arbitrator/apply:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
 