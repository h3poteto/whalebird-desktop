import List, { ListState } from './Hashtag/List'
import Tag, { TagState } from './Hashtag/Tag'
import { Module, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = (window as any) as MyWindow

export type HashtagState = {}

type HashtagModule = {
  List: ListState
  Tag: TagState
}

export type HashtagModuleState = HashtagModule & HashtagState

const state = (): HashtagState => ({})

const actions: ActionTree<HashtagState, RootState> = {
  saveTag: async ({ dispatch, rootState }, tag: string) => {
    await win.ipcRenderer.invoke('save-hashtag', { accountId: rootState.TimelineSpace.account!.id, tag })
    dispatch('TimelineSpace/SideMenu/listTags', {}, { root: true })
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
