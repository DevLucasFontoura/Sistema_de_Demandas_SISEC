import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../services/firebaseConfig'
import { User } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'

interface AuthContextType {
  user: User & { role?: string } | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  userType: string | undefined
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: async () => {},
  userType: undefined,
  logout: async () => {}
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User & { role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<string>()
  const firestore = getFirestore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'usuarios', user.uid))
        const userData = userDoc.data()
        setUser({ ...user, role: userData?.tipo })
        setUserType(userData?.tipo)
      } else {
        setUser(null)
        setUserType(undefined)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [firestore])

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(firestore, 'usuarios', userCredential.user.uid))
      const userData = userDoc.data()
      
      setUser({
        ...userCredential.user,
        role: userData?.tipo
      })
      setUserType(userData?.tipo)
      
      console.log('Login successful, user:', userCredential.user.uid, 'role:', userData?.tipo)
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserType(undefined)
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, userType, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 