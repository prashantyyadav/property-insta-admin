import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useData } from '../context/DataContext'
import { AlertTriangle, X } from 'lucide-react'

export default function Layout() {
  const { dbError, clearDbError } = useData()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {/* Supabase Error Banner */}
        {dbError && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-800 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-medium">Supabase Warning</p>
                <p className="text-amber-700">{dbError}</p>
              </div>
            </div>
            <button
              onClick={clearDbError}
              className="text-amber-500 hover:text-amber-700 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}