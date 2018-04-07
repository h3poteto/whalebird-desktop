import { ipcRenderer } from 'electron'

const General = {
  namespaced: true,
  state: {
    general: {
      sound: {
        fav_rb: true,
        toot: true
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
        ipcRenderer.send('get-preferences')
        ipcRenderer.once('error-get-preferences', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-preferences')
          reject(err)
        })
        ipcRenderer.once('response-get-preferences', (event, conf) => {
          ipcRenderer.removeAllListeners('error-get-preferences')
          console.log(conf)
          commit('updateGeneral', conf.general)
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
      ipcRenderer.send('save-preferences', config)
      ipcRenderer.once('error-save-preferences', (event, err) => {
        ipcRenderer.removeAllListeners('response-save-preferences')
        commit('changeLoading', false)
      })
      ipcRenderer.once('response-save-preferences', (event, conf) => {
        ipcRenderer.removeAllListeners('error-save-preferences')
        console.log(conf)
        commit('updateGeneral', conf.general)
        commit('changeLoading', false)
      })
    }
  }
}

export default General
