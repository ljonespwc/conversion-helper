interface StatsCardProps {
  title: string
  value: string | number | React.ReactNode
  subtitle?: string
  icon?: React.ReactNode
}

export default function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl flex items-center">
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full text-orange-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}