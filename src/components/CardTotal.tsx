// src/components/StatCard.tsx
import { ElementType } from 'react'

interface CardTotalProps {
  title: string
  value: string
  icon: ElementType // Usando ElementType para melhor tipagem de componentes
}

export function CardTotal({ title, value, icon: Icon }: CardTotalProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-primary-100 bg-opacity-30">
          <Icon className="h-8 w-8 text-primary-600" />
        </div>
        <div className="ml-4">
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  )
}