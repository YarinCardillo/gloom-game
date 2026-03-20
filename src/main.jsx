import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Gloom from './Gloom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Gloom />
  </StrictMode>,
)
