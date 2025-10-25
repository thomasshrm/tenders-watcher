// src/features/command/command-registry.ts
import { lazy } from "react"

/**
 * Registry: clé = code de commande
 * On met TOUT ici: label, vue (lazy) et tailles par défaut.
 */
export const COMMANDS = {
  ML: {
    label: "Market Lookup",
    view: lazy(() => import("./views/MarketLookupPanel")),
    size: { w: 1300, h: 700 },
  },
  DC: {
    label: "Descripter Code",
    view: lazy(() => import("./views/DescripteurPanel")),
    size: { w: 700, h: 400 },
  },
  PP: {
    label: "Personal Preferences",
    view: lazy(() => import("./views/PersonalPreferencesPanel")),
    size: { w: 700, h: 400 },
  },
} as const

// Types dérivés automatiquement
export type CommandCode = keyof typeof COMMANDS
export type CommandItem = typeof COMMANDS[CommandCode]

// Aides dérivées (si tu préfères garder tes anciennes API)
export const CommandViews: Record<CommandCode, CommandItem["view"]> = Object.fromEntries(
  Object.entries(COMMANDS).map(([code, meta]) => [code, meta.view])
) as any

export const CommandSizes: Record<CommandCode, CommandItem["size"]> = Object.fromEntries(
  Object.entries(COMMANDS).map(([code, meta]) => [code, meta.size])
) as any

// Liste plate utile pour l’autocomplete / CommandBar
export const CommandList = (Object.entries(COMMANDS).map(([code, meta]) => ({
  code: code as CommandCode,
  label: meta.label,
})) satisfies Array<{ code: CommandCode; label: string }>)
