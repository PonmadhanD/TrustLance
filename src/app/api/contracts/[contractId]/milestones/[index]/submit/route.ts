import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notifications';

// POST /api/contracts/[contractId]/milestones/[index]/submit - Submit proof of work
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ contractId: string; index: string }> }
) {
    try {
        const { contractId, index } = await params;
        const milestoneIndex = parseInt(index);
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { proof_of_work_url, description } = body;

        // Verify contract and user is freelancer
        const { data: contract } = await supabase
            .from('contracts')
            .select('*, project:projects(title)')
            .eq('id', contractId)
            .single();

        if (!contract || contract.freelancer_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Create or update milestone submission
        const { data: submission, error } = await supabase
            .from('milestone_submissions')
            .upsert({
                contract_id: contractId,
                milestone_index: milestoneIndex,
                proof_of_work_url,
                description,
                status: 'pending',
                submitted_at: new Date().toISOString()
            }, {
                onConflict: 'contract_id,milestone_index'
            })
            .select()
            .single();

        if (error) {
            console.error('Error submitting milestone:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Create notification for client
        if (contract) {
            const projectTitle = (contract as any).project?.title || 'project';
            await createNotification({
                userId: contract.client_id,
                title: 'Milestone Submitted',
                message: `${user.user_metadata?.name || user.email} submitted milestone ${milestoneIndex + 1} for "${projectTitle}"`,
                type: 'project',
                link: `/contracts/${contractId}`
            });
        }

        return NextResponse.json(submission);
    } catch (error: any) {
        console.error('Error in milestone submit:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
