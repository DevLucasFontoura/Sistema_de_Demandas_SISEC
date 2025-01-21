// Definição dos tipos
export interface StatusConfig {
  value: string
  label: string
  color: string
  icon: string
  bgColor: string
  borderColor: string
}

export interface TipoConfig {
  value: string
  label: string
}

export interface UrgenciaConfig {
  value: string
  label: string
  bgColor: string
  textColor: string
  borderColor: string
}

// Status das solicitações
export const STATUS_CONFIG: Record<string, StatusConfig> = {
  pendente: {
    value: 'pendente',
    label: 'Pendente',
    color: 'text-yellow-800',
    icon: 'XCircleIcon',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200'
  },
  em_andamento: {
    value: 'em_andamento',
    label: 'Em Andamento',
    color: 'text-blue-800',
    icon: 'ClockIcon',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200'
  },
  concluida: {
    value: 'concluida',
    label: 'Concluída',
    color: 'text-green-800',
    icon: 'CheckCircleIcon',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200'
  },
  suspenso: {
    value: 'suspenso',
    label: 'Suspenso',
    color: 'text-red-800',
    icon: 'StopCircleIcon',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200'
  }
}

// Tipos de solicitação
export const TIPOS_CONFIG: Record<string, TipoConfig> = {
  desenvolvimento: {
    value: 'desenvolvimento',
    label: 'Desenvolvimento'
  },
  dados: {
    value: 'dados',
    label: 'Dados'
  },
  suporte: {
    value: 'suporte',
    label: 'Suporte'
  },
  infraestrutura: {
    value: 'infraestrutura',
    label: 'Infraestrutura'
  },
  infraestrutura_ti: {
    value: 'infraestrutura_ti',
    label: 'Infraestrutura de TI'
  },
  outros: {
    value: 'outros',
    label: 'Outros'
  }
}

// Níveis de urgência
export const URGENCIA_CONFIG: Record<string, UrgenciaConfig> = {
  baixa: {
    value: 'baixa',
    label: 'Baixa',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  media: {
    value: 'media',
    label: 'Média',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  alta: {
    value: 'alta',
    label: 'Alta',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  }
}

// Helpers
export const getStatusConfig = (status: string): StatusConfig => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pendente
}

export const getTipoConfig = (tipo: string): TipoConfig => {
  console.log('Tipo recebido:', tipo)
  console.log('Tipos disponíveis:', Object.keys(TIPOS_CONFIG))
  const config = TIPOS_CONFIG[tipo]
  console.log('Config encontrada:', config)
  return config || { value: tipo, label: 'Desconhecido' }
}

export const getUrgenciaConfig = (urgencia: string): UrgenciaConfig => {
  return URGENCIA_CONFIG[urgencia] || URGENCIA_CONFIG.baixa
} 