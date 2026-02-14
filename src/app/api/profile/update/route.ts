import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            profession_title,
            profession_category,
            about,
            skills,
            languages,
            location,
            hourly_rate,
            company,
            phone
        } = body;

        // Validation (basic)
        if (about && about.length > 1000) {
            return NextResponse.json({ error: 'About section too long (max 1000 chars)' }, { status: 400 });
        }

        // Update User Profile
        const { error: updateError } = await supabase
            .from('users')
            .update({
                name,
                profession_title,
                profession_category,
                about,
                skills,
                languages,
                location,
                hourly_rate,
                company,
                phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error in profile update:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
 