'use client'

import { useState } from 'react'
import { Save, Eye, EyeOff } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Developer',
    email: 'john@example.com',
    bio: 'Passionate about coding and development tools',
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    toolSuggestions: true,
    weeklyDigest: false,
  })

  const [theme, setTheme] = useState('dark')
  const [saved, setSaved] = useState(false)

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-8 overflow-x-auto">
        <button className="px-4 py-3 border-b-2 border-primary text-primary font-medium whitespace-nowrap">
          Profile
        </button>
        <button className="px-4 py-3 text-muted-foreground hover:text-foreground font-medium whitespace-nowrap">
          Security
        </button>
        <button className="px-4 py-3 text-muted-foreground hover:text-foreground font-medium whitespace-nowrap">
          Preferences
        </button>
      </div>

      {/* Profile Section */}
      <div className="card-base mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>

        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className="input-base h-24"
            />
          </div>
        </div>

        <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2">
          <Save size={20} />
          Save Changes
        </button>

        {saved && (
          <p className="text-green-500 text-sm mt-3 animate-fade-in">✓ Changes saved successfully</p>
        )}
      </div>

      {/* Security Section */}
      <div className="card-base mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Security</h2>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={password.current}
                onChange={(e) => setPassword((prev) => ({ ...prev, current: e.target.value }))}
                className="input-base pr-10"
              />
              <button
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={password.new}
                onChange={(e) => setPassword((prev) => ({ ...prev, new: e.target.value }))}
                className="input-base pr-10"
              />
              <button
                onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={password.confirm}
                onChange={(e) => setPassword((prev) => ({ ...prev, confirm: e.target.value }))}
                className="input-base pr-10"
              />
              <button
                onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <button className="btn-primary">Update Password</button>
      </div>

      {/* Preferences Section */}
      <div className="card-base">
        <h2 className="text-2xl font-bold text-foreground mb-6">Preferences</h2>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-4">Theme</label>
            <div className="flex gap-4">
              {['light', 'dark', 'auto'].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={t}
                    checked={theme === t}
                    onChange={(e) => setTheme(e.target.value)}
                    className="accent-primary"
                  />
                  <span className="capitalize text-foreground">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-medium text-foreground mb-4">Notifications</h3>
            <div className="space-y-3">
              {Object.entries(notifications).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className="accent-primary"
                  />
                  <span className="text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="btn-primary">Save Preferences</button>
      </div>
    </div>
  )
}
