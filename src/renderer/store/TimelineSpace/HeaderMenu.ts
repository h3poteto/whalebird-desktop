import Mastodon, { List, Response } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'

export interface HeaderMenuState {
  title: string,
  reload: boolean
}

const state = (): HeaderMenuState => ({
  title: 'Home',
  reload: false
})

export const MUTATION_TYPES = {
  UPDATE_TITLE: 'updateTitle',
  CHANGE_RELOAD: 'changeReload'
}

const mutations: MutationTree<HeaderMenuState> = {
  [MUTATION_TYPES.UPDATE_TITLE]: (state, title: string) => {
    state.title = title
  },
  [MUTATION_TYPES.CHANGE_RELOAD]: (state, value: boolean) => {
    state.reload = value
  }
}

// TODO: use type of rootState
const actions: ActionTree<HeaderMenuState, any> = {
  fetchList: async ({ commit, rootState }, listID: number): Promise<List> => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const res: Response<List> = await client.get<List>(`/lists/${listID}`)
    commit(MUTATION_TYPES.UPDATE_TITLE, `#${res.data.title}`)
    return res.data
  }
}

const HeaderMenu: Module<HeaderMenuState, any> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default HeaderMenu
