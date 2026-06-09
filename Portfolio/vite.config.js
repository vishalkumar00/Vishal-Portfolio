import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // served from https://vishalkumar00.github.io/Vishal-Portfolio/
  base: '/Vishal-Portfolio/',
  plugins: [react()],
})
