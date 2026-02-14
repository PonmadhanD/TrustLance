
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createDemoUser() {
    const email = 'arbitrator@demo.com';
    const password = 'password123';

    console.log(`Creating user: ${email}...`);

    // 1. Create User in Auth
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            name: 'Demo Arbitrator',
            username: 'demoarbitrator',
            role: 'both' // Eligible for freelancer gigs
        }
    });

    if (createError) {
        if (createError.message.includes('already registered')) {
            console.log('User already exists in Auth. Looking up ID...');
            // If exists, likely user exists but maybe not updated, try to find user id
            // Note: admin.listUsers is one way, or just assume if they exist we can update public table by email
        } else {
            console.error('Error creating user:', createError.message);
            process.exit(1);
        }
    }

    const userId = user?.id; // If newly created

    console.log('User created/found in Auth. Updating public profile...');

    // 2. Update Public Profile (tokens, etc)
    const { error: updateError } = await supabase
        .from('users')
        .update({
            tokens: 4500,
            jobs_completed: 150,
            balance: 10000.00,
            arbitrator_status: 'offline',
            role: 'both' // Ensure role is correct
        })
        .eq('email', email);

    // If update fails (e.g. row didn't exist yet because trigger failed or didn't run), insert it
    // Wait, if no trigger, we must INSERT.
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();

    if (!existingUser && userId) {
        console.log('Profile not found, inserting manually...');
        await supabase.from('users').insert({
            id: userId,
            email,
            name: 'Demo Arbitrator',
            username: 'demoarbitrator',
            role: 'both',
            tokens: 4500,
            jobs_completed: 150,
            balance: 10000.00,
            arbitrator_status: 'offline'
        });
    } else if (existingUser) {
        console.log('Profile found, updated tokens.');
    }

    if (updateError) {
        console.error('Error updating public profile:', updateError.message);
    } else {
        console.log('✅ Success! Demo Arbitrator account ready.');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    }
}

createDemoUser();
 