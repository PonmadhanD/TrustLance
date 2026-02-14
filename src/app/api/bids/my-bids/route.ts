import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/bids/my-bids - Get user's bids (freelancer view)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const freelancerId = searchParams.get('freelancer_id');

        if (!freelancerId) {
            return NextResponse.json({ error: 'freelancer_id required' }, { status: 400 });
        }

        const supabase = await createClient();

        const { data: bids, error } = await supabase
            .from('proposals')
            .select(`
        *,
        project:projects(
          id,
          title,
          description,
          status,
          budget_min,
          budget_max
        )
      `)
            .eq('freelancer_id', freelancerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bids:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Map to expected format for frontend
        const formattedBids = (bids || []).map(bid => ({
            id: bid.id,
            job_id: bid.project_id,
            amount: bid.proposed_budget,
            proposal: bid.cover_letter,
            status: bid.status,
            created_at: bid.created_at,
            job: bid.project ? {
                id: bid.project.id,
                title: bid.project.title,
                description: bid.project.description,
                status: bid.project.status
            } : null
        }));

        return NextResponse.json(formattedBids);
    } catch (error: any) {
        console.error('Error in GET /api/bids/my-bids:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
 