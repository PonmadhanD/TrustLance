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
            revieweeId,
            rating,
            feedback,
            siteRating,
            siteFeedback
        } = body;

        if (!projectId || !revieweeId || !rating || !siteRating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Submit Review (Client -> Freelancer OR Freelancer -> Client)
        const { error: reviewError } = await supabase
            .from('feedback')
            .insert({
                project_id: projectId,
                reviewer_id: user.id,
                reviewee_id: revieweeId,
                rating: rating,
                feedback: feedback || 'No written feedback provided.'
            });

        if (reviewError) {
            // Check for duplicate review silently
            if (reviewError.code !== '23505') {
                console.error('Error submitting review:', reviewError);
                return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
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

        // =================================================================
        // AUTO-PORTFOLIO & CREDITS (Triggered when Client reviews Freelancer)
        // =================================================================
        try {
            // Check if reviewer is the project client
            const { data: project } = await supabase
                .from('projects')
                .select('client_id, title, description')
                .eq('id', projectId)
                .single();

            if (project && project.client_id === user.id) {
                // It IS a client review -> Trigger Freelancer Rewards

                // 1. Create Portfolio Item (Avoid duplicates with ignore)
                const { error: portfolioError } = await supabase
                    .from('portfolio_items')
                    .insert({
                        user_id: revieweeId, // Freelancer
                        project_id: projectId,
                        title: project.title,
                        summary: project.description ? (project.description.slice(0, 150) + (project.description.length > 150 ? '...' : '')) : 'Successfully completed project.',
                        client_rating: rating,
                        client_review: feedback,
                        origin: 'auto',
                        token_amount: 0, // Ideally fetch total paid amount
                        is_visible: true
                    });

                if (!portfolioError) {
                    // 2. Fetch current stats
                    const { data: freelancer } = await supabase
                        .from('users')
                        .select('total_credits, projects_completed')
                        .eq('id', revieweeId)
                        .single();

                    if (freelancer) {
                        const newCredits = (freelancer.total_credits || 0) + 30;
                        const newCount = (freelancer.projects_completed || 0) + 1;

                        // 3. Update User Stats
                        await supabase
                            .from('users')
                            .update({
                                total_credits: newCredits,
                                projects_completed: newCount
                            })
                            .eq('id', revieweeId);

                        // 4. Log Credit Transaction
                        await supabase
                            .from('credit_transactions')
                            .insert({
                                user_id: revieweeId,
                                project_id: projectId,
                                amount: 30,
                                reason: 'Successful project completion'
                            });
                    }
                } else {
                    if (portfolioError.code !== '23505') { // Ignore duplicate key error
                        console.error('Error creating auto-portfolio:', portfolioError);
                    }
                }
            }
        } catch (autoError) {
            console.error('Error in auto-portfolio logic:', autoError);
            // Do not fail the main request
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error in review submission:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
 