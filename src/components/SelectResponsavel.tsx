interface SelectResponsavelProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const responsaveisOptions = [
  'Lucas Fontoura',
  'Gustavo Luiz',
  'Diego Patrick',
  'Itala Renata',
  'Gabrielle Cristine'
].sort() // Mantém a lista ordenada alfabeticamente

export function SelectResponsavel({ value, onChange, className = '' }: SelectResponsavelProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
    >
      <option value="">Selecione um responsável</option>
      {responsaveisOptions.map((responsavel) => (
        <option key={responsavel} value={responsavel}>
          {responsavel}
        </option>
      ))}
    </select>
  )
} 