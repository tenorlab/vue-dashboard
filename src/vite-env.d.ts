/// <reference types="vite/client" />

// Tell TypeScript the global exists
declare const __HOST_VUE_VERSION__: string
declare const __HOST_TENORLAB_DASHBOARD_SDK_VERSION__: string

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
