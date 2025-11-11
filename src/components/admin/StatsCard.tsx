interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
}

export default function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}