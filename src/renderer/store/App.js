import { ipcRenderer } from 'electron'
import router from '../router'

const App = {
  namespaced: true,
  state: {
    theme: {
      background_color: '#282c37', // #ffffff
      selected_background_color: '#313543', // #f2f6fc
      global_header_color: '#393f4f', // #4a5664
      side_menu_color: '#191b22', // #373d48
      primary_color: '#ffffff', // #303133
      border_color: '#606266' // #ebeef5
    }
  },
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
