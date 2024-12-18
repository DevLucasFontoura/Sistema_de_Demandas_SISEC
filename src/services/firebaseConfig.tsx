import { initializeApp } from '@firebase/app'
import { getFirestore } from '@firebase/firestore'
import { getAuth } from '@firebase/auth'

const firebaseConfig = {
  // Substitua com suas configurações do Firebase
  apiKey: "AIzaSyCKI4GJzcQM6-mDjd4tbhQlMFiOvewBnnA",
  authDomain: "demandasisec.firebaseapp.com",
  projectId: "demandasisec",
  storageBucket: "demandasisec.firebasestorage.app",
  messagingSenderId: "456815001758",
  appId: "1:456815001758:web:4eb594a648eb48cf0fbb8f",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app) 