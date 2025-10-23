import { type ReactNode } from "react";
import { useAuth } from "./auth-context";

export function ModuleIfGuest({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return null;
  return <>{children}</>;
}