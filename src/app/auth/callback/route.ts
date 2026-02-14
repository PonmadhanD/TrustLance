import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error_param = requestUrl.searchParams.get('error');
    const error_description = requestUrl.searchParams.get('error_description');

    console.log('=== OAuth Callback Debug ===');
    console.log('Code exists:', !!code);
    console.log('Error param:', error_param);
    console.log('Error description:', error_description);
    console.log('Full URL:', requestUrl.href);

    // Handle OAuth errors from provider
    if (error_param) {
        console.error('OAuth provider error:', error_param, error_description);
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error_description || 'Authentication failed')}`, requestUrl.origin)
        );
    }

    if (code) {
        try {
            const cookieStore = await cookies();

            // Create Supabase server client
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        get(name: string) {
                            return cookieStore.get(name)?.value;
                        },
                        set(name: string, value: string, options: CookieOptions) {
                            try {
                                cookieStore.set({ name, value, ...options });
                            } catch (error) {
                                console.error('Error setting cookie:', name, error);
                            }
                        },
                        remove(name: string, options: CookieOptions) {
                            try {
                                cookieStore.set({ name, value: '', ...options });
                            } catch (error) {
                                console.error('Error removing cookie:', name, error);
                            }
                        },
                    },
                }
            );

            console.log('Exchanging code for session...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error('Exchange code error:', error);
                return NextResponse.redirect(
                    new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
                );
            }

            if (!data.session) {
                console.error('No session returned from exchange');
                return NextResponse.redirect(
                    new URL('/login?error=No session created', requestUrl.origin)
                );
            }

            console.log('Session created for user:', data.session.user.id);

            // Check if user profile exists in database
            console.log('Checking for existing user profile...');
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('id, username')
                .eq('id', data.session.user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                // PGRST116 is "not found" which is fine
                console.error('Error checking profile:', profileError);
            }

            // Create profile if it doesn't exist (for Google sign-in)
            if (!profile) {
                console.log('Creating new user profile...');

                // Generate unique username
                const email = data.session.user.email!;
                const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

                let username = baseUsername;
                let suffix = 2;

                while (true) {
                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('id')
                        .eq('username', username)
                        .single();

                    if (!existingUser) break;

                    username = `${baseUsername}_${suffix}`;
                    suffix++;
                }

                console.log('Generated username:', username);

                // Create user profile
                const { error: insertError } = await supabase.from('users').insert({
                    id: data.session.user.id,
                    email: data.session.user.email,
                    name: data.session.user.user_metadata.full_name || data.session.user.email!.split('@')[0],
                    username: username,
                    role: 'freelancer',
                    avatar_url: data.session.user.user_metadata.avatar_url,
                    membership_tier: 'free',
                    balance: 0,
                    currency: 'INR',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

                if (insertError) {
                    console.error('Error creating user profile:', insertError);
                    // Continue anyway - user might exist from previous attempt
                } else {
                    console.log('User profile created successfully');
                }
            } else {
                console.log('Existing user profile found:', profile.username);
            }

            // Redirect to dashboard page
            console.log('Redirecting to dashboard...');
            const redirectUrl = new URL('/dashboard', requestUrl.origin);
            return NextResponse.redirect(redirectUrl);

        } catch (error) {
            console.error('Unexpected error in callback:', error);
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent('An unexpected error occurred')}`, requestUrl.origin)
            );
        }
    }

    // No code and no error - shouldn't happen
    console.log('No code or error in callback - redirecting to login');
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
 