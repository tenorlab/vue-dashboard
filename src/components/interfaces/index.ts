// @tenorlab/vue-dashboard
// file: src/components/interfaces/index.ts
export * from './core-vue.interfaces'
export * from './vue-specific'

// TODO: should we move this into dashboard-core?
export type TWidgetErrorExtraProps = {
  versionMismatch: boolean
  requiredVer: string
  hostVer: string
  errorMessage: string
  externalDependencies: string[]
}
