import List, { ListState } from './Hashtag/List'
import Tag, { TagState } from './Hashtag/Tag'
import { Module, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

export type HashtagState = {}

type HashtagModule = {
  List: ListState
  Tag: TagState
}

export type HashtagModuleState = HashtagModule & HashtagState

const state = (): HashtagState => ({})

const actions: ActionTree<HashtagState, RootState> = {
  saveTag: ({ dispatch }, tag: string) => {
    win.ipcRenderer.once('response-save-hashtag', () => {
      dispatch('TimelineSpace/SideMenu/listTags', {}, { root: true })
    })
    win.ipcRenderer.send('save-hashtag', tag)
  }
}

const Hashtag: Module<HashtagState, RootState> = {
  namespaced: true,
  modules: {
    List,
    Tag
  },
  state: state,
  actions: actions
}

export default Hashtag
