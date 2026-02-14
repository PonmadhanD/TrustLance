import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/contracts/[contractId] - Get contract details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ contractId: string }> }
) {
    try {
        const { contractId } = await params;
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch contract with related data
        const { data: contract, error } = await supabase
            .from('contracts')
            .select(`
                *,
                project:projects(*),
                client:users!contracts_client_id_fkey(id, name, username, email, rating, wallet_address),
                freelancer:users!contracts_freelancer_id_fkey(id, name, username, email, rating, wallet_address)
            `)
            .eq('id', contractId)
            .single();

        if (error) {
            console.error('Error fetching contract:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        // Verify user has access (must be client or freelancer)
        if (contract.client_id !== user.id && contract.freelancer_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch milestone submissions
        const { data: submissions } = await supabase
            .from('milestone_submissions')
            .select('*')
            .eq('contract_id', contractId)
            .order('milestone_index');

        return NextResponse.json({
            ...contract,
            milestone_submissions: submissions || []
        });
    } catch (error: any) {
        console.error('Error in GET /api/contracts/[contractId]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
