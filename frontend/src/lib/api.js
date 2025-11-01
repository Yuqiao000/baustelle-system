const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    console.log('API Request:', url, config.method || 'GET')
    try {
      const response = await fetch(url, config)
      console.log('API Response status:', response.status)
      const data = await response.json()

      if (!response.ok) {
        console.error('API Error response:', data)
        throw new Error(data.detail || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Baustellen
  async getBaustellen(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/baustellen/?${query}`)
  }

  async getBaustelle(id) {
    return this.request(`/baustellen/${id}`)
  }

  async createBaustelle(data) {
    return this.request('/baustellen/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Items
  async getItems(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/items/?${query}`)
  }

  async getItem(id) {
    return this.request(`/items/${id}`)
  }

  async createItem(data) {
    return this.request('/items/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateItem(id, data) {
    return this.request(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Categories
  async getCategories(type) {
    const query = type ? `?type=${type}` : ''
    return this.request(`/items/categories/${query}`)
  }

  // Requests
  async getRequests(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/requests/?${query}`)
  }

  async getRequest(id) {
    return this.request(`/requests/${id}`)
  }

  async createRequest(data, workerId) {
    return this.request(`/requests/?worker_id=${workerId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRequest(id, data, confirmedBy = null) {
    const query = confirmedBy ? `?confirmed_by=${confirmedBy}` : ''
    return this.request(`/requests/${id}${query}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async cancelRequest(id) {
    return this.request(`/requests/${id}`, {
      method: 'DELETE',
    })
  }

  async getRequestHistory(id) {
    return this.request(`/requests/${id}/history`)
  }

  // Notifications
  async getNotifications(userId, params = {}) {
    const query = new URLSearchParams({ user_id: userId, ...params }).toString()
    return this.request(`/notifications/?${query}`)
  }

  async getUnreadCount(userId) {
    return this.request(`/notifications/unread-count?user_id=${userId}`)
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsRead(userId) {
    return this.request(`/notifications/mark-all-read?user_id=${userId}`, {
      method: 'PATCH',
    })
  }

  // Statistics
  async getDashboardStats() {
    return this.request('/statistics/dashboard')
  }

  async getMonthlyStats(year, month) {
    return this.request(`/statistics/monthly?year=${year}&month=${month}`)
  }

  async getMaterialUsage(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/statistics/material-usage?${query}`)
  }

  async getBaustelleStats(baustelleId, params = {}) {
    const query = new URLSearchParams({ baustelle_id: baustelleId, ...params }).toString()
    return this.request(`/statistics/baustelle-stats?${query}`)
  }
}

export const api = new ApiClient(API_URL)
