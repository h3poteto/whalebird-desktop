import generator, { Entity } from 'megalodon'
import { Module, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = window as any as MyWindow

type VoteParam = {
  id: string
  choices: Array<number>
}

type ReactionParam = {
  status_id: string
  native: string
}

export type TootState = {}

const state = (): TootState => ({})

export const ACTION_TYPES = {
  REBLOG: 'reblog',
  UNREBLOG: 'unreblog',
  ADD_FAVOURITE: 'addFavourite',
  REMOVE_FAVOURITE: 'addFavourite',
  ADD_BOOKMARK: 'addBookmark',
  REMOVE_BOOKMARK: 'removeBookmark',
  DELETE_TOOT: 'deleteToot',
  BLOCK: 'block',
  VOTE: 'vote',
  REFRESH: 'refresh',
  SEND_REACTION: 'sendReaction',
  DELETE_REACTION: 'deleteReaction'
}

const actions: ActionTree<TootState, RootState> = {
  [ACTION_TYPES.REBLOG]: async ({ rootState, dispatch }, message: Entity.Status) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.reblogStatus(message.id)
    // API returns new status when reblog.
    // Reblog target status is in the data.reblog.
    // So I send data.reblog as status for update local timeline.
    win.ipcRenderer.send('fav-rt-action-sound')
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data.reblog, { root: true })
    return res.data.reblog
  },
  [ACTION_TYPES.UNREBLOG]: async ({ rootState, dispatch }, message: Entity.Status) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.unreblogStatus(message.id)
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  [ACTION_TYPES.ADD_FAVOURITE]: async ({ rootState, dispatch }, message: Entity.Status): Promise<Entity.Status> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.favouriteStatus(message.id)
    win.ipcRenderer.send('fav-rt-action-sound')
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  removeFavourite: async ({ rootState, dispatch }, message: Entity.Status): Promise<Entity.Status> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.unfavouriteStatus(message.id)
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  addBookmark: async ({ rootState, dispatch }, message: Entity.Status): Promise<Entity.Status> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.bookmarkStatus(message.id)
    win.ipcRenderer.send('fav-rt-action-sound')
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  removeBookmark: async ({ rootState, dispatch }, message: Entity.Status): Promise<Entity.Status> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.unbookmarkStatus(message.id)
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  deleteToot: async ({ rootState }, message: Entity.Status) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    await client.deleteStatus(message.id)
    return message
  },
  block: async ({ rootState }, account: Entity.Account) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    return client.blockAccount(account.id)
  },
  vote: async ({ rootState }, params: VoteParam): Promise<Entity.Poll> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.votePoll(params.id, params.choices)
    return res.data
  },
  refresh: async ({ rootState }, id: string): Promise<Entity.Poll> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.getPoll(id)
    return res.data
  },
  sendReaction: async ({ rootState }, params: ReactionParam): Promise<Entity.Status> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.createEmojiReaction(params.status_id, params.native)
    return res.data
  },
  deleteReaction: async ({ rootState }, params: ReactionParam): Promise<Entity.Status> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.deleteEmojiReaction(params.status_id, params.native)
    return res.data
  }
}

const Toot: Module<TootState, RootState> = {
  namespaced: true,
  state: state,
  actions: actions
}

export default Toot
