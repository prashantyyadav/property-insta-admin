import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  Film,
  PlayCircle,
  FileText,
  Users,
  Globe,
  Bell,
  Star,
  HelpCircle,
  Building2,
  Network,
  Shield,
  Key,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navSections = [
  {
    label: 'Content',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/properties', label: 'Properties', icon: Home },
      { path: '/reels', label: 'Property Reels', icon: Film },
      { path: '/stories', label: 'Stories', icon: PlayCircle },
      { path: '/blogs', label: 'Blog Posts', icon: FileText },
      { path: '/agents', label: 'Agents', icon: Users },
    ],
  },
  {
    label: 'Operations & Management',
    items: [
      { path: '/builder-erp', label: 'Builder ERP', icon: Building2 },
      { path: '/channel-partners', label: 'Channel Partners', icon: Network },
      { path: '/society-os', label: 'Society OS', icon: Shield },
      { path: '/property-management', label: 'Property Mgmt', icon: Key },
    ],
  },
  {
    label: 'Platform',
    items: [
      { path: '/site-config', label: 'Site Config', icon: Globe },
      { path: '/notifications', label: 'Notifications', icon: Bell },
      { path: '/reviews', label: 'Reviews', icon: Star },
      { path: '/quiz', label: 'Quiz', icon: HelpCircle },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { logout, user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-white flex flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0 ${collapsed ? 'lg:w-16' : 'lg:w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <div className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}>
          <Home className="w-8 h-8 text-primary-400" />
          {!collapsed && <span className="text-lg font-bold tracking-wide">PropertyInsta</span>}
        </div>
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block p-1 rounded-md hover:bg-sidebar-hover transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        {/* Close — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md hover:bg-sidebar-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-3 pt-4 pb-1 text-xs font-bold text-gray-500 uppercase tracking-widest">
                {section.label}
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                  } ${collapsed ? 'lg:justify-center' : ''}`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-700 p-4">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200 w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}