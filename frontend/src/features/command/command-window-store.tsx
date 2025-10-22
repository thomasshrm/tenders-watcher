import { createContext, useContext, useState, type ReactNode } from "react"
import { CommandSizes, type CommandCode } from "./command-registry"

export type WindowInstance = {
  id: string
  code: CommandCode
  args?: any
  x: number
  y: number
  w: number
  h: number
  z: number
}

type Ctx = {
  windows: WindowInstance[]
  open: (code: CommandCode, args?: any) => void
  focus: (id: string) => void
  close: (id: string) => void
  move: (id: string, x: number, y: number) => void
}

const CtxWin = createContext<Ctx | null>(null)
let zTop = 100
const rnd = () => Math.random().toString(36).slice(2, 9)

export function CommandWindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([])

  const open: Ctx["open"] = (code, args) => {
    const size = CommandSizes[code]
    setWindows(ws => [
      ...ws,
      {
        id: rnd(),
        code,
        args,
        x: 60 + ws.length * 24,
        y: 100 + ws.length * 24,
        w: size.w,
        h: size.h,
        z: ++zTop,
      },
    ])
  }

  const focus: Ctx["focus"] = (id) =>
    setWindows(ws => ws.map(w => (w.id === id ? { ...w, z: ++zTop } : w)))

  const close: Ctx["close"] = (id) =>
    setWindows(ws => ws.filter(w => w.id !== id))

  const move: Ctx["move"] = (id, x, y) =>
    setWindows(ws => ws.map(w => (w.id === id ? { ...w, x, y } : w)))

  return (
    <CtxWin.Provider value={{ windows, open, focus, close, move }}>
      {children}
    </CtxWin.Provider>
  )
}

export const useCommandWindows = () => {
  const ctx = useContext(CtxWin)
  if (!ctx) throw new Error("useCommandWindows must be used inside provider")
  return ctx
}
