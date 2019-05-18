import Mastodon, { Response, Status, Account } from 'megalodon'
import { ipcRenderer } from 'electron'
import { Module, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface TootState {}

const state = (): TootState => ({})

const actions: ActionTree<TootState, RootState> = {
  reblog: async ({ rootState }, message: Status) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Status> = await client.post<Status>(`/statuses/${message.id}/reblog`)
    // API returns new status when reblog.
    // Reblog target status is in the data.reblog.
    // So I send data.reblog as status for update local timeline.
    ipcRenderer.send('fav-rt-action-sound')
    return res.data.reblog
  },
  unreblog: async ({ rootState }, message: Status) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Status> = await client.post<Status>(`/statuses/${message.id}/unreblog`)
    return res.data
  },
  addFavourite: async ({ rootState, dispatch }, message: Status) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Status> = await client.post<Status>(`/statuses/${message.id}/favourite`)
    ipcRenderer.send('fav-rt-action-sound')
    dispatch('TimelineSpace/addFavouriteToot', res.data, { root: true })
    return res.data
  },
  removeFavourite: async ({ rootState }, message: Status) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Status> = await client.post<Status>(`/statuses/${message.id}/unfavourite`)
    return res.data
  },
  deleteToot: async ({ rootState }, message: Status) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    await client.del(`/statuses/${message.id}`)
    return message
  },
  block: async ({ rootState }, account: Account) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    return client.post(`/accounts/${account.id}/block`)
  }
}

const Toot: Module<TootState, RootState> = {
  namespaced: true,
  state: state,
  actions: actions
}

export default Toot
