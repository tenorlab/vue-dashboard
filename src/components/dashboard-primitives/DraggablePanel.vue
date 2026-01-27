<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CSSProperties } from 'vue'

// --- Interface Definitions ---

interface IDraggablePanelProps {
  testId?: string
  className: string
  style?: CSSProperties
  zIndex?: number
  onDraggingChange?: (isDragging: boolean) => void
}

const props = defineProps<IDraggablePanelProps>()

// --- Emits (for event communication, replacing the onDraggingChange prop) ---
const emits = defineEmits<{
  (event: 'draggingChange', isDragging: boolean): void
}>()

// --- State and Refs ---

// Ref to the root HTML element of the panel
const panelRef = ref<HTMLElement | null>(null)

// State to track the panel's position, initialized based on default floating styles
const position = ref({ x: 0, y: 0 })

// State to hold the position where the drag started (relative to the viewport)
const dragStart = ref({ x: 0, y: 0 })

// State to hold the panel's position when drag started
const panelStart = ref({ x: 0, y: 0 })

// --- Constants and Styles ---
const zIndex = typeof props.zIndex !== 'undefined' ? Number(props.zIndex) : 99999

const defaultFloatingStyles: CSSProperties = {
  // 1. Take it out of the document flow
  position: 'fixed',
  // 2. Set initial viewport position (e.g., top right)
  top: '6rem',
  right: '1rem',
  // 3. Ensure it stacks above other content
  zIndex,

  // Add your layout/appearance styles
  width: '360px',
  minHeight: '360px',
  borderStyle: 'solid',
  borderWidth: '3px',
  boxShadow: 'rgba(0, 0, 0, 0.5) 7px 7px 10px 0px',
}

// Merge user-provided styles with default floating styles
const mergedStyles = computed(() => {
  return {
    ...defaultFloatingStyles,
    ...(props.style || {}),
    // Override top/right with CSS transform based on position state for dragging
    transform: `translate(${position.value.x}px, ${position.value.y}px)`,
    top: defaultFloatingStyles.top,
    right: defaultFloatingStyles.right,
    // When translating, setting 'left' and 'top' to 0 helps maintain consistent behavior
    left: 'initial',
  }
})

// --- Drag Handlers (Unified Mouse & Touch Implementation) ---

// Helper to extract coordinates regardless of event type
const getCoords = (e: MouseEvent | TouchEvent) => {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
}

// 1. Start Drag (Handles both mousedown and touchstart)
const handleStart = (e: MouseEvent | TouchEvent) => {
  const target = e.target as HTMLElement
  // Check if the event occurred on the designated handle element
  if (!target.closest('.handle')) {
    return
  }

  // Prevent default behavior (scrolling on touch, selection on mouse)
  if (e.cancelable) e.preventDefault()

  // Notify parent dragging started
  emits('draggingChange', true)

  // Record initial positions
  const coords = getCoords(e)
  dragStart.value = { x: coords.x, y: coords.y }
  panelStart.value = { x: position.value.x, y: position.value.y }

  // Attach global listeners for movement and release
  window.addEventListener('mousemove', handleMove)
  window.addEventListener('mouseup', handleEnd)

  // For touch, we use { passive: false } to allow e.preventDefault() during move
  window.addEventListener('touchmove', handleMove, { passive: false })
  window.addEventListener('touchend', handleEnd)
  window.addEventListener('touchcancel', handleEnd)
}

// 2. Move (During Drag)
const handleMove = (e: MouseEvent | TouchEvent) => {
  // Prevent background scrolling while dragging on mobile
  if (e.cancelable) e.preventDefault()

  const coords = getCoords(e)

  // Calculate the difference in position since drag started
  const dx = coords.x - dragStart.value.x
  const dy = coords.y - dragStart.value.y

  // Update the new panel position relative to the starting position
  position.value = {
    x: panelStart.value.x + dx,
    y: panelStart.value.y + dy,
  }
}

// 3. End Drag (Clean up all listeners)
const handleEnd = () => {
  // Clean up global listeners
  window.removeEventListener('mousemove', handleMove)
  window.removeEventListener('mouseup', handleEnd)
  window.removeEventListener('touchmove', handleMove)
  window.removeEventListener('touchend', handleEnd)
  window.removeEventListener('touchcancel', handleEnd)

  // Notify parent dragging stopped (with a slight delay)
  setTimeout(() => {
    emits('draggingChange', false)
  }, 100)
}

// Lifecycle events
onMounted(() => {
  // Attach both mousedown and touchstart listeners
  if (panelRef.value) {
    panelRef.value.addEventListener('mousedown', handleStart)
    panelRef.value.addEventListener('touchstart', handleStart, { passive: false })
  }
})

onUnmounted(() => {
  // Clean up the initial listeners
  if (panelRef.value) {
    panelRef.value.removeEventListener('mousedown', handleStart)
    panelRef.value.removeEventListener('touchstart', handleStart)
  }

  // Ensure global listeners are removed
  window.removeEventListener('mousemove', handleMove)
  window.removeEventListener('mouseup', handleEnd)
  window.removeEventListener('touchmove', handleMove)
  window.removeEventListener('touchend', handleEnd)
  window.removeEventListener('touchcancel', handleEnd)
})
</script>

<template>
  <!-- 
    The panel element acts as both the draggable wrapper and the container.
    We attach the ref here. The mergedStyles (which includes the transform)
    handles the positioning.
  -->
  <div
    ref="panelRef"
    :data-testid="props.testId || 'draggable-panel'"
    :class="props.className"
    :style="mergedStyles"
  >
    <!-- 
      The content slot. Dragging is initiated only when mousedown occurs 
      on an element with the class 'handle' inside this panel.
    -->
    <slot></slot>
  </div>
</template>
