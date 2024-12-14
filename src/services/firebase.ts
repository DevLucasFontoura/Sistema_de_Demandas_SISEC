import { initializeApp } from '@firebase/app'
import { getFirestore } from '@firebase/firestore'
import { getAuth } from '@firebase/auth'

const firebaseConfig = {
  // Substitua com suas configurações do Firebase
  apiKey: "sua-api-key",
  authDomain: "seu-auth-domain",
  projectId: "seu-project-id",
  storageBucket: "seu-storage-bucket",
  messagingSenderId: "seu-messaging-sender-id",
  appId: "seu-app-id"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app) 