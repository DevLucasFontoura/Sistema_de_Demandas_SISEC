import { useState, useEffect } from 'react'

interface ContadorTempoProps {
  inicioAndamento: string
  status: string
}

export function ContadorTempo({ inicioAndamento, status }: ContadorTempoProps) {
  const [tempoDecorrido, setTempoDecorrido] = useState<string>('00:00:00')

  useEffect(() => {
    console.log('Status atual:', status)
    console.log('Início do andamento:', inicioAndamento)

    let intervalId: NodeJS.Timeout

    if (status === 'em_andamento' && inicioAndamento) {
      console.log('Iniciando contador com data:', inicioAndamento)
      
      const inicio = new Date(inicioAndamento).getTime()
      
      const atualizarTempo = () => {
        const agora = new Date().getTime()
        const diferenca = agora - inicio

        const horas = Math.floor(diferenca / (1000 * 60 * 60))
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60))
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000)

        const novoTempo = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
        setTempoDecorrido(novoTempo)
      }

      intervalId = setInterval(atualizarTempo, 1000)
      atualizarTempo()
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [inicioAndamento, status])

  return (
    <div className="bg-[#f2f3f5] border border-gray-900 rounded-lg px-4 py-2 flex flex-col items-end">
      <h3 className="text-sm font-medium text-gray-500">Tempo em Andamento</h3>
      <div className="text-right">
        <p className="text-gray-800 font-mono text-lg">
          {status === 'em_andamento' ? tempoDecorrido : 'Não iniciado'}
        </p>
        <p className="text-xs text-gray-500">
          {inicioAndamento ? `Início: ${new Date(inicioAndamento).toLocaleString()}` : 'Aguardando início'}
        </p>
      </div>
    </div>
  )
}