import { EmojiIndex } from 'emoji-mart-vue-fast'
import emojidata from 'emoji-mart-vue-fast/data/all.json'
import generator, { MegalodonInterface } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store/index'
import { LocalTag } from '~/src/types/localTag'
import { InsertAccountCache } from '~/src/types/insertAccountCache'
import { CachedAccount } from '~/src/types/cachedAccount'
import { MyWindow } from '~/src/types/global'

const win = window as any as MyWindow

const emojiIndex = new EmojiIndex(emojidata)

type EmojiMartEmoji = {
  id: string
  name: string
  colons: string
  text: string
  emoticons: Array<string>
  skin: any
  native: string
}

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
  startIndex: number
  matchWord: string
  client: MegalodonInterface | null
}

const state = (): StatusState => ({
  filteredSuggestion: [],
  filteredAccounts: [],
  filteredHashtags: [],
  filteredEmojis: [],
  openSuggest: false,
  startIndex: 0,
  matchWord: '',
  client: null
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
  CLEAR_FILTERED_SUGGESTION: 'clearFilteredSuggestion',
  SET_CLIENT: 'setClient',
  CLEAR_CLIENT: 'clearClient'
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
  [MUTATION_TYPES.CHANGE_START_INDEX]: (state, index: number) => {
    state.startIndex = index
  },
  [MUTATION_TYPES.CHANGE_MATCH_WORD]: (state, word: string) => {
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
  },
  [MUTATION_TYPES.SET_CLIENT]: (state, client: MegalodonInterface) => {
    state.client = client
  },
  [MUTATION_TYPES.CLEAR_CLIENT]: state => {
    state.client = null
  }
}

type WordStart = {
  word: string
  start: number
}

export const ACTION_TYPES = {
  SUGGEST_ACCOUNT: 'suggestAccount',
  SUGGEST_HASHTAG: 'suggestHashtag',
  SUGGEST_EMOJI: 'suggestEmoji',
  CANCEL_REQUEST: 'cancelRequest',
  CLOSE_SUGGEST: 'closeSuggest'
}

const actions: ActionTree<StatusState, RootState> = {
  [ACTION_TYPES.SUGGEST_ACCOUNT]: async ({ commit, rootState, dispatch }, wordStart: WordStart) => {
    dispatch('cancelRequest')
    commit(MUTATION_TYPES.CLEAR_FILTERED_ACCOUNTS)
    commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_ACCOUNTS)
    const { word, start } = wordStart
    const searchCache = async () => {
      const target = word.replace('@', '')
      const accounts: Array<CachedAccount> = await win.ipcRenderer.invoke('get-cache-accounts', rootState.TimelineSpace.account._id)
      const matched = accounts.map(account => account.acct).filter(acct => acct.includes(target))
      if (matched.length === 0) throw new Error('Empty')
      commit(MUTATION_TYPES.APPEND_FILTERED_ACCOUNTS, matched)
      commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
      commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
      commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
      commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_ACCOUNTS)
      return matched
    }
    const searchAPI = async () => {
      const client = generator(
        rootState.TimelineSpace.sns,
        rootState.TimelineSpace.account.baseURL,
        rootState.TimelineSpace.account.accessToken,
        rootState.App.userAgent
      )
      commit(MUTATION_TYPES.SET_CLIENT, client)
      const res = await client.searchAccount(word)
      if (res.data.length === 0) throw new Error('Empty')
      commit(
        MUTATION_TYPES.APPEND_FILTERED_ACCOUNTS,
        res.data.map(account => account.acct)
      )
      await win.ipcRenderer.invoke('insert-cache-accounts', {
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
  [ACTION_TYPES.SUGGEST_HASHTAG]: async ({ commit, rootState, dispatch }, wordStart: WordStart) => {
    dispatch('cancelRequest')
    commit(MUTATION_TYPES.CLEAR_FILTERED_HASHTAGS)
    commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS)
    const { word, start } = wordStart
    const searchCache = async () => {
      const target = word.replace('#', '')
      const tags: Array<LocalTag> = await win.ipcRenderer.invoke('get-cache-hashtags')
      const matched = tags.map(tag => tag.tagName).filter(tag => tag.includes(target))
      if (matched.length === 0) throw new Error('Empty')
      commit(MUTATION_TYPES.APPEND_FILTERED_HASHTAGS, matched)
      commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
      commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
      commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
      commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS)
      return matched
    }
    const searchAPI = async () => {
      const client = generator(
        rootState.TimelineSpace.sns,
        rootState.TimelineSpace.account.baseURL,
        rootState.TimelineSpace.account.accessToken,
        rootState.App.userAgent
      )
      commit(MUTATION_TYPES.SET_CLIENT, client)
      const res = await client.search(word, 'hashtags')
      if (res.data.hashtags.length === 0) throw new Error('Empty')
      commit(
        MUTATION_TYPES.APPEND_FILTERED_HASHTAGS,
        res.data.hashtags.map(tag => tag.name)
      )
      await win.ipcRenderer.invoke(
        'insert-cache-hashtags',
        res.data.hashtags.map(tag => tag.name)
      )
      commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, true)
      commit(MUTATION_TYPES.CHANGE_START_INDEX, start)
      commit(MUTATION_TYPES.CHANGE_MATCH_WORD, word)
      commit(MUTATION_TYPES.FILTERED_SUGGESTION_FROM_HASHTAGS)
      return res.data.hashtags
    }
    await Promise.all([searchCache(), searchAPI()])
  },
  [ACTION_TYPES.SUGGEST_EMOJI]: ({ commit, rootState }, wordStart: WordStart) => {
    const { word, start } = wordStart
    // Find native emojis
    const foundEmoji: EmojiMartEmoji = emojiIndex.findEmoji(word)
    if (foundEmoji) {
      return {
        name: foundEmoji.colons,
        code: foundEmoji.native
      }
    }
    let filteredNativeEmoji: Array<SuggestEmoji> = []

    const regexp = word.match(/^:(.+)/)
    if (regexp && regexp.length > 1) {
      const emojiName = regexp[1]
      const filteredEmoji: Array<EmojiMartEmoji> = emojiIndex.search(emojiName)
      filteredNativeEmoji = filteredEmoji.map((emoji: EmojiMartEmoji) => {
        return {
          name: emoji.colons,
          code: emoji.native
        }
      })
    }
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
  [ACTION_TYPES.CANCEL_REQUEST]: ({ state }) => {
    if (state.client) {
      state.client.cancel()
    }
  },
  [ACTION_TYPES.CLOSE_SUGGEST]: ({ commit, dispatch }) => {
    dispatch('cancelRequest')
    commit(MUTATION_TYPES.CHANGE_OPEN_SUGGEST, false)
    commit(MUTATION_TYPES.CHANGE_START_INDEX, 0)
    commit(MUTATION_TYPES.CHANGE_MATCH_WORD, '')
    commit(MUTATION_TYPES.CLEAR_FILTERED_SUGGESTION)
    commit(MUTATION_TYPES.CLEAR_FILTERED_ACCOUNTS)
    commit(MUTATION_TYPES.CLEAR_FILTERED_HASHTAGS)
    commit(MUTATION_TYPES.CLEAR_CLIENT)
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
