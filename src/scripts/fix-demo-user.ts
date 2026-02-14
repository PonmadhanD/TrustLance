
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixDemoUser() {
    const email = 'arbitrator@demo.com';
    console.log(`Fixing user: ${email}...`);

    // 1. Get Auth User ID
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const authUser = users?.find(u => u.email === email);

    if (!authUser) {
        console.error('Auth user not found! Did the creation script run?');
        process.exit(1);
    }

    console.log(`Auth ID: ${authUser.id}`);

    // 2. Check Public User
    const { data: publicUserByEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (publicUserByEmail) {
        console.log(`Public User found by email. ID: ${publicUserByEmail.id}`);

        if (publicUserByEmail.id !== authUser.id) {
            console.warn('⚠️ ID MISMATCH DETECTED!');
            console.log('Deleting bad public record...');

            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', publicUserByEmail.id);

            if (deleteError) {
                console.error('Failed to delete bad record:', deleteError);
            } else {
                console.log('Bad record deleted.');
            }
        } else {
            console.log('IDs match. Profile is good.');
            return;
        }
    } else {
        console.log('No public user found by email.');
    }

    // 3. Insert Correct Record
    console.log('Inserting correct public record...');
    const { error: insertError } = await supabase
        .from('users')
        .upsert({
            id: authUser.id, // CRITICAL: Use Auth ID
            email: email,
            name: 'Demo Arbitrator',
            username: 'demoarbitrator',
            role: 'both',
            tokens: 4500,
            jobs_completed: 150,
            balance: 10000.00,
            arbitrator_status: 'offline',
            membership_tier: 'premium'
        });

    if (insertError) {
        console.error('Insert failed:', insertError);
    } else {
        console.log('✅ User fixed successfully! Try logging in now.');
    }
}

fixDemoUser();
 