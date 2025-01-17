import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { CardDemandas } from '../components/cardDemandas'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Demanda {
  id: string
  responsavel: string
  status: 'pendente' | 'em_andamento' | 'concluida' | 'suspenso'
  prazo: string
}

interface DemandaGrouped {
  responsavel: string
  demandas: Demanda[]
}

function PainelDemandas() {
  const [demandasPorResponsavel, setDemandasPorResponsavel] = useState<DemandaGrouped[]>([])

  useEffect(() => {
    const fetchDemandas = async () => {
      const firestore = getFirestore()
      const demandasRef = collection(firestore, 'demandas')
      const snapshot = await getDocs(demandasRef)
      
      const demandas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Demanda[]

      // Agrupa demandas por responsável
      const grouped = demandas.reduce((acc: { [key: string]: Demanda[] }, demanda) => {
        if (!demanda.responsavel) return acc
        if (!acc[demanda.responsavel]) {
          acc[demanda.responsavel] = []
        }
        acc[demanda.responsavel].push(demanda)
        return acc
      }, {})

      // Converte para array e ordena por quantidade de demandas (decrescente)
      const groupedArray = Object.entries(grouped)
        .map(([responsavel, demandas]) => ({
          responsavel,
          demandas
        }))
        .sort((a, b) => {
          // Primeiro critério: quantidade de demandas (decrescente)
          const diff = b.demandas.length - a.demandas.length
          // Se quantidade for igual, ordena por nome do responsável
          if (diff === 0) {
            return a.responsavel.localeCompare(b.responsavel)
          }
          return diff
        })

      setDemandasPorResponsavel(groupedArray)
    }

    fetchDemandas()
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/dashboard"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Demandas por Responsável
        </h1>
      </div>

      <div className="flex flex-col space-y-6 w-full">
        {demandasPorResponsavel.map(({ responsavel, demandas }) => (
          <CardDemandas 
            key={responsavel} 
            responsavel={responsavel} 
            demandas={demandas} 
          />
        ))}
      </div>

      {demandasPorResponsavel.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhuma demanda encontrada.
          </p>
        </div>
      )}
    </div>
  )
}

export default PainelDemandas
