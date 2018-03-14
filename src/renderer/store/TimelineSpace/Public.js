import { ipcRenderer } from 'electron'

const Public = {
  namespaced: true,
  state: {
    timeline: []
  },
  mutations: {
    appendTimeline (state, update) {
      state.timeline = [update].concat(state.timeline)
    },
    updateToot (state, message) {
      state.timeline = state.timeline.map((toot) => {
        if (toot.id === message.id) {
          return message
        } else {
          return toot
        }
      })
    }
  },
  actions: {
    startPublicStreaming ({ commit }, account) {
      ipcRenderer.on('update-start-public-streaming', (event, update) => {
        commit('appendTimeline', update)
      })
      return new Promise((resolve, reject) => {
        ipcRenderer.send('start-public-streaming', account)
        ipcRenderer.once('error-start-public-streaming', (event, err) => {
          reject(err)
        })
      })
    },
    stopPublicStreaming ({ commit }) {
      ipcRenderer.removeAllListeners('error-start-public-streaming')
      ipcRenderer.removeAllListeners('update-start-public-streaming')
      ipcRenderer.send('stop-public-streaming')
    }
  }
}

export default Public
