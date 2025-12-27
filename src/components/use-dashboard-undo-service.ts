// @tenorlab/vue-dashboard
// file: src/components/use-dashboard-undo-service.ts
import { reactive, computed, readonly } from 'vue'
import type {
  IDashboardConfig,
  TUndoHistoryEntry,
  TDashboardUndoStatus,
} from '@tenorlab/dashboard-core'

type TState = {
  currentDashboardId: string | null
  // History: { 'dashboardId': [entry, entry, ...] }
  undoHistory: Record<string, TUndoHistoryEntry[]>
  // Current index: { 'dashboardId': index }
  historyIndex: Record<string, number>
}

// Global, shared, mutable state object
const _state = reactive<TState>({
  currentDashboardId: '',
  undoHistory: {},
  historyIndex: {},
})

// --- Index Helpers ---
const _getHistory = (dashboardId: string) => _state.undoHistory[dashboardId] || []
const _getCurrentIndex = (dashboardId: string) => _state.historyIndex[dashboardId] ?? -1

// Helper to set the index for a specific dashboard
const _setHistoryIndex = (dashboardId: string, index: number) => {
  _state.historyIndex[dashboardId] = index
}

/**
 * Initializes history with a starting config (always index 0)
 * and CLEARs any previous history for the given ID.
 * @param initialConfig The configuration to save as the base state (index 0).
 */
const initializeHistoryForDashboard = (initialConfig: IDashboardConfig) => {
  const dashboardId = initialConfig.dashboardId
  if (_state.currentDashboardId !== dashboardId) {
    _state.currentDashboardId = dashboardId

    const newEntry: TUndoHistoryEntry = {
      undoIndex: 0,
      config: initialConfig,
    }

    // Set the history index to 0
    _setHistoryIndex(dashboardId, 0)

    // Overwrite (reset) the history for this specific ID
    _state.undoHistory[dashboardId] = [newEntry]
  }
}

/**
 * Adds a new undo entry, trimming any existing redo history.
 * @param newConfig The latest configuration to save in history.
 */
const addUndoEntry = (newConfig: IDashboardConfig) => {
  const dashboardId = newConfig.dashboardId
  const currentHistory = _getHistory(dashboardId)
  const currentIndex = _getCurrentIndex(dashboardId)

  // 1. Trim history: discard entries after the current index (the redo list)
  // If currentIndex is -1, this results in an empty array.
  const trimmedHistory = currentHistory.slice(0, currentIndex + 1)

  // 2. Define the new entry
  const newEntry: TUndoHistoryEntry = {
    undoIndex: trimmedHistory.length,
    config: newConfig,
  }

  // 3. Create the new history array
  const newDashboardHistory = [...trimmedHistory, newEntry]

  // 4. Update state: history and index (index is the last element's index)
  _state.undoHistory[dashboardId] = newDashboardHistory
  _setHistoryIndex(dashboardId, newDashboardHistory.length - 1)
}

/**
 * Removes the entire history for a deleted dashboard.
 */
const removeUndoHistoryForDashboard = (dashboardId: string) => {
  // Remove history
  delete _state.undoHistory[dashboardId]
  // Remove index tracker
  delete _state.historyIndex[dashboardId]
}

/**
 * Renamed from `undo`. Moves the history pointer one step back (decrements index).
 * @returns The configuration object at the previous state, or undefined.
 */
const getPreviousChanges = (dashboardId: string): IDashboardConfig | undefined => {
  const currentHistory = _getHistory(dashboardId)
  const currentIndex = _getCurrentIndex(dashboardId)
  const newIndex = Math.max(0, currentIndex - 1)

  if (newIndex !== currentIndex) {
    // 1. Update the index state
    _setHistoryIndex(dashboardId, newIndex)

    // 2. Return the config at the new (previous) index
    return currentHistory[newIndex]?.config
  }

  return undefined // Index didn't change (at beginning)
}

/**
 * Renamed from `redo`. Moves the history pointer one step forward (increments index).
 * @returns The configuration object at the next state, or undefined.
 */
const getNextChanges = (dashboardId: string): IDashboardConfig | undefined => {
  const currentHistory = _getHistory(dashboardId)
  const historyLength = currentHistory.length
  const currentIndex = _getCurrentIndex(dashboardId)

  // Cannot go past the last element's index
  const newIndex = Math.min(historyLength - 1, currentIndex + 1)

  if (newIndex !== currentIndex) {
    // 1. Update the index state
    _setHistoryIndex(dashboardId, newIndex)

    // 2. Return the config at the new (next) index
    return currentHistory[newIndex]?.config
  }
  return undefined // Index didn't change (at end)
}

// --- get Disabled Status Calculation ---
const getUndoStatus = (): TDashboardUndoStatus => {
  const dashboardId = _state.currentDashboardId || ''
  const currentIndex = _getCurrentIndex(dashboardId)
  const historyLength = _getHistory(dashboardId).length

  // Disabled if at the beginning (index 0) or if no history exists (length 0 or 1)
  const isUndoDisabled = currentIndex <= 0

  // Disabled if at the end (index = length - 1)
  const isRedoDisabled = currentIndex >= historyLength - 1

  return {
    isUndoDisabled,
    isRedoDisabled,
    // Optional debugging fields
    _currentIndex: currentIndex,
    _historyLength: historyLength,
  }
}

// Computed property to calculate status based on the currently active dashboard ID
const computedUndoStatus = computed<TDashboardUndoStatus>(() => getUndoStatus())

export const useDashboardUndoService = () => {
  return {
    initializeHistoryForDashboard,
    resetAllHistory: () => {
      _state.undoHistory = {}
      _state.historyIndex = {}
    },
    addUndoEntry,
    removeUndoHistoryForDashboard,
    getPreviousChanges,
    getNextChanges,
    computedUndoStatus, // Function that returns a Vue ComputedRef
    getUndoStatus, // for unit tests only
    // Expose reactive state for debugging or advanced external use (optional)
    historyState: readonly(_state),
  }
}
