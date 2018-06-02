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
    saveTag (_, tag) {
      ipcRenderer.send('save-hashtag', tag)
    }
  }
}

export default Hashtag
