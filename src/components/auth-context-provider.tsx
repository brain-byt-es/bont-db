"use client"

import { createContext, useContext, ReactNode } from "react"
import { MembershipRole, Plan } from "@/generated/client/enums"

interface AuthContextType {
  userRole: MembershipRole | null
  userPlan: Plan | null
  userId: string | null
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  userPlan: null,
  userId: null,
})

export function AuthContextProvider({ 
  children, 
  userRole,
  userPlan,
  userId
}: { 
  children: ReactNode, 
  userRole: MembershipRole,
  userPlan: Plan,
  userId: string
}) {
  return (
    <AuthContext.Provider value={{ userRole, userPlan, userId }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
