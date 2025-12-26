<script setup lang="ts">
import { computed } from 'vue'
import { getDistinctCssClasses, ensureZoomScaleIsWithinRange } from '@tenorlab/dashboard-core'
import type { IDashboardGridProps } from './interfaces/core-vue.interfaces'

const props = defineProps<IDashboardGridProps>()

const computedAdditionalColumns = (transformScale: number): number => {
  if (transformScale < 0.8) {
    return 1
  } else if (transformScale <= 1) {
    return 0
  } else if (transformScale > 1) {
    return -1
  }
  return 0
}

const style = computed(() => {
  let transformScale = ensureZoomScaleIsWithinRange(Number(props.zoomScale || 0))
  return {
    '--bwj-dashboard-transform-scale': transformScale,
    '--bwj-dashboard-add-cols': computedAdditionalColumns(transformScale),
  }
})

const cssClasses = computed(() => {
  return getDistinctCssClasses(
    'dashboard-main-grid w-full',
    props.isEditing ? 'editing' : '',
    props.responsiveGrid ? 'responsive-grid' : '',
    `border border-dashed ${props.isEditing ? 'border-primary border-opacity-50' : 'border-transparent'}`,
  )
})
</script>

<template>
  <div :class="cssClasses" :style="style">
    <slot></slot>
  </div>
</template>
