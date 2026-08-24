import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Midnight's wasm-bindgen packages contain an intentional JS ↔ WASM import
  // cycle. Vite's dependency pre-bundler flattens that cycle and can evaluate
  // __wbindgen_start before the WASM module has finished initializing. Serve
  // these packages as native async ESM instead.
  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/ledger-v8',
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/zkir-v2',
    ],
  },
  build: {
    target: 'esnext',
  },
  server: {
    host: '0.0.0.0',
  },
  preview: {
    host: '0.0.0.0',
  },
});
