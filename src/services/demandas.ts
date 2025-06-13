import { collection, addDoc, getDocs, query, orderBy, Timestamp } from '@firebase/firestore'
import { db } from './firebaseConfig'
import * as XLSX from 'xlsx'

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
    
    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Demanda[]
  } catch (error) {
    console.error('Erro ao listar demandas:', error)
    throw error
  }
}

export async function exportarDemandas() {
  try {
    const q = query(demandasRef, orderBy('dataCriacao', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const demandas = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Demanda[]

    // Formata os dados para XLSX
    const dados = demandas.map(demanda => ({
      'Número': demanda.id,
      'Título': demanda.titulo,
      'Status': demanda.status,
      'Urgência': demanda.urgencia,
      'Tipo': demanda.tipo,
      'Criado em': demanda.dataCriacao instanceof Date ? demanda.dataCriacao.toLocaleDateString('pt-BR') : (demanda.dataCriacao as any)?.toDate?.()?.toLocaleDateString('pt-BR') || '',
      'Prazo': demanda.prazo instanceof Date ? demanda.prazo.toLocaleDateString('pt-BR') : (demanda.prazo as any)?.toDate?.()?.toLocaleDateString('pt-BR') || '',
      'Responsável': demanda.responsavel || '',
      'Solicitante': demanda.solicitante || ''
    }))

    // Cria uma nova planilha
    const ws = XLSX.utils.json_to_sheet(dados)

    // Ajusta a largura das colunas
    const colWidths = [
      { wch: 10 }, // Número
      { wch: 40 }, // Título
      { wch: 15 }, // Status
      { wch: 10 }, // Urgência
      { wch: 15 }, // Tipo
      { wch: 12 }, // Criado em
      { wch: 12 }, // Prazo
      { wch: 20 }, // Responsável
      { wch: 20 }  // Solicitante
    ]
    ws['!cols'] = colWidths

    // Cria um novo workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Demandas')

    // Gera o arquivo XLSX
    XLSX.writeFile(wb, `demandas_${new Date().toLocaleDateString('pt-BR')}.xlsx`)
  } catch (error) {
    console.error('Erro ao exportar demandas:', error)
    throw error
  }
} 