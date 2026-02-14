import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/jobs - List jobs
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const createdBy = searchParams.get('created_by');

        const supabase = await createClient();

        let query = supabase
            .from('projects')
            .select(`
        *,
        client:users!projects_client_id_fkey(
          id,
          username,
          name,
          rating
        )
      `)
            .order('created_at', { ascending: false });

        // Filter by status
        if (status) {
            query = query.eq('status', status);
        }

        // Filter by category
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        // Filter by creator (for My Posted Jobs)
        if (createdBy) {
            query = query.eq('client_id', createdBy);
        }

        const { data: jobs, error } = await query;

        if (error) {
            console.error('Error fetching jobs:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(jobs || []);
    } catch (error: any) {
        console.error('Error in GET /api/jobs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/jobs - Create job
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
            title,
            description,
            category,
            subcategory,
            budget_type,
            budget_range,
            budget_min,
            budget_max,
            duration,
            experience_level,
            skills,
            location_preference,
            visibility,
            client_signature,
            client_signed_at
        } = body;

        // Validate required fields
        if (!title || !description || !category || !budget_type || !budget_range || !duration || !experience_level) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create job (in projects table)
        const { data: job, error } = await supabase
            .from('projects')
            .insert({
                title,
                description,
                category,
                subcategory,
                budget_type,
                budget_range,
                budget_min,
                budget_max,
                duration,
                experience_level,
                skills,
                location_preference,
                visibility: visibility || 'public',
                client_id: user.id,
                client_signature,
                client_signed_at,
                status: 'open'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating job:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(job, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/jobs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
