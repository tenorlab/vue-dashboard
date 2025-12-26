<script setup lang="ts">
import { computed } from 'vue'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'

export type TStackProps = {
  testId?: string
  classNames?: string
  direction?: 'row' | 'column'
  style?: Record<string, any>
}

const props = defineProps<TStackProps>()

const rest = computed(() => {
  const { testId: _, classNames: _0, direction: _1, ...rest } = props
  return rest
})

const cssClasses = computed(() => {
  if (props.direction === 'row') {
    return getDistinctCssClasses(`flex flex-row items-center gap-2`, props.classNames || '')
  }
  return getDistinctCssClasses(`flex flex-col gap-2 w-full`, props.classNames || '')
})
</script>

<template>
  <div :data-testid="testId || 'not-set'" :class="cssClasses" v-bind="rest">
    <slot></slot>
  </div>
</template>
