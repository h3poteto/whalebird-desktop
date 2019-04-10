import Mastodon, { Account, Tag, Response, Results } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store/index'

interface Suggest {
  name: string,
  image: string | null
}

interface SuggestAccount extends Suggest {}

interface SuggestHashtag extends Suggest {}

export interface StatusState {
  filteredAccounts: Array<SuggestAccount>,
  filteredHashtags: Array<SuggestHashtag>
}

const state = (): StatusState => ({
  filteredAccounts: [],
  filteredHashtags: []
})

export const MUTATION_TYPES = {
  UPDATE_FILTERED_ACCOUNTS: 'updateFilteredAccounts',
  CLEAR_FILTERED_ACCOUNTS: 'clearFilteredAccounts',
  UPDATE_FILTERED_HASHTAGS: 'updateFilteredHashtags',
  CLAER_FILTERED_HASHTAGS: 'clearFilteredHashtags'
}

const mutations: MutationTree<StatusState> = {
  [MUTATION_TYPES.UPDATE_FILTERED_ACCOUNTS]: (state, accounts: Array<Account>) => {
    state.filteredAccounts = accounts.map((a) => {
      return {
        name: `@${a.acct}`,
        image: null
      }
    })
  },
  [MUTATION_TYPES.CLEAR_FILTERED_ACCOUNTS]: (state) => {
    state.filteredAccounts = []
  },
  [MUTATION_TYPES.UPDATE_FILTERED_HASHTAGS]: (state, tags: Array<Tag>) => {
    state.filteredHashtags = tags.map((t) => {
      return {
        name: `#${t}`,
        image: null
      }
    })
  },
  [MUTATION_TYPES.CLEAR_FILTERED_ACCOUNTS]: (state) => {
    state.filteredHashtags = []
  }
}

const actions: ActionTree<StatusState, RootState> = {
  searchAccount: async ({ commit, rootState }, word: string) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const res: Response<Results> = await client.get<Results>('/search', { q: word, resolve: false })
    commit(MUTATION_TYPES.UPDATE_FILTERED_ACCOUNTS, res.data.accounts)
    if (res.data.accounts.length === 0) throw new Error('Empty')
    return res.data.accounts
  },
  searchHashtag: async ({ commit, rootState }, word: string) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const res: Response<Results> = await client.get<Results>('/search', { q: word })
      commit(MUTATION_TYPES.UPDATE_FILTERED_HASHTAGS, res.data.hashtags)
    if (res.data.hashtags.length === 0) throw new Error('Empty')
    return res.data.hashtags
  }
}

const getters: GetterTree<StatusState, RootState> = {
  pickerEmojis: (_state, _getters, rootState) => {
    return rootState.TimelineSpace.emojis.filter((e, i, array) => {
      return (array.findIndex(ar => e.name === ar.name) === i)
    }).map(e => {
      return {
        name: e.name,
        short_names: [e.name],
        text: e.name,
        emoticons: [],
        keywords: [e.name],
        imageUrl: e.image
      }
    })
  }
}

const Status: Module<StatusState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

export default Status
