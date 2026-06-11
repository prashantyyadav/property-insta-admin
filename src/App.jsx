import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Properties from './pages/Properties'
import Reels from './pages/Reels'
import Stories from './pages/Stories'
import Blogs from './pages/Blogs'
import Agents from './pages/Agents'
import SiteConfig from './pages/SiteConfig'
import Notifications from './pages/Notifications'
import Reviews from './pages/Reviews'
import Quiz from './pages/Quiz'
import BuilderERP from './pages/BuilderERP'
import ChannelPartners from './pages/ChannelPartners'
import SocietyOS from './pages/SocietyOS'
import PropertyManagement from './pages/PropertyManagement'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="reels" element={<Reels />} />
        <Route path="stories" element={<Stories />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="agents" element={<Agents />} />
        <Route path="site-config" element={<SiteConfig />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="settings" element={<Settings />} />
        <Route path="builder-erp" element={<BuilderERP />} />
        <Route path="channel-partners" element={<ChannelPartners />} />
        <Route path="society-os" element={<SocietyOS />} />
        <Route path="property-management" element={<PropertyManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}