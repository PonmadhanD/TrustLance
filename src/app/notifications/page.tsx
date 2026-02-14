'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, CheckCircle, Briefcase, MessageCircle, Trophy, DollarSign, Circle, Filter, MoreHorizontal, MessageSquare, Scale } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { user } = useAuth();
  const router = useRouter();

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'proposal': return <Briefcase className="h-5 w-5 text-blue-500" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'payment': return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'dispute': return <Scale className="h-5 w-5 text-red-500" />;
      case 'project': return <Briefcase className="h-5 w-5 text-purple-500" />;
      case 'system': return <Bell className="h-5 w-5 text-gray-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount} unread
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 mt-2">Stay updated with your latest activities</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 overflow-x-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>

          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'proposal', label: 'Bids', count: notifications.filter(n => n.type === 'proposal').length },
            { key: 'project', label: 'Projects', count: notifications.filter(n => n.type === 'project').length },
            { key: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
            { key: 'dispute', label: 'Disputes', count: notifications.filter(n => n.type === 'dispute').length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedFilter === filter.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {selectedFilter === 'all'
                  ? "You're all caught up! No notifications to show."
                  : `No ${selectedFilter} notifications found.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                onClick={() => {
                  if (!notification.read) markAsRead(notification.id);
                  if (notification.link) router.push(notification.link);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                            {!notification.read && (
                              <div className="flex items-center gap-1">
                                <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                                <span className="text-xs text-blue-600 font-medium">New</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More (Simplified for now) */}
        {!loading && filteredNotifications.length > 20 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Load more notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}