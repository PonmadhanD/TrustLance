import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notifications';

// GET /api/disputes - List disputes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'client', 'freelancer', 'arbitrator'
    // const status = searchParams.get('status');

    const supabase = await createClient();
    let query = supabase.from('disputes').select(`
            *,
            project:projects(title),
            arbitrator:users!arbitrator_id(name)
        `);

    if (userId) {
      if (role === 'arbitrator') {
        query = query.eq('arbitrator_id', userId);
      } else {
        query = query.eq('raised_by', userId); // Simplified for MVP, ideally OR check
      }
    }

    const { data: disputes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ disputes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/disputes - Create Dispute & Assign Arbitrator
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { project_id, reason, amount, role, milestone_index } = body;

    // 1. Find an Available Arbitrator
    // Criteria: Has a 'booked' gig NOW, and status is 'online'
    const now = new Date().toISOString();

    const { data: availableGig } = await supabase
      .from('arbitrator_gigs')
      .select(`
                id,
                arbitrator_id,
                arbitrator:users!inner(arbitrator_status)
            `)
      .eq('status', 'booked')
      .eq('arbitrator.arbitrator_status', 'online')
      .lte('start_time', now)
      .gte('end_time', now)
      .limit(1)
      .single();

    let assignedArbitratorId = null;
    let initialStatus = 'OPEN'; // AWAITING_EVIDENCE

    if (availableGig) {
      assignedArbitratorId = availableGig.arbitrator_id;
      initialStatus = 'UNDER_REVIEW'; // Auto-assign

      // Mark gig as 'completed' or 'active' (User logic: 1 gig = 1 dispute? or time based?)
      // Assuming time based, but maybe we mark it 'active' to show they are busy?
      // For now, let's keep it 'booked' or 'completed' to track usage.
      // Let's just log assignment.
    }

    // 2. Create Dispute
    const { data: dispute, error } = await supabase
      .from('disputes')
      .insert({
        id: `DSP-${Date.now().toString().slice(-6)}`,
        project_id,
        raised_by: user.id,
        project_name: body.project_name || 'Project Dispute', // Ideally fetch from project
        role,
        amount,
        reason,
        status: initialStatus,
        payment_method: 'BLOCKCHAIN_ESCROW',
        arbitrator_id: assignedArbitratorId,
        milestone_index: milestone_index
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create notification for the other party
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('client_id, hired_freelancer_id, title')
        .eq('id', project_id)
        .single();

      if (project) {
        const otherPartyId = role === 'CLIENT' ? project.hired_freelancer_id : project.client_id;
        if (otherPartyId) {
          await createNotification({
            userId: otherPartyId,
            title: 'Dispute Raised',
            message: `A dispute has been raised for the project "${project.title}" by the ${role.toLowerCase()}.`,
            type: 'dispute',
            link: `/disputes` // Or a more specific link if available
          });
        }
      }
    } catch (notifyError) {
      console.error('Error creating dispute notification:', notifyError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      ...dispute,
      assigned_arbitrator: !!assignedArbitratorId
    });

  } catch (error: any) {
    console.error('Create dispute error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}