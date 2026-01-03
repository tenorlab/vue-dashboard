// @tenorlab/vue-dashboard
// file: src/components/use-dashboard-store.ts
import { reactive, computed } from 'vue'
import { blankDashboardConfig, dashboardStoreUtils } from '@tenorlab/dashboard-core'
import type {
  IDashboardConfig,
  TDashboardWidgetKey,
  TAddWidgetResponse,
  TRemoveWidgetResponse,
  TMoveWidgetResponse,
} from '@tenorlab/dashboard-core'

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
    const resp = dashboardStoreUtils.addWidget({
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
    const resp = dashboardStoreUtils.removeWidget(
      _state.currentDashboardConfig,
      widgetKey,
      parentWidgetKey,
    )
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
  ): TMoveWidgetResponse => {
    const resp = dashboardStoreUtils.moveWidget(
      _state.currentDashboardConfig,
      direction,
      widgetKey,
      parentWidgetKey,
    )
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
    dashboardStoreUtils.getNextContainerKey(_state.currentDashboardConfig, containerWidgetKey),
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
