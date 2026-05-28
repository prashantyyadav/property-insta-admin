import { useState } from 'react'
import {
  Home,
  Eye,
  Film,
  PlayCircle,
  FileText,
  Users,
  TrendingUp,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { useData } from '../context/DataContext'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4']

function StatCard({ title, value, icon: Icon, change, changeType, color }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <button className="p-1 rounded-md hover:bg-gray-100">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          {changeType === 'up' ? (
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-red-500 rotate-90" />
          )}
          <span className={`text-sm font-medium ${changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {change}%
          </span>
          <span className="text-sm text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  )
}

function PropertyBadge({ type }) {
  const colors = {
    hot: 'badge-red',
    featured: 'badge-blue',
    sale: 'badge-green',
    rent: 'badge-yellow',
  }
  const labels = {
    hot: '🔥 Hot',
    featured: '⭐ Featured',
    sale: 'For Sale',
    rent: 'For Rent',
  }
  return <span className={colors[type] || 'badge-blue'}>{labels[type] || type}</span>
}

export default function Dashboard() {
  const { dashboardStats, dashRevenueData: revenueData, dashPropertyTypeData: propertyTypeData, dashPropertyStatusData: propertyStatusData, recentProperties, formatPriceIndian } = useData()
  const [monthRange, setMonthRange] = useState(12)

  const filteredRevenueData = revenueData.slice(-monthRange)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">PropertyInsta Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Manage your real estate platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Properties" value={dashboardStats.totalProperties} icon={Home} change={12.5} changeType="up" color="bg-blue-500" />
        <StatCard title="Total Reels" value={dashboardStats.totalReels} icon={Film} change={8.3} changeType="up" color="bg-pink-500" />
        <StatCard title="Active Stories" value={dashboardStats.totalStories} icon={PlayCircle} change={5.7} changeType="up" color="bg-purple-500" />
        <StatCard title="Total Views" value={(dashboardStats.totalViews / 1000).toFixed(1) + 'K'} icon={Eye} change={15.2} changeType="up" color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Blog Posts" value={dashboardStats.totalBlogs} icon={FileText} color="bg-orange-500" />
        <StatCard title="Agents" value={dashboardStats.totalAgents} icon={Users} color="bg-indigo-500" />
        <StatCard title="Active Listings" value={dashboardStats.activeListings} icon={TrendingUp} color="bg-teal-500" />
        <StatCard title="Under Construction" value={dashboardStats.underConstruction} icon={Home} color="bg-amber-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Property Sales & Rentals (₹ Cr)</h2>
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
              value={monthRange}
              onChange={(e) => setMonthRange(Number(e.target.value))}
            >
              <option value={12}>Last 12 months</option>
              <option value={6}>Last 6 months</option>
              <option value={3}>Last 3 months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredRevenueData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRentals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value) => [`₹${value} Cr`, undefined]}
              />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
              <Area type="monotone" dataKey="rentals" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRentals)" name="Rentals" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Property Type Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Properties by Type</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propertyTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Properties */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Properties</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Property</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Price</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Views</th>
                </tr>
              </thead>
              <tbody>
                {recentProperties.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="table-cell text-sm font-medium text-gray-900">{p.title}</td>
                    <td className="table-cell text-sm text-gray-500">{p.location}</td>
                    <td className="table-cell text-sm font-medium text-primary-600">{formatPriceIndian(p.price)}</td>
                    <td className="table-cell text-sm text-gray-700 capitalize">{p.type}</td>
                    <td className="table-cell">
                      <PropertyBadge type={p.status === 'sale' ? 'sale' : 'rent'} />
                    </td>
                    <td className="table-cell text-sm text-gray-500">{(p.views / 1000).toFixed(1)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Property Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Sale vs Rent</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={propertyStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {propertyStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#10b981'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}