import { ipcRenderer } from 'electron'

const Local = {
  namespaced: true,
  state: {
    timeline: []
  },
  mutations: {
    appendTimeline (state, update) {
      state.timeline = [update].concat(state.timeline)
    }
  },
  actions: {
    startLocalStreaming ({ commit }, account) {
      ipcRenderer.on('update-start-local-streaming', (event, update) => {
        commit('appendTimeline', update)
      })
      return new Promise((resolve, reject) => {
        ipcRenderer.send('start-local-streaming', account)
        ipcRenderer.once('error-start-local-streaming', (event, err) => {
          reject(err)
        })
      })
    },
    stopLocalStreaming ({ commit }) {
      ipcRenderer.send('stop-local-streaming')
    }
  }
}

export default Local
