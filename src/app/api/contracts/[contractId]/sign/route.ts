import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/contracts/[contractId]/sign - Freelancer signs the agreement
export async function PATCH(
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

        const body = await request.json();
        const { signature } = body;

        if (!signature) {
            return NextResponse.json({ error: 'Signature is required' }, { status: 400 });
        }

        // Check if user is party to contract
        const { data: existingContract, error: fetchError } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', contractId)
            .single();

        if (fetchError || !existingContract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        let updateData = {};
        if (existingContract.freelancer_id === user.id) {
            updateData = { freelancer_signature: signature, freelancer_signed_at: new Date().toISOString() };
        } else if (existingContract.client_id === user.id) {
            updateData = { client_signature: signature, client_signed_at: new Date().toISOString() };
        } else {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update contract with signature
        const { data: contract, error } = await supabase
            .from('contracts')
            .update(updateData)
            .eq('id', contractId)
            .select()
            .single();

        if (error) {
            console.error('Error signing contract:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(contract);
    } catch (error: any) {
        console.error('Error in PATCH /api/contracts/[contractId]/sign:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
