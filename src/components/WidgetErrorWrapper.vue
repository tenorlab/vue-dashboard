<script setup lang="ts">
import type {
  TDashboardWidgetKey,
} from '@tenorlab/dashboard-core'
import type {
  IDashboardWidgetProps,
  TWidgetEmits,
} from './interfaces'
import DashboardWidgetBase from './DashboardWidgetBase.vue'
import { useWidgetEmits } from './use-widget-emits'
import { computed } from 'vue'

const props = defineProps<IDashboardWidgetProps>()
const emits = defineEmits<TWidgetEmits>()
const { removeClick: onRemoveClick, moveClick: onMoveClick } = useWidgetEmits(emits)
const extraProps = computed(() => props.extraProps)
</script>

<template>
  <DashboardWidgetBase
    :widgetKey="props.widgetKey"
    title="Widget Error"
    :parentWidgetKey="parentWidgetKey"
    :index="index"
    :maxIndex="maxIndex"
    :isEditing="isEditing"
    @removeClick="onRemoveClick"
    @moveClick="onMoveClick"
  >
    <div class="p-4 border border-dashed border-danger">
      <span class="font-bold">Failed to load "{{ widgetKey }}"</span>
      <div v-if="extraProps?.versionMismatch" class="flex flex-col">
        <span class="font-bold text-sm">Version Mismatch: {{ widgetKey }}</span>
        <div class="flex flex-col text-xs">
          <span>Widget requires: Vue {{ extraProps?.requiredVer }}.</span>
          <span>Host version: {{ extraProps?.hostVer }}.</span>
        </div>
        <div class="flex flex-col mt-3">
          <h5>Externals:</h5>
          <dl class="ml-2 flex flex-col text-xs">
            <dd v-for="(dep, i) in extraProps?.externalDependencies" :key="`dep-${i}`">
              - {{ dep }}
            </dd>
          </dl>
        </div>
      </div>
      <div v-else class="flex flex-col">
        <div class="flex flex-col text-xs italic">
          <span>The remote plugin is unavailable.</span>
        </div>
        <span class="font-bold text-sm">Error Details:</span>
        <div class="flex flex-col mt-3">
          <h5>Details:</h5>
          <div class="text-xs break-all">
            {{ extraProps?.errorMessage || 'Unknown error occurred.' }}
          </div>
        </div>
      </div>
    </div>
  </DashboardWidgetBase>
</template>
