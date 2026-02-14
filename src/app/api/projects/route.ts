import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/projects - Get projects where user is involved
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        }

        const supabase = createClient();

        // Fetch projects where user is client OR freelancer
        const { data: projects, error } = await supabase
            .from('projects')
            .select(`
        *,
        client:profiles!projects_client_id_fkey(
          id,
          username,
          full_name,
          rating
        ),
        freelancer:profiles!projects_freelancer_id_fkey(
          id,
          username,
          full_name,
          rating
        )
      `)
            .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(projects || []);
    } catch (error: any) {
        console.error('Error in GET /api/projects:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/projects - Create project (called from bid acceptance)
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        const body = await request.json();
        const {
            job_id,
            title,
            description,
            client_id,
            freelancer_id,
            budget,
            milestones
        } = body;

        // Validate required fields
        if (!job_id || !client_id || !freelancer_id || !budget) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create project
        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                job_id,
                title,
                description,
                client_id,
                hired_freelancer_id: freelancer_id,
                budget,
                milestones,
                status: 'open'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(project, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/projects:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
