import generator, { Entity, NotificationType } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'
import { LoadingCard } from '@/types/loading-card'
import { LocalMarker } from '~/src/types/localMarker'

const win = (window as any) as MyWindow

const excludes: Array<string> = [
  NotificationType.Follow,
  NotificationType.Favourite,
  NotificationType.Reblog,
  NotificationType.PollVote,
  NotificationType.PollExpired
]

export type MentionsState = {
  lazyLoading: boolean
  heading: boolean
  mentions: Array<Entity.Notification | LoadingCard>
  scrolling: boolean
}

const state = (): MentionsState => ({
  lazyLoading: false,
  heading: true,
  mentions: [],
  scrolling: false
})

export const MUTATION_TYPES = {
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  CHANGE_HEADING: 'changeHeading',
  APPEND_MENTIONS: 'appendMentions',
  UPDATE_MENTIONS: 'updateMentions',
  INSERT_MENTIONS: 'insertMentions',
  ARCHIVE_MENTIONS: 'archiveMentions',
  CLEAR_MENTIONS: 'clearMentions',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  CHANGE_SCROLLING: 'changeScrolling',
  APPEND_MENTIONS_AFTER_LOADING_CARD: 'appendMentionsAfterLoadingCard'
}

const mutations: MutationTree<MentionsState> = {
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
  },
  [MUTATION_TYPES.CHANGE_HEADING]: (state, value: boolean) => {
    state.heading = value
  },
  [MUTATION_TYPES.APPEND_MENTIONS]: (state, update: Entity.Notification) => {
    // Reject duplicated status in timeline
    if (!state.mentions.find(item => item.id === update.id)) {
      state.mentions = ([update] as Array<Entity.Notification | LoadingCard>).concat(state.mentions)
    }
  },
  [MUTATION_TYPES.UPDATE_MENTIONS]: (state, messages: Array<Entity.Notification | LoadingCard>) => {
    state.mentions = messages
  },
  [MUTATION_TYPES.INSERT_MENTIONS]: (state, messages: Array<Entity.Notification | LoadingCard>) => {
    state.mentions = state.mentions.concat(messages)
  },
  [MUTATION_TYPES.ARCHIVE_MENTIONS]: state => {
    state.mentions = state.mentions.slice(0, 40)
  },
  [MUTATION_TYPES.CLEAR_MENTIONS]: state => {
    state.mentions = []
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Entity.Status) => {
    state.mentions = state.mentions.map(mention => {
      if (mention.type === 'mention' && mention.status && mention.status.id === message.id) {
        const status = {
          status: message
        }
        return Object.assign(mention, status)
      } else {
        return mention
      }
    })
  },
  [MUTATION_TYPES.DELETE_TOOT]: (state, id: string) => {
    state.mentions = state.mentions.filter(m => {
      if (m.id === 'loading-card') {
        return true
      }
      const mention = m as Entity.Notification
      if (mention.status) {
        if (mention.status.reblog && mention.status.reblog.id === id) {
          return false
        } else {
          return mention.status.id !== id
        }
      } else {
        return true
      }
    })
  },
  [MUTATION_TYPES.CHANGE_SCROLLING]: (state, value: boolean) => {
    state.scrolling = value
  },
  [MUTATION_TYPES.APPEND_MENTIONS_AFTER_LOADING_CARD]: (state, mentions: Array<Entity.Notification | LoadingCard>) => {
    const m = state.mentions.flatMap(mention => {
      if (mention.id !== 'loading-card') {
        return mention
      } else {
        return mentions
      }
    })
    // Reject duplicated status in timeline
    state.mentions = Array.from(new Set(m))
  }
}

const actions: ActionTree<MentionsState, RootState> = {
  fetchMentions: async ({ dispatch, commit, rootState }): Promise<Array<Entity.Notification>> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )

    const localMarker: LocalMarker | null = await dispatch('getMarker').catch(err => {
      console.error(err)
    })

    if (rootState.TimelineSpace.timelineSetting.useMarker.mentions && localMarker !== null) {
      const nextResponse = await client.getNotifications({
        limit: 1,
        min_id: localMarker.last_read_id,
        exclude_types: excludes
      })
      if (nextResponse.data.length > 0) {
        const card: LoadingCard = {
          type: 'middle-load',
          since_id: localMarker.last_read_id,
          max_id: null,
          id: 'loading-card'
        }
        let mentions: Array<Entity.Notification | LoadingCard> = [card]
        const res = await client.getNotifications({ limit: 30, max_id: nextResponse.data[0].id, exclude_types: excludes })
        mentions = mentions.concat(res.data)
        commit(MUTATION_TYPES.UPDATE_MENTIONS, mentions)
        commit('TimelineSpace/SideMenu/changeUnreadMentions', true, { root: true })
        return res.data
      }
    }

    const res = await client.getNotifications({
      limit: 30,
      exclude_types: excludes
    })
    commit(MUTATION_TYPES.UPDATE_MENTIONS, res.data)
    return res.data
  },
  lazyFetchMentions: async ({ state, commit, rootState }, lastMention: Entity.Notification): Promise<Array<Entity.Notification> | null> => {
    if (state.lazyLoading) {
      return Promise.resolve(null)
    }
    commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, true)
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    return client
      .getNotifications({
        max_id: lastMention.id,
        limit: 30,
        exclude_types: excludes
      })
      .then(res => {
        commit(MUTATION_TYPES.INSERT_MENTIONS, res.data)
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
      })
  },
  fetchMentionsSince: async ({ state, rootState, commit }, since_id: string): Promise<Array<Entity.Notification> | null> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const cardIndex = state.mentions.findIndex(s => {
      if (s.id === 'loading-card') {
        return true
      }
      return false
    })
    let maxID: string | null = null
    if (cardIndex > 0) {
      maxID = state.mentions[cardIndex - 1].id
    }
    let params = { min_id: since_id, limit: 30, exlude_types: excludes }
    if (maxID !== null) {
      params = Object.assign({}, params, {
        max_id: maxID
      })
    }

    const res = await client.getNotifications(params)
    if (res.data.length >= 30) {
      const card: LoadingCard = {
        type: 'middle-load',
        since_id: res.data[0].id,
        max_id: maxID,
        id: 'loading-card'
      }
      let mentions: Array<Entity.Notification | LoadingCard> = [card]
      mentions = mentions.concat(res.data)
      commit(MUTATION_TYPES.APPEND_MENTIONS_AFTER_LOADING_CARD, mentions)
    } else {
      commit(MUTATION_TYPES.APPEND_MENTIONS_AFTER_LOADING_CARD, res.data)
    }
    return res.data
  },
  getMarker: async ({ rootState }): Promise<LocalMarker | null> => {
    const localMarker: LocalMarker | null = await win.ipcRenderer.invoke('get-mentions-marker', rootState.TimelineSpace.account._id)
    return localMarker
  },
  saveMarker: async ({ state, rootState }) => {
    const mentions = state.mentions
    if (mentions.length === 0 || mentions[0].id === 'loading-card') {
      return
    }
    win.ipcRenderer.send('save-marker', {
      owner_id: rootState.TimelineSpace.account._id,
      timeline: 'mentions',
      last_read_id: mentions[0].id
    } as LocalMarker)
  }
}

const getters: GetterTree<MentionsState, RootState> = {
  mentions: state => {
    return state.mentions.filter(mention => {
      switch (mention.type) {
        case 'middle-load':
        case NotificationType.Mention:
          return true
        default:
          return false
      }
    })
  }
}

const Mentions: Module<MentionsState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

export default Mentions
