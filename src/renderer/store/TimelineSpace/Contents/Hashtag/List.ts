import { ipcRenderer } from 'electron'
import Hashtag from '~/src/types/hashtag'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface ListState {
  tags: Array<Hashtag>
}

const state = (): ListState => ({
  tags: []
})

export const MUTATION_TYPES = {
  UPDATE_TAGS: 'updateTags'
}

const mutations: MutationTree<ListState> = {
  [MUTATION_TYPES.UPDATE_TAGS]: (state, tags: Array<Hashtag>) => {
    state.tags = tags
  }
}

const actions: ActionTree<ListState, RootState> = {
  listTags: ({ commit }) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('response-list-hashtags', (_, tags: Array<Hashtag>) => {
        ipcRenderer.removeAllListeners('error-list-hashtags')
        commit(MUTATION_TYPES.UPDATE_TAGS, tags)
        resolve(tags)
      })
      ipcRenderer.once('error-list-hashtags', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-list-hashtags')
        reject(err)
      })
      ipcRenderer.send('list-hashtags')
    })
  },
  removeTag: ({ dispatch }, tag: Hashtag) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('response-remove-hashtag', () => {
        ipcRenderer.removeAllListeners('error-remove-hashtag')
        dispatch('listTags')
        dispatch('TimelineSpace/SideMenu/listTags', {}, { root: true })
        resolve('deleted')
      })
      ipcRenderer.once('error-remove-hashtag', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-remove-hashtag')
        reject(err)
      })
      ipcRenderer.send('remove-hashtag', tag)
    })
  }
}

const List: Module<ListState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default List
