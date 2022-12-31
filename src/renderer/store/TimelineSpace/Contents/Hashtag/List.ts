import { LocalTag } from '~/src/types/localTag'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'
import { toRaw } from 'vue'

const win = (window as any) as MyWindow

export type ListState = {
  tags: Array<LocalTag>
}

const state = (): ListState => ({
  tags: []
})

export const MUTATION_TYPES = {
  UPDATE_TAGS: 'updateTags'
}

const mutations: MutationTree<ListState> = {
  [MUTATION_TYPES.UPDATE_TAGS]: (state, tags: Array<LocalTag>) => {
    state.tags = tags
  }
}

export const ACTION_TYPES = {
  LIST_TAGS: 'listTags',
  REMOVE_TAG: 'removeTag'
}

const actions: ActionTree<ListState, RootState> = {
  [ACTION_TYPES.LIST_TAGS]: async ({ rootState, commit }) => {
    const tags: Array<LocalTag> = await win.ipcRenderer.invoke('list-hashtags', rootState.TimelineSpace.account!.id)
    commit(MUTATION_TYPES.UPDATE_TAGS, tags)
    return tags
  },
  [ACTION_TYPES.REMOVE_TAG]: async ({ dispatch }, tag: LocalTag) => {
    await win.ipcRenderer.invoke('remove-hashtag', toRaw(tag))
    dispatch(ACTION_TYPES.LIST_TAGS)
    dispatch('TimelineSpace/SideMenu/listTags', {}, { root: true })
    return 'deleted'
  }
}

const List: Module<ListState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default List
