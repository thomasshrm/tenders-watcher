// src/features/command/CommandWindowsLayer.tsx
import { SingleWindow } from "./SingleWindow";
import { useCommandWindows } from "./command-window-store";


export default function CommandWindowsLayer() {
  const { windows, close, focus, move } = useCommandWindows()
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {windows.map(w => (
        <SingleWindow key={w.id} w={w} close={close} focus={focus} move={move} />
      ))}
    </div>
  )
}
