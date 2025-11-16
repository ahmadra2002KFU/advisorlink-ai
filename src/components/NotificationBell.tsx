import { Bell, BellDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  language?: 'en' | 'ar';
}

const NotificationBell = ({ unreadCount, onClick, language = 'en' }: NotificationBellProps) => {
  const hasUnread = unreadCount > 0;
  const ariaLabel = language === 'en'
    ? `${unreadCount} unread notifications`
    : `${unreadCount} إشعارات غير مقروءة`;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {hasUnread ? (
        <BellDot className="h-5 w-5" />
      ) : (
        <Bell className="h-5 w-5" />
      )}
      {hasUnread && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs font-semibold"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBell;
