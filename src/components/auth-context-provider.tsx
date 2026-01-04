"use client"

import { createContext, useContext, ReactNode } from "react"
import { MembershipRole } from "@/generated/client/enums"

interface AuthContextType {
  userRole: MembershipRole | null
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
})

export function AuthContextProvider({ 
  children, 
  userRole 
}: { 
  children: ReactNode, 
  userRole: MembershipRole 
}) {
  return (
    <AuthContext.Provider value={{ userRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
