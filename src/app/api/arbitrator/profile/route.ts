import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/arbitrator/profile - Get arbitrator profile
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's profile with tokens
        const { data: profile, error } = await supabase
            .from('users')
            .select('id, name, email, tokens, arbitrator_status, jobs_completed')
            .eq('id', user.id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get active/future gigs
        const { data: gigs } = await supabase
            .from('arbitrator_gigs')
            .select('*')
            .eq('arbitrator_id', user.id)
            .gte('end_time', new Date().toISOString())
            .order('start_time', { ascending: true });

        // Get active disputes where user is arbitrator
        const { data: activeDisputes } = await supabase
            .from('disputes')
            .select('*')
            .eq('arbitrator_id', user.id)
            .in('status', ['UNDER_REVIEW']);

        return NextResponse.json({
            profile,
            gigs: gigs || [],
            active_disputes: activeDisputes || []
        });
    } catch (error: any) {
        console.error('Error in GET /api/arbitrator/profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
 