<script setup lang="ts">
import { computed } from 'vue'
import { IButtonProps } from './interfaces'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'

const props = withDefaults(defineProps<IButtonProps>(), {
  disabled: false,
  type: 'normal', // or 'ghost'
  category: 'primary',
  font: 'semibold',
  border: 0,
  borderHover: 1,
  borderColor: '',
  px: 0.7,
  py: 0.25,
  shadow: 'sm',
  shadowHover: 'md',
  justifyCss: 'justify-center',
  addCss: '',
})

const emits = defineEmits<{
  (event: 'click', args: MouseEvent): void
}>()

// const rest = computed(() => {
//   const { tooltip: _0, className: _1, isIconButton: _2, ...rest } = props
//   return rest
// })

const cssStrategy = new Map<string, string>([
  [
    'normal',
    `group bg-[category] content-[category] hover:bg-[category] group-hover:bg-[category] focus:outline-[category] focus:outline-offset-[category]`,
  ],
  [
    'ghost',
    `group bg-transparent border-[category] text-[category] hover:text-[category] group-hover:text-[category] focus:outline-[category] focus:outline-offset-[category]`,
  ],
])

// const cssClass = computed(() => {
//   return props.isIconButton
//     ? getDistinctCssClasses(
//         `flex flex-row items-center`,
//         props.disabled ? 'text-disabled' : 'text-primary hover:brightness-110 cursor-pointer',
//         props.className || '',
//       )
//     : getDistinctCssClasses(
//         `flex w-full justify-center rounded-md`,
//         `px-3 py-1.5 text-sm/6 font-semibold`,
//         `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`,
//         props.disabled
//           ? 'text-disabled'
//           : 'bg-primary content-primary hover:brightness-110 cursor-pointer',
//         props.className || '',
//       )
// })

const cssClass = computed((): string => {
  const isIconButton = props.isIconButton || false
  const category = props.category || 'primary'
  const buttonType = props.type || 'normal'
  const disabled = props.disabled || false
  const className = props.className || ''
  const font = props.font || ''
  const border = Number((props.border || 0) > 0 ? props.border : 0)
  let borderColor = (props.borderColor || '').trim()
  borderColor = borderColor.length > 0 ? borderColor : ''
  const borderHover = Number((props.borderHover || 0) > 0 ? props.borderHover : 0)
  const shadow = props.shadow || 'sm'
  const shadowHover = props.shadowHover || 'md'
  const addCss = (props.addCss || '').trim()
  const justifyCss = props.justifyCss || 'justify-center'

  if (isIconButton) {
    return getDistinctCssClasses(
      `flex flex-row items-center`,
      disabled ? 'text-disabled' : `text-${category} hover:brightness-110 cursor-pointer`,
      className || '',
    )
  }
  const result = [
    'relative cursor-pointer',
    'rounded-sm focus:outline-none focus:ring focus:ring-offset',
    `transition-all duration-150`,
    `text-sm`,
    `font-${font}`,
  ]

  if (disabled) {
    // these are the button CSS classes when disabled
    //result.push('bg-disabled content-disabled border-disabled opacity-50 cursor-not-allowed')
    if (buttonType === 'ghost') {
      result.push('text-disabled border-disabled cursor-not-allowed')
    } else {
      result.push('bg-disabled content-disabled border-disabled cursor-not-allowed')
    }
  } else {
    result.push('cursor-pointer')
    // these are the button CSS classes when enabled
    let template = ''
    if (cssStrategy.has(buttonType)) {
      template = `${cssStrategy.get(buttonType)}`
    } else {
      template = `${cssStrategy.get('normal')}`
    }

    if (border < 1) {
      template = template.replace('border-[category]', '')
    }

    const mainCss = template.replaceAll(`[category]`, category).trim()
    result.push(mainCss)
  }

  // by default we have a border that is transparent so always add with at least 1px

  if (border > 0) {
    result.push(`border-[${border}px]`)
    result.push(`border-${borderColor}`)
  } else {
    result.push(`border-[1px]`)
    result.push(`border-transparent`)
  }

  if (borderHover > 0) {
    result.push(`hover:border-[${borderHover}px] group-hover:border-[${borderHover}px]`)
    // apply color
    result.push(`hover:border-${borderColor} group-hover:border-${borderColor}`)
  } else {
    result.push(`hover:border-[1px] group-hover:border-[1px]`)
  }

  if (shadow) {
    result.push(`shadow-${shadow}`)
  }
  if (shadowHover) {
    result.push(`hover:shadow-${shadowHover} group-hover:shadow-${shadowHover}`)
  }

  // addCss will have additional CSS classes
  // we want to apply from where we consume this component
  if (addCss.length > 0) {
    result.push(addCss)
  }
  if (addCss.indexOf('hidden') === -1) {
    result.push('inline-flex')
  }

  result.push(justifyCss)
  return result.join(' ').trim()
})

const style = computed(() => {
  return {
    padding: props.isIconButton ? 0 : `${props.py}rem ${props.px}rem `,
  }
})

const onClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emits('click', event)
}
</script>

<template>
  <button
    type="button"
    :class="cssClass"
    :style="style"
    :title="tooltip?.title"
    :disabled="disabled"
    @click.stop="onClick"
  >
    <slot></slot>
  </button>
</template>
