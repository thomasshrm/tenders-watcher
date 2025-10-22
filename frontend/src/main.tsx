import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/routes/router.tsx'
import './index.css'
import { CommandModalProvider } from "./features/command/command-modal-store";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div style={{ padding: 24 }}>Chargement…</div>}>
      <CommandModalProvider>
        <RouterProvider router={router} />
      </CommandModalProvider>
    </Suspense>
  </StrictMode>,
)
