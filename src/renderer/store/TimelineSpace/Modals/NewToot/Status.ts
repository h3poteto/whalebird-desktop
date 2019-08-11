import { ipcRenderer } from 'electron'
import emojilib from 'emojilib'
import Mastodon, { Account, Response, Results } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store/index'
import { LocalTag } from '~/src/types/localTag'
import { InsertAccountCache } from '~/src/types/insertAccountCache'
import { CachedAccount } from '~/src/types/cachedAccount'

type Suggest = {
  name: string
  image?: string | null
  code?: string | null
}

type SuggestAccount = Suggest

type SuggestHashtag = Suggest

type SuggestEmoji = Suggest

export type StatusState = {
  filteredSuggestion: Array<Suggest>
  filteredAccounts: Array<SuggestAccount>
  filteredHashtags: Array<SuggestHashtag>
  filteredEmojis: Array<SuggestEmoji>
  openSuggest: boolean
  startIndex: number | null
  matchWord: string | null
}

const state = (): StatusState => ({
  filteredSuggestion: [],
  filteredAccounts: [],
  filteredHashtags: [],
  filteredEmojis: [],
  openSuggest: false,
  startIndex: null,
  matchWord: null
})

export const MUTATION_TYPES = {
  APPEND_FILTERED_ACCOUNTS: 'appendFilteredAccounts',
  CLEAR_FILTERED_ACCOUNTS: 'clearFilteredAccounts',
  APPEND_FILTERED_HASHTAGS: 'appendFilteredHashtags',
  CLEAR_FILTERED_HASHTAGS: 'clearFilteredHashtags',
  UPDATE_FILTERED_EMOJIS: 'updateFilteredEmojis',
  CLEAR_FILTERED_EMOJIS: 'clearFilteredEmojis',
  CHANGE_OPEN_SUGGEST: 'changeOpenSuggest',
  CHANGE_START_INDEX: 'changeStartIndex',
  CHANGE_MATCH_WORD: 'changeMatchWord',
  FILTERED_SUGGESTION_FROM_HASHTAGS: 'filteredSuggestionFromHashtags',
  FILTERED_SUGGESTION_FROM_ACCOUNTS: 'filteredSuggestionFromAccounts',
  FILTERED_SUGGESTION_FROM_EMOJIS: 'filteredSuggestionFromEmojis',
  CLEAR_FILTERED_SUGGESTION: 'clearFilteredSuggestion'
}

const mutations: MutationTree<StatusState> = {
  [MUTATION_TYPES.APPEND_FILTERED_ACCOUNTS]: (state, accounts: Array<string>) => {
    const suggestion = accounts.map(a => ({
      name: `@${a}`,
      image: null
    }))
    const appended = state.filteredAccounts.concat(suggestion)
    const unique = appended.filter((v1, i1, a1) => {
      return (
        a1.findIndex(v2 => {
          return v1.name === v2.name
        }) === i1
      )
    })
    state.filteredAccounts = unique.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
  },
  [MUTATION_TYPES.CLEAR_FILTERED_ACCOUNTS]: state => {
    state.filteredAccounts = []
  },
  [MUTATION_TYPES.APPEND_FILTERED_HASHTAGS]: (state, tags: Array<string>) => {
    const suggestion = tags.map(t => ({
      name: `#${t}`,
      image: null
    }))
    const appended = state.filteredHashtags.concat(suggestion)
    const unique = appended.filter((v1, i1, a1) => {
      return (
        a1.findIndex(v2 => {
          return v1.name === v2.name
        }) === i1
      )
    })
    Array.from(new Set(appended))
    state.filteredHashtags = unique.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
  },
  [MUTATION_TYPES.CLEAR_FILTERED_HASHTAGS]: state => {
    state.filteredHashtags = []
  },
  [MUTATION_TYPES.UPDATE_FILTERED_EMOJIS]: (state, emojis: Array<SuggestEmoji>) => {
    state.filteredEmojis = emojis
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
  [MUTATION_TYPES.FILTERED_SUGGESTION_FROM_EMOJIS]: state => {
    state.filteredSuggestion = state.filteredEmojis
  },
  [MUTATION_TYPES.CLEAR_FILTERED_SUGGESTION]: state => {
    state.filteredSuggestion = []
  }
}

type WordStart = {
  word: string
  start: number
}

const actions: ActionTree<StatusState, RootState> = {
  suggestAccount: async ({ commit, rootState }, wordStart: WordStart) => {
    commit(MUTATION_TYPES.CLEAR_FILTERED_ACCOUNTS)
    commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_ACCOUNTS)
    const { word, start } = wordStart
    const searchCache = () => {
      return new Promise(resolve => {
        const target = word.replace('@', '')
        ipcRenderer.once('response-get-cache-accounts', (_, accounts: Array<CachedAccount>) => {
          const matched = accounts.map(account => account.acct).filter(acct => acct.includes(target))
          if (matched.length === 0) throw new Error('Empty')
          commit(MUTATION_TYPES.APPEND_FILTERED_ACCOUNTS, matched)
          commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
          commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
          commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
          commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_ACCOUNTS)
          resolve(matched)
        })
        ipcRenderer.send('get-cache-accounts', rootState.TimelineSpace.account._id)
      })
    }
    const searchAPI = async () => {
      const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
      const res: Response<Array<Account>> = await client.get<Array<Account>>('/accounts/search', { q: word, resolve: false })
      if (res.data.length === 0) throw new Error('Empty')
      commit(MUTATION_TYPES.APPEND_FILTERED_ACCOUNTS, res.data.map(account => account.acct))
      ipcRenderer.send('insert-cache-accounts', {
        ownerID: rootState.TimelineSpace.account._id!,
        accts: res.data.map(a => a.acct)
      } as InsertAccountCache)
      commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
      commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
      commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
      commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_ACCOUNTS)
      return res.data
    }
    await Promise.all([searchCache(), searchAPI()])
  },
  suggestHashtag: async ({ commit, rootState }, wordStart: WordStart) => {
    commit(MUTATION_TYPES.CLEAR_FILTERED_HASHTAGS)
    commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS)
    const { word, start } = wordStart
    const searchCache = () => {
      return new Promise(resolve => {
        const target = word.replace('#', '')
        ipcRenderer.once('response-get-cache-hashtags', (_, tags: Array<LocalTag>) => {
          const matched = tags.map(tag => tag.tagName).filter(tag => tag.includes(target))
          if (matched.length === 0) throw new Error('Empty')
          commit(MUTATION_TYPES.APPEND_FILTERED_HASHTAGS, matched)
          commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
          commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
          commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
          commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS)
          resolve(matched)
        })
        ipcRenderer.send('get-cache-hashtags')
      })
    }
    const searchAPI = async () => {
      const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v2')
      const res: Response<Results> = await client.get<Results>('/search', { q: word })
      if (res.data.hashtags.length === 0) throw new Error('Empty')
      commit(MUTATION_TYPES.APPEND_FILTERED_HASHTAGS, res.data.hashtags.map(tag => tag.name))
      ipcRenderer.send('insert-cache-hashtags', res.data.hashtags.map(tag => tag.name))
      commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
      commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
      commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
      commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS)
      return res.data.hashtags
    }
    await Promise.all([searchCache(), searchAPI()])
  },
  suggestEmoji: ({ commit, rootState }, wordStart: WordStart) => {
    const { word, start } = wordStart
    // Find native emojis
    const filteredEmojiName: Array<string> = emojilib.ordered.filter((emoji: string) => `:${emoji}:`.includes(word))
    const filteredNativeEmoji: Array<SuggestEmoji> = filteredEmojiName.map((name: string) => {
      return {
        name: `:${name}:`,
        code: emojilib.lib[name].char
      }
    })
    // Find custom emojis
    const filteredCustomEmoji: Array<Suggest> = rootState.TimelineSpace.emojis
      .map(emoji => {
        return {
          name: `:${emoji.shortcode}:`,
          image: emoji.url
        }
      })
      .filter(emoji => emoji.name.includes(word))
    const filtered: Array<SuggestEmoji> = filteredNativeEmoji.concat(filteredCustomEmoji)
    if (filtered.length === 0) throw new Error('Empty')
    commit(
      MUTATION_TYPES.UPDATE_FILTERED_EMOJIS,
      filtered.filter((e, i, array) => {
        return array.findIndex(ar => e.name === ar.name) === i
      })
    )
    commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
    commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
    commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
    commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_EMOJIS)
    return filtered
  },
  closeSuggest: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, false)
    commit(MUTATION_TYPES.CHANGE_START_INDEX, null)
    commit(MUTATION_TYPES.CHANGE_MATCH_WORD, null)
    commit(MUTATION_TYPES.CLEAR_FILTERED_SUGGESTION)
    commit(MUTATION_TYPES.CLEAR_FILTERED_ACCOUNTS)
    commit(MUTATION_TYPES.CLEAR_FILTERED_HASHTAGS)
  }
}

const getters: GetterTree<StatusState, RootState> = {
  pickerEmojis: (_state, _getters, rootState) => {
    return rootState.TimelineSpace.emojis
      .map(emoji => {
        return {
          name: `:${emoji.shortcode}:`,
          image: emoji.url
        }
      })
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
