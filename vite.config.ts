import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// HashRouter + relative base so the same bundle works at any deploy path:
// ravi9386.github.io/Mymoney/, vermawisdom.com/, or vermawisdom.com/mymoney/.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? './' : '/',
  server: {
    port: 5180,
    open: false
  }
}))
