import React, { useEffect, useMemo, useRef, useState } from "react"
import { useCommandWindows } from "@/features/command/command-window-store";
import { CommandList, type CommandCode } from "@/features/command/command-registry"
import { UserMenu } from "./UserMenu";

export function CommandBar() {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const filtered = useMemo(() => {
    const q = value.toLowerCase().trim()
    if (!q) return CommandList
    return CommandList.filter(c => c.label.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [value])

  const { open } = useCommandWindows();

  const executeCommand = (code: CommandCode) => {
    open(code, { query: value })
    setValue("")
    setFocused(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      const match = CommandList.find(
        (c) =>
          c.code.toLowerCase() === value.toLowerCase().trim() ||
          c.label.toLowerCase() === value.toLowerCase().trim()
      )
      if (match) {
        executeCommand(match.code)           // <-- passe seulement le code
      } else if (filtered.length === 1) {
        executeCommand(filtered[0].code)     // <-- idem
      }
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#111] border-b border-neutral-800">
      {/* Barre + indicateur focus */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center transition-colors">
        <div className="group relative h-10 px-6 flex items-center gap-2 font-mono text-sm text-neutral-200">
          <span className="text-neutral-300 mr-1 select-none">{">"}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              const next = e.relatedTarget as HTMLElement | null
              if (!next?.dataset?.cmdpanel) setFocused(false)
            }}
            onKeyDown={handleKeyDown}
            placeholder={focused ? "Type a command" : "Press / to open terminal..."}
            className="w-full bg-transparent outline-none border-none placeholder:text-neutral-500 caret-neutral-200"
          />
          <span className="w-full pointer-events-none absolute bottom-0 left-6 right-6 h-px origin-left scale-x-0 bg-teal-400/80 transition-transform group-focus-within:scale-x-100" />
        </div>
        <div className="h-10 px-6 flex items-center font-mono text-sm text-neutral-200">
          <UserMenu />
        </div>
      </div>

      {/* Liste visible uniquement quand l’input est focus */}
      <div className="relative">
        {focused && (
          <div
            // panneau aligné à gauche sous la barre
            className="absolute left-6 top-0 mt-1 w-[32vw] min-w-[320px] max-w-[640px]"
            data-cmdpanel
            // empêcher le blur quand on clique dans le panneau
            onMouseDown={(e) => e.preventDefault()}
          >
            {/*<div className="text-xs font-semibold tracking-wider text-neutral-400 mb-2 px-1">
              COMMANDS
            </div>*/}

            <ul
              className="divide-y divide-neutral-800 rounded-md overflow-hidden border border-neutral-800/60 bg-[#111] shadow-lg shadow-black/40"
              data-cmdpanel
              tabIndex={-1}
            >
              {filtered.map((cmd) => (
                <li
                  key={cmd.code}
                  className="flex items-center gap-3 p-2 hover:bg-neutral-900 cursor-pointer transition-colors"
                  data-cmdpanel
                  tabIndex={-1}
                  onClick={() => executeCommand(cmd.code)}
                >
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-800 text-amber-400 font-mono">
                    {cmd.code}
                  </span>
                  <span className="text-sm">{cmd.label}</span>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="p-2 text-neutral-500 text-sm italic" data-cmdpanel>
                  No matching command
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
