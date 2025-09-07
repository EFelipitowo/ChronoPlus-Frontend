import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // <-- Nuevo plugin SWC
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
})