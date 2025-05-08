import React, { useState } from 'react';
import { Bell, Check, X, AlertTriangle, InfoIcon, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications, NotificationType, SystemNotification } from '../lib/stores/useNotifications';
import { useGame } from '../lib/stores/useGame';
import { Badge } from './ui/badge';
import { useAudio } from '../lib/stores/useAudio';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Helper function to get the icon for the notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    case 'info':
    default:
      return <InfoIcon className="h-4 w-4 text-blue-400" />;
  }
};

// Convert notification type to badge variant
const getBadgeVariant = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'secondary' as const;
    case 'error':
      return 'destructive' as const;
    case 'warning':
      return 'outline' as const;
    case 'info':
    default:
      return 'default' as const;
  }
};

const NotificationsPanel: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const { viewMode, notifications: notificationsEnabled } = useGame();
  const { playNotification } = useAudio();
  
  const isGodMode = viewMode === 'godmode';
  
  // Sorting notifications by timestamp (newest first) and unread status
  const sortedNotifications = [...notifications].sort((a, b) => {
    // Unread notifications first
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    // Then by timestamp
    return b.timestamp - a.timestamp;
  });
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
    
    if (!expanded && unreadCount > 0) {
      // Mark all as read when panel is expanded
      markAllAsRead();
    }
    
    // Play notification sound
    if (unreadCount > 0) {
      playNotification();
    }
  };
  
  const handleViewNotification = (notification: SystemNotification) => {
    markAsRead(notification.id);
    
    toast[notification.type](notification.title, {
      description: notification.message,
      duration: 5000,
    });
  };
  
  const handleClearNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeNotification(id);
  };
  
  // Only show if in god mode and notifications are enabled
  if (!isGodMode || !notificationsEnabled) {
    return null;
  }
  
  return (
    <div className="fixed right-4 top-[130px] z-50 flex flex-col items-end">
      {/* Notification Bell */}
      <div 
        className="flex items-center cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="p-2 bg-black/50 backdrop-blur-sm rounded-full relative hover:bg-black/60 transition-colors">
          <Bell className="h-5 w-5 text-cyan-400" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive"
              className={`absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center p-0 text-[0.65rem] ${
                unreadCount > 3 ? 'flash-animation' : ''
              }`}
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Notifications Panel */}
      {expanded && (
        <div className="mt-2 w-72 max-h-96 overflow-y-auto bg-black/70 backdrop-blur-sm border border-cyan-500/30 rounded-md shadow-lg">
          <div className="p-2 border-b border-cyan-500/20 flex justify-between items-center">
            <h3 className="text-xs font-medium text-cyan-400">System Notifications</h3>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                  title="Mark all as read"
                >
                  <Check className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          
          {sortedNotifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-cyan-500/10">
              {sortedNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-2 text-xs ${notification.read ? 'bg-transparent' : 'bg-cyan-950/20'} hover:bg-cyan-900/20 cursor-pointer ${
                    !notification.read && notification.priority === 'critical' ? 'critical-notification' : ''
                  }`}
                  onClick={() => handleViewNotification(notification)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1">
                      {getNotificationIcon(notification.type)}
                      <span className="font-semibold text-white">{notification.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={getBadgeVariant(notification.type)} className="px-1 py-0 h-4 text-[0.6rem]">
                        {notification.priority}
                      </Badge>
                      <button 
                        onClick={(e) => handleClearNotification(e, notification.id)} 
                        className="text-gray-400 hover:text-white"
                        title="Remove notification"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-300 text-[0.7rem] line-clamp-2 mb-1">
                    {notification.message}
                  </p>
                  <div className="flex justify-between items-center text-[0.65rem] text-gray-400">
                    <span>{notification.source}</span>
                    <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;