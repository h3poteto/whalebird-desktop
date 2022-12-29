import generator, { Entity, FilterContext, NotificationType } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { LocalMarker } from '~/src/types/localMarker'
import { MyWindow } from '~/src/types/global'
import { LoadingCard } from '@/types/loading-card'

const win = (window as any) as MyWindow

export type NotificationsState = {
  lazyLoading: boolean
  heading: boolean
  notifications: Array<Entity.Notification | LoadingCard>
}

const state = (): NotificationsState => ({
  lazyLoading: false,
  heading: true,
  notifications: []
})

export const MUTATION_TYPES = {
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  CHANGE_HEADING: 'changeHeading',
  APPEND_NOTIFICATIONS: 'appendNotifications',
  UPDATE_NOTIFICATIONS: 'updateNotifications',
  INSERT_NOTIFICATIONS: 'insertNotifications',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  CLEAR_NOTIFICATIONS: 'clearNotifications',
  ARCHIVE_NOTIFICATIONS: 'archiveNotifications',
  APPEND_NOTIFICATIONS_AFTER_LOADING_CARD: 'appendNotificationsAfterLoadingCard'
}

const mutations: MutationTree<NotificationsState> = {
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
  },
  [MUTATION_TYPES.CHANGE_HEADING]: (state, value: boolean) => {
    state.heading = value
  },
  [MUTATION_TYPES.APPEND_NOTIFICATIONS]: (state, notification: Entity.Notification) => {
    // Reject duplicated status in timeline
    if (!state.notifications.find(item => item.id === notification.id)) {
      state.notifications = ([notification] as Array<Entity.Notification | LoadingCard>).concat(state.notifications)
    }
  },
  [MUTATION_TYPES.UPDATE_NOTIFICATIONS]: (state, notifications: Array<Entity.Notification | LoadingCard>) => {
    state.notifications = notifications
  },
  [MUTATION_TYPES.INSERT_NOTIFICATIONS]: (state, notifications: Array<Entity.Notification | LoadingCard>) => {
    state.notifications = state.notifications.concat(notifications)
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Entity.Status) => {
    state.notifications = state.notifications.map(notification => {
      // I want to update toot only mention.
      // Because Toot component don't use status information when other patterns.
      if (notification.type === 'mention' && notification.status && notification.status.id === message.id) {
        const status = {
          status: message
        }
        return Object.assign(notification, status)
      } else {
        return notification
      }
    })
  },
  [MUTATION_TYPES.DELETE_TOOT]: (state, id: string) => {
    state.notifications = state.notifications.filter(notify => {
      if (notify.id === 'loading-card') {
        return true
      }
      const notification = notify as Entity.Notification
      if (notification.status) {
        if (notification.status.reblog && notification.status.reblog.id === id) {
          return false
        } else {
          return notification.status.id !== id
        }
      } else {
        return true
      }
    })
  },
  [MUTATION_TYPES.CLEAR_NOTIFICATIONS]: state => {
    state.notifications = []
  },
  [MUTATION_TYPES.ARCHIVE_NOTIFICATIONS]: state => {
    state.notifications = state.notifications.slice(0, 30)
  },
  [MUTATION_TYPES.APPEND_NOTIFICATIONS_AFTER_LOADING_CARD]: (state, notifications: Array<Entity.Notification | LoadingCard>) => {
    const n = state.notifications.flatMap(notify => {
      if (notify.id !== 'loading-card') {
        return notify
      } else {
        return notifications
      }
    })
    // Reject duplicated status in timeline
    state.notifications = Array.from(new Set(n))
  }
}

export const ACTION_TYPES = {
  FETCH_NOTIFICATIONS: 'fetchNotifications',
  LAZY_FETCH_NOTIFICATIONS: 'lazyFetchNotifications',
  FETCH_NOTIFICATIONS_SINCE: 'fetchNotificationsSince',
  RESET_BADGE: 'resetBadge',
  GET_MARKER: 'getMarker',
  SAVE_MARKER: 'saveMarker'
}

const actions: ActionTree<NotificationsState, RootState> = {
  [ACTION_TYPES.FETCH_NOTIFICATIONS]: async ({ dispatch, commit, rootState }): Promise<Array<Entity.Notification>> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )

    const localMarker: LocalMarker | null = await dispatch('getMarker').catch(err => {
      console.error(err)
    })

    if (rootState.TimelineSpace.timelineSetting.useMarker.notifications && localMarker !== null) {
      // The result does not contain max_id's notification, when we specify max_id parameter in get notifications.
      // So we need to get max_id's notification.
      const nextResponse = await client.getNotifications({ limit: 1, min_id: localMarker.last_read_id })
      if (nextResponse.data.length > 0) {
        const card: LoadingCard = {
          type: 'middle-load',
          since_id: localMarker.last_read_id,
          // We don't need to fill this field in the first fetching.
          // Because in most cases there is no new statuses at the first fetching.
          // After new statuses are received, if the number of unread statuses is more than 30, max_id is not necessary.
          // We can fill max_id when calling fetchTimelineSince.
          // If the number of unread statuses is less than 30, max_id is necessary, but it is enough to reject duplicated statuses.
          // So we do it in mutation.
          max_id: null,
          id: 'loading-card',
          uri: 'loading-card'
        }
        let notifications: Array<Entity.Notification | LoadingCard> = [card]
        const res = await client.getNotifications({ limit: 30, max_id: nextResponse.data[0].id })
        notifications = notifications.concat(res.data)
        commit(MUTATION_TYPES.UPDATE_NOTIFICATIONS, notifications)
        commit('TimelineSpace/SideMenu/changeUnreadNotifications', true, { root: true })
        return res.data
      }
    }
    const res = await client.getNotifications({ limit: 30 })
    commit(MUTATION_TYPES.UPDATE_NOTIFICATIONS, res.data)
    return res.data
  },
  [ACTION_TYPES.LAZY_FETCH_NOTIFICATIONS]: async (
    { state, commit, rootState },
    lastNotification: Entity.Notification
  ): Promise<Array<Entity.Notification> | null> => {
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
      .getNotifications({ max_id: lastNotification.id, limit: 30 })
      .then(res => {
        commit(MUTATION_TYPES.INSERT_NOTIFICATIONS, res.data)
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
      })
  },
  [ACTION_TYPES.FETCH_NOTIFICATIONS_SINCE]: async (
    { state, rootState, commit },
    since_id: string
  ): Promise<Array<Entity.Notification> | null> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const cardIndex = state.notifications.findIndex(s => {
      if (s.id === 'loading-card') {
        return true
      }
      return false
    })
    let maxID: string | null = null
    if (cardIndex > 0) {
      maxID = state.notifications[cardIndex - 1].id
    }
    let params = { min_id: since_id, limit: 30 }
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
        id: 'loading-card',
        uri: 'loading-card'
      }
      let notifications: Array<Entity.Notification | LoadingCard> = [card]
      notifications = notifications.concat(res.data)
      commit(MUTATION_TYPES.APPEND_NOTIFICATIONS_AFTER_LOADING_CARD, notifications)
    } else {
      commit(MUTATION_TYPES.APPEND_NOTIFICATIONS_AFTER_LOADING_CARD, res.data)
    }
    return res.data
  },
  [ACTION_TYPES.RESET_BADGE]: () => {
    win.ipcRenderer.send('reset-badge')
  },
  [ACTION_TYPES.GET_MARKER]: async ({ rootState }): Promise<LocalMarker | null> => {
    if (!rootState.TimelineSpace.timelineSetting.useMarker.notifications) {
      return null
    }
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    let serverMarker: Entity.Marker | {} = {}
    try {
      const res = await client.getMarkers(['notifications'])
      serverMarker = res.data
    } catch (err) {
      console.warn(err)
    }
    const s = serverMarker as Entity.Marker
    if (s.notifications !== undefined) {
      return {
        timeline: 'notifications',
        last_read_id: s.notifications.last_read_id
      } as LocalMarker
    }
    const localMarker: LocalMarker | null = await win.ipcRenderer.invoke('get-notifications-marker', rootState.TimelineSpace.account._id)
    return localMarker
  },
  [ACTION_TYPES.SAVE_MARKER]: async ({ state, rootState }) => {
    const notifications = state.notifications
    if (notifications.length === 0 || notifications[0].id === 'loading-card') {
      return
    }
    win.ipcRenderer.send('save-marker', {
      owner_id: rootState.TimelineSpace.account._id,
      timeline: 'notifications',
      last_read_id: notifications[0].id
    } as LocalMarker)

    if (rootState.TimelineSpace.sns === 'misskey') {
      return
    }
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.saveMarkers({ notifications: { last_read_id: notifications[0].id } })
    if (rootState.TimelineSpace.sns === 'pleroma') {
      await client.readNotifications({ max_id: notifications[0].id })
    }
    return res.data
  }
}

const getters: GetterTree<NotificationsState, RootState> = {
  handledNotifications: state => {
    return state.notifications.filter(n => {
      switch (n.type) {
        case 'middle-load':
        case NotificationType.Follow:
        case NotificationType.Favourite:
        case NotificationType.Reblog:
        case NotificationType.Mention:
        case NotificationType.EmojiReaction:
        case NotificationType.FollowRequest:
        case NotificationType.Status:
        case NotificationType.PollVote:
        case NotificationType.PollExpired:
          return true
        default:
          return false
      }
    })
  },
  filters: (_state, _getters, rootState) => {
    return rootState.TimelineSpace.filters.filter(f => f.context.includes(FilterContext.Notifications) && !f.irreversible)
  }
}

const Notifications: Module<NotificationsState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

export default Notifications
