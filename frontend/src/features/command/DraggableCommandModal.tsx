import { useEffect, useRef, useState } from "react";
import { X, Move } from "lucide-react";
import { useCommandModal } from "./command-modal-store";

/**
 * Modal flottante, déplaçable, indépendante du flux de page.
 * - Drag via la barre d’en-tête
 * - Reste dans l’écran
 * - Esc pour fermer
 */
export default function DraggableCommandModal() {
  const { open, payload, close } = useCommandModal();
  const [pos, setPos] = useState<{x:number; y:number}>({ x: 40, y: 80 });
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{mx:number; my:number; x0:number; y0:number} | null>(null);

  // fermer avec ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // maintient la fenêtre dans l’écran
  const clampToViewport = (x:number, y:number) => {
    const w = 560;           // largeur modale
    const h = 360;           // hauteur approx (min)
    const pad = 8;
    const maxX = window.innerWidth - w - pad;
    const maxY = window.innerHeight - h - pad;
    return { x: Math.max(pad, Math.min(x, maxX)), y: Math.max(48, Math.min(y, maxY)) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    startRef.current = { mx: e.clientX, my: e.clientY, x0: pos.x, y0: pos.y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.mx;
    const dy = e.clientY - startRef.current.my;
    setPos(clampToViewport(startRef.current.x0 + dx, startRef.current.y0 + dy));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    startRef.current = null;
    setDragging(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60">
      {/* backdrop très léger */}
      <div className="absolute inset-0 bg-black/30" onClick={close} />

      {/* fenêtre */}
      <div
        className="absolute w-[560px] rounded-lg border border-neutral-800 bg-[#0f0f10] shadow-2xl"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        role="dialog"
        aria-modal="true"
      >
        {/* header = handle de déplacement */}
        <div
          className={`flex items-center justify-between px-3 py-2 border-b border-neutral-800 select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <Move className="h-4 w-4" />
            <span>Expert <span className="ml-2 rounded bg-blue-900/40 px-2 py-[2px] text-[11px] text-blue-300">Beta</span></span>
          </div>
          <button
            onClick={close}
            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-neutral-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* contenu */}
        <div className="p-5 text-sm text-neutral-200">
          {/* Ici tu affiches la commande et son UI */}
          <div className="mb-4 text-neutral-400">
            {payload?.label ?? payload?.code ?? "Command"}
          </div>

          {/* exemple de contenu : invite à se connecter */}
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-neutral-300">Create an account to access this feature</p>
            <div className="flex gap-2">
              <button className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500">Register</button>
              <button className="rounded border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-900">Log in</button>
            </div>
          </div>
        </div>

        {/* footer optionnel */}
        <div className="border-t border-neutral-800 px-3 py-2 text-[11px] text-neutral-500">
          Press <kbd className="rounded border border-neutral-700 bg-neutral-900 px-1">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
