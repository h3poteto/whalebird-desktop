import Mastodon, { Response, Status, Account, Poll } from 'megalodon'
import { ipcRenderer } from 'electron'
import { Module, ActionTree } from 'vuex'
import { RootState } from '@/store'

type VoteParam = {
  id: string
  choices: Array<string>
}

export type TootState = {}

const state = (): TootState => ({})

const actions: ActionTree<TootState, RootState> = {
  reblog: async ({ rootState, dispatch }, message: Status) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Status> = await client.post<Status>(`/statuses/${message.id}/reblog`)
    // API returns new status when reblog.
    // Reblog target status is in the data.reblog.
    // So I send data.reblog as status for update local timeline.
    ipcRenderer.send('fav-rt-action-sound')
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data.reblog, { root: true })
    return res.data.reblog
  },
  unreblog: async ({ rootState, dispatch }, message: Status) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Status> = await client.post<Status>(`/statuses/${message.id}/unreblog`)
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  addFavourite: async ({ rootState, dispatch }, message: Status) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Status> = await client.post<Status>(`/statuses/${message.id}/favourite`)
    ipcRenderer.send('fav-rt-action-sound')
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  removeFavourite: async ({ rootState, dispatch }, message: Status) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Status> = await client.post<Status>(`/statuses/${message.id}/unfavourite`)
    dispatch('TimelineSpace/updateTootForAllTimelines', res.data, { root: true })
    return res.data
  },
  deleteToot: async ({ rootState }, message: Status) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    await client.del(`/statuses/${message.id}`)
    return message
  },
  block: async ({ rootState }, account: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    return client.post(`/accounts/${account.id}/block`)
  },
  vote: async ({ rootState }, params: VoteParam): Promise<Poll> => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.post<Poll>(`/polls/${params.id}/votes`, {
      choices: params.choices
    })
    return res.data
  },
  refresh: async ({ rootState }, id: string): Promise<Poll> => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.get<Poll>(`/polls/${id}`)
    return res.data
  }
}

const Toot: Module<TootState, RootState> = {
  namespaced: true,
  state: state,
  actions: actions
}

export default Toot
