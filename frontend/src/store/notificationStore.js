import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  subscription: null,

  initialize: async (userId) => {
    if (!userId) return

    // 加载通知
    await get().fetchNotifications(userId)

    // 订阅实时通知
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          set((state) => ({
            notifications: [payload.new, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === payload.new.id ? payload.new : n
            ),
            unreadCount: payload.new.is_read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          }))
        }
      )
      .subscribe()

    set({ subscription })
  },

  cleanup: () => {
    const subscription = get().subscription
    if (subscription) {
      supabase.removeChannel(subscription)
      set({ subscription: null })
    }
  },

  fetchNotifications: async (userId) => {
    try {
      set({ loading: true })
      const [notifications, unreadResult] = await Promise.all([
        api.getNotifications(userId, { limit: 50 }),
        api.getUnreadCount(userId),
      ])

      set({
        notifications,
        unreadCount: unreadResult.count,
        loading: false,
      })
    } catch (error) {
      console.error('Fetch notifications error:', error)
      set({ loading: false })
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId)
    } catch (error) {
      console.error('Mark notification read error:', error)
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await api.markAllNotificationsRead(userId)
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }))
    } catch (error) {
      console.error('Mark all notifications read error:', error)
    }
  },
}))
