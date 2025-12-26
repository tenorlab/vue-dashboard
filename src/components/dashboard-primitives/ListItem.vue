<script setup lang="ts">
import { computed } from 'vue'
import Stack, { TStackProps } from './Stack.vue'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'

const props = defineProps<TStackProps & { innerClass?: string }>()

const rest = computed(() => {
  const { classNames: _0, direction: _1, innerClass: _2, ...rest } = props
  return rest
})

const cssClasses = computed(() => {
  return getDistinctCssClasses(props.classNames || '', 'w-full')
})

const innerWrapperCss = getDistinctCssClasses(
  `w-full flex overflow-hidden justify-between items-center gap-0 
      rounded-md border`,
  props.innerClass || '',
)
</script>

<template>
  <Stack direction="row" :class="cssClasses" v-bind="rest">
    <div :class="innerWrapperCss"><slot></slot></div>
  </Stack>
</template>
