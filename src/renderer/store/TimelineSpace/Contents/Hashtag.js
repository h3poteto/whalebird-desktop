import { ipcRenderer } from 'electron'
import List from './Hashtag/List'
import Tag from './Hashtag/Tag'

const Hashtag = {
  namespaced: true,
  modules: {
    List,
    Tag
  },
  actions: {
    saveTag ({ dispatch }, tag) {
      ipcRenderer.once('response-save-hashtag', () => {
        dispatch('TimelineSpace/SideMenu/listTags', {}, { root: true })
      })
      ipcRenderer.send('save-hashtag', tag)
    }
  }
}

export default Hashtag
