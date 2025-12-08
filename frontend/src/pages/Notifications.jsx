import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { Bell, Check, CheckCheck, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

export default function Notifications() {
  const { user } = useAuthStore()
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id)
    }
  }, [user?.id, fetchNotifications])

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    // Navigate to related content if available
    if (notification.related_id && notification.type === 'request_status_changed') {
      // Determine route based on user role
      const role = notification.metadata?.role || 'worker'
      if (role === 'worker') {
        navigate(`/worker/requests/${notification.related_id}`)
      } else if (role === 'lager' || role === 'admin') {
        navigate(`/lager/requests/${notification.related_id}`)
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    if (user?.id && unreadCount > 0) {
      await markAllAsRead(user.id)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_status_changed':
        return '📋'
      case 'request_approved':
        return '✅'
      case 'request_rejected':
        return '❌'
      case 'low_stock':
        return '⚠️'
      case 'new_request':
        return '🆕'
      default:
        return '🔔'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Benachrichtigungen</h1>
          <p className="mt-1 text-gray-600">
            {unreadCount > 0 ? (
              <span>Sie haben <span className="font-bold text-blue-600">{unreadCount}</span> ungelesene Benachrichtigungen</span>
            ) : (
              <span>Alle Benachrichtigungen gelesen</span>
            )}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            <CheckCheck className="h-5 w-5" />
            Alle als gelesen markieren
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Keine Benachrichtigungen vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`block border-2 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                notification.is_read
                  ? 'bg-white border-gray-200'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    notification.is_read ? 'bg-gray-100' : 'bg-white shadow-md'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-base font-bold ${
                        notification.is_read ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      {notification.message && (
                        <p className={`mt-1 text-sm ${
                          notification.is_read ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: de
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Read status indicator */}
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Read icon */}
                {notification.is_read && (
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
