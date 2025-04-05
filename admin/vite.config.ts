import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mui/system': '@mui/system/esm',
      '@mui/system/RtlProvider': '@mui/system/esm/RtlProvider'
    }
  },
  optimizeDeps: {
    include: ['@mui/system', '@mui/material', '@mui/icons-material']
  }
})
