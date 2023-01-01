import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'
import { Setting } from '~src/types/setting'
import { DefaultSetting } from '~/src/constants/initializer/setting'

const win = (window as any) as MyWindow

export type TimelineState = {
  setting: Setting
}

const state = (): TimelineState => ({
  setting: DefaultSetting
})

export const MUTATION_TYPES = {
  UPDATE_TIMELINE_SETTING: 'updateTimelineSetting'
}

const mutations: MutationTree<TimelineState> = {
  [MUTATION_TYPES.UPDATE_TIMELINE_SETTING]: (state, setting: Setting) => {
    state.setting = setting
  }
}

export const ACTION_TYPES = {
  LOAD_TIMELINE_SETTING: 'loadTimelineSetting',
  CHANGE_UNREAD_NOTIFICATION: 'changeUnreadNotification',
  CHANGE_USER_MARKER: 'changeUserMarker'
}

const actions: ActionTree<TimelineState, RootState> = {
  [ACTION_TYPES.LOAD_TIMELINE_SETTING]: async ({ commit, rootState }): Promise<boolean> => {
    const setting: Setting = await win.ipcRenderer.invoke('get-account-setting', rootState.Settings.accountId)
    commit(MUTATION_TYPES.UPDATE_TIMELINE_SETTING, setting)
    return true
  },
  [ACTION_TYPES.CHANGE_USER_MARKER]: async ({ dispatch, state, rootState }, timeline: { key: boolean }) => {
    const setting: Setting = Object.assign({}, state.setting, timeline)
    setting.accountId = rootState.Settings.accountId!
    console.log(setting)
    await win.ipcRenderer.invoke('update-account-setting', setting)
    dispatch(ACTION_TYPES.LOAD_TIMELINE_SETTING)
    return true
  }
}

const Timeline: Module<TimelineState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Timeline
