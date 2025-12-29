// file: vite.config.ts
/// <reference types="vite/client" />

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'path'
import { name } from './package.json'
const projectName = name.replace('@tenorlab/', '').trim().toLowerCase()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      isProduction: true, // Ensures Vue is built in production mode
    }),
    dts({
      rollupTypes: true,
      bundledPackages: ['@tenorlab/dashboard-core'],
      // This ensures the plugin looks at the root of your project
      // and follows the devDependencies into node_modules
      compilerOptions: {
        moduleResolution: 100, // Bundler
        noEmit: false,
      },
      // Sometimes the plugin needs to be told exactly which
      // files to include for the rollup process
      afterDiagnostic: (diagnostics) => {
        // This helps debug if TS is failing to find the core types
        if (diagnostics.length > 0) {
          console.log('TS Diagnostics found during dts generation')
        }
      },
    }),
  ],
  envDir: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  define: {
    // This is the "Magic Bullet": It tells Vue to skip HMR and Dev checks
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_PROD_DEVTOOLS__: 'false',
  },
  build: {
    lib: {
      // Switching to object syntax for multiple outputs
      entry: {
        'vue-dashboard': path.resolve(__dirname, 'src/index.ts'),
        core: path.resolve(__dirname, 'src/core.ts'),
      },
      formats: ['es'],
      name: projectName,
      fileName: (format) => `${projectName}.${format}.js`,
    },
    rollupOptions: {
      // THIS IS VITAL: The SDK must not contain Vue code
      external: ['vue', '@tenorlab/dashboard-core'],
      output: {
        // // This ensures your main file is named vue-dashboard.es.js
        // // and core is named core.es.js
        // entryFileNames: (chunkInfo) => {
        //   // Matches the key in your lib.entry object
        //   return chunkInfo.name === 'vue-dashboard' ? 'vue-dashboard.es.js' : '[name].es.js'
        // },
        // // If shared code is split out, name it something recognizable
        // chunkFileNames: 'chunks/[name].js',
        // assetFileNames: (assetInfo) => {
        //   const name = assetInfo.names?.[0] ?? assetInfo.name
        //   if (name && name.endsWith('.css')) {
        //     return 'styles.css'
        //   }
        //   return '[name][extname]'
        // },

        // Ensure NO chunks are created.
        // This forces everything into the entry files.
        manualChunks: undefined,
        preserveModules: false,
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'vue-dashboard' ? 'vue-dashboard.es.js' : '[name].es.js'
        },
        // 3. THE MAGIC BIT:
        // This tells Rollup: "When you see an import for @tenorlab/dashboard-core,
        // rewrite the path to @tenorlab/vue-dashboard/core in the final JS."
        paths: {
          '@tenorlab/dashboard-core': '@tenorlab/vue-dashboard/core',
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name
          if (name && name.endsWith('.css')) {
            return 'styles.css'
          }
          return '[name][extname]'
        },
      },
    },
  },
})
