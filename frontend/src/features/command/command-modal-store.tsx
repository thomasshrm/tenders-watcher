import { createContext, useContext, useState, type ReactNode } from "react";

type CommandPayload = { code?: string; label?: string; args?: any };

type Ctx = {
  open: boolean;
  payload: CommandPayload | null;
  openWith: (p: CommandPayload) => void;
  close: () => void;
};

const CommandModalContext = createContext<Ctx | null>(null);

export function CommandModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<CommandPayload | null>(null);

  return (
    <CommandModalContext.Provider
      value={{
        open,
        payload,
        openWith: (p) => { setPayload(p); setOpen(true); },
        close: () => setOpen(false),
      }}
    >
      {children}
    </CommandModalContext.Provider>
  );
}

export function useCommandModal() {
  const ctx = useContext(CommandModalContext);
  if (!ctx) throw new Error("useCommandModal must be used inside provider");
  return ctx;
}
