import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { Home, Package, FileText, BarChart3, Bell, LogOut, Menu, X, Camera, QrCode, ShoppingCart, Users, Tag, FolderKanban, PackageMinus, ArrowRightLeft } from 'lucide-react'
import { useState } from 'react'

export default function Layout({ children }) {
  const { profile, signOut } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isWorker = profile?.role === 'worker'
  const isLagerOrAdmin = ['lager', 'admin'].includes(profile?.role)
  const isEinkaufs = profile?.role === 'einkaufs'

  const workerLinks = [
    { to: '/worker', icon: Home, label: 'Dashboard' },
    { to: '/worker/new-request', icon: Package, label: 'Neue Anfrage' },
    { to: '/worker/requests', icon: FileText, label: 'Meine Anfragen' },
    { to: '/worker/returns', icon: PackageMinus, label: 'Rückgaben' },
  ]

  const lagerLinks = [
    { to: '/lager', icon: Home, label: 'Dashboard' },
    { to: '/lager/requests', icon: FileText, label: 'Alle Anfragen' },
    { to: '/lager/inventory', icon: Package, label: 'Lagerbestand' },
    { to: '/lager/materials', icon: Tag, label: 'Materialien' },
    { to: '/lager/projects', icon: FolderKanban, label: 'Projekte' },
    { to: '/lager/subcontractors', icon: Users, label: 'Subs' },
    { to: '/lager/returns', icon: PackageMinus, label: 'Rückgaben' },
    { to: '/lager/transfers', icon: ArrowRightLeft, label: 'Transfers' },
    { to: '/lager/scan', icon: Camera, label: 'Scannen' },
    { to: '/lager/barcode-generator', icon: QrCode, label: 'QR-Codes' },
    { to: '/lager/statistics', icon: BarChart3, label: 'Statistiken' },
  ]

  const einkaufsLinks = [
    { to: '/einkaufs', icon: Home, label: 'Dashboard' },
    { to: '/einkaufs/orders', icon: ShoppingCart, label: 'Bestellungen' },
    { to: '/einkaufs/suppliers', icon: Users, label: 'Lieferanten' },
  ]

  const links = isWorker ? workerLinks : isEinkaufs ? einkaufsLinks : lagerLinks

  const handleSignOut = async () => {
    try {
      await signOut()
      // signOut成功后跳转到登录页
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
      // 即使signOut失败也强制跳转（Supabase会自动清理session）
      window.location.href = '/login'
    }
  }

  const handleNotificationClick = () => {
    // 根据角色导航到通知页面
    if (isWorker) {
      navigate('/worker/notifications')
    } else if (isEinkaufs) {
      navigate('/einkaufs/notifications')
    } else {
      navigate('/lager/notifications')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Package className="h-8 w-8 text-white" />
              <div className="ml-2">
                <span className="text-xl font-bold text-white">
                  Baustelle System
                </span>
                <p className="text-xs text-blue-100">Material Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Benachrichtigungen"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-bold shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-blue-200 capitalize">{profile?.role}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Abmelden"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-500/30">
            <nav className="px-4 py-3 space-y-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
