<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, CSSProperties, VNodeRef } from 'vue'

// --- Interface Definitions ---

interface IDraggablePanelProps {
  testId?: string
  className: string
  style?: CSSProperties
  onDraggingChange?: (isDragging: boolean) => void
}

const props = defineProps<IDraggablePanelProps>()

// --- Emits (for event communication, replacing the onDraggingChange prop) ---
const emits = defineEmits<{
  (event: 'draggingChange', isDragging: boolean): void
}>()

// --- State and Refs ---

// Ref to the root HTML element of the panel
const panelRef = ref<VNodeRef | null>(null)

// State to track the panel's position, initialized based on default floating styles
const position = ref({ x: 0, y: 0 })

// State to hold the position where the drag started (relative to the viewport)
const dragStart = ref({ x: 0, y: 0 })

// State to hold the panel's position when drag started
const panelStart = ref({ x: 0, y: 0 })

// --- Constants and Styles ---

const defaultFloatingStyles: CSSProperties = {
  // 1. Take it out of the document flow
  position: 'fixed',
  // 2. Set initial viewport position (e.g., top right)
  top: '6rem',
  right: '1rem',
  // 3. Ensure it stacks above other content
  zIndex: 1,

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

// --- Drag Handlers (Manual Implementation) ---

// 1. Mouse Down (Start Drag)
const handleMouseDown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  // Check if the mousedown event occurred on the designated handle element
  if (!target.closest('.handle')) {
    return
  }

  e.preventDefault() // Prevent selection

  // Notify parent dragging started
  emits('draggingChange', true)

  // Record initial positions
  dragStart.value = { x: e.clientX, y: e.clientY }
  panelStart.value = { x: position.value.x, y: position.value.y }

  // Attach global listeners for movement and release
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

// 2. Mouse Move (During Drag)
const handleMouseMove = (e: MouseEvent) => {
  // Calculate the difference in mouse position since drag started
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y

  // Update the new panel position relative to the starting position
  position.value = {
    x: panelStart.value.x + dx,
    y: panelStart.value.y + dy,
  }
}

// 3. Mouse Up (End Drag)
const handleMouseUp = () => {
  // Clean up global listeners
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)

  // Notify parent dragging stopped (with a slight delay)
  setTimeout(() => {
    emits('draggingChange', false)
  }, 100)
}

// Lifecycle events
onMounted(() => {
  // Attach the mousedown listener to the panel element when mounted
  if (panelRef.value) {
    panelRef.value.addEventListener('mousedown', handleMouseDown)
  }
})

onUnmounted(() => {
  // Clean up the mousedown listener when component is destroyed
  if (panelRef.value) {
    panelRef.value.removeEventListener('mousedown', handleMouseDown)
  }
  // Also ensure global listeners are removed in case of sudden unmount
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
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
