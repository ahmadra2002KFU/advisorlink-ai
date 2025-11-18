import { Bell, BellDot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UnreadMessage } from '@/api/chat';

interface NotificationBellProps {
  unreadMessages: UnreadMessage[];
  onNotificationClick: (conversationId: number) => void;
  language?: 'en' | 'ar';
  noNotificationsText?: string;
  viewAllText?: string;
}

const NotificationBell = ({
  unreadMessages,
  onNotificationClick,
  language = 'en',
  noNotificationsText = 'No new notifications',
  viewAllText = 'View all messages'
}: NotificationBellProps) => {
  const unreadCount = unreadMessages.length;
  const hasUnread = unreadCount > 0;

  // Helper function to get relative time
  const getRelativeTime = (dateString: string) => {
    const messageDate = new Date(dateString.replace(' ', 'T'));
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return language === 'en' ? 'Just now' : 'الآن';
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return language === 'en' ? `${mins}m ago` : `منذ ${mins}د`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return language === 'en' ? `${hours}h ago` : `منذ ${hours}س`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return language === 'en' ? `${days}d ago` : `منذ ${days} أيام`;
    }
  };

  // Helper function to truncate message text
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const ariaLabel = language === 'en'
    ? `${unreadCount} unread notifications`
    : `${unreadCount} إشعارات غير مقروءة`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
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
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={language === 'ar' ? 'start' : 'end'}
        className="w-80"
      >
        {!hasUnread ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {noNotificationsText}
          </div>
        ) : (
          <>
            {unreadMessages.map((message) => (
              <DropdownMenuItem
                key={message.id}
                className="cursor-pointer p-3 focus:bg-accent"
                onClick={() => onNotificationClick(message.conversation_id)}
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground mb-1">
                      {message.sender_name}
                      {message.student_number && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({message.student_number})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      {truncateText(message.message_text)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getRelativeTime(message.created_at)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            {unreadMessages.length >= 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer justify-center text-sm font-medium text-primary"
                  onClick={() => onNotificationClick(unreadMessages[0].conversation_id)}
                >
                  {viewAllText}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
