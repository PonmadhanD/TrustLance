
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function listUsersAnon() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('Fetching user with full profile relations...');
    const { data: user, error } = await supabase
        .from('users')
        .select(`
            *,
            user_education(*),
            user_certifications(*),
            portfolio_items(*)
        `)
        .eq('username', 'ifcodeelselearn')
        .single();

    if (error) {
        console.error('Error fetching user (Anon):', error);
        return;
    }

    console.log('User fetched (Anon View):', user ? user.username : 'None');
    if (user) {
        console.log('Education:', user.user_education);
        console.log('Certifications:', user.user_certifications);
        console.log('Portfolio:', user.portfolio_items);
    }
}

listUsersAnon();
 