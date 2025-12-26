<script setup lang="ts">
import { computed } from 'vue'
import { ITextFieldProps } from './interfaces'

const props = withDefaults(defineProps<ITextFieldProps>(), {
  size: 'medium',
  className: '',
  placeholder: '',
})

// Define the events this component can emit
const emit = defineEmits<{
  // 1. Standard event for v-model binding
  (event: 'update:modelValue', args: string): void
  // 2. Custom event to pass the raw KeyboardEvent object
  (event: 'keydown', args: KeyboardEvent): void
}>()

/**
 * Emits the standard Vue v-model update event.
 */
const updateValue = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

/**
 * Computed property to determine size-specific CSS classes.
 */
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      // Smaller padding and text size
      return 'py-1.5 px-3 text-sm'
    case 'medium':
    default:
      // Default padding and text size
      return 'py-2.5 px-4 text-base'
  }
})

// NOTE: Since the utility 'getDistinctCssClasses' is unavailable,
// we will rely on standard string concatenation and template binding.

// Base styles for the outer div
const cssClasses = computed(() => {
  // Equivalent to getDistinctCssClasses(`flex flex-col mb-4`, className)
  return `flex flex-col mb-4 ${props.className}`
})

// Base styles for the input element
const inputBaseClasses = `
  block w-full rounded-md px-3 py-1.5 text-base 
  bg-formfield content-formfield
  outline-1 -outline-offset-1 outline-primary 
  placeholder:text-disabled 
  focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-200 sm:text-sm/6
`

// Combine all classes for the input element
const inputClasses = computed(() => {
  return `${inputBaseClasses} ${sizeClasses.value}`
})
</script>

<template>
  <div :class="cssClasses">
    <label :for="props.label" class="block text-sm/6 font-medium mb-1.5">
      {{ props.label }}
    </label>
    <input
      :id="props.label"
      type="text"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :class="inputClasses"
      :aria-label="props.label"
      @input="updateValue"
      @keydown="emit('keydown', $event)"
    />
  </div>
</template>
