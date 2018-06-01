import { ipcRenderer } from 'electron'

const List = {
  namespaced: true,
  state: {
    tags: []
  },
  mutations: {
    updateTags (state, tags) {
      state.tags = tags
    }
  },
  actions: {
    listTags ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.once('response-list-hashtags', (event, tags) => {
          ipcRenderer.removeAllListeners('error-list-hashtags')
          commit('updateTags', tags)
          resolve(tags)
        })
        ipcRenderer.once('error-list-hashtags', (event, err) => {
          ipcRenderer.removeAlListeners('response-list-hashtags')
          reject(err)
        })
        ipcRenderer.send('list-hashtags')
      })
    }
  }
}

export default List
