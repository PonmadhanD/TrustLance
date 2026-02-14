import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/feedback/submit - Submit feedback (client→freelancer or freelancer→client)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            contractId,
            feedbackType, // 'freelancer' or 'client'
            rating,
            review,
            wouldWorkAgain,
            criteriaRatings,
            platformFeedback
        } = body;

        // Validate required fields
        if (!contractId || !feedbackType || !rating || !review) {
            return NextResponse.json({ 
                error: 'Missing required fields' 
            }, { status: 400 });
        }

        // Get contract details
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .select('*, project:projects(id, title)')
            .eq('id', contractId)
            .single();

        if (contractError || !contract) {
            return NextResponse.json({ 
                error: 'Contract not found' 
            }, { status: 404 });
        }

        // Determine if user is client or freelancer
        const isClient = contract.client_id === user.id;
        const isFreelancer = contract.freelancer_id === user.id;

        if (!isClient && !isFreelancer) {
            return NextResponse.json({ 
                error: 'You are not part of this contract' 
            }, { status: 403 });
        }

        // Validate feedback type matches user role
        if ((isClient && feedbackType !== 'freelancer') || 
            (isFreelancer && feedbackType !== 'client')) {
            return NextResponse.json({ 
                error: 'Invalid feedback type for your role' 
            }, { status: 400 });
        }

        const tableName = feedbackType === 'freelancer' ? 'freelancer_feedback' : 'client_feedback';
        const fromUserId = user.id;
        const toUserId = feedbackType === 'freelancer' ? contract.freelancer_id : contract.client_id;

        // Check if feedback already exists
        const { data: existingFeedback } = await supabase
            .from(tableName)
            .select('id')
            .eq('contract_id', contractId)
            .eq('from_user_id', fromUserId)
            .single();

        if (existingFeedback) {
            return NextResponse.json({ 
                error: 'Feedback already submitted for this contract' 
            }, { status: 409 });
        }

        // Insert feedback
        const feedbackData: any = {
            project_id: contract.project_id,
            contract_id: contractId,
            from_user_id: fromUserId,
            to_user_id: toUserId,
            rating,
            review,
            would_work_again: wouldWorkAgain
        };

        // Add criteria ratings based on feedback type
        if (feedbackType === 'freelancer') {
            feedbackData.communication_rating = criteriaRatings.communication;
            feedbackData.quality_rating = criteriaRatings.quality;
            feedbackData.timeliness_rating = criteriaRatings.timeliness;
            feedbackData.professionalism_rating = criteriaRatings.professionalism;
        } else {
            feedbackData.communication_rating = criteriaRatings.communication;
            feedbackData.clarity_rating = criteriaRatings.clarity;
            feedbackData.payment_timeliness_rating = criteriaRatings.paymentTimeliness;
            feedbackData.overall_rating = criteriaRatings.overall;
        }

        const { error: insertError } = await supabase
            .from(tableName)
            .insert(feedbackData);

        if (insertError) {
            console.error('Error inserting feedback:', insertError);
            return NextResponse.json({ 
                error: 'Failed to submit feedback' 
            }, { status: 500 });
        }

        // Insert platform feedback if provided
        if (platformFeedback && platformFeedback.rating) {
            await supabase.from('platform_feedback').insert({
                user_id: fromUserId,
                contract_id: contractId,
                user_role: isClient ? 'CLIENT' : 'FREELANCER',
                rating: platformFeedback.rating,
                comment: platformFeedback.comment || null
            });
        }

        // Update contract feedback_pending
        const feedbackPending = contract.feedback_pending || { client: true, freelancer: true };
        if (isClient) {
            feedbackPending.client = false;
        } else {
            feedbackPending.freelancer = false;
        }

        await supabase
            .from('contracts')
            .update({ feedback_pending: feedbackPending })
            .eq('id', contractId);

        // Create notification for the recipient
        const projectTitle = (contract as any).project?.title || 'a project';
        await supabase.from('notifications').insert({
            user_id: toUserId,
            title: 'New Feedback Received',
            message: `You received feedback for "${projectTitle}"`,
            type: 'system',
            link: `/feedback`
        });

        return NextResponse.json({ 
            success: true,
            message: 'Feedback submitted successfully'
        });

    } catch (error: any) {
        console.error('Error in feedback submission:', error);
        return NextResponse.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
}
 