
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper to create Supabase client for Server Route Handlers
async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwqaajsxhwiaemdikzkf.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cWFhanN4aHdpYWVtZGlremtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODc3NzgsImV4cCI6MjA4NDc2Mzc3OH0.tFry4pZCwebeDWC0zqLnTwc7fwy80aQYEUoCSsACL48',
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ contractId: string }> }
) {
    const { contractId } = await params;

    const supabase = await createClient();

    const { data: messages, error } = await supabase
        .from('contract_messages')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(messages);
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ contractId: string }> }
) {
    const { contractId } = await params;

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const { message } = json;

        if (!message || !message.trim()) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('contract_messages')
            .insert({
                contract_id: contractId,
                sender_id: user.id,
                message: message.trim()
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('SERVER ERROR in [/messages]:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error?.message || String(error)
        }, { status: 500 });
    }
}
