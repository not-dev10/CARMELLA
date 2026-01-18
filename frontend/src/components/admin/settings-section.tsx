import { motion } from "framer-motion"
import { Settings, Save, Mail, Bell, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SettingsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tight text-gray-800 mb-2">Settings & Configuration</h2>
        <p className="text-gray-500">Manage admin profile, system settings, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Profile */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Admin Profile
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Admin User"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="admin@carmella.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20">
                <option>Super Admin</option>
                <option>Admin</option>
                <option>Moderator</option>
              </select>
            </div>
            <Button className="w-full btn-gradient">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            System Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only" />
                <div className="w-10 h-5 bg-primary rounded-full transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Order Alerts</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only" />
                <div className="w-10 h-5 bg-primary rounded-full transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">B2B Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only" />
                <div className="w-10 h-5 bg-primary rounded-full transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Templates
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              Order Confirmation Email
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              B2B Approval Email
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              Shipping Notification Email
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              Welcome Email
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Security
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button className="w-full btn-gradient">
              <Lock className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
