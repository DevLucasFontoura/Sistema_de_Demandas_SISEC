// src/components/StatCard.tsx
import { ElementType } from 'react'

interface CardTotalProps {
  title: string
  value: string
  icon: ElementType
  className?: string
  iconClassName?: string
  borderClassName?: string
}

export function CardTotal({ 
  title, 
  value, 
  icon: Icon,
  className = "bg-white",
  iconClassName = "bg-gray-100",
  borderClassName = "border-gray-900"
}: CardTotalProps) {
  return (
    <div className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border ${className} ${borderClassName}`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${iconClassName}`}>
          <Icon className="w-6 h-6 text-gray-900" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{title}</p>
    </div>
  )
}