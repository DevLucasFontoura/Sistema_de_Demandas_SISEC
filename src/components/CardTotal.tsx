// src/components/CardTotal.tsx
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
    <div className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border ${className} ${borderClassName} flex items-center`}>
      <div className={`p-2 rounded-lg ${iconClassName} mr-4`}>
        <Icon className="w-8 h-8 text-gray-900" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}