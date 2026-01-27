<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronDownIcon } from './icons'
import { useClickOutside } from '@builtwithjavascript/use-click-outside'

interface TProps {
  testid?: string
  label?: string
  hideLabel?: boolean
  showChevron?: boolean
  addOptionLabel?: string
  hide?: boolean
  enabled: boolean
  isMenuOpen: boolean
  // toggleOpen: () => void
}

const props = withDefaults(defineProps<TProps>(), {
  testid: 'not-set',
  label: '',
  hideLabel: false,
  showChevron: false,
  addOptionLabel: '',
  hide: false,
})

const emits = defineEmits<{
  (e: 'toggleOpen', args: boolean): any
}>()

const refDropdown = ref<Element>()

const onMenuButtonClick = () => {
  emits('toggleOpen', !props.isMenuOpen)
}

const buttonCss = computed(() => {
  return `
    group max-w-xs 
    p-1 sm:p-2 rounded-md
    rounded-full flex items-center 
    text-sm 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary 
    content-topbar
    ${props.enabled ? 'hover:text-primary cursor-pointer' : 'opacity-50'}
  `.trim()
})

const buttonLabelCss = `
    ${props.hideLabel ? 'sr-only' : 'hidden ml-3 text-sm font-medium lg:block'}
  `.trim()
const buttonIconCss = `
    hidden flex-shrink-0 ml-1 size-4 lg:block
  `.trim()

const popupContainerCss = computed(() => {
  const results = [
    'absolute flex flex-col right-0 z-50 mt-2 w-56 origin-top-right',
    //'overflow-clip',
  ]
  results.push('rounded-md shadow-md')
  results.push('ring-1 ring-black ring-opacity-5')
  results.push('focus:outline-none')
  results.push('bg-formfield content-formfield')
  return results.join(' ').trim()
})

onMounted(() => {
  useClickOutside(refDropdown.value as any, () => {
    emits('toggleOpen', false)
  })
})
</script>

<template>
  <div ref="refDropdown" v-show="!props.hide" class="relative inline-block text-left">
    <button
      type="button"
      :class="buttonCss"
      aria-expanded="true"
      aria-haspopup="true"
      @click.stop="onMenuButtonClick"
    >
      <slot name="icon"></slot>
      <span :class="buttonLabelCss">{{ label }} </span>
      <ChevronDownIcon v-if="showChevron" :class="buttonIconCss" aria-hidden="true" />
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isMenuOpen"
        :class="popupContainerCss"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabindex="-1"
      >
        <div
          class="form-dropdown-menu overflow-clip flex flex-col grow rounded-md justify-center w-full h-full bg-sidebar content-sidebar bg-opacity-95"
          style="padding: 0 !important"
        >
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>
