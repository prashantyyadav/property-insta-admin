import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useData } from '../context/DataContext'
import { AlertTriangle, X } from 'lucide-react'

export default function Layout() {
  const { dbError } = useData()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Supabase Error Banner */}
        {dbError && !bannerDismissed && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-amber-800 text-sm min-w-0">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <div className="min-w-0">
                <p className="font-medium">Supabase Warning</p>
                <p className="text-amber-700 truncate">{dbError}</p>
              </div>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-amber-500 hover:text-amber-700 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
