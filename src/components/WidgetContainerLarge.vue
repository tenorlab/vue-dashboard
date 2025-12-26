<script setup lang="ts" generic="K extends TDashboardWidgetKey = TDashboardWidgetKey">
import { computed } from 'vue'
import WidgetContainer from './WidgetContainer.vue'
import { useWidgetEmits } from './use-widget-emits'
import { TDashboardWidgetKey } from '@tenorlab/dashboard-core'
import type { IDashboardWidgetProps, TWidgetEmits } from './interfaces/'

const props = withDefaults(defineProps<IDashboardWidgetProps>(), {
  title: '',
  size: 'large',
  direction: 'column',
  highlight: false,
  widgetKey: undefined,
  parentWidgetKey: undefined,
  placeholder: '',
})

const _emits = defineEmits<TWidgetEmits>()
const { removeClick, moveClick, selectContainer } = useWidgetEmits(_emits)

const rest = computed(() => {
  const { size: _0, ...rest } = props
  return rest
})
</script>
<template>
  <WidgetContainer
    size="large"
    v-bind="rest"
    @removeClick="removeClick"
    @moveClick="moveClick"
    @selectContainer="selectContainer"
  >
    <slot></slot>
  </WidgetContainer>
</template>
