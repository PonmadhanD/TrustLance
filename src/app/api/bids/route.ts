import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notifications';

// POST /api/bids - Submit bid
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { job_id, amount, proposal, milestones, duration } = body;

        // Validate required fields
        if (!job_id || !amount || !proposal) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if job exists and is open
        const { data: job } = await supabase
            .from('projects')
            .select('id, title, status, client_id')
            .eq('id', job_id)
            .single();

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.status !== 'open') {
            return NextResponse.json({ error: 'Job is not open for bidding' }, { status: 400 });
        }

        if (job.client_id === user.id) {
            return NextResponse.json({ error: 'Cannot bid on your own job' }, { status: 400 });
        }

        // Create bid (proposal)
        const { data: bid, error } = await supabase
            .from('proposals')
            .insert({
                project_id: job_id,
                freelancer_id: user.id,
                proposed_budget: amount,
                cover_letter: proposal,
                estimated_duration: milestones?.length ? `${milestones.length} milestones` : '30 days',
                milestones: milestones || [],
                status: 'pending'
            })
            .select(`
        *,
        freelancer:users!proposals_freelancer_id_fkey(
          id,
          username,
          name,
          rating
        )
      `)
            .single();

        if (error) {
            console.error('Error creating bid:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Create notification for client
        if (job) {
            await createNotification({
                userId: job.client_id,
                title: 'New bid received',
                message: `${user.user_metadata?.name || user.email} placed a bid of $${amount} on your "${job.title}"`,
                type: 'proposal',
                link: `/projects/${job_id}/bids`
            });
        }

        return NextResponse.json(bid, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/bids:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
