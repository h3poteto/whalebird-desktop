import { ipcRenderer } from 'electron'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { Sound } from '~/src/types/sound'
import { Timeline } from '~/src/types/timeline'

interface GeneralSet {
  sound: Sound,
  timeline: Timeline
}
export interface GeneralState {
  general: GeneralSet,
  loading: boolean
}

const state = (): GeneralState => ({
  general: {
    sound: {
      fav_rb: true,
      toot: true
    },
    timeline: {
      cw: false,
      nfsw: false,
      hideAllAttachments: false
    }
  },
  loading: false
})

export const MUTATION_TYPES = {
  UPDATE_GENERAL: 'updateGeneral',
  CHANGE_LOADING: 'changeLoading'
}

const mutations: MutationTree<GeneralState> = {
  [MUTATION_TYPES.UPDATE_GENERAL]: (state, conf: GeneralSet) => {
    state.general = conf
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, value: boolean) => {
    state.loading = value
  }
}

const actions: ActionTree<GeneralState, RootState> = {
  loadGeneral: ({ commit }) => {
    return new Promise((resolve, reject) => {
      commit(MUTATION_TYPES.CHANGE_LOADING, true)
      ipcRenderer.send('get-preferences')
      ipcRenderer.once('error-get-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-get-preferences')
        commit(MUTATION_TYPES.CHANGE_LOADING, false)
        reject(err)
      })
      ipcRenderer.once('response-get-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-get-preferences')
        commit(MUTATION_TYPES.UPDATE_GENERAL, conf.general as GeneralSet)
        commit(MUTATION_TYPES.CHANGE_LOADING, false)
        resolve(conf)
      })
    })
  },
  updateSound: ({ commit, state }, sound: object) => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    const newSound: Sound = Object.assign({}, state.general.sound, sound)
    const newGeneral: GeneralSet = Object.assign({}, state.general, {
      sound: newSound
    })
    const config = {
      general: newGeneral
    }
    return new Promise((resolve, reject) => {
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
        commit(MUTATION_TYPES.CHANGE_LOADING, false)
        reject(err)
      })
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit(MUTATION_TYPES.UPDATE_GENERAL, conf.general as GeneralSet)
        commit(MUTATION_TYPES.CHANGE_LOADING, false)
        resolve(conf)
      })
    })
  },
  updateTimeline: ({ commit, state, dispatch }, timeline: object) => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    const newTimeline: Timeline = Object.assign({}, state.general.timeline, timeline)
    const newGeneral: GeneralSet = Object.assign({}, state.general, {
      timeline: newTimeline
    })
    const config = {
      general: newGeneral
    }
    return new Promise((resolve, reject) => {
      ipcRenderer.once('error-update-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
        commit('changeLoading', false)
        reject(err)
      })
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit(MUTATION_TYPES.UPDATE_GENERAL, conf.general as GeneralSet)
        commit(MUTATION_TYPES.CHANGE_LOADING, false)
        dispatch('App/loadPreferences', null, { root: true })
        resolve(conf)
      })
      ipcRenderer.send('update-preferences', config)
    })
  }
}
const General: Module<GeneralState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default General
