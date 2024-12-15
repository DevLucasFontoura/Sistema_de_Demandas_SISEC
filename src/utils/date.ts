export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const dia = d.getDate().toString().padStart(2, '0')
  const mes = (d.getMonth() + 1).toString().padStart(2, '0')
  const ano = d.getFullYear()
  
  return `${dia} / ${mes} / ${ano}`
} 