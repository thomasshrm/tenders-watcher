// src/features/command/SingleWindow.tsx
import { useRef } from "react"
import { X } from "lucide-react"
import { CommandViews, COMMANDS } from "./command-registry"
import type { WindowInstance } from "./command-window-store"

type Props = {
  w: WindowInstance
  close: (id: string) => void
  focus: (id: string) => void
  move: (id: string, x: number, y: number) => void
}

export function SingleWindow({ w, close, focus, move }: Props) {
  const View: React.ComponentType<any> = CommandViews[w.code]
  const dragRef = useRef<{ mx: number; my: number; x0: number; y0: number } | null>(null)

  const clamp = (x: number, y: number) => {
    const PAD = 8
    const maxX = window.innerWidth - w.w - PAD
    const maxY = window.innerHeight - w.h - PAD
    return {
      x: Math.max(PAD, Math.min(x, maxX)),
      y: Math.max(48, Math.min(y, maxY)),
    }
  }

  const onHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-nodrag]")) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { mx: e.clientX, my: e.clientY, x0: w.x, y0: w.y }
    focus(w.id)
    e.preventDefault()
  }
  const onHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.mx
    const dy = e.clientY - dragRef.current.my
    const { x, y } = clamp(dragRef.current.x0 + dx, dragRef.current.y0 + dy)
    move(w.id, x, y)
  }
  const onHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    }
    dragRef.current = null
  }

  return (
    <div
      className="absolute pointer-events-auto rounded-lg border border-neutral-800 bg-[#0f0f10] shadow-2xl select-none"
      style={{
        transform: `translate(${w.x}px, ${w.y}px)`,
        zIndex: w.z,
        width: `${w.w}px`,
        height: `${w.h}px`,
      }}
      role="dialog"
      aria-modal="true"
      onMouseDown={() => focus(w.id)}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 cursor-grab active:cursor-grabbing"
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
      >
        <div className="text-sm text-neutral-100 flex items-center gap-2">
          {COMMANDS[w.code].label}
        </div>
        <a
          data-nodrag
          onClick={() => close(w.id)}
          className="h-8 w-8 grid place-items-center hover:bg-neutral-900 rounded"
          aria-label="Close"
        >
          <X className="h-3 w-3 text-neutral-300" />
        </a>
      </div>

      <div className="p-5 overflow-auto h-[calc(100%-44px)]">
        <View {...(w.args ?? {})} />
      </div>
    </div>
  )
}
