import { ipcRenderer } from 'electron'
import router from '../router'

const App = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    watchShortcutsEvents () {
      ipcRenderer.on('open-preferences', (event) => {
        router.push('/preferences/general')
      })
    },
    removeShortcutsEvents () {
      ipcRenderer.removeAllListeners('open-preferences')
    }
  }
}

export default App
