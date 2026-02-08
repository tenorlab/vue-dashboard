<script setup lang="ts" generic="K extends TDashboardWidgetKey = TDashboardWidgetKey">
import { computed } from 'vue'
import WidgetContainer from './WidgetContainer.vue'
import { useWidgetEmits } from './use-widget-emits'
import type { TDashboardWidgetKey } from '@tenorlab/dashboard-core'
import type { IDashboardWidgetProps, TWidgetEmits } from './interfaces/'

const props = withDefaults(defineProps<IDashboardWidgetProps>(), {
  title: '',
  size: 'default',
  direction: 'row',
  highlight: false,
  widgetKey: undefined,
  parentWidgetKey: undefined,
  placeholder: '',
})

const _emits = defineEmits<TWidgetEmits>()
const emitHandlers = useWidgetEmits(_emits)

const rest = computed(() => {
  const { direction: _0, ...rest } = props
  return rest
})
</script>
<template>
  <WidgetContainer direction="row" v-bind="rest" v-on="emitHandlers">
    <slot></slot>
  </WidgetContainer>
</template>
