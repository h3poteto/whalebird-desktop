import { ipcRenderer } from 'electron'

const General = {
  namespaced: true,
  state: {
    general: {
      sound: {
        fav_rb: true,
        toot: true
      },
      timeline: {
        cw: false,
        nfsw: false
      }
    },
    loading: false
  },
  mutations: {
    updateGeneral (state, conf) {
      state.general = conf
    },
    changeLoading (state, value) {
      state.loading = value
    }
  },
  actions: {
    loadGeneral ({ commit }) {
      return new Promise((resolve, reject) => {
        commit('changeLoading', true)
        ipcRenderer.send('get-preferences')
        ipcRenderer.once('error-get-preferences', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-preferences')
          commit('changeLoading', false)
          reject(err)
        })
        ipcRenderer.once('response-get-preferences', (event, conf) => {
          ipcRenderer.removeAllListeners('error-get-preferences')
          commit('updateGeneral', conf.general)
          commit('changeLoading', false)
          resolve(conf)
        })
      })
    },
    updateSound ({ commit, state }, sound) {
      commit('changeLoading', true)
      const newSound = Object.assign({}, state.general.sound, sound)
      const newGeneral = Object.assign({}, state.general, {
        sound: newSound
      })
      const config = {
        general: newGeneral
      }
      return new Promise((resolve, reject) => {
        ipcRenderer.send('update-preferences', config)
        ipcRenderer.once('error-update-preferences', (event, err) => {
          ipcRenderer.removeAllListeners('response-update-preferences')
          commit('changeLoading', false)
          reject(err)
        })
        ipcRenderer.once('response-update-preferences', (event, conf) => {
          ipcRenderer.removeAllListeners('error-update-preferences')
          commit('updateGeneral', conf.general)
          commit('changeLoading', false)
          resolve(conf)
        })
      })
    },
    updateTimeline ({ commit, state }, timeline) {
      commit('changeLoading', true)
      const newTimeline = Object.assign({}, state.general.timeline, timeline)
      const newGeneral = Object.assign({}, state.general, {
        timeline: newTimeline
      })
      const config = {
        general: newGeneral
      }
      return new Promise((resolve, reject) => {
        ipcRenderer.once('error-update-preferences', (event, err) => {
          ipcRenderer.removeAllListeners('response-update-preferences')
          commit('changeLoading', false)
          reject(err)
        })
        ipcRenderer.once('response-update-preferences', (event, conf) => {
          ipcRenderer.removeAllListeners('error-update-preferences')
          commit('updateGeneral', conf.general)
          commit('changeLoading', false)
          resolve(conf)
        })
        ipcRenderer.send('update-preferences', config)
      })
    }
  }
}

export default General
