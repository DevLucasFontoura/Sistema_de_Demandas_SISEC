// src/utils/generateId.ts

// Armazena os IDs já utilizados
const usedIds = new Set<string>()

export function generateUniqueId(): string {
  let id: string
  do {
    // Gera um número aleatório de 6 dígitos
    id = Math.floor(100000 + Math.random() * 900000).toString()
  } while (usedIds.has(id)) // Continua gerando até encontrar um ID único

  usedIds.add(id) // Adiciona o novo ID ao conjunto de IDs usados
  return id
}