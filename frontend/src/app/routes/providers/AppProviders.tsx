import React from "react";
import { AuthProvider } from "@/features/auth/auth-context";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
      <AuthProvider>{children}</AuthProvider>
  )
}