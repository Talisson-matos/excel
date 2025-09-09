import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import NotFound from './pages/NotFound/NotFound.tsx'
import Insumos from './pages/Insumo/Insumo.tsx'
import Acabado from './pages/Acabado/Acabado.tsx'
import './index.css'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/insumo', element:<Insumos /> },
  { path: '/acabado', element:<Acabado />  },
  { path: '*', element: <NotFound />  }, 
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
