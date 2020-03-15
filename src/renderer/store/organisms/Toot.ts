import generator, { Entity } from 'megalodon'
import { Module, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

type VoteParam = {
  id: string
  choices: Array<number>
}

export type TootState = {}

const state = (): TootState => ({})

const actions: ActionTree<TootState, RootState> = {
  reblog: async ({ rootState, dispatch }, message: Entity.Status) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.reblogStatus(message.id)
    // API returns new status when reblog.
    // Reblog target status is in the data.reblog.
    // So I send data.reblog as status for update local timeline.
    win.ipcRenderer.send('fav-rt-action-sound')
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data.reblog, { root: true })
    return res.data.reblog
  },
  unreblog: async ({ rootState, dispatch }, message: Entity.Status) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.unreblogStatus(message.id)
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  addFavourite: async ({ rootState, dispatch }, message: Entity.Status) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.favouriteStatus(message.id)
    win.ipcRenderer.send('fav-rt-action-sound')
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  removeFavourite: async ({ rootState, dispatch }, message: Entity.Status) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.unfavouriteStatus(message.id)
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  deleteToot: async ({ rootState }, message: Entity.Status) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    await client.deleteStatus(message.id)
    return message
  },
  block: async ({ rootState }, account: Account) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    return client.blockAccount(account.id)
  },
  vote: async ({ rootState }, params: VoteParam): Promise<Entity.Poll> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.votePoll(params.id, params.choices)
    return res.data
  },
  refresh: async ({ rootState }, id: string): Promise<Entity.Poll> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getPoll(id)
    return res.data
  }
}

const Toot: Module<TootState, RootState> = {
  namespaced: true,
  state: state,
  actions: actions
}

export default Toot
