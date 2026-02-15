import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwqaajsxhwiaemdikzkf.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cWFhanN4aHdpYWVtZGlremtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE4Nzc3OCwiZXhwIjoyMDg0NzYzNzc4fQ.ROySnbWfsnhyjovS3QMJSseBUwks66JOtqumfifXEvQ',
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}
