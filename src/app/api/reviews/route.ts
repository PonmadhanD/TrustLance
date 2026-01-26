import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            projectId,
            freelancerId,
            freelancerRating,
            siteRating,
            siteFeedback
        } = body;

        if (!projectId || !freelancerId || !freelancerRating || !siteRating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Submit Freelancer Review
        const { error: reviewError } = await supabase
            .from('reviews')
            .insert({
                project_id: projectId,
                reviewer_id: user.id,
                reviewee_id: freelancerId,
                rating: freelancerRating,
                comment: 'Project completed successfully.' // Default comment or add generic one
            });

        if (reviewError) {
            // Check for duplicate review silently
            if (reviewError.code !== '23505') {
                console.error('Error submitting freelancer review:', reviewError);
                return NextResponse.json({ error: 'Failed to save freelancer review' }, { status: 500 });
            }
        }

        // 2. Submit Site Review
        const { error: siteReviewError } = await supabase
            .from('site_reviews')
            .insert({
                user_id: user.id,
                project_id: projectId,
                rating: siteRating,
                feedback: siteFeedback || 'No feedback provided',
                is_public: true
            });

        if (siteReviewError) {
            console.error('Error submitting site review:', siteReviewError);
            // Don't fail the whole request if site review fails
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error in review submission:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
