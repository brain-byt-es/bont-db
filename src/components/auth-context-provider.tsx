"use client"

import { createContext, useContext, ReactNode } from "react"
import { MembershipRole, Plan } from "@/generated/client/enums"

interface AuthContextType {
  userRole: MembershipRole | null
  userPlan: Plan | null
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  userPlan: null,
})

export function AuthContextProvider({ 
  children, 
  userRole,
  userPlan
}: { 
  children: ReactNode, 
  userRole: MembershipRole,
  userPlan: Plan
}) {
  return (
    <AuthContext.Provider value={{ userRole, userPlan }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
