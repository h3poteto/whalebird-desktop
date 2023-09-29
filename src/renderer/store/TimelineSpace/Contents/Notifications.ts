import generator, { Entity, FilterContext } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'
import { LoadingCard } from '@/types/loading-card'
import { LocalServer } from '~/src/types/localServer'
import { LocalAccount } from '~/src/types/localAccount'

const win = (window as any) as MyWindow

export type NotificationsState = {
  notifications: { [key: number]: Array<Entity.Notification | LoadingCard> }
}

const state = (): NotificationsState => ({
  notifications: {}
})

export const MUTATION_TYPES = {
  APPEND_NOTIFICATIONS: 'appendNotifications',
  REPLACE_NOTIFICATIONS: 'updateNotifications',
  INSERT_NOTIFICATIONS: 'insertNotifications',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  APPEND_NOTIFICATIONS_AFTER_LOADING_CARD: 'appendNotificationsAfterLoadingCard'
}

const mutations: MutationTree<NotificationsState> = {
  [MUTATION_TYPES.APPEND_NOTIFICATIONS]: (state, obj: { notification: Entity.Notification; accountId: number }) => {
    if (state.notifications[obj.accountId]) {
      state.notifications[obj.accountId] = [obj.notification, ...state.notifications[obj.accountId]]
    } else {
      state.notifications[obj.accountId] = [obj.notification]
    }
  },
  [MUTATION_TYPES.REPLACE_NOTIFICATIONS]: (state, obj: { notifications: Array<Entity.Notification | LoadingCard>; accountId: number }) => {
    state.notifications[obj.accountId] = obj.notifications
  },
  [MUTATION_TYPES.INSERT_NOTIFICATIONS]: (state, obj: { notifications: Array<Entity.Notification | LoadingCard>; accountId: number }) => {
    if (state.notifications[obj.accountId]) {
      state.notifications[obj.accountId] = [...state.notifications[obj.accountId], ...obj.notifications]
    } else {
      state.notifications[obj.accountId] = obj.notifications
    }
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, obj: { status: Entity.Status; accountId: number }) => {
    if (!state.notifications[obj.accountId]) return
    state.notifications[obj.accountId] = state.notifications[obj.accountId].map(notification => {
      // I want to update toot only mention.
      // Because Toot component don't use status information when other patterns.
      if (notification.type === 'mention' && notification.status && notification.status.id === obj.status.id) {
        const status = {
          status: obj.status
        }
        return Object.assign(notification, status)
      } else {
        return notification
      }
    })
  },
  [MUTATION_TYPES.DELETE_TOOT]: (state, obj: { statusId: string; accountId: number }) => {
    if (!state.notifications[obj.accountId]) return
    state.notifications[obj.accountId] = state.notifications[obj.accountId].filter(notify => {
      if (notify.id === 'loading-card') {
        return true
      }
      const notification = notify as Entity.Notification
      if (notification.status) {
        if (notification.status.reblog && notification.status.reblog.id === obj.statusId) {
          return false
        } else {
          return notification.status.id !== obj.statusId
        }
      } else {
        return true
      }
    })
  },
  [MUTATION_TYPES.APPEND_NOTIFICATIONS_AFTER_LOADING_CARD]: (
    state,
    obj: { notifications: Array<Entity.Notification | LoadingCard>; accountId: number }
  ) => {
    if (!state.notifications[obj.accountId]) return
    const n = state.notifications[obj.accountId].flatMap(notify => {
      if (notify.id !== 'loading-card') {
        return notify
      } else {
        return obj.notifications
      }
    })
    // Reject duplicated status in timeline
    state.notifications[obj.accountId] = Array.from(new Set(n))
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
  [ACTION_TYPES.FETCH_NOTIFICATIONS]: async (
    { dispatch, commit, rootState },
    req: { account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Notification>> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)

    const marker: Entity.Marker | null = await dispatch(ACTION_TYPES.GET_MARKER, req).catch(err => {
      console.error(err)
    })

    if (rootState.TimelineSpace.setting.markerNotifications && marker !== null && marker.notifications) {
      // The result does not contain max_id's notification, when we specify max_id parameter in get notifications.
      // So we need to get max_id's notification.
      const nextResponse = await client.getNotifications({ limit: 1, min_id: marker.notifications.last_read_id })
      if (nextResponse.data.length > 0) {
        const card: LoadingCard = {
          type: 'middle-load',
          since_id: marker.notifications.last_read_id,
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
        commit(MUTATION_TYPES.REPLACE_NOTIFICATIONS, { notifications, accountId: req.account.id })
        commit('TimelineSpace/SideMenu/changeUnreadNotifications', true, { root: true })
        return res.data
      }
    }
    const res = await client.getNotifications({ limit: 30 })
    commit(MUTATION_TYPES.REPLACE_NOTIFICATIONS, { notifications: res.data, accountId: req.account.id })
    return res.data
  },
  [ACTION_TYPES.LAZY_FETCH_NOTIFICATIONS]: async (
    { commit, rootState },
    req: { lastNotification: Entity.Notification; account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Notification> | null> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    return client.getNotifications({ max_id: req.lastNotification.id, limit: 30 }).then(res => {
      commit(MUTATION_TYPES.INSERT_NOTIFICATIONS, { notifications: res.data, accountId: req.account.id })
      return res.data
    })
  },
  [ACTION_TYPES.FETCH_NOTIFICATIONS_SINCE]: async (
    { state, rootState, commit },
    req: { sinceId: string; account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Notification> | null> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const cardIndex = state.notifications[req.account.id].findIndex(s => {
      if (s.id === 'loading-card') {
        return true
      }
      return false
    })
    let maxID: string | null = null
    if (cardIndex > 0) {
      maxID = state.notifications[req.account.id][cardIndex - 1].id
    }
    let params = { min_id: req.sinceId, limit: 30 }
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
      commit(MUTATION_TYPES.APPEND_NOTIFICATIONS_AFTER_LOADING_CARD, { notifications, accountId: req.account.id })
    } else {
      commit(MUTATION_TYPES.APPEND_NOTIFICATIONS_AFTER_LOADING_CARD, { notifications: res.data, accountId: req.account.id })
    }
    return res.data
  },
  [ACTION_TYPES.RESET_BADGE]: () => {
    win.ipcRenderer.send('reset-badge')
  },
  [ACTION_TYPES.GET_MARKER]: async ({ rootState }, req: { account: LocalAccount; server: LocalServer }): Promise<Entity.Marker | null> => {
    if (!rootState.TimelineSpace.setting.markerNotifications) {
      return null
    }
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    let serverMarker: Entity.Marker | {} = {}
    try {
      const res = await client.getMarkers(['notifications'])
      serverMarker = res.data
    } catch (err) {
      console.warn(err)
    }
    return serverMarker
  },
  [ACTION_TYPES.SAVE_MARKER]: async ({ state, rootState }, req: { account: LocalAccount; server: LocalServer }) => {
    const notifications = state.notifications[req.account.id]
    if (notifications.length === 0 || notifications[0].id === 'loading-card') {
      return
    }

    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const res = await client.saveMarkers({ notifications: { last_read_id: notifications[0].id } })
    if (rootState.TimelineSpace.server!.sns === 'pleroma') {
      await client.readNotifications({ max_id: notifications[0].id })
    }
    return res.data
  }
}

const getters: GetterTree<NotificationsState, RootState> = {
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
