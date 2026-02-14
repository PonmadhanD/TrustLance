import { createClient } from './supabase/server';

export type NotificationType = 'project' | 'proposal' | 'payment' | 'dispute' | 'message' | 'system';

export interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}

/**
 * Creates a notification in the database for a specific user.
 */
export async function createNotification({
    userId,
    title,
    message,
    type,
    link
}: CreateNotificationParams) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                link,
                read: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error creating notification:', error);
        return { success: false, error };
    }
}
