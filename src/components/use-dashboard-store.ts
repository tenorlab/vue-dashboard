// @tenorlab/vue-dashboard
// file: src/components/use-dashboard-store.ts
import { reactive, computed } from 'vue'
import { blankDashboardConfig, ensureContainersSequence } from '@tenorlab/dashboard-core'
import type { IDashboardConfig, TDashboardWidgetKey } from '@tenorlab/dashboard-core'

/**
 * @name TAddWidgetResponse
 * @description Type for the response of the addWidget mutation
 * @property {boolean} success - Indicates if the widget was added successfully
 * @property {string} [message] - Optional message providing additional information
 * @property {IDashboardConfig} updatedDashboardConfig - The updated dashboard configuration after adding the widget
 * @property {IDashboardConfig[]} allUpdatedDashboardConfigs - All updated dashboard configurations
 */
type TAddWidgetResponse = {
  success: boolean
  message?: string
  updatedDashboardConfig: IDashboardConfig
  allUpdatedDashboardConfigs: IDashboardConfig[]
}
type TRemoveWidgetResponse = TAddWidgetResponse
type TMoveWidgetResponse = TAddWidgetResponse

/**
 * @name _getNextContainerName
 * @description Generates the next container name based on existing containers in the dashboard configuration
 * @param dashboardConfig
 * @returns {string} The next container name in the format 'containerX', where X is the next available number
 */
const _getNextContainerName = (dashboardConfig: IDashboardConfig) => {
  // get next container id
  const containersIds = dashboardConfig.widgets
    .filter((x) => x.includes('WidgetContainer'))
    .map((x) => Number(x.split('_')[1].replace('container', '')))
  let nextId = containersIds.length > 0 ? Math.max(...containersIds) + 1 : 1
  return `container${nextId}`
}

/**
 * @name _getNextContainerKey
 * @description Generates the next container widget key based on the dashboard configuration and a given container widget key
 * @param dashboardConfig
 * @param containerWidgetKey
 * @returns {TDashboardWidgetKey} The next container widget key
 */
const _getNextContainerKey = (
  dashboardConfig: IDashboardConfig,
  containerWidgetKey: TDashboardWidgetKey,
): TDashboardWidgetKey => {
  const containerName = _getNextContainerName(dashboardConfig)
  const widgetKey: TDashboardWidgetKey = `${containerWidgetKey}_${containerName}` as any
  return widgetKey
}

/**
 * @name _addWidget
 * @description Adds a widget to the dashboard configuration, either at the root level or within a specified parent container
 * @param params
 * @returns {Omit<TAddWidgetResponse, 'allUpdatedDashboardConfigs'>} The response indicating success or failure and the updated dashboard configuration
 */
const _addWidget = (params: {
  dashboardConfig: IDashboardConfig
  widgetKey: TDashboardWidgetKey
  parentWidgetKey?: TDashboardWidgetKey
  noDuplicatedWidgets?: boolean
}): Omit<TAddWidgetResponse, 'allUpdatedDashboardConfigs'> => {
  const { dashboardConfig, widgetKey, parentWidgetKey, noDuplicatedWidgets } = params

  if (parentWidgetKey) {
    // if adding to parent container
    // if noDuplicatedWidgets is true, do not allow to add duplicated widgets:
    if (
      noDuplicatedWidgets &&
      dashboardConfig.childWidgetsConfig.find(
        (x) => x.parentWidgetKey === parentWidgetKey && x.widgetKey === widgetKey,
      )
    ) {
      return {
        success: false,
        message: `DashboardStore: addWidget: Widget already added (${widgetKey})`,
        updatedDashboardConfig: dashboardConfig,
      }
    }
    const newChildWidgetsConfig = [
      ...dashboardConfig.childWidgetsConfig,
      { parentWidgetKey, widgetKey }, // new entry
    ]
    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        childWidgetsConfig: newChildWidgetsConfig,
      },
    }
  } else {
    // add root level widget
    // if noDuplicatedWidgets is true, do not allow to add duplicated widgets:
    if (noDuplicatedWidgets && dashboardConfig.widgets.includes(widgetKey)) {
      return {
        success: false,
        message: `DashboardStore: addWidget: Widget already added (${widgetKey})`,
        updatedDashboardConfig: dashboardConfig,
      }
    }
    const newWidgets = [...dashboardConfig.widgets, widgetKey]
    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        widgets: newWidgets,
      },
    }
  }
}

/**
 * @name _removeWidget
 * @description Removes a widget from the dashboard configuration, either from the root level or from a specified parent container
 * @param dashboardConfig
 * @param widgetKey
 * @param parentWidgetKey
 * @returns {Omit<TRemoveWidgetResponse, 'allUpdatedDashboardConfigs'>} The response indicating success or failure and the updated dashboard configuration
 */
const _removeWidget = (
  dashboardConfig: IDashboardConfig,
  widgetKey: TDashboardWidgetKey,
  parentWidgetKey?: TDashboardWidgetKey,
): Omit<TRemoveWidgetResponse, 'allUpdatedDashboardConfigs'> => {
  if ((parentWidgetKey || '').trim().length > 0) {
    // if removing from parent container:
    // save the other containers's widgets:
    const othersChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey !== parentWidgetKey,
    )
    // remove current widget from the container matching the parentWidhetKey argument
    const updateContainerChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey === parentWidgetKey && entry.widgetKey !== widgetKey,
    )
    // update
    const newChildWidgetsConfig = [...othersChildWidgets, ...updateContainerChildWidgets]
    let updatedDashboardConfig = {
      ...dashboardConfig,
      childWidgetsConfig: newChildWidgetsConfig,
    }
    // if removing container, ensure correct container sequence but keep original order
    const isContainer = `${widgetKey}`.includes('Container')
    if (isContainer) {
      updatedDashboardConfig = ensureContainersSequence(updatedDashboardConfig)
    }
    return {
      success: true,
      updatedDashboardConfig,
    }
  } else {
    // remove the root level widget
    const updatedWidgets = dashboardConfig.widgets.filter((key) => key !== widgetKey)
    // if the widget bring remove is a container, remove also all its childWidgets
    const updatedChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey !== widgetKey,
    )
    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        widgets: updatedWidgets,
        childWidgetsConfig: updatedChildWidgets,
      },
    }
  }
}

/**
 * @name _moveWidget
 * @description Moves a widget within the dashboard configuration, either at the root level or within a specified parent container
 * @param dashboardConfig
 * @param direction
 * @param widgetKey
 * @param parentWidgetKey
 * @returns {Omit<TMoveWidgetResponse, 'allUpdatedDashboardConfigs'>} The response indicating success or failure and the updated dashboard configuration
 */
const _moveWidget = (
  dashboardConfig: IDashboardConfig,
  direction: -1 | 1,
  widgetKey: TDashboardWidgetKey,
  parentWidgetKey?: TDashboardWidgetKey,
): Omit<TMoveWidgetResponse, 'allUpdatedDashboardConfigs'> => {
  if ((parentWidgetKey || '').trim().length > 0) {
    // if moving inside parent container:
    // save the other containers's widgets:
    const othersChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey !== parentWidgetKey,
    )
    // get this container widgets:
    let containerChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey === parentWidgetKey,
    )
    const currentIndex = containerChildWidgets.indexOf(widgetKey as any)
    let newIndex = currentIndex + direction

    // Ensure the new index is within the array bounds
    // If moving left past the start (index 0), keep it at 0.
    newIndex = Math.max(0, newIndex)
    // If moving right past the end, keep it at the last index (containerChildWidgets.length - 1).
    newIndex = Math.min(containerChildWidgets.length - 1, newIndex)

    // If the new index is the same as the current index, return
    if (newIndex === currentIndex) {
      return {
        success: false,
        message: `DashboardStore: moveWidget: Widget already at min/max position (${widgetKey})`,
        updatedDashboardConfig: dashboardConfig,
      }
    }

    // update position
    const updatedWidgets = [...containerChildWidgets]
    // Remove the element from its current position
    // splice(start, deleteCount) returns an array of the deleted elements
    const [elementToMove] = updatedWidgets.splice(currentIndex, 1)
    // Insert the element into its new position
    // splice(start, deleteCount, item1)
    updatedWidgets.splice(newIndex, 0, elementToMove)

    // return updated config
    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        childWidgetsConfig: [...othersChildWidgets, ...updatedWidgets],
      },
    }
  } else {
    // move root level widget
    const allWidgets = dashboardConfig.widgets || []
    const currentIndex = allWidgets.indexOf(widgetKey)
    let newIndex = currentIndex + direction

    // Ensure the new index is within the array bounds
    // If moving left past the start (index 0), keep it at 0.
    newIndex = Math.max(0, newIndex)
    // If moving right past the end, keep it at the last index (allWidgets.length - 1).
    newIndex = Math.min(allWidgets.length - 1, newIndex)

    // If the new index is the same as the current index, return
    if (newIndex === currentIndex) {
      return {
        success: false,
        message: `DashboardStore: moveWidget: Widget already at min/max position (${widgetKey})`,
        updatedDashboardConfig: dashboardConfig,
      }
    }

    // update position
    const updatedWidgets = [...allWidgets]
    // Remove the element from its current position
    // splice(start, deleteCount) returns an array of the deleted elements
    const [elementToMove] = updatedWidgets.splice(currentIndex, 1)
    // Insert the element into its new position
    // splice(start, deleteCount, item1)
    updatedWidgets.splice(newIndex, 0, elementToMove)

    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        widgets: updatedWidgets,
      },
    }
  }
}

/**
 * @name IDashboardState
 * @description Interface defining the structure of the dashboard store state
 * @property {boolean} isLoading - Indicates if the dashboard is currently loading
 * @property {boolean} isEditing - Indicates if the dashboard is in editing mode
 * @property {IDashboardConfig[]} allDashboardConfigs - List of all dashboard configurations
 * @property {IDashboardConfig} currentDashboardConfig - The currently selected dashboard configuration
 * @property {TDashboardWidgetKey | undefined} targetContainerKey - The key of the target container widget, if any
 */
interface IDashboardState {
  isLoading: boolean
  isEditing: boolean
  allDashboardConfigs: IDashboardConfig[]
  currentDashboardConfig: IDashboardConfig
  targetContainerKey?: TDashboardWidgetKey | undefined
}

/**
 * @name getInitialState
 * @description Returns the initial state of the dashboard store
 * @returns {IDashboardState} The initial dashboard store state
 */
const getInitialState = (): IDashboardState => {
  // TODO: add check for user preferred color scheme:
  // const prefersDark = usePreferredColorScheme().getPreferredScheme() === 'dark'

  return {
    isLoading: false, // Start uninitialized/not loading
    isEditing: false,
    allDashboardConfigs: [blankDashboardConfig],
    currentDashboardConfig: blankDashboardConfig,
  }
}

const _state = reactive<IDashboardState>(getInitialState())

/**
 * @name _mutations
 * @description Object containing mutation methods to modify the dashboard store state
 */
const _mutations = {
  setIsLoading: (value: boolean) => (_state.isLoading = value),
  setIsEditing: (value: boolean) => (_state.isEditing = value),
  setTargetContainerKey: (
    value: TDashboardWidgetKey | undefined,
  ): TDashboardWidgetKey | undefined => (_state.targetContainerKey = value),
  setAllDashboardConfigs: (value: IDashboardConfig[]) => (_state.allDashboardConfigs = value),
  setCurrentDashboardConfig: (value: IDashboardConfig): IDashboardConfig[] => {
    const updatedList = [
      ..._state.allDashboardConfigs.filter((x) => x.dashboardId !== value.dashboardId),
      value,
    ]
    _state.allDashboardConfigs = updatedList
    _state.currentDashboardConfig = value
    return updatedList
  },

  addDashboardConfig: (value: IDashboardConfig): IDashboardConfig[] => {
    const updatedList = [
      ..._state.allDashboardConfigs.filter((x) => x.dashboardId !== value.dashboardId),
      value,
    ]
    _state.allDashboardConfigs = updatedList
    _state.currentDashboardConfig = value
    return updatedList
  },

  deleteDashboardConfigById: (dashboardId: string): IDashboardConfig[] => {
    const updatedList = [..._state.allDashboardConfigs.filter((x) => x.dashboardId !== dashboardId)]
    _state.allDashboardConfigs = updatedList
    _state.currentDashboardConfig = updatedList[0] || blankDashboardConfig
    return updatedList
  },

  selectDashboardById: (dashboardId: string): IDashboardConfig | undefined => {
    const item = _state.allDashboardConfigs.find((x) => x.dashboardId === dashboardId)
    if (item) {
      _state.currentDashboardConfig = item
    }
    return item
  },

  addWidget: (params: {
    widgetKey: TDashboardWidgetKey
    parentWidgetKey?: TDashboardWidgetKey
    noDuplicatedWidgets?: boolean
  }): TAddWidgetResponse & {
    allUpdatedDashboardConfigs: IDashboardConfig[]
  } => {
    const resp = _addWidget({
      dashboardConfig: _state.currentDashboardConfig,
      ...params,
    })
    const allUpdatedDashboardConfigs = [
      ..._state.allDashboardConfigs.filter(
        (x) => x.dashboardId !== resp.updatedDashboardConfig.dashboardId,
      ),
      resp.updatedDashboardConfig,
    ]
    if (resp.success) {
      _state.allDashboardConfigs = allUpdatedDashboardConfigs
      _state.currentDashboardConfig = resp.updatedDashboardConfig
    }
    return {
      ...resp,
      allUpdatedDashboardConfigs,
    }
  },

  removeWidget: (
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ): TRemoveWidgetResponse => {
    const resp = _removeWidget(_state.currentDashboardConfig, widgetKey, parentWidgetKey)
    const allUpdatedDashboardConfigs = [
      ..._state.allDashboardConfigs.filter(
        (x) => x.dashboardId !== resp.updatedDashboardConfig.dashboardId,
      ),
      resp.updatedDashboardConfig,
    ]
    if (resp.success) {
      _state.allDashboardConfigs = allUpdatedDashboardConfigs
      _state.currentDashboardConfig = resp.updatedDashboardConfig
    }
    return {
      ...resp,
      allUpdatedDashboardConfigs,
    }
  },

  moveWidget: (
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ): TRemoveWidgetResponse => {
    const resp = _moveWidget(_state.currentDashboardConfig, direction, widgetKey, parentWidgetKey)
    const allUpdatedDashboardConfigs = [
      ..._state.allDashboardConfigs.filter(
        (x) => x.dashboardId !== resp.updatedDashboardConfig.dashboardId,
      ),
      resp.updatedDashboardConfig,
    ]
    if (resp.success) {
      _state.allDashboardConfigs = allUpdatedDashboardConfigs
      _state.currentDashboardConfig = resp.updatedDashboardConfig
    }
    return {
      ...resp,
      allUpdatedDashboardConfigs,
    }
  },
}

/**
 * @name _actions
 * @description Object containing action methods that wrap mutations for the dashboard store
 */
const _actions = {
  setIsLoading: (value: boolean): boolean => _mutations.setIsLoading(value),
  setIsEditing: (value: boolean): boolean => {
    if (!value) {
      _mutations.setTargetContainerKey(undefined)
    }
    _mutations.setIsEditing(value)
    return value
  },
  setTargetContainerKey: (value: TDashboardWidgetKey | undefined) => {
    return _mutations.setTargetContainerKey(value)
  },
  setAllDashboardConfigs: (value: IDashboardConfig[]): IDashboardConfig[] => {
    return _mutations.setAllDashboardConfigs(value)
  },
  setCurrentDashboardConfig: (value: IDashboardConfig) => {
    return _mutations.setCurrentDashboardConfig(value)
  },
  addDashboardConfig: (value: IDashboardConfig) => {
    return _mutations.addDashboardConfig(value)
  },
  deleteDashboardConfigById: (dashboardId: string): IDashboardConfig[] =>
    _mutations.deleteDashboardConfigById(dashboardId),
  selectDashboardById: (dashboardId: string) => _mutations.selectDashboardById(dashboardId),
  addWidget: (params: {
    widgetKey: TDashboardWidgetKey
    parentWidgetKey?: TDashboardWidgetKey
    noDuplicatedWidgets?: boolean
  }) => _mutations.addWidget(params),
  removeWidget: (widgetKey: TDashboardWidgetKey, parentWidgetKey?: TDashboardWidgetKey) =>
    _mutations.removeWidget(widgetKey, parentWidgetKey),
  moveWidget: (
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ) => _mutations.moveWidget(direction, widgetKey, parentWidgetKey),
}

/**
 * @name _getters
 * @description Object containing getter methods to retrieve specific information from the dashboard store state
 */
const _getters = {
  getNextContainerKey: (containerWidgetKey: TDashboardWidgetKey): TDashboardWidgetKey =>
    _getNextContainerKey(_state.currentDashboardConfig, containerWidgetKey),
  getCurrentDashboardConfig: (): IDashboardConfig => _state.currentDashboardConfig,
  getCurrentDashboardId: (): string => _state.currentDashboardConfig.dashboardId,
  getIsResponsive: (): boolean => _state.currentDashboardConfig.responsiveGrid || false,
  getTargetContainerKey: (): TDashboardWidgetKey | undefined => _state.targetContainerKey,
}

/**
 * @name computedGetters
 * @description Object containing computed properties for the dashboard store state
 */
const computedGetters = {
  isLoading: computed(() => _state.isLoading),
  isEditing: computed(() => _state.isEditing),
  targetContainerKey: computed(() => _state.targetContainerKey),
  currentDashboardConfig: computed(() => _state.currentDashboardConfig),
  allDashboardConfigs: computed(() => {
    return _state.allDashboardConfigs.sort((a, b) => {
      const isADefault = a.dashboardId === 'default'
      const isBDefault = b.dashboardId === 'default'

      // 1. If 'a' is default and 'b' is not, 'a' comes first (-1)
      if (isADefault && !isBDefault) {
        return -1
      }

      // 2. If 'b' is default and 'a' is not, 'b' comes first (1)
      if (isBDefault && !isADefault) {
        return 1
      }

      // 3. If neither is default (or both are, which shouldn't happen),
      // sort alphabetically (A-Z) by dashboardId.
      return a.dashboardId.localeCompare(b.dashboardId)
    })
  }),
}

type TActions = typeof _actions

/**
 * @name IDashboardStore
 * @description Interface defining the structure of the dashboard store
 * @property {TActions} actions - The actions available in the dashboard store
 * @property {typeof _getters} getters - The getters available in the dashboard store
 * @property {typeof computedGetters} computed - The computed properties available in the dashboard store
 */
export interface IDashboardStore extends TActions {
  actions: TActions
  getters: typeof _getters
  computed: typeof computedGetters
}

const _dashboardStore: IDashboardStore = {
  ..._actions,
  actions: _actions,
  getters: _getters,
  computed: computedGetters,
}

/**
 * @name useDashboardStore
 * @description Hook to access the dashboard store
 * @returns {IDashboardStore} The dashboard store instance
 */
export const useDashboardStore = (): IDashboardStore => _dashboardStore
