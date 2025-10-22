import React, { useEffect, useMemo, useRef, useState } from "react"

type Cmd = {
  code: string;
  label: string;
  action: () => void
}

const COMMANDS: Cmd[] = [
  { code: "CF", label: "SEC Filings", action: () => alert("Opening SEC Filings...") },
  { code: "ML", label: "Market Lookup", action: () => alert("Opening Market Lookup...") },
  { code: "US", label: "User Settings", action: () => alert("Opening User Settings...") },
  { code: "LG", label: "Logs Viewer", action: () => alert("Opening Logs Viewer...") },
]

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
    if (!q) return COMMANDS
    return COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.code.toLowerCase().includes(q)
    )
  }, [value])

  const executeCommand = (Cmd: Cmd) => {
    Cmd.action()
    setValue("")
    setFocused(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      const match = COMMANDS.find(
        (c) =>
          c.code.toLowerCase() === value.toLowerCase().trim() ||
          c.label.toLowerCase() === value.toLowerCase().trim()
      )
      if (match) {
        executeCommand(match)
      } else if (filtered.length === 1) {
        executeCommand(filtered[0])
      } else {
        console.log("Unknown command:", value)
      }
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#111] border-b border-neutral-800">
      {/* Barre + indicateur focus */}
      <div className="group focus-within:bg-[#0f0f0f] transition-colors">
        <div className="h-10 px-6 flex items-center gap-2 font-mono text-sm text-neutral-200">
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
        </div>

        {/* Fine barre accent sous l'input visible seulement au focus */}
        <div className="h-px w-full scale-x-0 group-focus-within:scale-x-100 origin-left bg-teal-400/80 transition-transform" />
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
                  onClick={() => executeCommand(cmd)}
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
