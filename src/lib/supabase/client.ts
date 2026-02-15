import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwqaajsxhwiaemdikzkf.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cWFhanN4aHdpYWVtZGlremtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODc3NzgsImV4cCI6MjA4NDc2Mzc3OH0.tFry4pZCwebeDWC0zqLnTwc7fwy80aQYEUoCSsACL48'
    );
}
