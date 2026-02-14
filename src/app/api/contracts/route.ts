import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/contracts - Get user's contracts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Fetch contracts where user is either client or freelancer
        const { data: contracts, error } = await supabase
            .from('contracts')
            .select(`
                *,
                project:projects(title),
                client:users!contracts_client_id_fkey(id, name, username),
                freelancer:users!contracts_freelancer_id_fkey(id, name, username)
            `)
            .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching contracts:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Format response
        const formattedContracts = (contracts || []).map(contract => ({
            id: contract.id,
            project_id: contract.project_id,
            title: contract.project?.title || 'Untitled Project',
            client_id: contract.client_id,
            freelancer_id: contract.freelancer_id,
            client_name: contract.client?.name,
            freelancer_name: contract.freelancer?.name,
            total_amount: contract.total_amount,
            locked_amount: contract.locked_amount,
            status: contract.status,
            created_at: contract.created_at
        }));

        return NextResponse.json(formattedContracts);
    } catch (error: any) {
        console.error('Error in GET /api/contracts:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
 