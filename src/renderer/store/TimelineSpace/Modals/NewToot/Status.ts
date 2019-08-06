import { ipcRenderer } from 'electron'
import Mastodon, { Account, Tag, Response, Results } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store/index'
import { LocalTag } from '~/src/types/localTag'

type Suggest = {
  name: string
  image: string | null
}

type SuggestAccount = Suggest

type SuggestHashtag = Suggest

export type StatusState = {
  filteredAccounts: Array<SuggestAccount>
  filteredHashtags: Array<SuggestHashtag>
  openSuggest: boolean
  startIndex: number | null
  matchWord: string | null
  filteredSuggestion: Array<Suggest>
}

const state = (): StatusState => ({
  filteredAccounts: [],
  filteredHashtags: [],
  openSuggest: false,
  startIndex: null,
  matchWord: null,
  filteredSuggestion: []
})

export const MUTATION_TYPES = {
  UPDATE_FILTERED_ACCOUNTS: 'updateFilteredAccounts',
  CLEAR_FILTERED_ACCOUNTS: 'clearFilteredAccounts',
  APPEND_FILTERED_HASHTAGS: 'appendFilteredHashtags',
  CLEAR_FILTERED_HASHTAGS: 'clearFilteredHashtags',
  CHANGE_OPEN_SUGGEST: 'changeOpenSuggest',
  CHANGE_START_INDEX: 'changeStartIndex',
  CHANGE_MATCH_WORD: 'changeMatchWord',
  FILTERED_SUGGESTION_FROM_HASHTAGS: 'filteredSuggestionFromHashtags',
  FILTERED_SUGGESTION_FROM_ACCOUNTS: 'filteredSuggestionFromAccounts',
  CLEAR_FILTERED_SUGGESTION: 'clearFilteredSuggestion',
  CHANGE_FILTERED_SUGGESTION: 'changeFilteredSuggestion'
}

const mutations: MutationTree<StatusState> = {
  [MUTATION_TYPES.UPDATE_FILTERED_ACCOUNTS]: (state, accounts: Array<Account>) => {
    state.filteredAccounts = accounts.map(a => ({
      name: `@${a.acct}`,
      image: null
    }))
  },
  [MUTATION_TYPES.CLEAR_FILTERED_ACCOUNTS]: state => {
    state.filteredAccounts = []
  },
  [MUTATION_TYPES.APPEND_FILTERED_HASHTAGS]: (state, tags: Array<Tag>) => {
    const appended = tags.map(t => ({
      name: `#${t}`,
      image: null
    }))
    state.filteredHashtags = appended.filter((elem, index, self) => self.indexOf(elem) === index)
  },
  [MUTATION_TYPES.CLEAR_FILTERED_HASHTAGS]: state => {
    state.filteredHashtags = []
  },
  [MUTATION_TYPES.CHANGE_OPEN_SUGGEST]: (state, value: boolean) => {
    state.openSuggest = value
  },
  [MUTATION_TYPES.CHANGE_START_INDEX]: (state, index: number | null) => {
    state.startIndex = index
  },
  [MUTATION_TYPES.CHANGE_MATCH_WORD]: (state, word: string | null) => {
    state.matchWord = word
  },
  [MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS]: state => {
    state.filteredSuggestion = state.filteredHashtags
  },
  [MUTATION_TYPES.FILTERED_SUGGESTION_FROM_ACCOUNTS]: state => {
    state.filteredSuggestion = state.filteredAccounts
  },
  [MUTATION_TYPES.CLEAR_FILTERED_SUGGESTION]: state => {
    state.filteredSuggestion = []
  },
  [MUTATION_TYPES.CHANGE_FILTERED_SUGGESTION]: (state, suggestion: Array<Suggest>) => {
    state.filteredSuggestion = suggestion
  }
}

type WordStart = {
  word: string
  start: number
}

const actions: ActionTree<StatusState, RootState> = {
  searchAccount: async ({ commit, rootState }, word: string) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Results> = await client.get<Results>('/search', { q: word, resolve: false })
    commit(MUTATION_TYPES.UPDATE_FILTERED_ACCOUNTS, res.data.accounts)
    if (res.data.accounts.length === 0) throw new Error('Empty')
    return res.data.accounts
  },
  suggestHashtag: async ({ commit, rootState }, wordStart: WordStart) => {
    commit(MUTATION_TYPES.CLEAR_FILTERED_HASHTAGS)
    commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS)
    const { word, start } = wordStart
    const searchCache = () => {
      return new Promise(resolve => {
        const target = word.replace('#', '')
        ipcRenderer.once('response-get-cache-hashtags', (_, tags: Array<LocalTag>) => {
          const mached = tags.filter(tag => tag.tagName.includes(target)).map(tag => tag.tagName)
          commit(MUTATION_TYPES.APPEND_FILTERED_HASHTAGS, mached)
          if (mached.length === 0) throw new Error('Empty')
          commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
          commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
          commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
          commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS)
          resolve(mached)
        })
        ipcRenderer.send('get-cache-hashtags')
      })
    }
    const searchAPI = async () => {
      const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
      const res: Response<Results> = await client.get<Results>('/search', { q: word })
      commit(MUTATION_TYPES.APPEND_FILTERED_HASHTAGS, res.data.hashtags)
      ipcRenderer.send('insert-cache-hashtags', res.data.hashtags)
      if (res.data.hashtags.length === 0) throw new Error('Empty')
      commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
      commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
      commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
      commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS)
      return res.data.hashtags
    }
    await Promise.all([searchCache(), searchAPI()])
  }
}

const getters: GetterTree<StatusState, RootState> = {
  pickerEmojis: (_state, _getters, rootState) => {
    return rootState.TimelineSpace.emojis
      .filter((e, i, array) => {
        return array.findIndex(ar => e.name === ar.name) === i
      })
      .map(e => {
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
