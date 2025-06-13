import { useState, useEffect } from 'react'
import { Button, Table, Modal, Form, Select, message } from 'antd'
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons'
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const firestore = getFirestore()

interface Demanda {
  id: string
  solicitante: string
  tipo: 'desenvolvimento' | 'dados' | 'suporte' | 'infraestrutura' | 'outros'
  urgencia: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'em_andamento' | 'concluida' | 'suspenso'
  prazo: string
  responsavel: string
  titulo: string
}

interface DemandaPriorizada extends Demanda {
  prioridade: number
}

const PRIORIDADE_DOC_ID = 'lista' // pode ser qualquer id fixo

export default function DemandasPorPrioridade() {
  const [demandas, setDemandas] = useState<DemandaPriorizada[]>([])
  const [todasDemandas, setTodasDemandas] = useState<Demanda[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const { user } = useAuth()
  const [carregouPrioridades, setCarregouPrioridades] = useState(false)

  const isAdminOrTI = user?.role === 'adm' || user?.role === 'equipe_ti'

  // Busca todas as demandas do banco
  const fetchDemandas = async () => {
    try {
      const demandasRef = collection(firestore, 'demandas')
      const querySnapshot = await getDocs(demandasRef)
      const demandasList = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          solicitante: data.solicitante || '',
          tipo: data.tipo || 'desenvolvimento',
          urgencia: data.urgencia || 'baixa',
          status: data.status || 'pendente',
          prazo: data.prazo || '',
          responsavel: data.responsavel || '',
          titulo: data.titulo || '',
        }
      })
      setTodasDemandas(demandasList)
    } catch (error) {
      message.error('Erro ao buscar demandas')
    }
  }

  // Busca prioridades salvas no banco
  const fetchPrioridades = async () => {
    try {
      const prioridadesRef = doc(firestore, 'prioridade', PRIORIDADE_DOC_ID)
      const prioridadesSnap = await getDocs(collection(firestore, 'prioridade'))
      const docSnap = prioridadesSnap.docs.find(d => d.id === PRIORIDADE_DOC_ID)
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data()
        if (Array.isArray(data.lista)) {
          setDemandas(data.lista)
        }
      }
      setCarregouPrioridades(true)
    } catch (error) {
      message.error('Erro ao buscar prioridades')
      setCarregouPrioridades(true)
    }
  }

  // Salva prioridades no banco
  const salvarPrioridades = async (lista: DemandaPriorizada[]) => {
    try {
      await setDoc(doc(firestore, 'prioridade', PRIORIDADE_DOC_ID), {
        lista
      })
    } catch (error) {
      message.error('Erro ao salvar prioridades')
    }
  }

  useEffect(() => {
    fetchDemandas()
    fetchPrioridades()
  }, [])

  // Sempre que demandas mudar, salva no banco (mas só depois do carregamento inicial)
  useEffect(() => {
    if (carregouPrioridades) {
      salvarPrioridades(demandas)
    }
  }, [demandas, carregouPrioridades])

  const handleAdicionarDemanda = async (values: { demandaId: string }) => {
    try {
      const novaDemanda = todasDemandas.find(d => d.id === values.demandaId)
      if (novaDemanda) {
        const novasDemandas = [
          ...demandas,
          { ...novaDemanda, prioridade: demandas.length + 1 }
        ]
        setDemandas(novasDemandas)
        setIsModalVisible(false)
        form.resetFields()
        message.success('Demanda adicionada com sucesso!')
      }
    } catch (error) {
      message.error('Erro ao adicionar demanda')
    }
  }

  const abrirModal = async () => {
    await fetchDemandas()
    setIsModalVisible(true)
  }

  const moverDemanda = (index: number, direcao: 'cima' | 'baixo') => {
    if (
      (direcao === 'cima' && index === 0) || 
      (direcao === 'baixo' && index === demandas.length - 1)
    ) {
      return
    }
    const novasDemandas = [...demandas]
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1
    const temp = novasDemandas[index]
    novasDemandas[index] = novasDemandas[novoIndex]
    novasDemandas[novoIndex] = temp
    const demandasAtualizadas = novasDemandas.map((demanda, idx) => ({
      ...demanda,
      prioridade: idx + 1
    }))
    setDemandas(demandasAtualizadas)
  }

  const removerDemanda = (index: number) => {
    const novasDemandas = demandas.filter((_, idx) => idx !== index)
    const demandasAtualizadas = novasDemandas.map((demanda, idx) => ({
      ...demanda,
      prioridade: idx + 1
    }))
    setDemandas(demandasAtualizadas)
  }

  const columns = [
    {
      title: 'Prioridade',
      dataIndex: 'prioridade',
      key: 'prioridade',
      width: 100,
      render: (prioridade: number) => (
        <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
          # {String(prioridade).padStart(2, '0')}
        </span>
      ),
    },
    {
      title: 'Nº',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Link
          to={`/detalhes-solicitacao/${id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-mono font-medium"
        >
          {id}
        </Link>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
    },
    {
      title: 'Responsável',
      dataIndex: 'responsavel',
      key: 'responsavel',
      width: 180,
      render: (responsavel: string) => (
        <span className="text-gray-700 font-medium">{responsavel || '-'}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
          status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {status === 'pendente' ? 'Pendente' :
           status === 'em_andamento' ? 'Em Andamento' :
           'Concluída'}
        </span>
      ),
    },
    {
      title: 'Urgência',
      dataIndex: 'urgencia',
      key: 'urgencia',
      width: 150,
      render: (urgencia: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          urgencia === 'alta' ? 'bg-red-100 text-red-800' :
          urgencia === 'media' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {urgencia === 'alta' ? 'Alta' :
           urgencia === 'media' ? 'Média' :
           'Baixa'}
        </span>
      ),
    },
    ...(isAdminOrTI ? [
      {
        title: 'Mover',
        key: 'mover',
        width: 100,
        render: (_: any, record: DemandaPriorizada, index: number) => (
          <div className="flex flex-col items-center">
            <Button
              type="text"
              icon={<ArrowUpOutlined />}
              onClick={() => moverDemanda(index, 'cima')}
              disabled={index === 0}
              className="p-0 h-6"
            />
            <Button
              type="text"
              icon={<ArrowDownOutlined />}
              onClick={() => moverDemanda(index, 'baixo')}
              disabled={index === demandas.length - 1}
              className="p-0 h-6"
            />
          </div>
        ),
      },
      {
        title: 'Ações',
        key: 'acoes',
        width: 80,
        render: (_: any, record: DemandaPriorizada, index: number) => (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removerDemanda(index)}
          />
        ),
      },
    ] : []),
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Demandas por Prioridade</h1>
        <p className="text-gray-600">Gerencie a ordem de prioridade das demandas do sistema</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          {isAdminOrTI && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={abrirModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Adicionar Demanda
            </Button>
          )}
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={demandas}
          pagination={false}
          className="[&_.ant-table-thead_.ant-table-cell]:bg-gray-50"
        />
      </div>

      <Modal
        title="Adicionar Demanda"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="[&_.ant-modal-content]:rounded-lg" width={800}
      >
        <Form form={form} onFinish={handleAdicionarDemanda}>
          <Form.Item
            name="demandaId"
            label="Selecione a Demanda"
            rules={[{ required: true, message: 'Por favor, selecione uma demanda' }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const value = String(option?.value ?? '')
                let label = ''
                if (typeof option?.children === 'string') {
                  label = option.children
                } else if (Array.isArray(option?.children)) {
                  label = option.children.join(' ')
                }
                return (
                  value.toLowerCase().includes(input.toLowerCase()) ||
                  label.toLowerCase().includes(input.toLowerCase())
                )
              }}
            >
              {todasDemandas.map(demanda => (
                <Select.Option key={demanda.id} value={demanda.id}>
                  {demanda.id} - {demanda.titulo}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700">
              Adicionar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
