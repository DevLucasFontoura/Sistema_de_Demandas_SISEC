import { collection, addDoc, getDocs, query, orderBy, Timestamp } from '@firebase/firestore'
import { db } from './firebase'

export interface Demanda {
  id: string
  tipo: 'desenvolvimento' | 'dados'
  urgencia: 'alta' | 'media' | 'baixa'
  prazo: Date
  solicitante: string
  descricao: string
  status: 'pendente' | 'em_andamento' | 'concluida'
  dataCriacao: Date
  responsavel: string
  titulo: string
}

const demandasRef = collection(db, 'demandas')

export async function criarDemanda(demanda: Omit<Demanda, 'id' | 'status' | 'dataCriacao'>) {
  try {
    const novaDemanda = {
      ...demanda,
      status: 'pendente',
      dataCriacao: Timestamp.now(),
      prazo: Timestamp.fromDate(new Date(demanda.prazo))
    }
    
    const docRef = await addDoc(demandasRef, novaDemanda)
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar demanda:', error)
    throw error
  }
}

export async function listarDemandas() {
  try {
    const q = query(demandasRef, orderBy('dataCriacao', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Demanda[]
  } catch (error) {
    console.error('Erro ao listar demandas:', error)
    throw error
  }
} 