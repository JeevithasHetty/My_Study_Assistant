import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { usersAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge, EmptyState } from '../../components/common/Shared';

const TYPE_COLOR = { exam: 'red', study: 'green', ai: 'purple', placement: 'amber', general: 'gray' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    usersAPI.getNotifications().then((res) => setNotifications(res.data)).finally(() => setLoading(false));
  };

  const markRead = async (id) => {
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
    await usersAPI.markNotificationRead(id);
  };

  const markAllRead = async () => {
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })));
    await usersAPI.markAllRead();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell size={22} className="text-brand-cyan" /> Notifications
          </h1>
          <p className="text-text-secondary text-sm mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && <Button variant="secondary" icon={CheckCheck} onClick={markAllRead}>Mark all read</Button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-blue" /></div>
      ) : notifications.length === 0 ? (
        <Card><EmptyState icon={Bell} title="No notifications" description="You're all caught up." /></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`!p-4 cursor-pointer ${!n.is_read ? 'border-brand-blue/30 bg-brand-blue/5' : ''}`}
            >
              <div className="flex items-start gap-3">
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-brand-cyan mt-1.5 flex-shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <Badge color={TYPE_COLOR[n.type] || 'gray'}>{n.type}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary">{n.message}</p>
                  <p className="text-xs text-text-muted mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
