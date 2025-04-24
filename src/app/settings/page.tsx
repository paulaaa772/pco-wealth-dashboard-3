import { CogIcon, BellIcon, KeyIcon, UserCircleIcon, WalletIcon } from '@heroicons/react/24/outline'

const settings = [
  {
    id: 'profile',
    name: 'Profile Settings',
    description: 'Update your personal information and preferences.',
    icon: UserCircleIcon,
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', value: 'John Doe' },
      { name: 'email', label: 'Email Address', type: 'email', value: 'john.doe@example.com' },
      { name: 'phone', label: 'Phone Number', type: 'tel', value: '+1 (555) 123-4567' },
    ]
  },
  {
    id: 'notifications',
    name: 'Notification Preferences',
    description: 'Configure how you want to receive alerts and updates.',
    icon: BellIcon,
    options: [
      { id: 'trade-alerts', name: 'Trade Alerts', description: 'Get notified when trades are executed', enabled: true },
      { id: 'price-alerts', name: 'Price Alerts', description: 'Receive alerts when price targets are hit', enabled: true },
      { id: 'news-alerts', name: 'News Alerts', description: 'Stay updated with market-moving news', enabled: false },
      { id: 'congress-alerts', name: 'Congress Trading Alerts', description: 'Get notified of new congressional trades', enabled: true },
    ]
  },
  {
    id: 'security',
    name: 'Security Settings',
    description: 'Manage your account security and authentication options.',
    icon: KeyIcon,
    options: [
      { id: '2fa', name: 'Two-Factor Authentication', description: 'Add an extra layer of security', enabled: true },
      { id: 'session', name: 'Active Sessions', description: 'Manage your active login sessions', enabled: true },
      { id: 'api-keys', name: 'API Keys', description: 'Manage your API keys and access tokens', enabled: false },
    ]
  },
  {
    id: 'trading',
    name: 'Trading Preferences',
    description: 'Configure your trading settings and risk parameters.',
    icon: WalletIcon,
    fields: [
      { name: 'default-size', label: 'Default Position Size', type: 'number', value: '1000' },
      { name: 'max-risk', label: 'Maximum Risk per Trade (%)', type: 'number', value: '2' },
      { name: 'default-stop', label: 'Default Stop Loss (%)', type: 'number', value: '5' },
    ]
  },
]

export default function Settings() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your account preferences and trading settings
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settings.map((section) => (
          <div key={section.id} className="rounded-lg bg-white dark:bg-zinc-800 shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <section.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">{section.name}</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {section.fields && (
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    {section.fields.map((field) => (
                      <div key={field.name}>
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                        </label>
                        <div className="mt-1">
                          <input
                            type={field.type}
                            name={field.name}
                            id={field.name}
                            defaultValue={field.value}
                            className="block w-full rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white sm:text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.options && (
                  <div className="space-y-4">
                    {section.options.map((option) => (
                      <div key={option.id} className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id={option.id}
                            name={option.id}
                            type="checkbox"
                            defaultChecked={option.enabled}
                            className="h-4 w-4 rounded border-gray-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 dark:bg-zinc-900"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor={option.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {option.name}
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 