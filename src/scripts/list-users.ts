import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createAdminClient } from '../lib/supabase/admin';

async function listUsers() {
    const supabase = createAdminClient();
    const { data: users, error } = await supabase.from('users').select('id, username, email');

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    console.log('Users in DB:');
    console.table(users);
}

listUsers();
 