import { createContext, useContext, useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

const UsersContext = createContext()

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('totalPoints', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersMap = new Map()
        snapshot.docs.forEach(doc => {
          usersMap.set(doc.id, {
            uid: doc.id,
            ...doc.data()
          })
        })
        const usersData = Array.from(usersMap.values())
        setUsers(usersData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching users:', error)
        if (error.code === 'failed-precondition') {
          console.warn('Index not found, fetching without orderBy')
          const qNoOrder = query(usersRef)
          const unsubscribeNoOrder = onSnapshot(qNoOrder, (snapshot) => {
            const usersMap = new Map()
            snapshot.docs.forEach(doc => {
              usersMap.set(doc.id, {
                uid: doc.id,
                ...doc.data()
              })
            })
            const usersData = Array.from(usersMap.values())
            // Sort by totalPoints manually
            usersData.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
            setUsers(usersData)
            setLoading(false)
          }, (err) => {
            console.error('Error fetching users without orderBy:', err)
            setLoading(false)
          })
          return () => unsubscribeNoOrder()
        } else {
          setLoading(false)
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <UsersContext.Provider
      value={{
        users,
        loading
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider')
  }
  return context
}

